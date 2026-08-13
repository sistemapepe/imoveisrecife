-- 1. DROP TUDO ANTES
DROP FUNCTION IF EXISTS public.set_perms(jsonb);
DROP FUNCTION IF EXISTS public.force_save_permissions(jsonb);
DROP FUNCTION IF EXISTS public.save_role_permissions(jsonb);
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
GRANT SELECT ON public.role_permissions TO anon;
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;

-- 4. RPC PADRÃO SEM ARGUMENTOS NOMEADOS PARA EVITAR CONFLITOS DE CACHE
-- Usando a sintaxe mais básica possível
CREATE OR REPLACE FUNCTION public.save_perms(jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.role_permissions (role, permission, enabled)
    SELECT (item->>'role')::public.app_role, item->>'permission', (item->>'enabled')::boolean
    FROM jsonb_array_elements($1) AS item
    ON CONFLICT (role, permission) DO UPDATE SET enabled = EXCLUDED.enabled;
    RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_perms(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_perms(jsonb) TO anon;

-- 5. RELOAD
NOTIFY pgrst, 'reload schema';
