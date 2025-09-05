-- Update game timestamps to correct order:
-- 1. servette, 2. winti, 3. basu, 4. sion, 5. courtelle, 6. bratislava heim, 7. bratislava aus, 8. lugano, 9. luzern

UPDATE games SET created_at = '2024-01-01 10:00:00' WHERE name = 'servette';
UPDATE games SET created_at = '2024-01-01 11:00:00' WHERE name = 'winti';
UPDATE games SET created_at = '2024-01-01 12:00:00' WHERE name = 'basu';
UPDATE games SET created_at = '2024-01-01 13:00:00' WHERE name = 'sion';
UPDATE games SET created_at = '2024-01-01 14:00:00' WHERE name ILIKE '%courtelle%' OR name ILIKE '%cortuelle%';
UPDATE games SET created_at = '2024-01-01 15:00:00' WHERE name = 'bratislava heim';
UPDATE games SET created_at = '2024-01-01 16:00:00' WHERE name = 'bratislava aus';
UPDATE games SET created_at = '2024-01-01 17:00:00' WHERE name = 'lugano';
UPDATE games SET created_at = '2024-01-01 18:00:00' WHERE name = 'luzern';
