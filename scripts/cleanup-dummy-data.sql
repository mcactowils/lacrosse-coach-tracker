-- Remove all dummy data from the lacrosse tracker database

-- Delete in correct order to respect foreign key constraints
DELETE FROM game_stats;
DELETE FROM games;
DELETE FROM players;
DELETE FROM teams;

-- Reset sequences (if using PostgreSQL SERIAL columns)
-- This ensures new records start from ID 1
ALTER SEQUENCE IF EXISTS teams_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS players_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS games_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS game_stats_id_seq RESTART WITH 1;