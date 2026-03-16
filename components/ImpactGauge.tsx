'use client';

import { type TeamSeasonSummary } from '@/lib/types';

interface ImpactGaugeProps {
  summary: TeamSeasonSummary | null;
}

export default function ImpactGauge({ summary }: ImpactGaugeProps) {
  if (!summary || summary.total_games === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Performance</h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          No games recorded yet
        </div>
      </div>
    );
  }

  // Calculate performance level based on average team impact
  const avgScore = summary.avg_team_impact;
  let performance: { level: string; color: string; percentage: number } = {
    level: 'Excellent',
    color: 'text-green-600',
    percentage: 100
  };

  if (avgScore < 5) {
    performance = { level: 'Needs Work', color: 'text-red-600', percentage: 25 };
  } else if (avgScore < 8) {
    performance = { level: 'Fair', color: 'text-yellow-600', percentage: 50 };
  } else if (avgScore < 12) {
    performance = { level: 'Good', color: 'text-blue-600', percentage: 75 };
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Performance</h3>

      <div className="text-center mb-6">
        <div className={`text-3xl font-bold ${performance.color} mb-2`}>
          {avgScore}
        </div>
        <div className="text-sm text-gray-600">Average Team Impact</div>
      </div>

      {/* Visual gauge */}
      <div className="relative mb-4">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              performance.percentage >= 75 ? 'bg-green-500' :
              performance.percentage >= 50 ? 'bg-blue-500' :
              performance.percentage >= 25 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${performance.percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>5</span>
          <span>10</span>
          <span>15+</span>
        </div>
      </div>

      <div className="text-center">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          performance.percentage >= 75 ? 'bg-green-100 text-green-800' :
          performance.percentage >= 50 ? 'bg-blue-100 text-blue-800' :
          performance.percentage >= 25 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {performance.level}
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">{summary.total_games}</div>
            <div className="text-xs text-gray-500">Games Played</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">{summary.total_players}</div>
            <div className="text-xs text-gray-500">Active Players</div>
          </div>
        </div>
      </div>
    </div>
  );
}