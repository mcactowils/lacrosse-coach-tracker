-- Lacrosse Coach Tracker - Multi-player Architecture Schema
-- Run this SQL in your Neon database

-- Drop existing tables if they exist (for migration)
DROP TABLE IF EXISTS game_stats CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- Teams table
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  season VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  jersey_number INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, jersey_number)
);

-- Games table
CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  game_date DATE NOT NULL,
  opponent VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game stats table
CREATE TABLE game_stats (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  ground_balls INTEGER NOT NULL DEFAULT 0,
  screens INTEGER NOT NULL DEFAULT 0,
  effort_plays INTEGER NOT NULL DEFAULT 0,
  impact_score INTEGER GENERATED ALWAYS AS (ground_balls + screens + effort_plays) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, player_id)
);

-- Create indexes for performance
CREATE INDEX idx_teams_season ON teams(season);
CREATE INDEX idx_players_team_active ON players(team_id, active);
CREATE INDEX idx_players_name ON players(last_name, first_name);
CREATE INDEX idx_games_team_date ON games(team_id, game_date DESC);
CREATE INDEX idx_games_date ON games(game_date DESC);
CREATE INDEX idx_game_stats_game ON game_stats(game_id);
CREATE INDEX idx_game_stats_player ON game_stats(player_id);
CREATE INDEX idx_game_stats_impact ON game_stats(impact_score DESC);

-- Insert sample data
INSERT INTO teams (name, season) VALUES
  ('Eagles', '2024 Spring'),
  ('Lions', '2024 Spring');

INSERT INTO players (team_id, first_name, last_name, jersey_number) VALUES
  (1, 'John', 'Smith', 12),
  (1, 'Mike', 'Johnson', 7),
  (1, 'Alex', 'Brown', 23),
  (1, 'Chris', 'Wilson', 15),
  (2, 'David', 'Davis', 8),
  (2, 'Ryan', 'Miller', 22);

INSERT INTO games (team_id, game_date, opponent, location) VALUES
  (1, '2024-03-10', 'Panthers', 'Home'),
  (1, '2024-03-12', 'Tigers', 'Away'),
  (1, '2024-03-15', 'Hawks', 'Home'),
  (2, '2024-03-11', 'Wolves', 'Home');

INSERT INTO game_stats (game_id, player_id, ground_balls, screens, effort_plays, notes) VALUES
  -- Game 1 (Eagles vs Panthers)
  (1, 1, 5, 3, 2, 'Strong performance in first half'),
  (1, 2, 3, 4, 3, 'Excellent screen setting'),
  (1, 3, 7, 2, 4, 'Dominated ground balls'),
  (1, 4, 2, 5, 1, 'Great pick and roll execution'),
  -- Game 2 (Eagles vs Tigers)
  (2, 1, 4, 3, 3, 'Consistent effort throughout'),
  (2, 2, 6, 2, 2, 'Active on loose balls'),
  (2, 3, 3, 4, 5, 'High energy hustle plays'),
  (2, 4, 5, 3, 2, 'Solid all-around game'),
  -- Game 3 (Eagles vs Hawks)
  (3, 1, 6, 4, 3, 'Best game of season'),
  (3, 2, 2, 3, 4, 'Great effort plays'),
  (3, 3, 5, 5, 2, 'Perfect screen timing'),
  (3, 4, 3, 2, 3, 'Steady performance'),
  -- Game 4 (Lions vs Wolves)
  (4, 5, 4, 3, 3, 'Good debut game'),
  (4, 6, 7, 2, 4, 'Aggressive ground ball play');