ALTER TABLE ibadah_activities
ADD COLUMN IF NOT EXISTS schedule_days SMALLINT[] NOT NULL DEFAULT ARRAY[0, 1, 2, 3, 4, 5, 6];

UPDATE ibadah_activities
SET schedule_days = ARRAY[1, 4]
WHERE LOWER(name) = 'puasa sunnah';
