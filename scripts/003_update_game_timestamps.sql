-- Update existing games with proper timestamps to maintain specified order
-- Set timestamps for existing games in the specified order
UPDATE games SET created_at = '2024-01-01 10:00:00+00' WHERE LOWER(name) LIKE '%servette%';
UPDATE games SET created_at = '2024-01-01 11:00:00+00' WHERE LOWER(name) LIKE '%winti%';
UPDATE games SET created_at = '2024-01-01 12:00:00+00' WHERE LOWER(name) LIKE '%basu%';
UPDATE games SET created_at = '2024-01-01 13:00:00+00' WHERE LOWER(name) LIKE '%sion%';
UPDATE games SET created_at = '2024-01-01 14:00:00+00' WHERE LOWER(name) LIKE '%cup courtelle%';
UPDATE games SET created_at = '2024-01-01 15:00:00+00' WHERE LOWER(name) LIKE '%bratislava aus%';
UPDATE games SET created_at = '2024-01-01 16:00:00+00' WHERE LOWER(name) LIKE '%bratislava heim%';
UPDATE games SET created_at = '2024-01-01 17:00:00+00' WHERE LOWER(name) LIKE '%lugano%';
UPDATE games SET created_at = '2024-01-01 18:00:00+00' WHERE LOWER(name) LIKE '%luzern%';
