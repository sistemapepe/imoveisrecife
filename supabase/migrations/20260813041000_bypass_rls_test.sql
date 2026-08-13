-- TESTE: Desabilitar RLS e dar permissão total até para anon (Apenas para depurar se o problema é RLS ou GRANT)
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO anon;
GRANT ALL ON public.role_permissions TO service_role;
