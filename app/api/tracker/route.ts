import { NextRequest, NextResponse } from 'next/server';
import {
  createGameStats,
  upsertGameStats,
  getGameStats
} from '@/lib/queries/games';
import { createGame } from '@/lib/queries/games';
import type { CreateGameInput, CreateGameStatsInput } from '@/lib/types';

// GET /api/tracker?gameId=123 - Get stats for a specific game
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json(
        { error: 'gameId parameter is required' },
        { status: 400 }
      );
    }

    const gameIdNum = parseInt(gameId);
    if (isNaN(gameIdNum)) {
      return NextResponse.json(
        { error: 'gameId must be a valid number' },
        { status: 400 }
      );
    }

    const gameStats = await getGameStats(gameIdNum);
    return NextResponse.json(gameStats);
  } catch (error) {
    console.error('Error fetching game stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game stats' },
      { status: 500 }
    );
  }
}

// POST /api/tracker - Save game and stats from tracker
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request structure
    if (!body.game || !body.stats || !Array.isArray(body.stats)) {
      return NextResponse.json(
        { error: 'Request must include game object and stats array' },
        { status: 400 }
      );
    }

    const { game, stats } = body;

    // Validate game data
    const requiredGameFields = ['team_id', 'game_date', 'opponent'];
    const missingGameFields = requiredGameFields.filter(field =>
      game[field] === undefined || game[field] === null || game[field] === ''
    );

    if (missingGameFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required game fields: ${missingGameFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate team_id
    const teamId = parseInt(game.team_id);
    if (isNaN(teamId)) {
      return NextResponse.json(
        { error: 'team_id must be a valid number' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(game.game_date)) {
      return NextResponse.json(
        { error: 'game_date must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    // Validate stats array
    if (stats.length === 0) {
      return NextResponse.json(
        { error: 'At least one player stat is required' },
        { status: 400 }
      );
    }

    // Validate each stat entry
    for (const stat of stats) {
      const requiredStatFields = ['player_id', 'ground_balls', 'screens', 'effort_plays'];
      const missingStatFields = requiredStatFields.filter(field =>
        stat[field] === undefined || stat[field] === null
      );

      if (missingStatFields.length > 0) {
        return NextResponse.json(
          { error: `Missing required stat fields: ${missingStatFields.join(', ')}` },
          { status: 400 }
        );
      }

      // Validate numeric fields
      const numericFields = ['player_id', 'ground_balls', 'screens', 'effort_plays'];
      for (const field of numericFields) {
        const value = parseInt(stat[field]);
        if (isNaN(value) || value < 0) {
          return NextResponse.json(
            { error: `${field} must be a non-negative number` },
            { status: 400 }
          );
        }
      }
    }

    // Create the game first
    const gameData: CreateGameInput = {
      team_id: teamId,
      game_date: game.game_date,
      opponent: game.opponent.trim(),
      location: game.location ? game.location.trim() : undefined,
    };

    const newGame = await createGame(gameData);

    // Create stats for each player
    const createdStats = [];
    for (const stat of stats) {
      // Skip players with zero stats (no participation)
      if (stat.ground_balls === 0 && stat.screens === 0 && stat.effort_plays === 0) {
        continue;
      }

      const statsData: CreateGameStatsInput = {
        game_id: newGame.id,
        player_id: parseInt(stat.player_id),
        ground_balls: parseInt(stat.ground_balls),
        screens: parseInt(stat.screens),
        effort_plays: parseInt(stat.effort_plays),
        notes: stat.notes || null,
      };

      const gameStats = await createGameStats(statsData);
      createdStats.push(gameStats);
    }

    return NextResponse.json({
      game: newGame,
      stats: createdStats,
      message: `Game saved with stats for ${createdStats.length} players`
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving tracker data:', error);

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Game with this date and opponent already exists for this team' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save tracker data' },
      { status: 500 }
    );
  }
}

// PUT /api/tracker - Update existing game stats
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.game_id || !body.stats || !Array.isArray(body.stats)) {
      return NextResponse.json(
        { error: 'Request must include game_id and stats array' },
        { status: 400 }
      );
    }

    const { game_id, stats } = body;

    // Validate game_id
    const gameId = parseInt(game_id);
    if (isNaN(gameId)) {
      return NextResponse.json(
        { error: 'game_id must be a valid number' },
        { status: 400 }
      );
    }

    // Validate and update each stat entry
    const updatedStats = [];
    for (const stat of stats) {
      const requiredStatFields = ['player_id', 'ground_balls', 'screens', 'effort_plays'];
      const missingStatFields = requiredStatFields.filter(field =>
        stat[field] === undefined || stat[field] === null
      );

      if (missingStatFields.length > 0) {
        return NextResponse.json(
          { error: `Missing required stat fields: ${missingStatFields.join(', ')}` },
          { status: 400 }
        );
      }

      const statsData: CreateGameStatsInput = {
        game_id: gameId,
        player_id: parseInt(stat.player_id),
        ground_balls: parseInt(stat.ground_balls),
        screens: parseInt(stat.screens),
        effort_plays: parseInt(stat.effort_plays),
        notes: stat.notes || null,
      };

      const gameStats = await upsertGameStats(statsData);
      updatedStats.push(gameStats);
    }

    return NextResponse.json({
      stats: updatedStats,
      message: `Updated stats for ${updatedStats.length} players`
    });

  } catch (error) {
    console.error('Error updating tracker data:', error);
    return NextResponse.json(
      { error: 'Failed to update tracker data' },
      { status: 500 }
    );
  }
}