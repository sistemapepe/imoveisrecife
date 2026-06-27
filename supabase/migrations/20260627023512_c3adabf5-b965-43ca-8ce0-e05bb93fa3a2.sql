ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS watermark_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS watermark_size_pct integer NOT NULL DEFAULT 30;