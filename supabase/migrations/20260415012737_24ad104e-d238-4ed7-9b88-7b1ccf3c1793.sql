-- Add video tour URL to properties
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS video_tour_url text NOT NULL DEFAULT '';

-- Property views tracking for analytics
CREATE TABLE public.property_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  viewer_id uuid,
  ip_hash text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a view" ON public.property_views
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins and supervisors can view analytics" ON public.property_views
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));

CREATE INDEX idx_property_views_property_id ON public.property_views(property_id);
CREATE INDEX idx_property_views_created_at ON public.property_views(created_at);

-- Visit scheduling
CREATE TABLE public.visit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  preferred_date date NOT NULL,
  preferred_time text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.visit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit visit request" ON public.visit_requests
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins and supervisors can view requests" ON public.visit_requests
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));

CREATE POLICY "Admins and supervisors can update requests" ON public.visit_requests
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));

CREATE TRIGGER update_visit_requests_updated_at
  BEFORE UPDATE ON public.visit_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();