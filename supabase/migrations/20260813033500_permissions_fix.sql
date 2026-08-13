-- Certificar que a tabela existe (deve existir do migration anterior)
-- Adicionar RLS se não houver
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem para evitar conflitos
DROP POLICY IF EXISTS "Super admins can do everything" ON public.role_permissions;
DROP POLICY IF EXISTS "Authenticated users can select permissions" ON public.role_permissions;

-- Super admins têm acesso total
CREATE POLICY "Super admins can do everything"
ON public.role_permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Usuários autenticados podem ler permissões para aplicar no frontend
CREATE POLICY "Authenticated users can select permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (true);

-- Garantir privilégios
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
