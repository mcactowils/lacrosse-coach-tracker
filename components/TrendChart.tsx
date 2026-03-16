'use client';

interface TrendData {
  game_date: string;
  impact_score: number;
  opponent: string;
}

interface TrendChartProps {
  trend: TrendData[];
}

export default function TrendChart({ trend }: TrendChartProps) {
  if (trend.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
        <div className="text-center py-8 text-gray-500">
          No trend data available yet. Add more games to see your progress!
        </div>
      </div>
    );
  }

  // Calculate chart dimensions
  const maxScore = Math.max(...trend.map(t => t.impact_score), 15);
  const chartHeight = 200;
  const chartWidth = 400;

  // Calculate points for the line chart
  const points = trend.map((item, index) => {
    const x = (index / (trend.length - 1)) * chartWidth;
    const y = chartHeight - (item.impact_score / maxScore) * chartHeight;
    return { x, y, ...item };
  });

  const pathData = points.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>

      <div className="relative">
        <svg
          width="100%"
          height={chartHeight + 60}
          viewBox={`0 0 ${chartWidth + 40} ${chartHeight + 60}`}
          className="overflow-visible"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const y = chartHeight - (percent / 100) * chartHeight;
            return (
              <g key={percent}>
                <line
                  x1={0}
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
                <text
                  x={-10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#6b7280"
                >
                  {Math.round((percent / 100) * maxScore)}
                </text>
              </g>
            );
          })}

          {/* Trend line */}
          <path
            d={pathData}
            stroke="#3b82f6"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
              />

              {/* Hover info */}
              <title>
                {formatDate(point.game_date)}: {point.impact_score} vs {point.opponent}
              </title>
            </g>
          ))}

          {/* X-axis labels */}
          {points.map((point, index) => (
            <text
              key={index}
              x={point.x}
              y={chartHeight + 20}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
              transform={`rotate(-45 ${point.x} ${chartHeight + 20})`}
            >
              {formatDate(point.game_date)}
            </text>
          ))}
        </svg>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing last {trend.length} games</span>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Impact Score</span>
          </div>
        </div>
      </div>
    </div>
  );
}