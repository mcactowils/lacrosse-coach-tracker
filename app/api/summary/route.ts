import { NextRequest, NextResponse } from 'next/server';
import {
  getTeamSeasonSummary,
  getAllTeamsSummary,
  getTopPerformers,
  getTeamTrendData,
  getSeasonStats,
  getTeamGameSummaries,
  getLeaderboards
} from '@/lib/queries/summaries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const season = searchParams.get('season');
    const type = searchParams.get('type'); // 'team', 'players', 'trend', 'season', 'games', 'leaderboards'
    const limit = searchParams.get('limit');

    const limitNum = limit ? parseInt(limit) : 10;

    switch (type) {
      case 'team': {
        if (teamId) {
          const summary = await getTeamSeasonSummary(parseInt(teamId), season || undefined);
          return NextResponse.json(summary);
        } else {
          const summaries = await getAllTeamsSummary(season || undefined);
          return NextResponse.json(summaries);
        }
      }

      case 'players': {
        const topPerformers = await getTopPerformers(
          teamId ? parseInt(teamId) : undefined,
          limitNum
        );
        return NextResponse.json(topPerformers);
      }

      case 'trend': {
        if (!teamId) {
          return NextResponse.json(
            { error: 'teamId is required for trend data' },
            { status: 400 }
          );
        }
        const trendData = await getTeamTrendData(parseInt(teamId), limitNum);
        return NextResponse.json(trendData);
      }

      case 'season': {
        const seasonStats = await getSeasonStats(season || undefined);
        return NextResponse.json(seasonStats);
      }

      case 'games': {
        if (!teamId) {
          return NextResponse.json(
            { error: 'teamId is required for game summaries' },
            { status: 400 }
          );
        }
        const gameSummaries = await getTeamGameSummaries(parseInt(teamId), limitNum);
        return NextResponse.json(gameSummaries);
      }

      case 'leaderboards': {
        const leaderboards = await getLeaderboards(
          teamId ? parseInt(teamId) : undefined
        );
        return NextResponse.json(leaderboards);
      }

      default: {
        // Default comprehensive summary
        if (!teamId) {
          return NextResponse.json(
            { error: 'teamId is required for default summary' },
            { status: 400 }
          );
        }

        const teamIdNum = parseInt(teamId);

        // Get data step by step with error handling
        let teamSummary: any = null;
        let topPlayers: any[] = [];
        let trendData: any[] = [];
        let recentGames: any[] = [];
        let leaderboards: any = {};

        try {
          teamSummary = await getTeamSeasonSummary(teamIdNum, season || undefined);
        } catch (error) {
          console.error('Error getting team summary:', error);
          teamSummary = null;
        }

        try {
          topPlayers = await getTopPerformers(teamIdNum, 5);
        } catch (error) {
          console.error('Error getting top performers:', error);
          topPlayers = [];
        }

        try {
          trendData = await getTeamTrendData(teamIdNum, 10);
        } catch (error) {
          console.error('Error getting trend data:', error);
          trendData = [];
        }

        try {
          recentGames = await getTeamGameSummaries(teamIdNum, 5);
        } catch (error) {
          console.error('Error getting recent games:', error);
          recentGames = [];
        }

        try {
          leaderboards = await getLeaderboards(teamIdNum);
        } catch (error) {
          console.error('Error getting leaderboards:', error);
          leaderboards = {};
        }

        return NextResponse.json({
          team: teamSummary,
          topPlayers: topPlayers || [],
          trend: trendData || [],
          recentGames: recentGames || [],
          leaderboards: leaderboards || {}
        });
      }
    }
  } catch (error) {
    console.error('Error fetching summary data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary data' },
      { status: 500 }
    );
  }
}