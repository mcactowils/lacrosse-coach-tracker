import { sql } from '@/lib/db';
import type {
  Player,
  CreatePlayerInput,
  PlayerSeasonSummary,
  PlayerFilters
} from '@/lib/types';

export async function getAllPlayers(): Promise<Player[]> {
  const result = await sql`
    SELECT
      p.*,
      p.first_name || ' ' || p.last_name as full_name,
      t.name as team_name
    FROM players p
    JOIN teams t ON p.team_id = t.id
    WHERE p.active = true
    ORDER BY p.last_name, p.first_name
  `;
  return result as Player[];
}

export async function getPlayersByTeam(teamId: number): Promise<Player[]> {
  const result = await sql`
    SELECT
      p.*,
      p.first_name || ' ' || p.last_name as full_name,
      t.name as team_name
    FROM players p
    JOIN teams t ON p.team_id = t.id
    WHERE p.team_id = ${teamId} AND p.active = true
    ORDER BY p.jersey_number, p.last_name, p.first_name
  `;
  return result as Player[];
}

export async function getPlayerById(playerId: number): Promise<Player | null> {
  const result = await sql`
    SELECT
      p.*,
      p.first_name || ' ' || p.last_name as full_name,
      t.name as team_name
    FROM players p
    JOIN teams t ON p.team_id = t.id
    WHERE p.id = ${playerId}
  `;
  return result[0] as Player || null;
}

export async function getPlayersWithFilters(filters: PlayerFilters): Promise<Player[]> {
  if (filters.teamId && filters.search && filters.active !== undefined) {
    const result = await sql`
      SELECT
        p.*,
        p.first_name || ' ' || p.last_name as full_name,
        t.name as team_name
      FROM players p
      JOIN teams t ON p.team_id = t.id
      WHERE p.team_id = ${filters.teamId}
        AND p.active = ${filters.active}
        AND (
          LOWER(p.first_name) LIKE LOWER(${`%${filters.search}%`}) OR
          LOWER(p.last_name) LIKE LOWER(${`%${filters.search}%`}) OR
          CAST(p.jersey_number AS TEXT) LIKE ${`%${filters.search}%`}
        )
      ORDER BY p.last_name, p.first_name
    `;
    return result as Player[];
  } else if (filters.teamId && filters.active !== undefined) {
    const result = await sql`
      SELECT
        p.*,
        p.first_name || ' ' || p.last_name as full_name,
        t.name as team_name
      FROM players p
      JOIN teams t ON p.team_id = t.id
      WHERE p.team_id = ${filters.teamId} AND p.active = ${filters.active}
      ORDER BY p.last_name, p.first_name
    `;
    return result as Player[];
  } else if (filters.teamId && filters.search) {
    const result = await sql`
      SELECT
        p.*,
        p.first_name || ' ' || p.last_name as full_name,
        t.name as team_name
      FROM players p
      JOIN teams t ON p.team_id = t.id
      WHERE p.team_id = ${filters.teamId}
        AND (
          LOWER(p.first_name) LIKE LOWER(${`%${filters.search}%`}) OR
          LOWER(p.last_name) LIKE LOWER(${`%${filters.search}%`}) OR
          CAST(p.jersey_number AS TEXT) LIKE ${`%${filters.search}%`}
        )
      ORDER BY p.last_name, p.first_name
    `;
    return result as Player[];
  } else if (filters.teamId) {
    return getPlayersByTeam(filters.teamId);
  } else if (filters.search) {
    const result = await sql`
      SELECT
        p.*,
        p.first_name || ' ' || p.last_name as full_name,
        t.name as team_name
      FROM players p
      JOIN teams t ON p.team_id = t.id
      WHERE (
        LOWER(p.first_name) LIKE LOWER(${`%${filters.search}%`}) OR
        LOWER(p.last_name) LIKE LOWER(${`%${filters.search}%`}) OR
        CAST(p.jersey_number AS TEXT) LIKE ${`%${filters.search}%`}
      )
      ORDER BY p.last_name, p.first_name
    `;
    return result as Player[];
  } else if (filters.active !== undefined) {
    const result = await sql`
      SELECT
        p.*,
        p.first_name || ' ' || p.last_name as full_name,
        t.name as team_name
      FROM players p
      JOIN teams t ON p.team_id = t.id
      WHERE p.active = ${filters.active}
      ORDER BY p.last_name, p.first_name
    `;
    return result as Player[];
  } else {
    return getAllPlayers();
  }
}

export async function createPlayer(playerData: CreatePlayerInput): Promise<Player> {
  const result = await sql`
    INSERT INTO players (team_id, first_name, last_name, jersey_number, active)
    VALUES (${playerData.team_id}, ${playerData.first_name}, ${playerData.last_name},
            ${playerData.jersey_number || null}, ${playerData.active ?? true})
    RETURNING *
  `;
  return result[0] as Player;
}

export async function updatePlayer(
  playerId: number,
  updates: Partial<CreatePlayerInput>
): Promise<Player | null> {
  if (updates.first_name && updates.last_name && updates.jersey_number !== undefined && updates.active !== undefined) {
    const result = await sql`
      UPDATE players
      SET first_name = ${updates.first_name}, last_name = ${updates.last_name},
          jersey_number = ${updates.jersey_number}, active = ${updates.active}
      WHERE id = ${playerId}
      RETURNING *
    `;
    return result[0] as Player || null;
  } else if (updates.first_name && updates.last_name) {
    const result = await sql`
      UPDATE players
      SET first_name = ${updates.first_name}, last_name = ${updates.last_name}
      WHERE id = ${playerId}
      RETURNING *
    `;
    return result[0] as Player || null;
  } else if (updates.first_name) {
    const result = await sql`
      UPDATE players
      SET first_name = ${updates.first_name}
      WHERE id = ${playerId}
      RETURNING *
    `;
    return result[0] as Player || null;
  } else if (updates.last_name) {
    const result = await sql`
      UPDATE players
      SET last_name = ${updates.last_name}
      WHERE id = ${playerId}
      RETURNING *
    `;
    return result[0] as Player || null;
  } else if (updates.jersey_number !== undefined) {
    const result = await sql`
      UPDATE players
      SET jersey_number = ${updates.jersey_number}
      WHERE id = ${playerId}
      RETURNING *
    `;
    return result[0] as Player || null;
  } else if (updates.active !== undefined) {
    const result = await sql`
      UPDATE players
      SET active = ${updates.active}
      WHERE id = ${playerId}
      RETURNING *
    `;
    return result[0] as Player || null;
  } else {
    return getPlayerById(playerId);
  }
}

export async function deletePlayer(playerId: number): Promise<boolean> {
  const result = await sql`
    UPDATE players
    SET active = false
    WHERE id = ${playerId}
    RETURNING id
  `;
  return result.length > 0;
}

export async function getPlayerSeasonSummary(
  playerId: number,
  season?: string
): Promise<PlayerSeasonSummary | null> {
  let result;

  if (season) {
    result = await sql`
      SELECT
        p.id as player_id,
        p.first_name || ' ' || p.last_name as player_name,
        p.jersey_number,
        COUNT(DISTINCT g.id) as games_played,
        COALESCE(SUM(gs.ground_balls), 0) as total_ground_balls,
        COALESCE(SUM(gs.screens), 0) as total_screens,
        COALESCE(SUM(gs.effort_plays), 0) as total_effort_plays,
        COALESCE(SUM(gs.impact_score), 0) as total_impact_score,
        COALESCE(ROUND(AVG(gs.ground_balls), 1), 0) as avg_ground_balls,
        COALESCE(ROUND(AVG(gs.screens), 1), 0) as avg_screens,
        COALESCE(ROUND(AVG(gs.effort_plays), 1), 0) as avg_effort_plays,
        COALESCE(ROUND(AVG(gs.impact_score), 1), 0) as avg_impact_score,
        COALESCE(MAX(gs.impact_score), 0) as best_impact_score,
        (
          SELECT gs2.impact_score
          FROM game_stats gs2
          JOIN games g2 ON gs2.game_id = g2.id
          WHERE gs2.player_id = p.id
          ORDER BY g2.game_date DESC
          LIMIT 1
        ) as latest_impact_score
      FROM players p
      LEFT JOIN game_stats gs ON p.id = gs.player_id
      LEFT JOIN games g ON gs.game_id = g.id
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.id = ${playerId} AND t.season = ${season}
      GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
    `;
  } else {
    result = await sql`
      SELECT
        p.id as player_id,
        p.first_name || ' ' || p.last_name as player_name,
        p.jersey_number,
        COUNT(DISTINCT g.id) as games_played,
        COALESCE(SUM(gs.ground_balls), 0) as total_ground_balls,
        COALESCE(SUM(gs.screens), 0) as total_screens,
        COALESCE(SUM(gs.effort_plays), 0) as total_effort_plays,
        COALESCE(SUM(gs.impact_score), 0) as total_impact_score,
        COALESCE(ROUND(AVG(gs.ground_balls), 1), 0) as avg_ground_balls,
        COALESCE(ROUND(AVG(gs.screens), 1), 0) as avg_screens,
        COALESCE(ROUND(AVG(gs.effort_plays), 1), 0) as avg_effort_plays,
        COALESCE(ROUND(AVG(gs.impact_score), 1), 0) as avg_impact_score,
        COALESCE(MAX(gs.impact_score), 0) as best_impact_score,
        (
          SELECT gs2.impact_score
          FROM game_stats gs2
          JOIN games g2 ON gs2.game_id = g2.id
          WHERE gs2.player_id = p.id
          ORDER BY g2.game_date DESC
          LIMIT 1
        ) as latest_impact_score
      FROM players p
      LEFT JOIN game_stats gs ON p.id = gs.player_id
      LEFT JOIN games g ON gs.game_id = g.id
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.id = ${playerId}
      GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
    `;
  }

  return (result[0] as PlayerSeasonSummary) || null;
}

export async function getTeamPlayersSummaries(
  teamId: number,
  season?: string
): Promise<PlayerSeasonSummary[]> {
  let result;

  if (season) {
    result = await sql`
      SELECT
        p.id as player_id,
        p.first_name || ' ' || p.last_name as player_name,
        p.jersey_number,
        COUNT(DISTINCT g.id) as games_played,
        COALESCE(SUM(gs.ground_balls), 0) as total_ground_balls,
        COALESCE(SUM(gs.screens), 0) as total_screens,
        COALESCE(SUM(gs.effort_plays), 0) as total_effort_plays,
        COALESCE(SUM(gs.impact_score), 0) as total_impact_score,
        COALESCE(ROUND(AVG(gs.ground_balls), 1), 0) as avg_ground_balls,
        COALESCE(ROUND(AVG(gs.screens), 1), 0) as avg_screens,
        COALESCE(ROUND(AVG(gs.effort_plays), 1), 0) as avg_effort_plays,
        COALESCE(ROUND(AVG(gs.impact_score), 1), 0) as avg_impact_score,
        COALESCE(MAX(gs.impact_score), 0) as best_impact_score,
        (
          SELECT gs2.impact_score
          FROM game_stats gs2
          JOIN games g2 ON gs2.game_id = g2.id
          WHERE gs2.player_id = p.id
          ORDER BY g2.game_date DESC
          LIMIT 1
        ) as latest_impact_score
      FROM players p
      LEFT JOIN game_stats gs ON p.id = gs.player_id
      LEFT JOIN games g ON gs.game_id = g.id
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.team_id = ${teamId} AND p.active = true AND t.season = ${season}
      GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
      ORDER BY p.last_name, p.first_name
    `;
  } else {
    result = await sql`
      SELECT
        p.id as player_id,
        p.first_name || ' ' || p.last_name as player_name,
        p.jersey_number,
        COUNT(DISTINCT g.id) as games_played,
        COALESCE(SUM(gs.ground_balls), 0) as total_ground_balls,
        COALESCE(SUM(gs.screens), 0) as total_screens,
        COALESCE(SUM(gs.effort_plays), 0) as total_effort_plays,
        COALESCE(SUM(gs.impact_score), 0) as total_impact_score,
        COALESCE(ROUND(AVG(gs.ground_balls), 1), 0) as avg_ground_balls,
        COALESCE(ROUND(AVG(gs.screens), 1), 0) as avg_screens,
        COALESCE(ROUND(AVG(gs.effort_plays), 1), 0) as avg_effort_plays,
        COALESCE(ROUND(AVG(gs.impact_score), 1), 0) as avg_impact_score,
        COALESCE(MAX(gs.impact_score), 0) as best_impact_score,
        (
          SELECT gs2.impact_score
          FROM game_stats gs2
          JOIN games g2 ON gs2.game_id = g2.id
          WHERE gs2.player_id = p.id
          ORDER BY g2.game_date DESC
          LIMIT 1
        ) as latest_impact_score
      FROM players p
      LEFT JOIN game_stats gs ON p.id = gs.player_id
      LEFT JOIN games g ON gs.game_id = g.id
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.team_id = ${teamId} AND p.active = true
      GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
      ORDER BY p.last_name, p.first_name
    `;
  }

  return result as PlayerSeasonSummary[];
}