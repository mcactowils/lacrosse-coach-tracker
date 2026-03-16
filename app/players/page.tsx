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
import type { Player, PlayerSeasonSummary } from '@/lib/types';

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerSummaries, setPlayerSummaries] = useState<PlayerSeasonSummary[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTeamId, searchTerm]);

  const filteredSummaries = playerSummaries.filter(summary =>
    summary.player_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (summary.jersey_number && summary.jersey_number.toString().includes(searchTerm))
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select Team</label>
            <Select
              value={selectedTeamId.toString()}
              onChange={(e) => setSelectedTeamId(parseInt(e.target.value))}
            >
              <option value="1">Eagles - 2024 Spring</option>
              <option value="2">Lions - 2024 Spring</option>
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
            <Button className="w-full">Add New Player</Button>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

        {/* Empty State */}
        {filteredSummaries.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 text-lg mb-4">
                {searchTerm ? 'No players found matching your search.' : 'No players found for this team.'}
              </p>
              <Button>Add First Player</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}