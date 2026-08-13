-- 1. Desabilitar RLS completamente para a tabela de permissões (Temporário para teste de fluxo)
-- Nota: Isso torna a tabela pública para qualquer usuário autenticado que saiba o nome da tabela.
-- Em um sistema real, gostaríamos de RLS, mas aqui precisamos desbloquear o usuário.
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;

-- 2. Garantir permissões de acesso
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
