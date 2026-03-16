import { sql } from '@/lib/db';
import type { Team, CreateTeamInput } from '@/lib/types';

export async function getAllTeams(): Promise<Team[]> {
  const result = await sql`
    SELECT * FROM teams
    ORDER BY created_at DESC
  `;
  return result as Team[];
}

export async function getTeamById(teamId: number): Promise<Team | null> {
  const result = await sql`
    SELECT * FROM teams
    WHERE id = ${teamId}
  `;
  return result[0] as Team || null;
}

export async function createTeam(teamData: CreateTeamInput): Promise<Team> {
  const result = await sql`
    INSERT INTO teams (name, season)
    VALUES (${teamData.name}, ${teamData.season})
    RETURNING *
  `;
  return result[0] as Team;
}

export async function updateTeam(
  teamId: number,
  updates: Partial<CreateTeamInput>
): Promise<Team | null> {
  if (updates.name && updates.season) {
    const result = await sql`
      UPDATE teams
      SET name = ${updates.name}, season = ${updates.season}
      WHERE id = ${teamId}
      RETURNING *
    `;
    return result[0] as Team || null;
  } else if (updates.name) {
    const result = await sql`
      UPDATE teams
      SET name = ${updates.name}
      WHERE id = ${teamId}
      RETURNING *
    `;
    return result[0] as Team || null;
  } else if (updates.season) {
    const result = await sql`
      UPDATE teams
      SET season = ${updates.season}
      WHERE id = ${teamId}
      RETURNING *
    `;
    return result[0] as Team || null;
  } else {
    return getTeamById(teamId);
  }
}

export async function deleteTeam(teamId: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM teams
    WHERE id = ${teamId}
    RETURNING id
  `;
  return result.length > 0;
}

export async function getTeamWithStats(teamId: number) {
  const result = await sql`
    SELECT
      t.*,
      COUNT(DISTINCT p.id) as player_count,
      COUNT(DISTINCT g.id) as game_count,
      COUNT(DISTINCT gs.id) as total_stats_records
    FROM teams t
    LEFT JOIN players p ON t.id = p.team_id AND p.active = true
    LEFT JOIN games g ON t.id = g.team_id
    LEFT JOIN game_stats gs ON g.id = gs.game_id
    WHERE t.id = ${teamId}
    GROUP BY t.id, t.name, t.season, t.created_at
  `;
  return result[0] || null;
}