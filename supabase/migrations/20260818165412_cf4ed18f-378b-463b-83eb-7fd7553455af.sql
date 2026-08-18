ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS twitter_user text;
GRANT SELECT, UPDATE ON public.site_settings TO authenticated;
GRANT SELECT ON public.site_settings TO anon;
GRANT ALL ON public.site_settings TO service_role;