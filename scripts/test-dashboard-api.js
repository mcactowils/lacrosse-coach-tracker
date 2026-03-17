const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = "postgresql://neondb_owner:npg_61QucVHzmyTB@ep-round-bread-a4o46i06-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

const sql = neon(DATABASE_URL);

async function testDashboardAPI() {
  try {
    console.log('Testing dashboard API queries directly...\n');

    // Test the team summary query like the API does
    const teamId = 1;

    console.log('1. Testing team summary query:');
    const teamSummary = await sql`
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

    console.log('Team Summary Result:', teamSummary[0]);

    console.log('\n2. Testing top performers query:');
    const topPerformers = await sql`
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
        COALESCE(MAX(gs.impact_score), 0) as best_impact_score
      FROM players p
      LEFT JOIN game_stats gs ON p.id = gs.player_id
      LEFT JOIN games g ON gs.game_id = g.id
      WHERE p.active = true AND p.team_id = ${teamId}
      GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
      HAVING COUNT(DISTINCT g.id) > 0
      ORDER BY avg_impact_score DESC, total_impact_score DESC
      LIMIT 5
    `;

    console.log('Top Performers Result:', topPerformers);

    console.log('\n3. Testing if query without HAVING clause shows players:');
    const allPlayers = await sql`
      SELECT
        p.id as player_id,
        p.first_name || ' ' || p.last_name as player_name,
        p.jersey_number,
        COUNT(DISTINCT g.id) as games_played,
        COALESCE(ROUND(AVG(gs.impact_score), 1), 0) as avg_impact_score
      FROM players p
      LEFT JOIN game_stats gs ON p.id = gs.player_id
      LEFT JOIN games g ON gs.game_id = g.id
      WHERE p.active = true AND p.team_id = ${teamId}
      GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
      ORDER BY avg_impact_score DESC, total_impact_score DESC
      LIMIT 5
    `;

    console.log('All Players (no HAVING filter):', allPlayers);

  } catch (error) {
    console.error('Error testing dashboard API:', error);
  }
}

testDashboardAPI();