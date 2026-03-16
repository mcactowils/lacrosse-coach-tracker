const { neon } = require('@neondatabase/serverless');

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL);

async function cleanupDummyData() {
  try {
    console.log('Starting database cleanup...');

    // Delete in correct order to respect foreign key constraints
    console.log('Deleting game_stats...');
    await sql`DELETE FROM game_stats`;

    console.log('Deleting games...');
    await sql`DELETE FROM games`;

    console.log('Deleting players...');
    await sql`DELETE FROM players`;

    console.log('Deleting teams...');
    await sql`DELETE FROM teams`;

    // Reset sequences
    console.log('Resetting sequences...');
    try {
      await sql`ALTER SEQUENCE teams_id_seq RESTART WITH 1`;
      await sql`ALTER SEQUENCE players_id_seq RESTART WITH 1`;
      await sql`ALTER SEQUENCE games_id_seq RESTART WITH 1`;
      await sql`ALTER SEQUENCE game_stats_id_seq RESTART WITH 1`;
    } catch (seqError) {
      console.log('Note: Could not reset sequences (this is normal if using different ID column types)');
    }

    console.log('✅ Database cleanup completed successfully!');
    console.log('All dummy data has been removed. You can now create your first team.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupDummyData();