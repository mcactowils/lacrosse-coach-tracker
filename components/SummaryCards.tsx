'use client';

import { type SeasonSummary } from '@/lib/db';

interface SummaryCardsProps {
  summary: SeasonSummary | null;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Games',
      value: summary.total_games,
      subtitle: 'games played',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Avg Impact Score',
      value: summary.avg_impact_score,
      subtitle: 'per game',
      color: 'bg-green-50 text-green-700',
    },
    {
      title: 'Total Impact',
      value: summary.total_impact_score,
      subtitle: 'season total',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      title: 'Best Game',
      value: summary.best_game_impact,
      subtitle: summary.best_game_opponent ? `vs ${summary.best_game_opponent}` : '',
      color: 'bg-orange-50 text-orange-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${card.color} mb-2`}>
            {card.title}
          </div>
          <div className="text-2xl font-bold text-gray-900">{card.value}</div>
          {card.subtitle && <p className="text-sm text-gray-500">{card.subtitle}</p>}
        </div>
      ))}
    </div>
  );
}