'use client';

import { useState, useEffect } from 'react';
import GameForm from '@/components/GameForm';
import SummaryCards from '@/components/SummaryCards';
import ImpactGauge from '@/components/ImpactGauge';
import GamesTable from '@/components/GamesTable';
import TrendChart from '@/components/TrendChart';
import { type Game, type SeasonSummary } from '@/lib/db';

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [summary, setSummary] = useState<SeasonSummary | null>(null);
  const [trend, setTrend] = useState<Array<{ game_date: string; impact_score: number; opponent: string }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [gamesResponse, summaryResponse] = await Promise.all([
        fetch('/api/games'),
        fetch('/api/summary')
      ]);

      if (!gamesResponse.ok || !summaryResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const gamesData = await gamesResponse.json();
      const summaryData = await summaryResponse.json();

      setGames(gamesData);
      setSummary(summaryData.summary);
      setTrend(summaryData.trend);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGameAdded = () => {
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lacrosse Coach Tracker</h1>
          <p className="mt-2 text-gray-600">Track performance metrics and analyze game statistics</p>
        </div>

        {/* Game Form */}
        <div className="mb-8">
          <GameForm onGameAdded={handleGameAdded} />
        </div>

        {/* Summary Cards */}
        <div className="mb-8">
          <SummaryCards summary={summary} />
        </div>

        {/* Impact Gauge and Trend Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ImpactGauge summary={summary} />
          <TrendChart trend={trend} />
        </div>

        {/* Games Table */}
        <div className="mb-8">
          <GamesTable games={games} loading={loading} />
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm">
          <p>© 2024 Lacrosse Coach Tracker. Built with Next.js and Tailwind CSS.</p>
        </footer>
      </div>
    </div>
  );
}