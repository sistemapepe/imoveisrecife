ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS header_style TEXT DEFAULT 'normal';
COMMENT ON COLUMN public.site_settings.header_style IS 'Define o estilo do cabeçalho: normal ou compact';