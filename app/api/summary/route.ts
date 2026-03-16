import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [summary, trend] = await Promise.all([
      db.getSeasonSummary(),
      db.getGamesTrend()
    ]);

    return NextResponse.json({
      summary,
      trend
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary data' },
      { status: 500 }
    );
  }
}