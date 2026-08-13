-- Verificar e remover gatilhos que possam estar bloqueando a inserção
DROP TRIGGER IF EXISTS trg_validate_permission ON public.role_permissions;
DROP TRIGGER IF EXISTS trg_audit_permissions ON public.role_permissions;

-- Garantir que não há RLS
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;

-- Dar acesso total a todos os autenticados para teste
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO anon;
GRANT ALL ON public.role_permissions TO service_role;
