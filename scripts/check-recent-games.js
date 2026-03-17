const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = "postgresql://neondb_owner:npg_61QucVHzmyTB@ep-round-bread-a4o46i06-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

const sql = neon(DATABASE_URL);

async function checkRecentGames() {
  try {
    console.log('Checking recent games and their dates...\n');

    // Get recent games
    const games = await sql`
      SELECT
        id,
        team_id,
        game_date,
        game_date::text as date_text,
        to_char(game_date, 'YYYY-MM-DD') as formatted_date,
        to_char(game_date, 'Mon DD, YYYY') as display_date,
        opponent,
        location,
        created_at::text as created_text
      FROM games
      ORDER BY created_at DESC
      LIMIT 5
    `;

    console.log('Recent Games (ordered by creation time):');
    games.forEach((game, index) => {
      console.log(`${index + 1}. Game ID: ${game.id}`);
      console.log(`   Team ID: ${game.team_id}`);
      console.log(`   Opponent: ${game.opponent}`);
      console.log(`   Location: ${game.location || 'N/A'}`);
      console.log(`   Raw Date: ${game.game_date}`);
      console.log(`   As Text: ${game.date_text}`);
      console.log(`   Formatted: ${game.formatted_date}`);
      console.log(`   Display: ${game.display_date}`);
      console.log(`   Created: ${game.created_text}`);
      console.log('');
    });

    // Check if there are stats for these games
    console.log('Game stats for recent games:');
    for (const game of games) {
      const stats = await sql`
        SELECT
          gs.*,
          p.first_name,
          p.last_name
        FROM game_stats gs
        JOIN players p ON gs.player_id = p.id
        WHERE gs.game_id = ${game.id}
      `;

      console.log(`Game ${game.id} (${game.opponent}): ${stats.length} stat entries`);
      stats.forEach(stat => {
        console.log(`  - ${stat.first_name} ${stat.last_name}: GB=${stat.ground_balls}, SC=${stat.screens}, EP=${stat.effort_plays}, Impact=${stat.impact_score}`);
      });
    }

  } catch (error) {
    console.error('Error checking recent games:', error);
  }
}

checkRecentGames();