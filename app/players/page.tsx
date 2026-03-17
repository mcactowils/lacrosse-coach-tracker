'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { formatPlayerNameWithNumber } from '@/lib/utils';
import { getScoreLabel } from '@/lib/definitions';
import type { Player, PlayerSeasonSummary, Team } from '@/lib/types';

export default function PlayersPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerSummaries, setPlayerSummaries] = useState<PlayerSeasonSummary[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    first_name: '',
    last_name: '',
    jersey_number: '',
  });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams');
        if (response.ok) {
          const teamsData = await response.json();
          setTeams(teamsData);
          if (teamsData.length > 0 && !selectedTeamId) {
            setSelectedTeamId(teamsData[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedTeamId) {
        setPlayers([]);
        setPlayerSummaries([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [playersResponse, summariesResponse] = await Promise.all([
          fetch(`/api/players?teamId=${selectedTeamId}&active=true&search=${searchTerm}`),
          fetch(`/api/summary?teamId=${selectedTeamId}&type=players&limit=50`)
        ]);

        if (playersResponse.ok && summariesResponse.ok) {
          const [playersData, summariesData] = await Promise.all([
            playersResponse.json(),
            summariesResponse.json()
          ]);

          setPlayers(playersData);
          setPlayerSummaries(summariesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setPlayers([]);
        setPlayerSummaries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTeamId, searchTerm]);

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeamId) {
      alert('Please select a team first');
      return;
    }

    if (!newPlayer.first_name.trim() || !newPlayer.last_name.trim()) {
      alert('Please fill in first name and last name');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: selectedTeamId,
          first_name: newPlayer.first_name.trim(),
          last_name: newPlayer.last_name.trim(),
          jersey_number: newPlayer.jersey_number ? parseInt(newPlayer.jersey_number) : null,
          active: true
        })
      });

      if (response.ok) {
        const createdPlayer = await response.json();

        // Add the new player to the existing players list immediately
        setPlayers(prevPlayers => [...prevPlayers, createdPlayer]);

        // Reset form and hide it
        setNewPlayer({ first_name: '', last_name: '', jersey_number: '' });
        setShowCreateForm(false);
        alert('Player created successfully!');
      } else {
        const error = await response.json();
        alert(`Error creating player: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating player:', error);
      alert('Error creating player. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Combine all players with their summary data (if available)
  const enrichedPlayers = players.map(player => {
    const summary = playerSummaries.find(s => s.player_id === player.id);
    return {
      player_id: player.id,
      player_name: `${player.first_name} ${player.last_name}`,
      jersey_number: player.jersey_number,
      games_played: summary?.games_played || 0,
      avg_ground_balls: summary?.avg_ground_balls || 0,
      avg_screens: summary?.avg_screens || 0,
      avg_effort_plays: summary?.avg_effort_plays || 0,
      avg_impact_score: summary?.avg_impact_score || 0,
      best_impact_score: summary?.best_impact_score || 0,
      latest_impact_score: summary?.latest_impact_score || null,
      total_ground_balls: summary?.total_ground_balls || 0,
      total_screens: summary?.total_screens || 0,
      total_effort_plays: summary?.total_effort_plays || 0,
      total_impact_score: summary?.total_impact_score || 0,
    };
  });

  const filteredSummaries = enrichedPlayers.filter(player =>
    player.player_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (player.jersey_number && player.jersey_number.toString().includes(searchTerm))
  );

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
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Players</h1>
          <p className="text-gray-600 mt-2">Manage team roster and view player performance</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select Team</label>
            <Select
              value={selectedTeamId?.toString() || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTeamId(parseInt(e.target.value))}
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name} - {team.season}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Search Players</label>
            <Input
              placeholder="Search by name or jersey number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={() => setShowCreateForm(!showCreateForm)}
              disabled={!selectedTeamId || teams.length === 0}
            >
              {showCreateForm ? 'Cancel' : 'Add New Player'}
            </Button>
          </div>
        </div>

        {/* Create Player Form */}
        {showCreateForm && selectedTeamId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Player</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePlayer} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name *</label>
                    <Input
                      placeholder="e.g., John"
                      value={newPlayer.first_name}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, first_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                    <Input
                      placeholder="e.g., Smith"
                      value={newPlayer.last_name}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, last_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Jersey Number</label>
                    <Input
                      type="number"
                      placeholder="e.g., 25"
                      value={newPlayer.jersey_number}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, jersey_number: e.target.value }))}
                      min="0"
                      max="99"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Player'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewPlayer({ first_name: '', last_name: '', jersey_number: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* No Teams State */}
        {teams.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams found</h3>
              <p className="text-gray-600 mb-6">Create a team first to start managing players</p>
              <Link href="/teams">
                <Button className="bg-green-600 hover:bg-green-700">Create Your First Team</Button>
              </Link>
            </CardContent>
          </Card>
        ) : filteredSummaries.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No players match your search' : 'No players yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? 'Try adjusting your search terms or add a new player'
                  : 'Add your first player to start tracking their performance'
                }
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!selectedTeamId}
              >
                Add Your First Player
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Players Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {filteredSummaries.map((summary) => {
            const avgScoreLabel = getScoreLabel(summary.avg_impact_score);
            const bestScoreLabel = getScoreLabel(summary.best_impact_score);

            return (
              <Link key={summary.player_id} href={`/players/${summary.player_id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {summary.player_name}
                      </CardTitle>
                      {summary.jersey_number && (
                        <Badge variant="outline">#{summary.jersey_number}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Games Played */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Games Played</span>
                        <span className="font-medium">{summary.games_played}</span>
                      </div>

                      {/* Impact Scores */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Avg Impact</span>
                          <Badge className={`${avgScoreLabel.bgColor} ${avgScoreLabel.color}`}>
                            {summary.avg_impact_score}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Best Game</span>
                          <Badge className={`${bestScoreLabel.bgColor} ${bestScoreLabel.color}`}>
                            {summary.best_impact_score}
                          </Badge>
                        </div>
                      </div>

                      {/* Stat Breakdown */}
                      <div className="border-t pt-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Avg Ground Balls</span>
                          <span className="font-medium">{summary.avg_ground_balls}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Avg Screens</span>
                          <span className="font-medium">{summary.avg_screens}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Avg Effort Plays</span>
                          <span className="font-medium">{summary.avg_effort_plays}</span>
                        </div>
                      </div>

                      {/* Latest Score */}
                      {summary.latest_impact_score !== null && (
                        <div className="border-t pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Latest Game</span>
                            <Badge variant="outline">
                              {summary.latest_impact_score}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}