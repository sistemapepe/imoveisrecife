-- 1. Desabilitar RLS completamente para a tabela
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas
DROP POLICY IF EXISTS "Super admin full access" ON public.role_permissions;
DROP POLICY IF EXISTS "All authenticated users can read permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Super admins can manage all permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Everyone authenticated can view permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Admins and role owners can view permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "authenticated_read_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "super_admin_all_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Super admins can manage all permissions" ON public.role_permissions;

-- 3. Habilitar RLS novamente
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 4. Criar UMA política simples para leitura
CREATE POLICY "read_all" ON public.role_permissions FOR SELECT TO authenticated USING (true);

-- 5. Criar UMA política simples para escrita que NÃO depende de funções (para evitar recursão)
-- Usamos auth.jwt() para checar a role se estiver no JWT, ou uma subquery direta simples.
CREATE POLICY "write_super_admin" ON public.role_permissions FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- 6. Garantir permissões básicas do Postgres
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
