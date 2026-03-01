-- Add new settings columns for full site customization
ALTER TABLE public.site_settings
  ADD COLUMN brand_name text NOT NULL DEFAULT 'JHR LUXURY',
  ADD COLUMN footer_text text NOT NULL DEFAULT '© 2024 JHR Imóveis de Luxo. Todos os direitos reservados.',
  ADD COLUMN instagram_url text NOT NULL DEFAULT '',
  ADD COLUMN facebook_url text NOT NULL DEFAULT '',
  ADD COLUMN youtube_url text NOT NULL DEFAULT '',
  ADD COLUMN linkedin_url text NOT NULL DEFAULT '',
  ADD COLUMN website_url text NOT NULL DEFAULT '',
  ADD COLUMN email_contact text NOT NULL DEFAULT '',
  ADD COLUMN primary_color text NOT NULL DEFAULT '195 85% 45%',
  ADD COLUMN accent_color text NOT NULL DEFAULT '42 56% 55%';