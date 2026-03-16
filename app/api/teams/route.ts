import { NextRequest, NextResponse } from 'next/server';
import { getAllTeams, createTeam } from '@/lib/queries/teams';
import type { CreateTeamInput } from '@/lib/types';

export async function GET() {
  try {
    const teams = await getAllTeams();
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.season) {
      return NextResponse.json(
        { error: 'Team name and season are required' },
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

    // Validate season format (optional - you can customize this)
    if (body.season.trim().length < 4) {
      return NextResponse.json(
        { error: 'Season must be at least 4 characters long (e.g., "2024 Spring")' },
        { status: 400 }
      );
    }

    const teamData: CreateTeamInput = {
      name: body.name.trim(),
      season: body.season.trim()
    };

    const newTeam = await createTeam(teamData);
    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}