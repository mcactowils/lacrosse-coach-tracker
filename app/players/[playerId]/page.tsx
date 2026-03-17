'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatPlayerNameWithNumber } from '@/lib/utils';
import { getScoreLabel, getStatDefinition } from '@/lib/definitions';
import type { Player, PlayerSeasonSummary, GameStats, PlayerTrendData } from '@/lib/types';

export default function PlayerDetailPage() {
  const params = useParams();
  const playerId = parseInt(params.playerId as string);

  const [player, setPlayer] = useState<Player | null>(null);
  const [summary, setSummary] = useState<PlayerSeasonSummary | null>(null);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);

        // Fetch player details and summary
        console.log('Fetching player data for ID:', playerId);
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

          setPlayer(playerData || null);
          setSummary(summaryData || null);
          setGameStats(gamesData || []);
        }
      } catch (error) {
        console.error('Error fetching player data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchPlayerData();
    }
  }, [playerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading player data...</p>
        </div>
      </div>
    );
  }

  if (!player || !summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Player not found</p>
        </div>
      </div>
    );
  }

  const avgScoreLabel = getScoreLabel(summary.avg_impact_score);
  const bestScoreLabel = getScoreLabel(summary.best_impact_score);

  // Get stat definitions for target comparisons
  const gbDef = getStatDefinition('groundBalls');
  const scDef = getStatDefinition('screens');
  const epDef = getStatDefinition('effortPlays');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {formatPlayerNameWithNumber(player.first_name, player.last_name, player.jersey_number)}
          </h1>
          <p className="text-gray-600 mt-2">{player.team_name} • Season Performance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Games Played</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{summary.games_played}</div>
              <p className="text-sm text-gray-500">total appearances</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Avg Impact Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-gray-900">{summary.avg_impact_score}</div>
                <Badge className={`${avgScoreLabel.bgColor} ${avgScoreLabel.color}`}>
                  {avgScoreLabel.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">per game average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Best Game</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-gray-900">{summary.best_impact_score}</div>
                <Badge className={`${bestScoreLabel.bgColor} ${bestScoreLabel.color}`}>
                  {bestScoreLabel.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">season high</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Total Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{summary.total_impact_score}</div>
              <p className="text-sm text-gray-500">season total</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Breakdown and Target Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
          {/* Season Averages */}
          <Card>
            <CardHeader>
              <CardTitle>Season Averages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Ground Balls */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Ground Balls</span>
                    <span className="text-lg font-bold">{summary.avg_ground_balls}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (summary.avg_ground_balls / 5) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Target: {gbDef.target}</p>
                </div>

                {/* Screens */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Screens</span>
                    <span className="text-lg font-bold">{summary.avg_screens}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (summary.avg_screens / 6) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Target: {scDef.target}</p>
                </div>

                {/* Effort Plays */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Effort Plays</span>
                    <span className="text-lg font-bold">{summary.avg_effort_plays}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (summary.avg_effort_plays / 3) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Target: {epDef.target}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {gameStats.length > 0 ? (
                <div className="h-64 flex items-end justify-between space-x-1">
                  {gameStats.slice(-8).map((game, index) => {
                    const maxScore = Math.max(...gameStats.map(g => g.impact_score));
                    const height = (game.impact_score / maxScore) * 100;
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
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No game data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Games */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Opponent</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">GB</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">SC</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">EP</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Impact Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {gameStats.map((game) => {
                    const scoreLabel = getScoreLabel(game.impact_score);

                    return (
                      <tr key={game.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">
                          {formatDate(game.game_date || '')}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {game.opponent}
                        </td>
                        <td className="py-3 px-4 text-center">{game.ground_balls}</td>
                        <td className="py-3 px-4 text-center">{game.screens}</td>
                        <td className="py-3 px-4 text-center">{game.effort_plays}</td>
                        <td className="py-3 px-4">
                          <Badge className={`${scoreLabel.bgColor} ${scoreLabel.color}`}>
                            {game.impact_score}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm max-w-xs truncate">
                          {game.notes || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {gameStats.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No game stats recorded yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}