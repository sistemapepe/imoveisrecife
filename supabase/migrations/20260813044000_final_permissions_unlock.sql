-- 1. Desabilitar RLS completamente para a tabela
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas
DROP POLICY IF EXISTS "permissive_all" ON public.role_permissions;
DROP POLICY IF EXISTS "allow_all_auth" ON public.role_permissions;
DROP POLICY IF EXISTS "authenticated_full_access" ON public.role_permissions;
DROP POLICY IF EXISTS "read_all" ON public.role_permissions;
DROP POLICY IF EXISTS "write_super_admin" ON public.role_permissions;

-- 3. Garantir privilégios totais para a função authenticated no Postgres
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
GRANT ALL ON public.role_permissions TO anon;

-- 4. Criar política ultra simples caso o RLS seja reabilitado acidentalmente
-- Mas manter RLS desabilitado por enquanto.
CREATE POLICY "unlock" ON public.role_permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
