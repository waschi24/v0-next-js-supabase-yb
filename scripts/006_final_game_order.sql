-- Update game timestamps to match the correct order
-- servette, winti, basu, sion, courtelle, bratislava heim, bratislava aus, lugano, lugano

-- Set base timestamp (1 hour ago)
DO $$
DECLARE
    base_time timestamp := NOW() - INTERVAL '1 hour';
BEGIN
    -- Update games in the specified order with 1-minute intervals
    UPDATE games SET created_at = base_time WHERE name ILIKE '%servette%';
    UPDATE games SET created_at = base_time + INTERVAL '1 minute' WHERE name ILIKE '%winti%';
    UPDATE games SET created_at = base_time + INTERVAL '2 minutes' WHERE name ILIKE '%basu%';
    UPDATE games SET created_at = base_time + INTERVAL '3 minutes' WHERE name ILIKE '%sion%';
    UPDATE games SET created_at = base_time + INTERVAL '4 minutes' WHERE name ILIKE '%courtelle%' OR name ILIKE '%cortuelle%';
    UPDATE games SET created_at = base_time + INTERVAL '5 minutes' WHERE name ILIKE '%bratislava%' AND name ILIKE '%heim%';
    UPDATE games SET created_at = base_time + INTERVAL '6 minutes' WHERE name ILIKE '%bratislava%' AND name ILIKE '%aus%';
    
    -- Handle two lugano games - set different timestamps for each
    UPDATE games 
    SET created_at = CASE 
        WHEN id = (SELECT MIN(id) FROM games WHERE name ILIKE '%lugano%') 
        THEN base_time + INTERVAL '7 minutes'
        ELSE base_time + INTERVAL '8 minutes'
    END
    WHERE name ILIKE '%lugano%';
    
END $$;
