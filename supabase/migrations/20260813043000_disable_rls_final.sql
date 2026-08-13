-- 1. Desabilitar RLS completamente e NÃO reabilitar
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;

-- 2. Garantir privilégios totais para todos os papéis da API
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO anon;
GRANT ALL ON public.role_permissions TO service_role;
