import { NextRequest, NextResponse } from 'next/server';
import { db, type GameInput } from '@/lib/db';

export async function GET() {
  try {
    const games = await db.getRecentGames(50);
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['game_date', 'opponent', 'ground_balls', 'screens', 'effort_plays'];
    const missingFields = requiredFields.filter(field =>
      body[field] === undefined || body[field] === null
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate data types
    if (typeof body.opponent !== 'string' || body.opponent.trim() === '') {
      return NextResponse.json(
        { error: 'Opponent must be a non-empty string' },
        { status: 400 }
      );
    }

    const numericFields = ['ground_balls', 'screens', 'effort_plays'];
    for (const field of numericFields) {
      const value = parseInt(body[field]);
      if (isNaN(value) || value < 0) {
        return NextResponse.json(
          { error: `${field} must be a non-negative number` },
          { status: 400 }
        );
      }
      body[field] = value;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.game_date)) {
      return NextResponse.json(
        { error: 'game_date must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    const gameData: GameInput = {
      game_date: body.game_date,
      opponent: body.opponent.trim(),
      ground_balls: body.ground_balls,
      screens: body.screens,
      effort_plays: body.effort_plays,
    };

    const newGame = await db.createGame(gameData);
    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}