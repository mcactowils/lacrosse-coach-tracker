import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(process.env.DATABASE_URL);

export type Game = {
  id: number;
  game_date: string;
  opponent: string;
  ground_balls: number;
  screens: number;
  effort_plays: number;
  impact_score: number;
  created_at: string;
  updated_at: string;
};

export type GameInput = {
  game_date: string;
  opponent: string;
  ground_balls: number;
  screens: number;
  effort_plays: number;
};

export type SeasonSummary = {
  total_games: number;
  avg_ground_balls: number;
  avg_screens: number;
  avg_effort_plays: number;
  avg_impact_score: number;
  total_impact_score: number;
  best_game_impact: number;
  best_game_opponent: string;
  best_game_date: string;
};

export const db = {
  // Get all games, ordered by date descending
  async getGames(): Promise<Game[]> {
    const result = await sql`
      SELECT * FROM games
      ORDER BY game_date DESC, id DESC
    `;
    return result as Game[];
  },

  // Get recent games with limit
  async getRecentGames(limit: number = 10): Promise<Game[]> {
    const result = await sql`
      SELECT * FROM games
      ORDER BY game_date DESC, id DESC
      LIMIT ${limit}
    `;
    return result as Game[];
  },

  // Create a new game
  async createGame(gameData: GameInput): Promise<Game> {
    const result = await sql`
      INSERT INTO games (game_date, opponent, ground_balls, screens, effort_plays)
      VALUES (${gameData.game_date}, ${gameData.opponent}, ${gameData.ground_balls}, ${gameData.screens}, ${gameData.effort_plays})
      RETURNING *
    `;
    return result[0] as Game;
  },

  // Get season summary statistics
  async getSeasonSummary(): Promise<SeasonSummary> {
    const result = await sql`
      SELECT
        COUNT(*) as total_games,
        COALESCE(ROUND(AVG(ground_balls), 1), 0) as avg_ground_balls,
        COALESCE(ROUND(AVG(screens), 1), 0) as avg_screens,
        COALESCE(ROUND(AVG(effort_plays), 1), 0) as avg_effort_plays,
        COALESCE(ROUND(AVG(impact_score), 1), 0) as avg_impact_score,
        COALESCE(SUM(impact_score), 0) as total_impact_score,
        COALESCE(MAX(impact_score), 0) as best_game_impact
      FROM games
    `;

    const bestGameResult = await sql`
      SELECT opponent, game_date
      FROM games
      WHERE impact_score = (SELECT MAX(impact_score) FROM games)
      ORDER BY game_date DESC
      LIMIT 1
    `;

    const summary = result[0] as Omit<SeasonSummary, 'best_game_opponent' | 'best_game_date'>;
    const bestGame = bestGameResult[0] as { opponent?: string; game_date?: string } | undefined;

    return {
      ...summary,
      best_game_opponent: bestGame?.opponent || '',
      best_game_date: bestGame?.game_date || ''
    };
  },

  // Get games for trend analysis (last 10 games)
  async getGamesTrend(): Promise<Array<{ game_date: string; impact_score: number; opponent: string }>> {
    const result = await sql`
      SELECT game_date, impact_score, opponent
      FROM games
      ORDER BY game_date ASC, id ASC
      LIMIT 10
    `;
    return result as Array<{ game_date: string; impact_score: number; opponent: string }>;
  }
};

export default sql;