'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate, formatPlayerNameWithNumber } from '@/lib/utils';
import { getScoreLabel } from '@/lib/definitions';
import type { Team, Player, PlayerSeasonSummary, TeamSeasonSummary, GameTrendData } from '@/lib/types';

export default function ManagementPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'players'>('overview');

  // Teams state
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [showCreateTeamForm, setShowCreateTeamForm] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', season: '' });
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Players state
  const [players, setPlayers] = useState<Player[]>([]);
  const [showCreatePlayerForm, setShowCreatePlayerForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ first_name: '', last_name: '', jersey_number: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [playerDetails, setPlayerDetails] = useState<any>(null);
  const [playerSummary, setPlayerSummary] = useState<any>(null);
  const [playerGames, setPlayerGames] = useState<any[]>([]);

  // Dashboard state
  const [teamSummary, setTeamSummary] = useState<TeamSeasonSummary | null>(null);
  const [topPlayers, setTopPlayers] = useState<PlayerSeasonSummary[]>([]);
  const [trendData, setTrendData] = useState<GameTrendData[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeamId) {
      if (activeTab === 'overview') {
        fetchDashboardData();
      } else if (activeTab === 'players') {
        fetchPlayers();
      }
    }
  }, [selectedTeamId, activeTab]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
        if (data.length > 0 && !selectedTeamId) {
          setSelectedTeamId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!selectedTeamId) return;

    try {
      console.log('Fetching dashboard data for team:', selectedTeamId);
      const response = await fetch(`/api/summary?teamId=${selectedTeamId}`);
      console.log('Dashboard API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard API data:', data);
        setTeamSummary(data.team);
        setTopPlayers(data.topPlayers || []);
        setTrendData(data.trend || []);
        console.log('Set trendData:', data.trend);
        console.log('Set topPlayers:', data.topPlayers);
      } else {
        const errorText = await response.text();
        console.error('Dashboard API Error:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchPlayers = async () => {
    if (!selectedTeamId) return;

    try {
      const response = await fetch(`/api/players?teamId=${selectedTeamId}`);
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchPlayerDetails = async (playerId: number) => {
    try {
      console.log('Fetching player details for:', playerId);
      const [playerResponse, summaryResponse, gamesResponse] = await Promise.all([
        fetch(`/api/players/${playerId}`),
        fetch(`/api/players/${playerId}/summary`),
        fetch(`/api/players/${playerId}/games?limit=10`)
      ]);

      console.log('Player API response statuses:', {
        player: playerResponse.status,
        summary: summaryResponse.status,
        games: gamesResponse.status
      });

      if (playerResponse.ok && summaryResponse.ok && gamesResponse.ok) {
        const [playerData, summaryData, gamesData] = await Promise.all([
          playerResponse.json(),
          summaryResponse.json(),
          gamesResponse.json()
        ]);

        console.log('Player details data:', { playerData, summaryData, gamesData });

        setPlayerDetails(playerData);
        setPlayerSummary(summaryData);
        setPlayerGames(gamesData);
        setSelectedPlayerId(playerId);
      } else {
        console.error('One or more player APIs failed');
        if (!playerResponse.ok) console.error('Player API error:', await playerResponse.text());
        if (!summaryResponse.ok) console.error('Summary API error:', await summaryResponse.text());
        if (!gamesResponse.ok) console.error('Games API error:', await gamesResponse.text());
      }
    } catch (error) {
      console.error('Error fetching player details:', error);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name.trim() || !newTeam.season.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setCreating(true);
    try {
      const url = editingTeam ? `/api/teams/${editingTeam.id}` : '/api/teams';
      const method = editingTeam ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeam),
      });

      if (response.ok) {
        setNewTeam({ name: '', season: '' });
        setShowCreateTeamForm(false);
        setEditingTeam(null);
        fetchTeams();
      } else {
        alert(`Failed to ${editingTeam ? 'update' : 'create'} team`);
      }
    } catch (error) {
      console.error(`Error ${editingTeam ? 'updating' : 'creating'} team:`, error);
      alert(`Error ${editingTeam ? 'updating' : 'creating'} team`);
    } finally {
      setCreating(false);
    }
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) {
      alert('Please select a team first');
      return;
    }
    if (!newPlayer.first_name.trim() || !newPlayer.last_name.trim()) {
      alert('Please fill in player name');
      return;
    }

    setCreating(true);
    try {
      const playerData = {
        ...newPlayer,
        team_id: selectedTeamId,
        jersey_number: newPlayer.jersey_number ? parseInt(newPlayer.jersey_number) : null,
      };

      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData),
      });

      if (response.ok) {
        setNewPlayer({ first_name: '', last_name: '', jersey_number: '' });
        setShowCreatePlayerForm(false);
        fetchPlayers();
      } else {
        alert('Failed to create player');
      }
    } catch (error) {
      console.error('Error creating player:', error);
      alert('Error creating player');
    } finally {
      setCreating(false);
    }
  };

  const filteredPlayers = players.filter(player => {
    if (!searchTerm) return true;
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) ||
           player.jersey_number?.toString().includes(searchTerm);
  });

  const renderTabButton = (tab: 'overview' | 'players', label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === tab
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-2">Manage teams, players, and view performance analytics</p>
        </div>

        {/* Team Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Team</label>
          <div className="flex items-center space-x-4">
            <select
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedTeamId?.toString() || ''}
              onChange={(e) => setSelectedTeamId(parseInt(e.target.value))}
            >
              <option value="">Select a team...</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name} - {team.season}
                </option>
              ))}
            </select>
            <Button
              onClick={() => setShowCreateTeamForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              New Team
            </Button>
            {selectedTeamId && (
              <Button
                variant="outline"
                onClick={() => {
                  const team = teams.find(t => t.id === selectedTeamId);
                  if (team) {
                    setEditingTeam(team);
                    setNewTeam({ name: team.name, season: team.season });
                  }
                }}
              >
                Edit Team
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {renderTabButton('overview', 'Overview')}
            {renderTabButton('players', 'Players')}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            {!selectedTeamId ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">Select a team to view performance overview</p>
                </CardContent>
              </Card>
            ) : teamSummary ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-500">Total Games</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{teamSummary.total_games}</div>
                      <p className="text-sm text-gray-500">games played</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-500">Active Players</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{teamSummary.total_players}</div>
                      <p className="text-sm text-gray-500">roster size</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-500">Avg Team Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <div className="text-2xl font-bold text-gray-900">{teamSummary.avg_team_impact}</div>
                        <Badge className={`${getScoreLabel(teamSummary.avg_team_impact).bgColor} ${getScoreLabel(teamSummary.avg_team_impact).color}`}>
                          {getScoreLabel(teamSummary.avg_team_impact).label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">per player per game</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-500">Best Individual Game</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{teamSummary.best_individual_game}</div>
                      <p className="text-sm text-gray-500">impact score</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Players and Trend */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {topPlayers.slice(0, 5).map((player, index) => {
                          const scoreLabel = getScoreLabel(player.avg_impact_score);
                          return (
                            <div key={player.player_id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{player.player_name}</p>
                                  <p className="text-sm text-gray-500">
                                    #{player.jersey_number} • {player.games_played} games
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className={`${scoreLabel.bgColor} ${scoreLabel.color}`}>
                                  {player.avg_impact_score}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">avg impact</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Team Performance Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {trendData && trendData.length > 0 ? (
                        <div className="h-64 flex items-end justify-between space-x-1">
                          {trendData.slice(-10).map((game, index) => {
                            const maxScore = Math.max(...trendData.map(g => g.impact_score));
                            const height = maxScore > 0 ? (game.impact_score / maxScore) * 100 : 0;
                            const scoreLabel = getScoreLabel(game.impact_score);

                            return (
                              <div key={game.game_id} className="flex-1 flex flex-col items-center">
                                <div
                                  className={`w-full rounded-t-sm ${scoreLabel.bgColor.replace('bg-', 'bg-').replace('100', '500')} transition-all duration-500`}
                                  style={{ height: `${height}%`, minHeight: '8px' }}
                                  title={`${game.opponent}: ${game.impact_score} (${game.player_name || 'Top Player'})`}
                                ></div>
                                <p className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                                  {formatDate(game.game_date).split(', ')[0]}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                          No trend data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Player Performances */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Player Performances</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Player</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Games</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Avg GB</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Avg SC</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Avg EP</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Avg Impact</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Best Game</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topPlayers && topPlayers.length > 0 ? topPlayers.map((player) => {
                            const scoreLabel = getScoreLabel(player.avg_impact_score);
                            const bestLabel = getScoreLabel(player.best_impact_score);

                            return (
                              <tr key={player.player_id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <div>
                                    <p className="font-medium text-gray-900">{player.player_name}</p>
                                    <p className="text-sm text-gray-500">#{player.jersey_number}</p>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-gray-900">{player.games_played}</td>
                                <td className="py-3 px-4 text-gray-900">{player.avg_ground_balls}</td>
                                <td className="py-3 px-4 text-gray-900">{player.avg_screens}</td>
                                <td className="py-3 px-4 text-gray-900">{player.avg_effort_plays}</td>
                                <td className="py-3 px-4">
                                  <Badge className={`${scoreLabel.bgColor} ${scoreLabel.color}`}>
                                    {player.avg_impact_score}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge className={`${bestLabel.bgColor} ${bestLabel.color}`}>
                                    {player.best_impact_score}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          }) : (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-gray-500">
                                No player performance data available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">No data available for this team</p>
                  <p className="text-sm text-gray-400 mt-2">Add players and start tracking games to see analytics</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'players' && (
          <div>
            {selectedTeamId ? (
              <>
                {/* Player Controls */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <Input
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button
                    onClick={() => setShowCreatePlayerForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Add Player
                  </Button>
                </div>

                {/* Players Grid and Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Players List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Team Roster</h3>
                    <div className="space-y-3">
                      {filteredPlayers.map((player) => (
                        <Card
                          key={player.id}
                          className={`hover:shadow-lg transition-shadow cursor-pointer ${
                            selectedPlayerId === player.id ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => fetchPlayerDetails(player.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">
                                  {formatPlayerNameWithNumber(player.first_name, player.last_name, player.jersey_number)}
                                </p>
                                <p className="text-sm text-gray-500">{player.team_name}</p>
                              </div>
                              <Badge variant={player.active ? "default" : "secondary"}>
                                {player.active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Player Details */}
                  <div>
                    {selectedPlayerId && playerDetails && playerSummary ? (
                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>
                              {formatPlayerNameWithNumber(playerDetails.first_name, playerDetails.last_name, playerDetails.jersey_number)}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Games Played</p>
                                <p className="font-semibold">{playerSummary.games_played}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Avg Impact Score</p>
                                <div className="flex items-center space-x-2">
                                  <p className="font-semibold">{playerSummary.avg_impact_score}</p>
                                  <Badge className={`${getScoreLabel(playerSummary.avg_impact_score).bgColor} ${getScoreLabel(playerSummary.avg_impact_score).color}`}>
                                    {getScoreLabel(playerSummary.avg_impact_score).label}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Best Game</p>
                                <p className="font-semibold">{playerSummary.best_impact_score}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Total Impact</p>
                                <p className="font-semibold">{playerSummary.total_impact_score}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Season Averages</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">Ground Balls</span>
                                  <span className="text-lg font-bold">{playerSummary.avg_ground_balls}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, (playerSummary.avg_ground_balls / 5) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">Screens</span>
                                  <span className="text-lg font-bold">{playerSummary.avg_screens}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, (playerSummary.avg_screens / 6) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">Effort Plays</span>
                                  <span className="text-lg font-bold">{playerSummary.avg_effort_plays}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, (playerSummary.avg_effort_plays / 3) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Performance Trend</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {playerGames.length > 0 ? (
                              <div className="h-48 flex items-end justify-between space-x-1">
                                {playerGames.slice(-8).map((game, index) => {
                                  const maxScore = Math.max(...playerGames.map(g => g.impact_score));
                                  const height = maxScore > 0 ? (game.impact_score / maxScore) * 100 : 0;
                                  const scoreLabel = getScoreLabel(game.impact_score);

                                  return (
                                    <div key={game.id} className="flex-1 flex flex-col items-center">
                                      <div
                                        className={`w-full rounded-t-sm ${scoreLabel.bgColor.replace('bg-', 'bg-').replace('100', '500')} transition-all duration-500`}
                                        style={{ height: `${height}%`, minHeight: '8px' }}
                                        title={`${game.opponent}: ${game.impact_score} (${formatDate(game.game_date || '')})`}
                                      ></div>
                                      <p className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                                        {game.opponent?.slice(0, 3)}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="h-48 flex items-center justify-center text-gray-500">
                                No game data available
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Recent Games</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {playerGames.slice(0, 5).map((game) => {
                                const scoreLabel = getScoreLabel(game.impact_score);
                                return (
                                  <div key={game.id} className="flex justify-between items-center p-3 border rounded-lg">
                                    <div>
                                      <p className="font-medium">{game.opponent}</p>
                                      <p className="text-sm text-gray-500">{formatDate(game.game_date || '')}</p>
                                    </div>
                                    <div className="text-right">
                                      <Badge className={`${scoreLabel.bgColor} ${scoreLabel.color}`}>
                                        {game.impact_score}
                                      </Badge>
                                      <p className="text-xs text-gray-500 mt-1">
                                        GB: {game.ground_balls} SC: {game.screens} EP: {game.effort_plays}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <Card className="h-full">
                        <CardContent className="flex items-center justify-center h-64">
                          <p className="text-gray-500">Select a player to view details</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {filteredPlayers.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-gray-500">No players found</p>
                      {searchTerm && (
                        <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">Select a team to view and manage players</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Create/Edit Team Modal */}
        {(showCreateTeamForm || editingTeam) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{editingTeam ? 'Edit Team' : 'Create New Team'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <Input
                    placeholder="Team Name"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Season (e.g., 2024)"
                    value={newTeam.season}
                    onChange={(e) => setNewTeam({ ...newTeam, season: e.target.value })}
                    required
                  />
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={creating} className="flex-1">
                      {creating ? (editingTeam ? 'Updating...' : 'Creating...') : (editingTeam ? 'Update' : 'Create')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateTeamForm(false);
                        setEditingTeam(null);
                        setNewTeam({ name: '', season: '' });
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Player Modal */}
        {showCreatePlayerForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add New Player</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePlayer} className="space-y-4">
                  <Input
                    placeholder="First Name"
                    value={newPlayer.first_name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, first_name: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Last Name"
                    value={newPlayer.last_name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, last_name: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Jersey Number (optional)"
                    value={newPlayer.jersey_number}
                    onChange={(e) => setNewPlayer({ ...newPlayer, jersey_number: e.target.value })}
                    type="number"
                  />
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={creating} className="flex-1">
                      {creating ? 'Adding...' : 'Add Player'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreatePlayerForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}