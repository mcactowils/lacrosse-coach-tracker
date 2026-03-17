const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = "postgresql://neondb_owner:npg_61QucVHzmyTB@ep-round-bread-a4o46i06-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

const sql = neon(DATABASE_URL);

async function testPlayerAPIs() {
  try {
    console.log('Testing player API queries directly...\n');

    const playerId = 1;

    console.log('1. Testing getPlayerById query:');
    const player = await sql`
      SELECT
        p.*,
        p.first_name || ' ' || p.last_name as full_name,
        t.name as team_name
      FROM players p
      JOIN teams t ON p.team_id = t.id
      WHERE p.id = ${playerId}
    `;

    console.log('Player Result:', player[0] || 'No player found');

    console.log('\n2. Testing getPlayerSeasonSummary query:');
    const summary = await sql`
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

    console.log('Summary Result:', summary[0] || 'No summary found');

    console.log('\n3. Testing player games query:');
    const gameStats = await sql`
      SELECT
        gs.*,
        g.game_date,
        g.opponent,
        g.location,
        (gs.ground_balls + gs.screens + gs.effort_plays) as impact_score
      FROM game_stats gs
      JOIN games g ON gs.game_id = g.id
      WHERE gs.player_id = ${playerId}
      ORDER BY g.game_date DESC
      LIMIT 10
    `;

    console.log('Game Stats Results:', gameStats);

  } catch (error) {
    console.error('Error testing player APIs:', error);
  }
}

testPlayerAPIs();