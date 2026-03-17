const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = "postgresql://neondb_owner:npg_61QucVHzmyTB@ep-round-bread-a4o46i06-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

const sql = neon(DATABASE_URL);

async function checkData() {
  try {
    console.log('Checking current database state...\n');

    // Check teams
    const teams = await sql`SELECT * FROM teams`;
    console.log('Teams:', teams.length);
    teams.forEach(team => {
      console.log(`  - ${team.name} (${team.season}) - ID: ${team.id}`);
    });

    // Check players
    const players = await sql`SELECT * FROM players`;
    console.log('\nPlayers:', players.length);
    players.forEach(player => {
      console.log(`  - ${player.first_name} ${player.last_name} (#${player.jersey_number}) - Team ID: ${player.team_id}`);
    });

    // Check games
    const games = await sql`SELECT * FROM games ORDER BY game_date DESC`;
    console.log('\nGames:', games.length);
    games.forEach(game => {
      console.log(`  - ${game.opponent} on ${game.game_date} at ${game.location} - Team ID: ${game.team_id}, ID: ${game.id}`);
    });

    // Check game stats
    const gameStats = await sql`SELECT gs.*, p.first_name, p.last_name FROM game_stats gs JOIN players p ON gs.player_id = p.id ORDER BY gs.game_id`;
    console.log('\nGame Stats:', gameStats.length);
    gameStats.forEach(stat => {
      console.log(`  - ${stat.first_name} ${stat.last_name}: GB=${stat.ground_balls}, SC=${stat.screens}, EP=${stat.effort_plays}, Impact=${stat.impact_score} (Game ID: ${stat.game_id})`);
    });

  } catch (error) {
    console.error('Error checking data:', error);
  }
}

checkData();