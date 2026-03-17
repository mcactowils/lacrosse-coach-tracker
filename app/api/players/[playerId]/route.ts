import { NextRequest, NextResponse } from 'next/server';
import { getPlayerById, getPlayerSeasonSummary } from '@/lib/queries/players';

export async function GET(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const playerId = parseInt(params.playerId);

    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: 'Player ID must be a valid number' },
        { status: 400 }
      );
    }

    const player = await getPlayerById(playerId);

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    );
  }
}