CREATE TABLE IF NOT EXISTS public.traffic_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pathname text NOT NULL DEFAULT '/',
  full_url text NOT NULL DEFAULT '',
  referrer_url text NOT NULL DEFAULT '',
  referrer_domain text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'direct',
  medium text NOT NULL DEFAULT 'direct',
  channel text NOT NULL DEFAULT 'Direto',
  social_network text NOT NULL DEFAULT '',
  campaign text NOT NULL DEFAULT '',
  term text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  landing_page text NOT NULL DEFAULT '/',
  device_type text NOT NULL DEFAULT 'desktop',
  browser text NOT NULL DEFAULT '',
  os text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  session_id text NOT NULL DEFAULT '',
  visitor_id text NOT NULL DEFAULT '',
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  event_type text NOT NULL DEFAULT 'page_view',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.traffic_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can create traffic events"
ON public.traffic_events
FOR INSERT
TO public
WITH CHECK (
  event_type IN ('page_view', 'whatsapp_click', 'contact_submit', 'visit_request', 'property_view')
  AND length(pathname) <= 500
  AND length(full_url) <= 2000
  AND length(referrer_url) <= 2000
  AND length(referrer_domain) <= 255
  AND length(source) <= 100
  AND length(medium) <= 100
  AND length(channel) <= 100
  AND length(social_network) <= 100
  AND length(campaign) <= 255
  AND length(term) <= 255
  AND length(content) <= 255
  AND length(landing_page) <= 500
  AND length(device_type) <= 50
  AND length(browser) <= 100
  AND length(os) <= 100
  AND length(language) <= 50
  AND length(country) <= 100
  AND length(session_id) <= 255
  AND length(visitor_id) <= 255
);

CREATE POLICY "Admins and supervisors can view traffic events"
ON public.traffic_events
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'supervisor'::app_role)
);

CREATE INDEX IF NOT EXISTS idx_traffic_events_created_at ON public.traffic_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_traffic_events_channel ON public.traffic_events(channel);
CREATE INDEX IF NOT EXISTS idx_traffic_events_source ON public.traffic_events(source);
CREATE INDEX IF NOT EXISTS idx_traffic_events_medium ON public.traffic_events(medium);
CREATE INDEX IF NOT EXISTS idx_traffic_events_campaign ON public.traffic_events(campaign);
CREATE INDEX IF NOT EXISTS idx_traffic_events_landing_page ON public.traffic_events(landing_page);
CREATE INDEX IF NOT EXISTS idx_traffic_events_event_type ON public.traffic_events(event_type);
CREATE INDEX IF NOT EXISTS idx_traffic_events_property_id ON public.traffic_events(property_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.traffic_events;