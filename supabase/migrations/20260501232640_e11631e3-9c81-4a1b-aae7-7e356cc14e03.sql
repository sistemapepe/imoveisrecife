ALTER TABLE public.site_settings 
ADD COLUMN marquee_text TEXT;

COMMENT ON COLUMN public.site_settings.marquee_text IS 'Custom text to display in the marquee banner instead of property titles.';