-- Reordering games to put cup cortuelle between bratislava games and sion
UPDATE games SET created_at = '2024-01-01 10:00:00' WHERE name = 'servette';
UPDATE games SET created_at = '2024-01-01 11:00:00' WHERE name = 'winti';
UPDATE games SET created_at = '2024-01-01 12:00:00' WHERE name = 'basu';
UPDATE games SET created_at = '2024-01-01 13:00:00' WHERE name = 'bratislava aus';
UPDATE games SET created_at = '2024-01-01 14:00:00' WHERE name = 'bratislava heim';
UPDATE games SET created_at = '2024-01-01 15:00:00' WHERE name = 'cup courtelle';
UPDATE games SET created_at = '2024-01-01 16:00:00' WHERE name = 'sion';
UPDATE games SET created_at = '2024-01-01 17:00:00' WHERE name = 'lugano';
UPDATE games SET created_at = '2024-01-01 18:00:00' WHERE name = 'luzern';
