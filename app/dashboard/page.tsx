'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { formatDate, formatPlayerName } from '@/lib/utils';
import { getScoreLabel } from '@/lib/definitions';
import type { TeamSeasonSummary, PlayerSeasonSummary, GameTrendData } from '@/lib/types';

export default function DashboardPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<number>(1);
  const [teamSummary, setTeamSummary] = useState<TeamSeasonSummary | null>(null);
  const [topPlayers, setTopPlayers] = useState<PlayerSeasonSummary[]>([]);
  const [trendData, setTrendData] = useState<GameTrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/summary?teamId=${selectedTeamId}`);
        if (response.ok) {
          const data = await response.json();
          setTeamSummary(data.team);
          setTopPlayers(data.topPlayers || []);
          setTrendData(data.trend || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedTeamId) {
      fetchDashboardData();
    }
  }, [selectedTeamId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const avgImpact = teamSummary?.avg_team_impact || 0;
  const scoreLabel = getScoreLabel(avgImpact);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="text-gray-600 mt-2">Performance overview and player statistics</p>
        </div>

        {/* Team Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Team</label>
          <Select
            value={selectedTeamId.toString()}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTeamId(parseInt(e.target.value))}
          >
            <option value="1">Eagles - 2024 Spring</option>
            <option value="2">Lions - 2024 Spring</option>
          </Select>
        </div>

        {/* Summary Cards */}
        {teamSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <div className="text-2xl font-bold text-gray-900">{avgImpact}</div>
                  <Badge className={`${scoreLabel.bgColor} ${scoreLabel.color}`}>
                    {scoreLabel.label}
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
        )}

        {/* Top Players and Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Players */}
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

          {/* Performance Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? (
                <div className="h-64 flex items-end justify-between space-x-1">
                  {trendData.slice(-10).map((game, index) => {
                    const maxScore = Math.max(...trendData.map(g => g.impact_score));
                    const height = (game.impact_score / maxScore) * 100;
                    const scoreLabel = getScoreLabel(game.impact_score);

                    return (
                      <div key={game.game_id} className="flex-1 flex flex-col items-center">
                        <div
                          className={`w-full rounded-t-sm ${scoreLabel.bgColor.replace('bg-', 'bg-').replace('100', '500')} transition-all duration-500`}
                          style={{ height: `${height}%`, minHeight: '8px' }}
                          title={`${game.opponent}: ${game.impact_score} (${game.player_name})`}
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

        {/* Recent Individual Performances */}
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
                  {topPlayers.map((player) => {
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
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}