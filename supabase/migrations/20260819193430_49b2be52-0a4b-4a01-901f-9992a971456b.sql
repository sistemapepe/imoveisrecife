ALTER TABLE public.import_history ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES public.sites(id);

-- Update RLS for Import History now that site_id exists
DROP POLICY IF EXISTS "Admins manage import history" ON public.import_history;
CREATE POLICY "Admins manage import history" ON public.import_history
FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin', site_id) OR
  public.has_role(auth.uid(), 'super_admin')
);
