'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TapCounter } from '@/components/tracker/TapCounter';
import { getScoreLabel } from '@/lib/definitions';
import { formatPlayerNameWithNumber } from '@/lib/utils';
import type { Player, TrackerState } from '@/lib/types';

export default function TrackerPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number>(1); // Default to team 1
  const [trackerState, setTrackerState] = useState<TrackerState>({
    selectedPlayerId: null,
    gameDate: new Date().toISOString().split('T')[0],
    opponent: '',
    location: '',
    playerStats: {},
    lastAction: null,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load players for the team
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/players?teamId=${selectedTeamId}&active=true`);
        if (response.ok) {
          const data = await response.json();
          setPlayers(data);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedTeamId) {
      fetchPlayers();
    }
  }, [selectedTeamId]);

  const getPlayerStats = (playerId: number) => {
    return trackerState.playerStats[playerId] || {
      ground_balls: 0,
      screens: 0,
      effort_plays: 0,
      notes: ''
    };
  };

  const updatePlayerStat = (playerId: number, statType: 'ground_balls' | 'screens' | 'effort_plays', value: number) => {
    const currentStats = getPlayerStats(playerId);
    const previousValue = currentStats[statType];

    setTrackerState(prev => ({
      ...prev,
      playerStats: {
        ...prev.playerStats,
        [playerId]: {
          ...currentStats,
          [statType]: Math.max(0, value)
        }
      },
      lastAction: {
        playerId,
        statType,
        previousValue
      }
    }));
  };

  const incrementStat = (playerId: number, statType: 'ground_balls' | 'screens' | 'effort_plays') => {
    const currentValue = getPlayerStats(playerId)[statType];
    updatePlayerStat(playerId, statType, currentValue + 1);
  };

  const decrementStat = (playerId: number, statType: 'ground_balls' | 'screens' | 'effort_plays') => {
    const currentValue = getPlayerStats(playerId)[statType];
    if (currentValue > 0) {
      updatePlayerStat(playerId, statType, currentValue - 1);
    }
  };

  const undoLastAction = () => {
    if (!trackerState.lastAction) return;

    const { playerId, statType, previousValue } = trackerState.lastAction;
    updatePlayerStat(playerId, statType, previousValue);

    setTrackerState(prev => ({
      ...prev,
      lastAction: null
    }));
  };

  const resetStats = () => {
    if (window.confirm('Are you sure you want to reset all stats? This cannot be undone.')) {
      setTrackerState(prev => ({
        ...prev,
        playerStats: {},
        lastAction: null
      }));
    }
  };

  const saveGame = async () => {
    if (!trackerState.opponent.trim()) {
      alert('Please enter an opponent name');
      return;
    }

    const statsToSave = Object.entries(trackerState.playerStats)
      .filter(([_, stats]) => stats.ground_balls > 0 || stats.screens > 0 || stats.effort_plays > 0)
      .map(([playerId, stats]) => ({
        player_id: parseInt(playerId),
        ...stats
      }));

    if (statsToSave.length === 0) {
      alert('Please add stats for at least one player');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: {
            team_id: selectedTeamId,
            game_date: trackerState.gameDate,
            opponent: trackerState.opponent.trim(),
            location: trackerState.location.trim() || null
          },
          stats: statsToSave
        })
      });

      if (response.ok) {
        alert('Game saved successfully!');
        // Reset the tracker
        setTrackerState({
          selectedPlayerId: null,
          gameDate: new Date().toISOString().split('T')[0],
          opponent: '',
          location: '',
          playerStats: {},
          lastAction: null,
        });
      } else {
        const error = await response.json();
        alert(`Error saving game: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Error saving game. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateImpactScore = (playerId: number) => {
    const stats = getPlayerStats(playerId);
    return stats.ground_balls + stats.screens + stats.effort_plays;
  };

  const selectedPlayer = trackerState.selectedPlayerId
    ? players.find(p => p.id === trackerState.selectedPlayerId)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading players...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Live Game Tracker</h1>
          <p className="text-gray-600">Track player performance during the game</p>
        </div>

        {/* Game Setup */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Game Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input
                  type="date"
                  value={trackerState.gameDate}
                  onChange={(e) => setTrackerState(prev => ({ ...prev, gameDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Opponent *</label>
                <Input
                  placeholder="Enter opponent team"
                  value={trackerState.opponent}
                  onChange={(e) => setTrackerState(prev => ({ ...prev, opponent: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input
                placeholder="Home, Away, or venue name"
                value={trackerState.location}
                onChange={(e) => setTrackerState(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Player Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Player</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={trackerState.selectedPlayerId?.toString() || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTrackerState(prev => ({
                ...prev,
                selectedPlayerId: e.target.value ? parseInt(e.target.value) : null
              }))}
            >
              <option value="">Choose a player to track...</option>
              {players.map(player => (
                <option key={player.id} value={player.id}>
                  {formatPlayerNameWithNumber(player.first_name, player.last_name, player.jersey_number)}
                </option>
              ))}
            </Select>
          </CardContent>
        </Card>

        {/* Tracking Interface */}
        {selectedPlayer && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  Tracking: {formatPlayerNameWithNumber(
                    selectedPlayer.first_name,
                    selectedPlayer.last_name,
                    selectedPlayer.jersey_number
                  )}
                </span>
                <Badge className="ml-2">
                  Impact Score: {calculateImpactScore(selectedPlayer.id)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <TapCounter
                  label="Ground Balls"
                  count={getPlayerStats(selectedPlayer.id).ground_balls}
                  color="bg-blue-500 border-blue-500"
                  onIncrement={() => incrementStat(selectedPlayer.id, 'ground_balls')}
                  onDecrement={() => decrementStat(selectedPlayer.id, 'ground_balls')}
                />
                <TapCounter
                  label="Screens"
                  count={getPlayerStats(selectedPlayer.id).screens}
                  color="bg-green-500 border-green-500"
                  onIncrement={() => incrementStat(selectedPlayer.id, 'screens')}
                  onDecrement={() => decrementStat(selectedPlayer.id, 'screens')}
                />
                <TapCounter
                  label="Effort Plays"
                  count={getPlayerStats(selectedPlayer.id).effort_plays}
                  color="bg-purple-500 border-purple-500"
                  onIncrement={() => incrementStat(selectedPlayer.id, 'effort_plays')}
                  onDecrement={() => decrementStat(selectedPlayer.id, 'effort_plays')}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            variant="outline"
            onClick={undoLastAction}
            disabled={!trackerState.lastAction}
          >
            Undo Last Action
          </Button>
          <Button variant="outline" onClick={resetStats}>
            Reset All Stats
          </Button>
          <Button
            onClick={saveGame}
            disabled={saving || !trackerState.opponent.trim()}
            className="ml-auto"
          >
            {saving ? 'Saving...' : 'Save Game'}
          </Button>
        </div>

        {/* Stats Summary */}
        {Object.keys(trackerState.playerStats).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Game Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {players
                  .filter(player => trackerState.playerStats[player.id])
                  .map(player => {
                    const stats = getPlayerStats(player.id);
                    const impactScore = calculateImpactScore(player.id);
                    const scoreLabel = getScoreLabel(impactScore);

                    return (
                      <div key={player.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="font-medium">
                          {formatPlayerNameWithNumber(player.first_name, player.last_name, player.jersey_number)}
                        </span>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>GB: {stats.ground_balls}</span>
                          <span>SC: {stats.screens}</span>
                          <span>EP: {stats.effort_plays}</span>
                          <Badge className={scoreLabel.bgColor + ' ' + scoreLabel.color}>
                            {impactScore}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}