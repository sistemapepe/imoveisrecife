CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role, _site_id uuid)
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

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role, uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role, uuid) TO authenticated;

-- Properties
DROP POLICY IF EXISTS "Admins and supervisors can insert properties" ON public.properties;
CREATE POLICY "Admins and supervisors can insert properties" ON public.properties
FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'admin', site_id) OR 
  public.has_role(auth.uid(), 'supervisor', site_id) OR
  public.has_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "Admins and supervisors can update properties" ON public.properties;
CREATE POLICY "Admins and supervisors can update properties" ON public.properties
FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'admin', site_id) OR 
  public.has_role(auth.uid(), 'supervisor', site_id) OR
  public.has_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "Admins and supervisors can delete properties" ON public.properties;
CREATE POLICY "Admins and supervisors can delete properties" ON public.properties
FOR DELETE TO authenticated USING (
  public.has_role(auth.uid(), 'admin', site_id) OR 
  public.has_role(auth.uid(), 'supervisor', site_id) OR
  public.has_role(auth.uid(), 'super_admin')
);
