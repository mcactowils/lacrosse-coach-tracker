import { NextRequest, NextResponse } from 'next/server';
import { getPlayerSeasonSummary } from '@/lib/queries/players';

export async function GET(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season');

    const playerId = parseInt(params.playerId);

    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: 'Player ID must be a valid number' },
        { status: 400 }
      );
    }

    const summary = await getPlayerSeasonSummary(playerId, season || undefined);

    if (!summary) {
      return NextResponse.json(
        { error: 'Player summary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching player summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player summary' },
      { status: 500 }
    );
  }
}