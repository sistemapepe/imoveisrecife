
CREATE TABLE IF NOT EXISTS public.import_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'em_andamento',
  company_updated BOOLEAN NOT NULL DEFAULT false,
  properties_total INTEGER NOT NULL DEFAULT 0,
  properties_created INTEGER NOT NULL DEFAULT 0,
  properties_failed INTEGER NOT NULL DEFAULT 0,
  errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  log JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.import_history TO authenticated;
GRANT ALL ON public.import_history TO service_role;

ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage import history"
  ON public.import_history
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_import_history_updated_at
  BEFORE UPDATE ON public.import_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
