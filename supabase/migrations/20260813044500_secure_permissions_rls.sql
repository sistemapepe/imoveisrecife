-- 1. Reabilitar RLS para segurança
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 2. Limpar todas as políticas de teste anteriores
DROP POLICY IF EXISTS "unlock" ON public.role_permissions;
DROP POLICY IF EXISTS "authenticated_full_access" ON public.role_permissions;
DROP POLICY IF EXISTS "allow_all_auth" ON public.role_permissions;
DROP POLICY IF EXISTS "permissive_all" ON public.role_permissions;
DROP POLICY IF EXISTS "read_all" ON public.role_permissions;
DROP POLICY IF EXISTS "write_super_admin" ON public.role_permissions;

-- 3. Política de Leitura: Qualquer usuário autenticado pode ler as permissões
-- Isso é necessário para que o app saiba quais botões mostrar/esconder
CREATE POLICY "auth_read_perms" ON public.role_permissions FOR SELECT TO authenticated USING (true);

-- 4. Política de Escrita: NINGUÉM via Data API (PostgREST)
-- Como agora usamos uma Edge Function com service_role (security bypass), 
-- não precisamos de políticas de INSERT/UPDATE/DELETE para usuários finais.
-- Isso fecha a brecha de segurança onde um usuário mal-intencionado tentaria burlar o RLS.

-- 5. Garantir que a service_role (usada pela Edge Function) continue tendo acesso total
GRANT ALL ON public.role_permissions TO service_role;
GRANT SELECT ON public.role_permissions TO authenticated;
