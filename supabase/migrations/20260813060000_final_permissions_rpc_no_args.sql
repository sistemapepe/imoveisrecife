-- 1. LIMPEZA TOTAL
DROP FUNCTION IF EXISTS public.save_perms(jsonb);
DROP TABLE IF EXISTS public.role_permissions CASCADE;

-- 2. RECRIAR TABELA
CREATE TABLE public.role_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role public.app_role NOT NULL,
    permission text NOT NULL,
    enabled boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(role, permission)
);

-- 3. GRANT E RLS OFF
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
GRANT ALL ON public.role_permissions TO anon;
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;

-- 4. RPC SEM ARGUMENTOS PARA FORÇAR RECONHECIMENTO BÁSICO
-- O PostgREST às vezes tem problemas com sobrecarga de funções ou tipos complexos no cache
CREATE OR REPLACE FUNCTION public.reset_all_perms()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Apenas um teste para ver se o RPC é chamado
    RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_all_perms() TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_all_perms() TO anon;

-- 5. RELOAD
NOTIFY pgrst, 'reload schema';
