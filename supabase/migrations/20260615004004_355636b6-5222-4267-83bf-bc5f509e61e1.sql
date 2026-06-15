ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS navbar_height_px integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS logo_width_px integer NOT NULL DEFAULT 270,
  ADD COLUMN IF NOT EXISTS logo_height_px integer NOT NULL DEFAULT 140,
  ADD COLUMN IF NOT EXISTS marquee_padding_y_px integer NOT NULL DEFAULT 4;