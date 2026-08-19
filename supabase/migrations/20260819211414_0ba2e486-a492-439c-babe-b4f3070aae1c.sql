-- 1. Fix audit_logs table structure
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE;

-- If it was created without it, we might need to make it NOT NULL later, 
-- but for now let's just ensure it exists for the policies.

-- 2. Grants (Ensure they are set)
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

-- 3. RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Admins can view audit logs for their site" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs for their site"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (internal.has_role(auth.uid(), 'admin', site_id));

DROP POLICY IF EXISTS "Authenticated users can insert audit logs for their site" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs for their site"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (internal.has_role(auth.uid(), 'corretor', site_id) OR internal.has_role(auth.uid(), 'supervisor', site_id) OR internal.has_role(auth.uid(), 'admin', site_id));
