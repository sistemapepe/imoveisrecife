ALTER TABLE public.traffic_events ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE;
GRANT ALL ON public.traffic_events TO authenticated;
GRANT INSERT ON public.traffic_events TO anon;