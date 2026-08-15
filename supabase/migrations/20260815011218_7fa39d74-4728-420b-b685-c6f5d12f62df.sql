ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS publish_status text DEFAULT 'draft';
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS last_published_at timestamp with time zone;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'publish_status_type') THEN
    CREATE TYPE publish_status_type AS ENUM ('draft', 'published', 'scheduled');
  END IF;
END $$;

-- Optional: update column to use enum if we want strictness, but text is fine for now for flexibility.
-- For now let's keep it as text to avoid migration complexity if enum already exists or changes.
