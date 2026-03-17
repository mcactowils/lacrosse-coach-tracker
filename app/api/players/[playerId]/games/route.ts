import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    const playerId = parseInt(params.playerId);

    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: 'Player ID must be a valid number' },
        { status: 400 }
      );
    }

    const limitNum = limit ? parseInt(limit) : 50;

    const gameStats = await sql`
      SELECT
        gs.*,
        g.game_date,
        g.opponent,
        g.location,
        (gs.ground_balls + gs.screens + gs.effort_plays) as impact_score
      FROM game_stats gs
      JOIN games g ON gs.game_id = g.id
      WHERE gs.player_id = ${playerId}
      ORDER BY g.game_date DESC
      LIMIT ${limitNum}
    `;

    return NextResponse.json(gameStats);
  } catch (error) {
    console.error('Error fetching player game stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player game stats' },
      { status: 500 }
    );
  }
}