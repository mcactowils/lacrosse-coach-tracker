import { NextRequest, NextResponse } from 'next/server';
import {
  getAllPlayers,
  getPlayersByTeam,
  createPlayer,
  getPlayersWithFilters
} from '@/lib/queries/players';
import type { CreatePlayerInput, PlayerFilters } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const active = searchParams.get('active');
    const search = searchParams.get('search');

    // If we have any filters, use the filtered query
    if (teamId || active !== null || search) {
      const filters: PlayerFilters = {};

      if (teamId) {
        filters.teamId = parseInt(teamId);
      }

      if (active !== null) {
        filters.active = active === 'true';
      }

      if (search) {
        filters.search = search;
      }

      const players = await getPlayersWithFilters(filters);
      return NextResponse.json(players);
    }

    // If teamId is specified without other filters, use optimized team query
    if (teamId && !search && active === null) {
      const players = await getPlayersByTeam(parseInt(teamId));
      return NextResponse.json(players);
    }

    // Default to all active players
    const players = await getAllPlayers();
    return NextResponse.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['team_id', 'first_name', 'last_name'];
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

    // Validate names are strings
    if (typeof body.first_name !== 'string' || typeof body.last_name !== 'string') {
      return NextResponse.json(
        { error: 'first_name and last_name must be strings' },
        { status: 400 }
      );
    }

    // Validate jersey number if provided
    if (body.jersey_number !== undefined && body.jersey_number !== null) {
      const jerseyNumber = parseInt(body.jersey_number);
      if (isNaN(jerseyNumber) || jerseyNumber < 1 || jerseyNumber > 99) {
        return NextResponse.json(
          { error: 'jersey_number must be between 1 and 99' },
          { status: 400 }
        );
      }
      body.jersey_number = jerseyNumber;
    }

    const playerData: CreatePlayerInput = {
      team_id: teamId,
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
      jersey_number: body.jersey_number || null,
      active: body.active ?? true,
    };

    const newPlayer = await createPlayer(playerData);
    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);

    // Handle unique constraint violations (duplicate jersey number)
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Jersey number already exists for this team' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    );
  }
}