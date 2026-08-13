-- 1. Desabilitar RLS completamente
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;

-- 2. Limpar TODAS as políticas possíveis (nomes conhecidos)
DROP POLICY IF EXISTS "permissive_all" ON public.role_permissions;
DROP POLICY IF EXISTS "Super admin full access" ON public.role_permissions;
DROP POLICY IF EXISTS "All authenticated users can read permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "authenticated_read_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "super_admin_all_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "read_all" ON public.role_permissions;
DROP POLICY IF EXISTS "write_super_admin" ON public.role_permissions;
DROP POLICY IF EXISTS "Everyone authenticated can view permissions" ON public.role_permissions;

-- 3. Habilitar RLS e criar política baseada APENAS em 'true' para teste
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_full_access" ON public.role_permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Garantir privilégios
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
