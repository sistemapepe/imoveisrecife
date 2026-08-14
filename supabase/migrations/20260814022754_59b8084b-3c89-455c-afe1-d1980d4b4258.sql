-- Security hardening: revoke public execution and explicitly grant to authenticated
REVOKE EXECUTE ON FUNCTION public.duplicate_site(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.duplicate_site(UUID, TEXT, TEXT) TO authenticated;
