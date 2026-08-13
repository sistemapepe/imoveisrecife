-- 1. Habilitar RLS (caso não esteja)
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas possíveis para limpar o estado
DROP POLICY IF EXISTS "Super admins can do everything" ON public.role_permissions;
DROP POLICY IF EXISTS "Authenticated users can select permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Admins can select all rows" ON public.role_permissions;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.role_permissions;
DROP POLICY IF EXISTS "Super admins can manage all permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Everyone authenticated can view permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Admins and role owners can view permissions" ON public.role_permissions;

-- 3. Criar a política definitiva de ALL para super_admin
-- Usando auth.uid() e verificando na user_roles diretamente para ser mais performático e evitar recursão
CREATE POLICY "Super admin full access"
ON public.role_permissions
FOR ALL
TO authenticated
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

-- 4. Criar política de leitura para todos os autenticados
-- Importante para o AuthContext carregar as permissões do usuário logado
CREATE POLICY "All authenticated users can read permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (true);

-- 5. Garantir permissões de acesso
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
