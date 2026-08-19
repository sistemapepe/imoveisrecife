-- Apply multi-tenant RLS policies to tables that have site_id

-- 1. Site Settings
DROP POLICY IF EXISTS "Admins can update settings" ON public.site_settings;
CREATE POLICY "Admins can update settings" ON public.site_settings
FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'admin', site_id) OR
  public.has_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "Admins can insert settings" ON public.site_settings;
CREATE POLICY "Admins can insert settings" ON public.site_settings
FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'admin', site_id) OR
  public.has_role(auth.uid(), 'super_admin')
);

-- 2. Role Permissions
DROP POLICY IF EXISTS "Admins can insert permissions" ON public.role_permissions;
CREATE POLICY "Admins can insert permissions" ON public.role_permissions
FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'admin', site_id) OR
  public.has_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "Admins can update permissions" ON public.role_permissions;
CREATE POLICY "Admins can update permissions" ON public.role_permissions
FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'admin', site_id) OR
  public.has_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "Admins can delete permissions" ON public.role_permissions;
CREATE POLICY "Admins can delete permissions" ON public.role_permissions
FOR DELETE TO authenticated USING (
  public.has_role(auth.uid(), 'admin', site_id) OR
  public.has_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "Admins and role owners can view permissions" ON public.role_permissions;
CREATE POLICY "Admins and role owners can view permissions" ON public.role_permissions
FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin', site_id) OR 
  public.has_role(auth.uid(), 'super_admin') OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
      AND ur.role = role_permissions.role
      AND ur.site_id = role_permissions.site_id
  )
);

-- 3. Contact Messages
DROP POLICY IF EXISTS "Admins and supervisors can view messages" ON public.contact_messages;
CREATE POLICY "Admins and supervisors can view messages" ON public.contact_messages
FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin', site_id) OR 
  public.has_role(auth.uid(), 'supervisor', site_id) OR
  public.has_role(auth.uid(), 'super_admin')
);

-- 4. Traffic Events
DROP POLICY IF EXISTS "Admins and supervisors can view traffic events" ON public.traffic_events;
CREATE POLICY "Admins and supervisors can view traffic events" ON public.traffic_events
FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin', site_id) OR 
  public.has_role(auth.uid(), 'supervisor', site_id) OR
  public.has_role(auth.uid(), 'super_admin')
);

-- 5. Performance Logs
DROP POLICY IF EXISTS "Admins and supervisors view performance logs" ON public.performance_logs;
CREATE POLICY "Admins and supervisors view performance logs" ON public.performance_logs
FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin', site_id) OR 
  public.has_role(auth.uid(), 'supervisor', site_id) OR
  public.has_role(auth.uid(), 'super_admin')
);

-- 6. User Roles
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
CREATE POLICY "Only admins can insert roles" ON public.user_roles
FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'admin', site_id) OR
  public.has_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
CREATE POLICY "Only admins can update roles" ON public.user_roles
FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'admin', site_id) OR
  public.has_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;
CREATE POLICY "Only admins can delete roles" ON public.user_roles
FOR DELETE TO authenticated USING (
  public.has_role(auth.uid(), 'admin', site_id) OR
  public.has_role(auth.uid(), 'super_admin')
);
