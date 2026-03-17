const { getTeamSeasonSummary, getTopPerformers } = require('../lib/queries/summaries');

async function testAPI() {
  try {
    console.log('Testing API functions directly...\n');

    const teamSummary = await getTeamSeasonSummary(1);
    console.log('Team Summary:');
    console.log(teamSummary);

    console.log('\nTop Performers:');
    const topPlayers = await getTopPerformers(1, 5);
    console.log(topPlayers);

  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();