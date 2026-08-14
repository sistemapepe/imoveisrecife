ALTER TABLE public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_permission_key;
ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_role_permission_site_key UNIQUE (role, permission, site_id);
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_site_key UNIQUE (user_id, role, site_id);

GRANT ALL ON public.role_permissions TO authenticated, service_role;
GRANT ALL ON public.user_roles TO authenticated, service_role;
