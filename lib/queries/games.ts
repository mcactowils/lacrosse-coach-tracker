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
  if (limit) {
    const result = await sql`
      SELECT
        g.*,
        t.name as team_name
      FROM games g
      JOIN teams t ON g.team_id = t.id
      WHERE g.team_id = ${teamId}
      ORDER BY g.game_date DESC
      LIMIT ${limit}
    `;
    return result as Game[];
  } else {
    const result = await sql`
      SELECT
        g.*,
        t.name as team_name
      FROM games g
      JOIN teams t ON g.team_id = t.id
      WHERE g.team_id = ${teamId}
      ORDER BY g.game_date DESC
    `;
    return result as Game[];
  }
}

export async function getGamesWithFilters(filters: GameFilters): Promise<Game[]> {
  // Build the query dynamically based on provided filters
  if (filters.teamId && filters.startDate && filters.endDate && filters.opponent) {
    return await sql`
      SELECT g.*, t.name as team_name
      FROM games g
      JOIN teams t ON g.team_id = t.id
      WHERE g.team_id = ${filters.teamId}
        AND g.game_date >= ${filters.startDate}
        AND g.game_date <= ${filters.endDate}
        AND LOWER(g.opponent) LIKE LOWER(${`%${filters.opponent}%`})
      ORDER BY g.game_date DESC
    ` as Game[];
  } else if (filters.teamId && filters.startDate && filters.endDate) {
    return await sql`
      SELECT g.*, t.name as team_name
      FROM games g
      JOIN teams t ON g.team_id = t.id
      WHERE g.team_id = ${filters.teamId}
        AND g.game_date >= ${filters.startDate}
        AND g.game_date <= ${filters.endDate}
      ORDER BY g.game_date DESC
    ` as Game[];
  } else if (filters.teamId && filters.opponent) {
    return await sql`
      SELECT g.*, t.name as team_name
      FROM games g
      JOIN teams t ON g.team_id = t.id
      WHERE g.team_id = ${filters.teamId}
        AND LOWER(g.opponent) LIKE LOWER(${`%${filters.opponent}%`})
      ORDER BY g.game_date DESC
    ` as Game[];
  } else if (filters.teamId) {
    return await sql`
      SELECT g.*, t.name as team_name
      FROM games g
      JOIN teams t ON g.team_id = t.id
      WHERE g.team_id = ${filters.teamId}
      ORDER BY g.game_date DESC
    ` as Game[];
  } else if (filters.startDate && filters.endDate) {
    return await sql`
      SELECT g.*, t.name as team_name
      FROM games g
      JOIN teams t ON g.team_id = t.id
      WHERE g.game_date >= ${filters.startDate}
        AND g.game_date <= ${filters.endDate}
      ORDER BY g.game_date DESC
    ` as Game[];
  } else if (filters.opponent) {
    return await sql`
      SELECT g.*, t.name as team_name
      FROM games g
      JOIN teams t ON g.team_id = t.id
      WHERE LOWER(g.opponent) LIKE LOWER(${`%${filters.opponent}%`})
      ORDER BY g.game_date DESC
    ` as Game[];
  } else {
    return await getAllGames();
  }
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
  if (updates.game_date && updates.opponent && updates.location !== undefined) {
    const result = await sql`
      UPDATE games
      SET game_date = ${updates.game_date}, opponent = ${updates.opponent}, location = ${updates.location}
      WHERE id = ${gameId}
      RETURNING *
    `;
    return result[0] as Game || null;
  } else if (updates.game_date && updates.opponent) {
    const result = await sql`
      UPDATE games
      SET game_date = ${updates.game_date}, opponent = ${updates.opponent}
      WHERE id = ${gameId}
      RETURNING *
    `;
    return result[0] as Game || null;
  } else if (updates.opponent) {
    const result = await sql`
      UPDATE games
      SET opponent = ${updates.opponent}
      WHERE id = ${gameId}
      RETURNING *
    `;
    return result[0] as Game || null;
  } else {
    return getGameById(gameId);
  }
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
  if (limit) {
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
      LIMIT ${limit}
    `;
    return result as GameStats[];
  } else {
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
    `;
    return result as GameStats[];
  }
}

export async function getGameStatsWithFilters(filters: StatsFilters): Promise<GameStats[]> {
  if (filters.playerId && filters.teamId) {
    return await sql`
      SELECT
        gs.*,
        p.first_name || ' ' || p.last_name as player_name,
        g.game_date,
        g.opponent
      FROM game_stats gs
      JOIN players p ON gs.player_id = p.id
      JOIN games g ON gs.game_id = g.id
      WHERE gs.player_id = ${filters.playerId} AND g.team_id = ${filters.teamId}
      ORDER BY g.game_date DESC, gs.impact_score DESC
    ` as GameStats[];
  } else if (filters.playerId) {
    return await sql`
      SELECT
        gs.*,
        p.first_name || ' ' || p.last_name as player_name,
        g.game_date,
        g.opponent
      FROM game_stats gs
      JOIN players p ON gs.player_id = p.id
      JOIN games g ON gs.game_id = g.id
      WHERE gs.player_id = ${filters.playerId}
      ORDER BY g.game_date DESC, gs.impact_score DESC
    ` as GameStats[];
  } else if (filters.teamId) {
    return await sql`
      SELECT
        gs.*,
        p.first_name || ' ' || p.last_name as player_name,
        g.game_date,
        g.opponent
      FROM game_stats gs
      JOIN players p ON gs.player_id = p.id
      JOIN games g ON gs.game_id = g.id
      WHERE g.team_id = ${filters.teamId}
      ORDER BY g.game_date DESC, gs.impact_score DESC
    ` as GameStats[];
  } else {
    return await sql`
      SELECT
        gs.*,
        p.first_name || ' ' || p.last_name as player_name,
        g.game_date,
        g.opponent
      FROM game_stats gs
      JOIN players p ON gs.player_id = p.id
      JOIN games g ON gs.game_id = g.id
      ORDER BY g.game_date DESC, gs.impact_score DESC
    ` as GameStats[];
  }
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
  if (updates.ground_balls !== undefined && updates.screens !== undefined && updates.effort_plays !== undefined) {
    const result = await sql`
      UPDATE game_stats
      SET ground_balls = ${updates.ground_balls}, screens = ${updates.screens}, effort_plays = ${updates.effort_plays}
      WHERE game_id = ${gameId} AND player_id = ${playerId}
      RETURNING *
    `;
    return result[0] as GameStats || null;
  } else {
    return getGameStatsByPlayerAndGame(gameId, playerId);
  }
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
  if (teamId) {
    const result = await sql`
      SELECT
        gs.*,
        p.first_name || ' ' || p.last_name as player_name,
        g.game_date,
        g.opponent
      FROM game_stats gs
      JOIN players p ON gs.player_id = p.id
      JOIN games g ON gs.game_id = g.id
      WHERE g.team_id = ${teamId}
      ORDER BY g.game_date DESC, gs.impact_score DESC
      LIMIT ${limit}
    `;
    return result as GameStats[];
  } else {
    const result = await sql`
      SELECT
        gs.*,
        p.first_name || ' ' || p.last_name as player_name,
        g.game_date,
        g.opponent
      FROM game_stats gs
      JOIN players p ON gs.player_id = p.id
      JOIN games g ON gs.game_id = g.id
      ORDER BY g.game_date DESC, gs.impact_score DESC
      LIMIT ${limit}
    `;
    return result as GameStats[];
  }
}