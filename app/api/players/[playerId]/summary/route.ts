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
      // Return empty summary instead of 404 to match frontend expectations
      return NextResponse.json({
        player_id: playerId,
        player_name: '',
        jersey_number: null,
        games_played: 0,
        total_ground_balls: 0,
        total_screens: 0,
        total_effort_plays: 0,
        total_impact_score: 0,
        avg_ground_balls: 0,
        avg_screens: 0,
        avg_effort_plays: 0,
        avg_impact_score: 0,
        best_impact_score: 0,
        latest_impact_score: null
      });
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