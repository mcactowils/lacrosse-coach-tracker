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
  let query = sql`
    SELECT
      p.*,
      p.first_name || ' ' || p.last_name as full_name,
      t.name as team_name
    FROM players p
    JOIN teams t ON p.team_id = t.id
    WHERE 1=1
  `;

  const conditions = [];
  const params: any[] = [];

  if (filters.teamId) {
    conditions.push(`p.team_id = $${conditions.length + 1}`);
    params.push(filters.teamId);
  }

  if (filters.active !== undefined) {
    conditions.push(`p.active = $${conditions.length + 1}`);
    params.push(filters.active);
  }

  if (filters.search) {
    conditions.push(`(
      LOWER(p.first_name) LIKE LOWER($${conditions.length + 1}) OR
      LOWER(p.last_name) LIKE LOWER($${conditions.length + 1}) OR
      CAST(p.jersey_number AS TEXT) LIKE $${conditions.length + 1}
    )`);
    params.push(`%${filters.search}%`);
  }

  if (conditions.length > 0) {
    const whereClause = ' AND ' + conditions.join(' AND ');
    query = sql`
      SELECT
        p.*,
        p.first_name || ' ' || p.last_name as full_name,
        t.name as team_name
      FROM players p
      JOIN teams t ON p.team_id = t.id
      WHERE 1=1 ${sql.unsafe(whereClause)}
      ORDER BY p.last_name, p.first_name
    `;
  }

  const result = await query;
  return result as Player[];
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
  const setClause: string[] = [];
  const params: any[] = [];

  if (updates.first_name !== undefined) {
    setClause.push(`first_name = $${setClause.length + 1}`);
    params.push(updates.first_name);
  }

  if (updates.last_name !== undefined) {
    setClause.push(`last_name = $${setClause.length + 1}`);
    params.push(updates.last_name);
  }

  if (updates.jersey_number !== undefined) {
    setClause.push(`jersey_number = $${setClause.length + 1}`);
    params.push(updates.jersey_number);
  }

  if (updates.active !== undefined) {
    setClause.push(`active = $${setClause.length + 1}`);
    params.push(updates.active);
  }

  if (setClause.length === 0) {
    return getPlayerById(playerId);
  }

  const result = await sql`
    UPDATE players
    SET ${sql.unsafe(setClause.join(', '))}
    WHERE id = ${playerId}
    RETURNING *
  `;

  return result[0] as Player || null;
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
  const seasonCondition = season
    ? sql`AND t.season = ${season}`
    : sql``;

  const result = await sql`
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
    WHERE p.id = ${playerId} ${seasonCondition}
    GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
  `;

  return result[0] as PlayerSeasonSummary || null;
}

export async function getTeamPlayersSummaries(
  teamId: number,
  season?: string
): Promise<PlayerSeasonSummary[]> {
  const seasonCondition = season
    ? sql`AND t.season = ${season}`
    : sql``;

  const result = await sql`
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
    WHERE p.team_id = ${teamId} AND p.active = true ${seasonCondition}
    GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
    ORDER BY p.last_name, p.first_name
  `;

  return result as PlayerSeasonSummary[];
}