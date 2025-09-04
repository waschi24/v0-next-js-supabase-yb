-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create games table  
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create player_status table
CREATE TABLE IF NOT EXISTS player_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'white' CHECK (status IN ('white', 'red', 'orange', 'green')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, game_id)
);

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_status ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a simple demo)
-- In production, you'd want proper user-based policies
CREATE POLICY "Allow public read access on players" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public insert on players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on players" ON players FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on players" ON players FOR DELETE USING (true);

CREATE POLICY "Allow public read access on games" ON games FOR SELECT USING (true);
CREATE POLICY "Allow public insert on games" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on games" ON games FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on games" ON games FOR DELETE USING (true);

CREATE POLICY "Allow public read access on player_status" ON player_status FOR SELECT USING (true);
CREATE POLICY "Allow public insert on player_status" ON player_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on player_status" ON player_status FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on player_status" ON player_status FOR DELETE USING (true);
