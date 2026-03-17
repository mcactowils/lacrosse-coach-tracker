import { NextRequest, NextResponse } from 'next/server';
import { getTeamById, updateTeam } from '@/lib/queries/teams';

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const teamId = parseInt(params.teamId);

    if (isNaN(teamId)) {
      return NextResponse.json(
        { error: 'Team ID must be a valid number' },
        { status: 400 }
      );
    }

    const team = await getTeamById(teamId);

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const teamId = parseInt(params.teamId);

    if (isNaN(teamId)) {
      return NextResponse.json(
        { error: 'Team ID must be a valid number' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        { error: 'Team name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!body.season || typeof body.season !== 'string' || body.season.trim() === '') {
      return NextResponse.json(
        { error: 'Season is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate name length
    if (body.name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Team name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Validate season length
    if (body.season.trim().length < 4) {
      return NextResponse.json(
        { error: 'Season must be at least 4 characters long' },
        { status: 400 }
      );
    }

    const updatedTeam = await updateTeam(teamId, {
      name: body.name.trim(),
      season: body.season.trim()
    });

    if (!updatedTeam) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'A team with this name and season already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}