ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS watermark_opacity integer NOT NULL DEFAULT 40,
  ADD COLUMN IF NOT EXISTS watermark_position text NOT NULL DEFAULT 'center';