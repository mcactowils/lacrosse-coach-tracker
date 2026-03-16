-- Lacrosse Coach Tracker Database Schema
-- Run this SQL in your Neon database

CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  game_date DATE NOT NULL,
  opponent VARCHAR(255) NOT NULL,
  ground_balls INTEGER NOT NULL DEFAULT 0,
  screens INTEGER NOT NULL DEFAULT 0,
  effort_plays INTEGER NOT NULL DEFAULT 0,
  impact_score INTEGER GENERATED ALWAYS AS (ground_balls + screens + effort_plays) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance on date queries
CREATE INDEX IF NOT EXISTS idx_games_game_date ON games(game_date DESC);

-- Index for performance on opponent queries
CREATE INDEX IF NOT EXISTS idx_games_opponent ON games(opponent);

-- Update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();