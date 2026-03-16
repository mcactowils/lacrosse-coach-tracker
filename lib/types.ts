// Type definitions for the lacrosse tracker application

export interface Team {
  id: number;
  name: string;
  season: string;
  created_at: string;
}

export interface Player {
  id: number;
  team_id: number;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
  active: boolean;
  created_at: string;
  // Computed fields
  full_name?: string;
  team_name?: string;
}

export interface Game {
  id: number;
  team_id: number;
  game_date: string;
  opponent: string;
  location: string | null;
  created_at: string;
  // Computed fields
  team_name?: string;
}

export interface GameStats {
  id: number;
  game_id: number;
  player_id: number;
  ground_balls: number;
  screens: number;
  effort_plays: number;
  impact_score: number;
  notes: string | null;
  created_at: string;
  // Computed fields
  player_name?: string;
  game_date?: string;
  opponent?: string;
}

// Input types for creating new records
export interface CreateTeamInput {
  name: string;
  season: string;
}

export interface CreatePlayerInput {
  team_id: number;
  first_name: string;
  last_name: string;
  jersey_number?: number;
  active?: boolean;
}

export interface CreateGameInput {
  team_id: number;
  game_date: string;
  opponent: string;
  location?: string;
}

export interface CreateGameStatsInput {
  game_id: number;
  player_id: number;
  ground_balls: number;
  screens: number;
  effort_plays: number;
  notes?: string;
}

export interface UpdateGameStatsInput {
  ground_balls?: number;
  screens?: number;
  effort_plays?: number;
  notes?: string;
}

// Summary and analytics types
export interface PlayerSeasonSummary {
  player_id: number;
  player_name: string;
  jersey_number: number | null;
  games_played: number;
  total_ground_balls: number;
  total_screens: number;
  total_effort_plays: number;
  total_impact_score: number;
  avg_ground_balls: number;
  avg_screens: number;
  avg_effort_plays: number;
  avg_impact_score: number;
  best_impact_score: number;
  latest_impact_score: number | null;
}

export interface TeamSeasonSummary {
  team_id: number;
  team_name: string;
  season: string;
  total_games: number;
  total_players: number;
  avg_team_impact: number;
  best_team_game: number;
  best_individual_game: number;
}

export interface GameTrendData {
  game_id: number;
  game_date: string;
  opponent: string;
  player_id: number;
  player_name: string;
  impact_score: number;
}

export interface PlayerTrendData {
  game_date: string;
  opponent: string;
  ground_balls: number;
  screens: number;
  effort_plays: number;
  impact_score: number;
}

// Tracker state types
export interface TrackerState {
  selectedPlayerId: number | null;
  gameDate: string;
  opponent: string;
  location: string;
  playerStats: Record<number, {
    ground_balls: number;
    screens: number;
    effort_plays: number;
    notes: string;
  }>;
  lastAction: {
    playerId: number;
    statType: 'ground_balls' | 'screens' | 'effort_plays';
    previousValue: number;
  } | null;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Filter and query types
export interface PlayerFilters {
  teamId?: number;
  active?: boolean;
  search?: string;
}

export interface GameFilters {
  teamId?: number;
  playerId?: number;
  startDate?: string;
  endDate?: string;
  opponent?: string;
}

export interface StatsFilters extends GameFilters {
  minImpactScore?: number;
  maxImpactScore?: number;
}