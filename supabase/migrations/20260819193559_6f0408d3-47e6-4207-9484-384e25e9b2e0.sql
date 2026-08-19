-- Final fix for RLS visibility leakage: ensure roles can only see permissions for their site
DROP POLICY IF EXISTS "Admins and role owners can view permissions" ON public.role_permissions;
CREATE POLICY "Admins and role owners can view permissions" ON public.role_permissions
FOR SELECT TO authenticated USING (
  internal.has_role(auth.uid(), 'admin', site_id) OR 
  internal.is_super_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
      AND ur.role = role_permissions.role
      AND ur.site_id = role_permissions.site_id
  )
);
