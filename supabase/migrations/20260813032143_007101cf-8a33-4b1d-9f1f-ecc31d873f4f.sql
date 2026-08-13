-- Step 2: Update users and populate permissions table
UPDATE public.user_roles SET role = 'super_admin' WHERE role = 'admin';

-- Populate role_permissions for all roles
INSERT INTO public.role_permissions (role, permission, enabled)
SELECT r.role, p.perm, false
FROM (SELECT unnest(enum_range(NULL::app_role)) as role) r
CROSS JOIN (SELECT unnest(ARRAY['view_properties', 'manage_properties', 'delete_properties', 'view_contacts', 'manage_settings', 'manage_users', 'view_analytics', 'view_visits', 'view_traffic', 'manage_seo', 'bulk_import', 'manage_privacy', 'manage_bucket']) as perm) p
ON CONFLICT (role, permission) DO NOTHING;

-- Grant full access to super_admin
UPDATE public.role_permissions SET enabled = true WHERE role = 'super_admin';

-- Update RLS policies
DROP POLICY IF EXISTS "Admins can insert properties" ON public.properties;
CREATE POLICY "Super Admins can insert properties" ON public.properties FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Admins can update properties" ON public.properties;
CREATE POLICY "Super Admins can update properties" ON public.properties FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Admins can delete properties" ON public.properties;
CREATE POLICY "Super Admins can delete properties" ON public.properties FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
