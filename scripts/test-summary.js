const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = "postgresql://neondb_owner:npg_61QucVHzmyTB@ep-round-bread-a4o46i06-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

const sql = neon(DATABASE_URL);

async function testSummary() {
  try {
    console.log('Testing summary queries...\n');

    // Test team summary
    const teamSummary = await sql`
      SELECT
        t.id as team_id,
        t.name as team_name,
        t.season,
        COUNT(DISTINCT g.id) as total_games,
        COUNT(DISTINCT p.id) as total_players,
        COALESCE(SUM(gs.ground_balls), 0) as total_ground_balls,
        COALESCE(SUM(gs.screens), 0) as total_screens,
        COALESCE(SUM(gs.effort_plays), 0) as total_effort_plays,
        COALESCE(SUM(gs.impact_score), 0) as total_impact_score,
        COALESCE(ROUND(AVG(gs.impact_score), 1), 0) as avg_impact_score
      FROM teams t
      LEFT JOIN players p ON t.id = p.team_id AND p.active = true
      LEFT JOIN games g ON t.id = g.team_id
      LEFT JOIN game_stats gs ON p.id = gs.player_id AND g.id = gs.game_id
      WHERE t.id = 1
      GROUP BY t.id, t.name, t.season
    `;

    console.log('Team Summary for Team ID 1:');
    console.log(teamSummary[0] || 'No data found');

    // Test top performers
    const topPlayers = await sql`
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
      WHERE p.active = true AND p.team_id = 1
      GROUP BY p.id, p.first_name, p.last_name, p.jersey_number
      HAVING COUNT(DISTINCT g.id) > 0
      ORDER BY avg_impact_score DESC, total_impact_score DESC
      LIMIT 5
    `;

    console.log('\nTop Players for Team ID 1:');
    topPlayers.forEach(player => {
      console.log(`  - ${player.player_name} (#${player.jersey_number}): ${player.games_played} games, Avg Impact: ${player.avg_impact_score}`);
    });

  } catch (error) {
    console.error('Error testing summary:', error);
  }
}

testSummary();