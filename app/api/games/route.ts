import { NextRequest, NextResponse } from 'next/server';
import {
  getAllGames,
  getGamesByTeam,
  createGame,
  getGamesWithFilters
} from '@/lib/queries/games';
import type { CreateGameInput, GameFilters } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const limit = searchParams.get('limit');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const opponent = searchParams.get('opponent');

    // If we have filters other than just teamId and limit, use the filtered query
    if (startDate || endDate || opponent) {
      const filters: GameFilters = {};

      if (teamId) {
        filters.teamId = parseInt(teamId);
      }

      if (startDate) {
        filters.startDate = startDate;
      }

      if (endDate) {
        filters.endDate = endDate;
      }

      if (opponent) {
        filters.opponent = opponent;
      }

      const games = await getGamesWithFilters(filters);
      return NextResponse.json(games);
    }

    // If teamId is specified, use team-specific query
    if (teamId) {
      const limitNum = limit ? parseInt(limit) : undefined;
      const games = await getGamesByTeam(parseInt(teamId), limitNum);
      return NextResponse.json(games);
    }

    // Default to all games
    const games = await getAllGames();
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
    const requiredFields = ['team_id', 'game_date', 'opponent'];
    const missingFields = requiredFields.filter(field =>
      body[field] === undefined || body[field] === null || body[field] === ''
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate team_id is a number
    const teamId = parseInt(body.team_id);
    if (isNaN(teamId)) {
      return NextResponse.json(
        { error: 'team_id must be a valid number' },
        { status: 400 }
      );
    }

    // Validate opponent is a string
    if (typeof body.opponent !== 'string' || body.opponent.trim() === '') {
      return NextResponse.json(
        { error: 'opponent must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.game_date)) {
      return NextResponse.json(
        { error: 'game_date must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    // Validate date is valid
    const gameDate = new Date(body.game_date);
    if (isNaN(gameDate.getTime())) {
      return NextResponse.json(
        { error: 'game_date must be a valid date' },
        { status: 400 }
      );
    }

    const gameData: CreateGameInput = {
      team_id: teamId,
      game_date: body.game_date,
      opponent: body.opponent.trim(),
      location: body.location ? body.location.trim() : undefined,
    };

    const newGame = await createGame(gameData);
    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}