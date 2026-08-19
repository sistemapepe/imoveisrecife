-- Fix Security Findings: Revoke Public Execute on Security Definer Functions in 'public' schema

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role, uuid) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.save_role_perms(jsonb) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.assign_site_admin(uuid, uuid) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.duplicate_site(uuid, text, text) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.enforce_contact_message_rate_limit() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.get_tenant_id_by_hostname(text) FROM public, anon;

-- Explicitly allow authenticated users to execute them where needed (RLS policies)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_contact_message_rate_limit() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_tenant_id_by_hostname(text) TO authenticated;

-- Admin functions should ONLY be executable by service_role (Edge Functions)
GRANT EXECUTE ON FUNCTION public.save_role_perms(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.assign_site_admin(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.duplicate_site(uuid, text, text) TO service_role;
