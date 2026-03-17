import { sql } from '@/lib/db';
import type {
  TeamSeasonSummary,
  PlayerSeasonSummary,
  GameTrendData
} from '@/lib/types';

export async function getTeamSeasonSummary(
  teamId: number,
  season?: string
): Promise<TeamSeasonSummary | null> {
  try {
    // First check if team exists
    const teamCheck = await sql`
      SELECT id, name, season FROM teams WHERE id = ${teamId}
    `;

    if (teamCheck.length === 0) {
      return null;
    }

    let result;

    if (season) {
      result = await sql`
        SELECT
          t.id as team_id,
          t.name as team_name,
          t.season,
          COUNT(DISTINCT g.id) as total_games,
          COUNT(DISTINCT p.id) as total_players,
          COALESCE(ROUND(AVG(gs.impact_score), 1), 0) as avg_team_impact,
          COALESCE(MAX(
            (SELECT SUM(gs2.impact_score)
             FROM game_stats gs2
             WHERE gs2.game_id = g.id)
          ), 0) as best_team_game,
          COALESCE(MAX(gs.impact_score), 0) as best_individual_game
        FROM teams t
        LEFT JOIN games g ON t.id = g.team_id
        LEFT JOIN players p ON t.id = p.team_id AND p.active = true
        LEFT JOIN game_stats gs ON g.id = gs.game_id
        WHERE t.id = ${teamId} AND t.season = ${season}
        GROUP BY t.id, t.name, t.season
      `;
    } else {
      result = await sql`
        SELECT
          t.id as team_id,
          t.name as team_name,
          t.season,
          COUNT(DISTINCT g.id) as total_games,
          COUNT(DISTINCT p.id) as total_players,
          COALESCE(ROUND(AVG(gs.impact_score), 1), 0) as avg_team_impact,
          COALESCE(MAX(
            (SELECT SUM(gs2.impact_score)
             FROM game_stats gs2
             WHERE gs2.game_id = g.id)
          ), 0) as best_team_game,
          COALESCE(MAX(gs.impact_score), 0) as best_individual_game
        FROM teams t
        LEFT JOIN games g ON t.id = g.team_id
        LEFT JOIN players p ON t.id = p.team_id AND p.active = true
        LEFT JOIN game_stats gs ON g.id = gs.game_id
        WHERE t.id = ${teamId}
        GROUP BY t.id, t.name, t.season
      `;
    }

    return (result[0] as TeamSeasonSummary) || null;
  } catch (error) {
    console.error('Error in getTeamSeasonSummary:', error);
    return null;
  }
}

export async function getAllTeamsSummary(season?: string): Promise<TeamSeasonSummary[]> {
  let result;

  if (season) {
    result = await sql`
      SELECT
        t.id as team_id,
        t.name as team_name,
        t.season,
        COUNT(DISTINCT g.id) as total_games,
        COUNT(DISTINCT p.id) as total_players,
        COALESCE(ROUND(AVG(gs.impact_score), 1), 0) as avg_team_impact,
        COALESCE(MAX(
          (SELECT SUM(gs2.impact_score)
           FROM game_stats gs2
           WHERE gs2.game_id = g.id)
        ), 0) as best_team_game,
        COALESCE(MAX(gs.impact_score), 0) as best_individual_game
      FROM teams t
      LEFT JOIN games g ON t.id = g.team_id
      LEFT JOIN players p ON t.id = p.team_id AND p.active = true
      LEFT JOIN game_stats gs ON g.id = gs.game_id
      WHERE t.season = ${season}
      GROUP BY t.id, t.name, t.season
      ORDER BY t.name
    `;
  } else {
    result = await sql`
      SELECT
        t.id as team_id,
        t.name as team_name,
        t.season,
        COUNT(DISTINCT g.id) as total_games,
        COUNT(DISTINCT p.id) as total_players,
        COALESCE(ROUND(AVG(gs.impact_score), 1), 0) as avg_team_impact,
        COALESCE(MAX(
          (SELECT SUM(gs2.impact_score)
           FROM game_stats gs2
           WHERE gs2.game_id = g.id)
        ), 0) as best_team_game,
        COALESCE(MAX(gs.impact_score), 0) as best_individual_game
      FROM teams t
      LEFT JOIN games g ON t.id = g.team_id
      LEFT JOIN players p ON t.id = p.team_id AND p.active = true
      LEFT JOIN game_stats gs ON g.id = gs.game_id
      GROUP BY t.id, t.name, t.season
      ORDER BY t.name
    `;
  }

  return result as TeamSeasonSummary[];
}

export async function getTopPerformers(
  teamId?: number,
  limit: number = 10
): Promise<PlayerSeasonSummary[]> {
  try {
    let result;

    if (teamId) {
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
        WHERE p.active = true AND p.team_id = ${teamId}
        GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
        HAVING COUNT(DISTINCT g.id) > 0
        ORDER BY avg_impact_score DESC, total_impact_score DESC
        LIMIT ${limit}
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
        WHERE p.active = true
        GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
        HAVING COUNT(DISTINCT g.id) > 0
        ORDER BY avg_impact_score DESC, total_impact_score DESC
        LIMIT ${limit}
      `;
    }

    return result as PlayerSeasonSummary[];
  } catch (error) {
    console.error('Error in getTopPerformers:', error);
    return [];
  }
}

export async function getTeamTrendData(
  teamId: number,
  limit: number = 10
): Promise<GameTrendData[]> {
  try {
    const result = await sql`
      SELECT
        g.id as game_id,
        g.game_date,
        g.opponent,
        gs.player_id,
        p.first_name || ' ' || p.last_name as player_name,
        gs.impact_score
      FROM games g
      JOIN game_stats gs ON g.id = gs.game_id
      JOIN players p ON gs.player_id = p.id
      WHERE g.team_id = ${teamId}
      ORDER BY g.game_date ASC, gs.impact_score DESC
      LIMIT ${limit * 5}
    `;

    return result as GameTrendData[];
  } catch (error) {
    console.error('Error in getTeamTrendData:', error);
    return [];
  }
}

export async function getSeasonStats(season?: string) {
  let result;

  if (season) {
    result = await sql`
      SELECT
        COUNT(DISTINCT t.id) as total_teams,
        COUNT(DISTINCT p.id) as total_players,
        COUNT(DISTINCT g.id) as total_games,
        COALESCE(SUM(gs.ground_balls), 0) as total_ground_balls,
        COALESCE(SUM(gs.screens), 0) as total_screens,
        COALESCE(SUM(gs.effort_plays), 0) as total_effort_plays,
        COALESCE(SUM(gs.impact_score), 0) as total_impact_score,
        COALESCE(ROUND(AVG(gs.ground_balls), 1), 0) as avg_ground_balls,
        COALESCE(ROUND(AVG(gs.screens), 1), 0) as avg_screens,
        COALESCE(ROUND(AVG(gs.effort_plays), 1), 0) as avg_effort_plays,
        COALESCE(ROUND(AVG(gs.impact_score), 1), 0) as avg_impact_score,
        COALESCE(MAX(gs.impact_score), 0) as best_impact_score
      FROM teams t
      LEFT JOIN players p ON t.id = p.team_id AND p.active = true
      LEFT JOIN games g ON t.id = g.team_id
      LEFT JOIN game_stats gs ON g.id = gs.game_id
      WHERE t.season = ${season}
    `;
  } else {
    result = await sql`
      SELECT
        COUNT(DISTINCT t.id) as total_teams,
        COUNT(DISTINCT p.id) as total_players,
        COUNT(DISTINCT g.id) as total_games,
        COALESCE(SUM(gs.ground_balls), 0) as total_ground_balls,
        COALESCE(SUM(gs.screens), 0) as total_screens,
        COALESCE(SUM(gs.effort_plays), 0) as total_effort_plays,
        COALESCE(SUM(gs.impact_score), 0) as total_impact_score,
        COALESCE(ROUND(AVG(gs.ground_balls), 1), 0) as avg_ground_balls,
        COALESCE(ROUND(AVG(gs.screens), 1), 0) as avg_screens,
        COALESCE(ROUND(AVG(gs.effort_plays), 1), 0) as avg_effort_plays,
        COALESCE(ROUND(AVG(gs.impact_score), 1), 0) as avg_impact_score,
        COALESCE(MAX(gs.impact_score), 0) as best_impact_score
      FROM teams t
      LEFT JOIN players p ON t.id = p.team_id AND p.active = true
      LEFT JOIN games g ON t.id = g.team_id
      LEFT JOIN game_stats gs ON g.id = gs.game_id
    `;
  }

  return result[0];
}

export async function getTeamGameSummaries(teamId: number, limit: number = 10) {
  const result = await sql`
    SELECT
      g.id as game_id,
      g.game_date,
      g.opponent,
      g.location,
      COUNT(gs.id) as players_count,
      COALESCE(SUM(gs.ground_balls), 0) as total_ground_balls,
      COALESCE(SUM(gs.screens), 0) as total_screens,
      COALESCE(SUM(gs.effort_plays), 0) as total_effort_plays,
      COALESCE(SUM(gs.impact_score), 0) as team_impact_score,
      COALESCE(ROUND(AVG(gs.impact_score), 1), 0) as avg_player_impact,
      COALESCE(MAX(gs.impact_score), 0) as top_player_impact,
      (
        SELECT p.first_name || ' ' || p.last_name
        FROM game_stats gs2
        JOIN players p ON gs2.player_id = p.id
        WHERE gs2.game_id = g.id
        ORDER BY gs2.impact_score DESC
        LIMIT 1
      ) as top_player_name
    FROM games g
    LEFT JOIN game_stats gs ON g.id = gs.game_id
    WHERE g.team_id = ${teamId}
    GROUP BY g.id, g.game_date, g.opponent, g.location
    ORDER BY g.game_date DESC
    LIMIT ${limit}
  `;

  return result;
}

export async function getPlayerComparison(playerIds: number[]) {
  if (playerIds.length === 0) return [];

  // For simplicity, let's limit this to a reasonable number of players
  if (playerIds.length === 1) {
    const result = await sql`
      SELECT
        p.id as player_id,
        p.first_name || ' ' || p.last_name as player_name,
        p.jersey_number,
        COUNT(DISTINCT g.id) as games_played,
        COALESCE(ROUND(AVG(gs.ground_balls), 1), 0) as avg_ground_balls,
        COALESCE(ROUND(AVG(gs.screens), 1), 0) as avg_screens,
        COALESCE(ROUND(AVG(gs.effort_plays), 1), 0) as avg_effort_plays,
        COALESCE(ROUND(AVG(gs.impact_score), 1), 0) as avg_impact_score,
        COALESCE(MAX(gs.impact_score), 0) as best_impact_score,
        COALESCE(SUM(gs.impact_score), 0) as total_impact_score
      FROM players p
      LEFT JOIN game_stats gs ON p.id = gs.player_id
      LEFT JOIN games g ON gs.game_id = g.id
      WHERE p.id = ${playerIds[0]}
      GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
      ORDER BY avg_impact_score DESC
    `;
    return result;
  } else if (playerIds.length === 2) {
    const result = await sql`
      SELECT
        p.id as player_id,
        p.first_name || ' ' || p.last_name as player_name,
        p.jersey_number,
        COUNT(DISTINCT g.id) as games_played,
        COALESCE(ROUND(AVG(gs.ground_balls), 1), 0) as avg_ground_balls,
        COALESCE(ROUND(AVG(gs.screens), 1), 0) as avg_screens,
        COALESCE(ROUND(AVG(gs.effort_plays), 1), 0) as avg_effort_plays,
        COALESCE(ROUND(AVG(gs.impact_score), 1), 0) as avg_impact_score,
        COALESCE(MAX(gs.impact_score), 0) as best_impact_score,
        COALESCE(SUM(gs.impact_score), 0) as total_impact_score
      FROM players p
      LEFT JOIN game_stats gs ON p.id = gs.player_id
      LEFT JOIN games g ON gs.game_id = g.id
      WHERE p.id = ${playerIds[0]} OR p.id = ${playerIds[1]}
      GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
      ORDER BY avg_impact_score DESC
    `;
    return result;
  } else {
    // For more than 2 players, just return empty for now
    return [];
  }
}

export async function getLeaderboards(teamId?: number) {
  if (teamId) {
    // Get top performers in each category for specific team
    const [groundBallLeaders, screenLeaders, effortPlayLeaders, impactLeaders] = await Promise.all([
      sql`
        SELECT
          p.id as player_id,
          p.first_name || ' ' || p.last_name as player_name,
          p.jersey_number,
          COALESCE(ROUND(AVG(gs.ground_balls), 1), 0) as avg_stat
        FROM players p
        LEFT JOIN game_stats gs ON p.id = gs.player_id
        WHERE p.active = true AND p.team_id = ${teamId}
        GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
        HAVING COUNT(gs.id) >= 3
        ORDER BY avg_stat DESC
        LIMIT 5
      `,

      sql`
        SELECT
          p.id as player_id,
          p.first_name || ' ' || p.last_name as player_name,
          p.jersey_number,
          COALESCE(ROUND(AVG(gs.screens), 1), 0) as avg_stat
        FROM players p
        LEFT JOIN game_stats gs ON p.id = gs.player_id
        WHERE p.active = true AND p.team_id = ${teamId}
        GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
        HAVING COUNT(gs.id) >= 3
        ORDER BY avg_stat DESC
        LIMIT 5
      `,

      sql`
        SELECT
          p.id as player_id,
          p.first_name || ' ' || p.last_name as player_name,
          p.jersey_number,
          COALESCE(ROUND(AVG(gs.effort_plays), 1), 0) as avg_stat
        FROM players p
        LEFT JOIN game_stats gs ON p.id = gs.player_id
        WHERE p.active = true AND p.team_id = ${teamId}
        GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
        HAVING COUNT(gs.id) >= 3
        ORDER BY avg_stat DESC
        LIMIT 5
      `,

      sql`
        SELECT
          p.id as player_id,
          p.first_name || ' ' || p.last_name as player_name,
          p.jersey_number,
          COALESCE(ROUND(AVG(gs.impact_score), 1), 0) as avg_stat
        FROM players p
        LEFT JOIN game_stats gs ON p.id = gs.player_id
        WHERE p.active = true AND p.team_id = ${teamId}
        GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
        HAVING COUNT(gs.id) >= 3
        ORDER BY avg_stat DESC
        LIMIT 5
      `
    ]);

    return {
      groundBalls: groundBallLeaders,
      screens: screenLeaders,
      effortPlays: effortPlayLeaders,
      impact: impactLeaders
    };
  } else {
    // Get top performers in each category for all teams
    const [groundBallLeaders, screenLeaders, effortPlayLeaders, impactLeaders] = await Promise.all([
      sql`
        SELECT
          p.id as player_id,
          p.first_name || ' ' || p.last_name as player_name,
          p.jersey_number,
          COALESCE(ROUND(AVG(gs.ground_balls), 1), 0) as avg_stat
        FROM players p
        LEFT JOIN game_stats gs ON p.id = gs.player_id
        WHERE p.active = true
        GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
        HAVING COUNT(gs.id) >= 3
        ORDER BY avg_stat DESC
        LIMIT 5
      `,

      sql`
        SELECT
          p.id as player_id,
          p.first_name || ' ' || p.last_name as player_name,
          p.jersey_number,
          COALESCE(ROUND(AVG(gs.screens), 1), 0) as avg_stat
        FROM players p
        LEFT JOIN game_stats gs ON p.id = gs.player_id
        WHERE p.active = true
        GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
        HAVING COUNT(gs.id) >= 3
        ORDER BY avg_stat DESC
        LIMIT 5
      `,

      sql`
        SELECT
          p.id as player_id,
          p.first_name || ' ' || p.last_name as player_name,
          p.jersey_number,
          COALESCE(ROUND(AVG(gs.effort_plays), 1), 0) as avg_stat
        FROM players p
        LEFT JOIN game_stats gs ON p.id = gs.player_id
        WHERE p.active = true
        GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
        HAVING COUNT(gs.id) >= 3
        ORDER BY avg_stat DESC
        LIMIT 5
      `,

      sql`
        SELECT
          p.id as player_id,
          p.first_name || ' ' || p.last_name as player_name,
          p.jersey_number,
          COALESCE(ROUND(AVG(gs.impact_score), 1), 0) as avg_stat
        FROM players p
        LEFT JOIN game_stats gs ON p.id = gs.player_id
        WHERE p.active = true
        GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
        HAVING COUNT(gs.id) >= 3
        ORDER BY avg_stat DESC
        LIMIT 5
      `
    ]);

    return {
      groundBalls: groundBallLeaders,
      screens: screenLeaders,
      effortPlays: effortPlayLeaders,
      impact: impactLeaders
    };
  }
}