ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS google_site_verification text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bing_site_verification text NOT NULL DEFAULT '';