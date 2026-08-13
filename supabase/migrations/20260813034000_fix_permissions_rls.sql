-- Garantir que a tabela existe e tem RLS habilitado
ALTER TABLE IF EXISTS public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas para evitar erros de duplicidade ou conflito
DROP POLICY IF EXISTS "Super admins can do everything" ON public.role_permissions;
DROP POLICY IF EXISTS "Authenticated users can select permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Admins can select all rows" ON public.role_permissions;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.role_permissions;

-- 1. Super admins (definidos na user_roles) têm acesso TOTAL à tabela de permissões
CREATE POLICY "Super admins can manage all permissions"
ON public.role_permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 2. Todos os usuários autenticados (corretores, supervisores, admins) precisam LER
-- as permissões para que o AuthContext carregue as flags de UI corretamente.
CREATE POLICY "Everyone authenticated can view permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (true);

-- 3. Garantir privilégios de acesso ao Data API (PostgREST)
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
