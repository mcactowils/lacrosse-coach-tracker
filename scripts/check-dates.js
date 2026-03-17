const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = "postgresql://neondb_owner:npg_61QucVHzmyTB@ep-round-bread-a4o46i06-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

const sql = neon(DATABASE_URL);

async function checkDates() {
  try {
    console.log('Checking date storage and formatting...\n');

    // Check how dates are stored and retrieved
    const games = await sql`
      SELECT
        id,
        game_date,
        game_date::text as date_text,
        to_char(game_date, 'YYYY-MM-DD') as formatted_date,
        opponent
      FROM games
      ORDER BY game_date DESC
    `;

    console.log('Games with date analysis:');
    games.forEach(game => {
      console.log(`  - ID: ${game.id}`);
      console.log(`    Opponent: ${game.opponent}`);
      console.log(`    Raw game_date: ${game.game_date}`);
      console.log(`    As text: ${game.date_text}`);
      console.log(`    Formatted (YYYY-MM-DD): ${game.formatted_date}`);
      console.log('');
    });

    // Test date filtering
    console.log('Testing date filtering with current date format...');
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    console.log(`Today as YYYY-MM-DD: ${todayStr}`);

    const recentGames = await sql`
      SELECT * FROM games
      WHERE game_date >= ${todayStr}::date - INTERVAL '30 days'
      ORDER BY game_date DESC
    `;

    console.log(`\nGames in last 30 days: ${recentGames.length}`);

  } catch (error) {
    console.error('Error checking dates:', error);
  }
}

checkDates();