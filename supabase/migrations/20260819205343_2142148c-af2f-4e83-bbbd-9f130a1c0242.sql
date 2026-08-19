
-- 1. Ensure site_id exists for all relevant tables
ALTER TABLE public.property_views ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE;
ALTER TABLE public.visit_requests ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE;
ALTER TABLE public.contact_info ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE;

-- Backfill site_id
UPDATE public.property_views pv SET site_id = p.site_id FROM public.properties p WHERE pv.property_id = p.id AND pv.site_id IS NULL;
UPDATE public.visit_requests vr SET site_id = p.site_id FROM public.properties p WHERE vr.property_id = p.id AND vr.site_id IS NULL;

-- 2. Update storage.objects policies (already attempted, ensuring idempotency)
DROP POLICY IF EXISTS "Admins can upload property images" ON storage.objects;
CREATE POLICY "Admins can upload property images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'property-images' AND (internal.has_role(auth.uid(), 'admin') OR internal.is_super_admin(auth.uid())));

DROP POLICY IF EXISTS "Admins can update property images" ON storage.objects;
CREATE POLICY "Admins can update property images" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'property-images' AND (internal.has_role(auth.uid(), 'admin') OR internal.is_super_admin(auth.uid())));

DROP POLICY IF EXISTS "Admins can delete property images" ON storage.objects;
CREATE POLICY "Admins can delete property images" ON storage.objects FOR DELETE TO public USING (bucket_id = 'property-images' AND (internal.has_role(auth.uid(), 'admin') OR internal.is_super_admin(auth.uid())));

DROP POLICY IF EXISTS "Admins can list property images" ON storage.objects;
CREATE POLICY "Admins can list property images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'property-images' AND (internal.has_role(auth.uid(), 'admin') OR internal.has_role(auth.uid(), 'supervisor') OR internal.is_super_admin(auth.uid())));

-- 3. Update public policies to use internal schema with site_id
DROP POLICY IF EXISTS "Admins and supervisors can view analytics" ON public.property_views;
CREATE POLICY "Admins and supervisors can view analytics" ON public.property_views FOR SELECT TO authenticated USING (internal.has_role(auth.uid(), 'admin', site_id) OR internal.has_role(auth.uid(), 'supervisor', site_id) OR internal.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins and supervisors can view requests" ON public.visit_requests;
CREATE POLICY "Admins and supervisors can view requests" ON public.visit_requests FOR SELECT TO authenticated USING (internal.has_role(auth.uid(), 'admin', site_id) OR internal.has_role(auth.uid(), 'supervisor', site_id) OR internal.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins and supervisors can update requests" ON public.visit_requests;
CREATE POLICY "Admins and supervisors can update requests" ON public.visit_requests FOR UPDATE TO authenticated USING (internal.has_role(auth.uid(), 'admin', site_id) OR internal.has_role(auth.uid(), 'supervisor', site_id) OR internal.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (internal.has_role(auth.uid(), 'admin', site_id) OR internal.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view contact info" ON public.contact_info;
CREATE POLICY "Admins can view contact info" ON public.contact_info FOR SELECT TO authenticated USING (internal.has_role(auth.uid(), 'admin', site_id) OR internal.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert contact info" ON public.contact_info;
CREATE POLICY "Admins can insert contact info" ON public.contact_info FOR INSERT TO authenticated WITH CHECK (internal.has_role(auth.uid(), 'admin', site_id) OR internal.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update contact info" ON public.contact_info;
CREATE POLICY "Admins can update contact info" ON public.contact_info FOR UPDATE TO authenticated USING (internal.has_role(auth.uid(), 'admin', site_id) OR internal.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super Admins can insert properties" ON public.properties;
CREATE POLICY "Super Admins can insert properties" ON public.properties FOR INSERT TO authenticated WITH CHECK (internal.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super Admins can update properties" ON public.properties;
CREATE POLICY "Super Admins can update properties" ON public.properties FOR UPDATE TO authenticated USING (internal.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super Admins can delete properties" ON public.properties;
CREATE POLICY "Super Admins can delete properties" ON public.properties FOR DELETE TO authenticated USING (internal.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can manage sites" ON public.sites;
CREATE POLICY "Super admins can manage sites" ON public.sites FOR ALL TO authenticated USING (internal.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super Admins can manage network settings" ON public.network_settings;
CREATE POLICY "Super Admins can manage network settings" ON public.network_settings FOR ALL TO authenticated USING (internal.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can manage tenants" ON public.tenants;
CREATE POLICY "Super admins can manage tenants" ON public.tenants FOR ALL TO authenticated USING (internal.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can manage domains" ON public.tenant_domains;
CREATE POLICY "Super admins can manage domains" ON public.tenant_domains FOR ALL TO authenticated USING (internal.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage import history" ON public.import_history;
CREATE POLICY "Admins manage import history" ON public.import_history FOR ALL TO authenticated USING (internal.has_role(auth.uid(), 'admin', site_id) OR internal.is_super_admin(auth.uid()));

-- 4. Clean up legacy functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role, uuid) FROM public, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM public, authenticated, anon;

DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role, uuid);
DROP FUNCTION IF EXISTS public.is_super_admin(uuid);
