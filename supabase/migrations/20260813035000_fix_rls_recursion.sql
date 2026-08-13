-- 1. Desabilitar RLS temporariamente para limpar
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas
DROP POLICY IF EXISTS "Super admin full access" ON public.role_permissions;
DROP POLICY IF EXISTS "All authenticated users can read permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Super admins can manage all permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Everyone authenticated can view permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Admins and role owners can view permissions" ON public.role_permissions;

-- 3. Habilitar RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 4. Criar política de leitura simplificada
CREATE POLICY "authenticated_read_permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (true);

-- 5. Criar política de gravação baseada em função fixa ou metadados da sessão se possível,
-- mas aqui usaremos uma subquery direta que o Supabase geralmente trata bem
CREATE POLICY "super_admin_all_permissions"
ON public.role_permissions
FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'
)
WITH CHECK (
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'
);

-- 6. Garantir permissões
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
