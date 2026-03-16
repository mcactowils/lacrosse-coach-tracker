import { sql } from '@/lib/db';
import type {
  Game,
  GameStats,
  CreateGameInput,
  CreateGameStatsInput,
  UpdateGameStatsInput,
  GameFilters,
  StatsFilters,
  PlayerTrendData
} from '@/lib/types';

export async function getAllGames(): Promise<Game[]> {
  const result = await sql`
    SELECT
      g.*,
      t.name as team_name
    FROM games g
    JOIN teams t ON g.team_id = t.id
    ORDER BY g.game_date DESC
  `;
  return result as Game[];
}

export async function getGameById(gameId: number): Promise<Game | null> {
  const result = await sql`
    SELECT
      g.*,
      t.name as team_name
    FROM games g
    JOIN teams t ON g.team_id = t.id
    WHERE g.id = ${gameId}
  `;
  return result[0] as Game || null;
}

export async function getGamesByTeam(teamId: number, limit?: number): Promise<Game[]> {
  const limitClause = limit ? sql`LIMIT ${limit}` : sql``;

  const result = await sql`
    SELECT
      g.*,
      t.name as team_name
    FROM games g
    JOIN teams t ON g.team_id = t.id
    WHERE g.team_id = ${teamId}
    ORDER BY g.game_date DESC
    ${limitClause}
  `;
  return result as Game[];
}

export async function getGamesWithFilters(filters: GameFilters): Promise<Game[]> {
  const conditions = ['1=1'];
  const params: any[] = [];

  if (filters.teamId) {
    conditions.push(`g.team_id = $${conditions.length}`);
    params.push(filters.teamId);
  }

  if (filters.startDate) {
    conditions.push(`g.game_date >= $${conditions.length}`);
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    conditions.push(`g.game_date <= $${conditions.length}`);
    params.push(filters.endDate);
  }

  if (filters.opponent) {
    conditions.push(`LOWER(g.opponent) LIKE LOWER($${conditions.length})`);
    params.push(`%${filters.opponent}%`);
  }

  const whereClause = conditions.join(' AND ');

  const result = await sql`
    SELECT
      g.*,
      t.name as team_name
    FROM games g
    JOIN teams t ON g.team_id = t.id
    WHERE ${sql.unsafe(whereClause)}
    ORDER BY g.game_date DESC
  `;

  return result as Game[];
}

export async function createGame(gameData: CreateGameInput): Promise<Game> {
  const result = await sql`
    INSERT INTO games (team_id, game_date, opponent, location)
    VALUES (${gameData.team_id}, ${gameData.game_date}, ${gameData.opponent}, ${gameData.location || null})
    RETURNING *
  `;
  return result[0] as Game;
}

export async function updateGame(
  gameId: number,
  updates: Partial<CreateGameInput>
): Promise<Game | null> {
  const setClause: string[] = [];
  const params: any[] = [];

  if (updates.game_date !== undefined) {
    setClause.push(`game_date = $${setClause.length + 1}`);
    params.push(updates.game_date);
  }

  if (updates.opponent !== undefined) {
    setClause.push(`opponent = $${setClause.length + 1}`);
    params.push(updates.opponent);
  }

  if (updates.location !== undefined) {
    setClause.push(`location = $${setClause.length + 1}`);
    params.push(updates.location);
  }

  if (setClause.length === 0) {
    return getGameById(gameId);
  }

  const result = await sql`
    UPDATE games
    SET ${sql.unsafe(setClause.join(', '))}
    WHERE id = ${gameId}
    RETURNING *
  `;

  return result[0] as Game || null;
}

export async function deleteGame(gameId: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM games
    WHERE id = ${gameId}
    RETURNING id
  `;
  return result.length > 0;
}

// Game Stats functions

export async function getGameStats(gameId: number): Promise<GameStats[]> {
  const result = await sql`
    SELECT
      gs.*,
      p.first_name || ' ' || p.last_name as player_name,
      g.game_date,
      g.opponent
    FROM game_stats gs
    JOIN players p ON gs.player_id = p.id
    JOIN games g ON gs.game_id = g.id
    WHERE gs.game_id = ${gameId}
    ORDER BY p.jersey_number, p.last_name, p.first_name
  `;
  return result as GameStats[];
}

export async function getPlayerGameStats(
  playerId: number,
  limit?: number
): Promise<GameStats[]> {
  const limitClause = limit ? sql`LIMIT ${limit}` : sql``;

  const result = await sql`
    SELECT
      gs.*,
      p.first_name || ' ' || p.last_name as player_name,
      g.game_date,
      g.opponent
    FROM game_stats gs
    JOIN players p ON gs.player_id = p.id
    JOIN games g ON gs.game_id = g.id
    WHERE gs.player_id = ${playerId}
    ORDER BY g.game_date DESC
    ${limitClause}
  `;
  return result as GameStats[];
}

export async function getGameStatsWithFilters(filters: StatsFilters): Promise<GameStats[]> {
  const conditions = ['1=1'];
  const params: any[] = [];

  if (filters.playerId) {
    conditions.push(`gs.player_id = $${conditions.length}`);
    params.push(filters.playerId);
  }

  if (filters.teamId) {
    conditions.push(`g.team_id = $${conditions.length}`);
    params.push(filters.teamId);
  }

  if (filters.startDate) {
    conditions.push(`g.game_date >= $${conditions.length}`);
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    conditions.push(`g.game_date <= $${conditions.length}`);
    params.push(filters.endDate);
  }

  if (filters.minImpactScore) {
    conditions.push(`gs.impact_score >= $${conditions.length}`);
    params.push(filters.minImpactScore);
  }

  if (filters.maxImpactScore) {
    conditions.push(`gs.impact_score <= $${conditions.length}`);
    params.push(filters.maxImpactScore);
  }

  const whereClause = conditions.join(' AND ');

  const result = await sql`
    SELECT
      gs.*,
      p.first_name || ' ' || p.last_name as player_name,
      g.game_date,
      g.opponent
    FROM game_stats gs
    JOIN players p ON gs.player_id = p.id
    JOIN games g ON gs.game_id = g.id
    WHERE ${sql.unsafe(whereClause)}
    ORDER BY g.game_date DESC, gs.impact_score DESC
  `;

  return result as GameStats[];
}

export async function createGameStats(statsData: CreateGameStatsInput): Promise<GameStats> {
  const result = await sql`
    INSERT INTO game_stats (game_id, player_id, ground_balls, screens, effort_plays, notes)
    VALUES (${statsData.game_id}, ${statsData.player_id}, ${statsData.ground_balls},
            ${statsData.screens}, ${statsData.effort_plays}, ${statsData.notes || null})
    RETURNING *
  `;
  return result[0] as GameStats;
}

export async function updateGameStats(
  gameId: number,
  playerId: number,
  updates: UpdateGameStatsInput
): Promise<GameStats | null> {
  const setClause: string[] = [];
  const params: any[] = [];

  if (updates.ground_balls !== undefined) {
    setClause.push(`ground_balls = $${setClause.length + 1}`);
    params.push(updates.ground_balls);
  }

  if (updates.screens !== undefined) {
    setClause.push(`screens = $${setClause.length + 1}`);
    params.push(updates.screens);
  }

  if (updates.effort_plays !== undefined) {
    setClause.push(`effort_plays = $${setClause.length + 1}`);
    params.push(updates.effort_plays);
  }

  if (updates.notes !== undefined) {
    setClause.push(`notes = $${setClause.length + 1}`);
    params.push(updates.notes);
  }

  if (setClause.length === 0) {
    return getGameStatsByPlayerAndGame(gameId, playerId);
  }

  const result = await sql`
    UPDATE game_stats
    SET ${sql.unsafe(setClause.join(', '))}
    WHERE game_id = ${gameId} AND player_id = ${playerId}
    RETURNING *
  `;

  return result[0] as GameStats || null;
}

export async function upsertGameStats(statsData: CreateGameStatsInput): Promise<GameStats> {
  const result = await sql`
    INSERT INTO game_stats (game_id, player_id, ground_balls, screens, effort_plays, notes)
    VALUES (${statsData.game_id}, ${statsData.player_id}, ${statsData.ground_balls},
            ${statsData.screens}, ${statsData.effort_plays}, ${statsData.notes || null})
    ON CONFLICT (game_id, player_id)
    DO UPDATE SET
      ground_balls = EXCLUDED.ground_balls,
      screens = EXCLUDED.screens,
      effort_plays = EXCLUDED.effort_plays,
      notes = EXCLUDED.notes
    RETURNING *
  `;
  return result[0] as GameStats;
}

export async function getGameStatsByPlayerAndGame(
  gameId: number,
  playerId: number
): Promise<GameStats | null> {
  const result = await sql`
    SELECT
      gs.*,
      p.first_name || ' ' || p.last_name as player_name,
      g.game_date,
      g.opponent
    FROM game_stats gs
    JOIN players p ON gs.player_id = p.id
    JOIN games g ON gs.game_id = g.id
    WHERE gs.game_id = ${gameId} AND gs.player_id = ${playerId}
  `;
  return result[0] as GameStats || null;
}

export async function deleteGameStats(gameId: number, playerId: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM game_stats
    WHERE game_id = ${gameId} AND player_id = ${playerId}
    RETURNING id
  `;
  return result.length > 0;
}

export async function getPlayerTrend(
  playerId: number,
  limit: number = 10
): Promise<PlayerTrendData[]> {
  const result = await sql`
    SELECT
      g.game_date,
      g.opponent,
      gs.ground_balls,
      gs.screens,
      gs.effort_plays,
      gs.impact_score
    FROM game_stats gs
    JOIN games g ON gs.game_id = g.id
    WHERE gs.player_id = ${playerId}
    ORDER BY g.game_date ASC
    LIMIT ${limit}
  `;
  return result as PlayerTrendData[];
}

export async function getRecentGameStats(
  teamId?: number,
  limit: number = 20
): Promise<GameStats[]> {
  const teamCondition = teamId ? sql`AND g.team_id = ${teamId}` : sql``;

  const result = await sql`
    SELECT
      gs.*,
      p.first_name || ' ' || p.last_name as player_name,
      g.game_date,
      g.opponent
    FROM game_stats gs
    JOIN players p ON gs.player_id = p.id
    JOIN games g ON gs.game_id = g.id
    WHERE 1=1 ${teamCondition}
    ORDER BY g.game_date DESC, gs.impact_score DESC
    LIMIT ${limit}
  `;
  return result as GameStats[];
}