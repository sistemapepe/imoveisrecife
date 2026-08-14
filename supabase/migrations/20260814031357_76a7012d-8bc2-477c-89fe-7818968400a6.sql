ALTER TABLE public.performance_logs ADD COLUMN IF NOT EXISTS context JSONB;
GRANT INSERT ON public.performance_logs TO anon, authenticated;
