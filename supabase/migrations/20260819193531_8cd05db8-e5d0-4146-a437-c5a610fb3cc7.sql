-- Refined security migration: use private schema 'internal' for security-critical functions
-- and update all dependencies to prevent multi-tenant data leakage.

CREATE SCHEMA IF NOT EXISTS internal;

-- 1. Create secure functions in 'internal' schema
CREATE OR REPLACE FUNCTION internal.has_role(_user_id uuid, _role app_role, _site_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
      AND role = _role
      AND site_id = _site_id
  )
$function$;

CREATE OR REPLACE FUNCTION internal.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION internal.is_super_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin'
  )
$function$;

-- 2. Update all RLS policies to use 'internal' schema and enforce site_id

-- Properties
DROP POLICY IF EXISTS "Admins and supervisors can insert properties" ON public.properties;
CREATE POLICY "Admins and supervisors can insert properties" ON public.properties
FOR INSERT TO authenticated WITH CHECK (
  internal.has_role(auth.uid(), 'admin', site_id) OR 
  internal.has_role(auth.uid(), 'supervisor', site_id) OR
  internal.is_super_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins and supervisors can update properties" ON public.properties;
CREATE POLICY "Admins and supervisors can update properties" ON public.properties
FOR UPDATE TO authenticated USING (
  internal.has_role(auth.uid(), 'admin', site_id) OR 
  internal.has_role(auth.uid(), 'supervisor', site_id) OR
  internal.is_super_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins and supervisors can delete properties" ON public.properties;
CREATE POLICY "Admins and supervisors can delete properties" ON public.properties
FOR DELETE TO authenticated USING (
  internal.has_role(auth.uid(), 'admin', site_id) OR 
  internal.has_role(auth.uid(), 'supervisor', site_id) OR
  internal.is_super_admin(auth.uid())
);

-- Site Settings
DROP POLICY IF EXISTS "Admins can update settings" ON public.site_settings;
CREATE POLICY "Admins can update settings" ON public.site_settings
FOR UPDATE TO authenticated USING (
  internal.has_role(auth.uid(), 'admin', site_id) OR
  internal.is_super_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can insert settings" ON public.site_settings;
CREATE POLICY "Admins can insert settings" ON public.site_settings
FOR INSERT TO authenticated WITH CHECK (
  internal.has_role(auth.uid(), 'admin', site_id) OR
  internal.is_super_admin(auth.uid())
);

-- Role Permissions
DROP POLICY IF EXISTS "Admins can insert permissions" ON public.role_permissions;
CREATE POLICY "Admins can insert permissions" ON public.role_permissions
FOR INSERT TO authenticated WITH CHECK (
  internal.has_role(auth.uid(), 'admin', site_id) OR
  internal.is_super_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can update permissions" ON public.role_permissions;
CREATE POLICY "Admins can update permissions" ON public.role_permissions
FOR UPDATE TO authenticated USING (
  internal.has_role(auth.uid(), 'admin', site_id) OR
  internal.is_super_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can delete permissions" ON public.role_permissions;
CREATE POLICY "Admins can delete permissions" ON public.role_permissions
FOR DELETE TO authenticated USING (
  internal.has_role(auth.uid(), 'admin', site_id) OR
  internal.is_super_admin(auth.uid())
);

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

-- Contact Messages
DROP POLICY IF EXISTS "Admins and supervisors can view messages" ON public.contact_messages;
CREATE POLICY "Admins and supervisors can view messages" ON public.contact_messages
FOR SELECT TO authenticated USING (
  internal.has_role(auth.uid(), 'admin', site_id) OR 
  internal.has_role(auth.uid(), 'supervisor', site_id) OR
  internal.is_super_admin(auth.uid())
);

-- Traffic Events
DROP POLICY IF EXISTS "Admins and supervisors can view traffic events" ON public.traffic_events;
CREATE POLICY "Admins and supervisors can view traffic events" ON public.traffic_events
FOR SELECT TO authenticated USING (
  internal.has_role(auth.uid(), 'admin', site_id) OR 
  internal.has_role(auth.uid(), 'supervisor', site_id) OR
  internal.is_super_admin(auth.uid())
);

-- Performance Logs
DROP POLICY IF EXISTS "Admins and supervisors view performance logs" ON public.performance_logs;
CREATE POLICY "Admins and supervisors view performance logs" ON public.performance_logs
FOR SELECT TO authenticated USING (
  internal.has_role(auth.uid(), 'admin', site_id) OR 
  internal.has_role(auth.uid(), 'supervisor', site_id) OR
  internal.is_super_admin(auth.uid())
);

-- User Roles
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
CREATE POLICY "Only admins can insert roles" ON public.user_roles
FOR INSERT TO authenticated WITH CHECK (
  internal.has_role(auth.uid(), 'admin', site_id) OR
  internal.is_super_admin(auth.uid())
);

DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
CREATE POLICY "Only admins can update roles" ON public.user_roles
FOR UPDATE TO authenticated USING (
  internal.has_role(auth.uid(), 'admin', site_id) OR
  internal.is_super_admin(auth.uid())
);

DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;
CREATE POLICY "Only admins can delete roles" ON public.user_roles
FOR DELETE TO authenticated USING (
  internal.has_role(auth.uid(), 'admin', site_id) OR
  internal.is_super_admin(auth.uid())
);

-- Audit Logs
DROP POLICY IF EXISTS "Super admins can view all logs" ON public.audit_logs;
CREATE POLICY "Super admins can view all logs" ON public.audit_logs
FOR SELECT TO authenticated USING (internal.is_super_admin(auth.uid()));

-- Storage (if possible, but storage doesn't support custom schema calls in same way, 
-- we will update public functions to be less permissive if they must remain in public)

-- 3. Update public functions to be non-executable by public (keep for storage/compatibility)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role, uuid) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM public, anon;

-- Grants for internal schema
GRANT USAGE ON SCHEMA internal TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA internal TO authenticated;
GRANT USAGE ON SCHEMA internal TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA internal TO service_role;
