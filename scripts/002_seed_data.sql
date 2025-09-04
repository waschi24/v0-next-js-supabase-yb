-- Insert sample players
INSERT INTO players (name) VALUES 
  ('Alice Johnson'),
  ('Bob Smith'),
  ('Charlie Brown'),
  ('Diana Prince'),
  ('Eve Wilson'),
  ('Frank Miller'),
  ('Grace Lee'),
  ('Henry Davis'),
  ('Ivy Chen'),
  ('Jack Taylor')
ON CONFLICT (name) DO NOTHING;

-- Insert sample games
INSERT INTO games (name) VALUES 
  ('Chess Tournament'),
  ('Poker Night'),
  ('Scrabble Championship'),
  ('Monopoly Marathon'),
  ('Risk Campaign'),
  ('Settlers of Catan'),
  ('Ticket to Ride'),
  ('Splendor'),
  ('Azul'),
  ('Wingspan')
ON CONFLICT (name) DO NOTHING;

-- Insert some initial player statuses (all default to white)
INSERT INTO player_status (player_id, game_id, status)
SELECT p.id, g.id, 'white'
FROM players p
CROSS JOIN games g
ON CONFLICT (player_id, game_id) DO NOTHING;
