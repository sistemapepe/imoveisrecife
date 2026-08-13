-- 1. Garantir tabela limpa e RLS DEFINITIVAMENTE desativado
DROP TABLE IF EXISTS public.role_permissions CASCADE;

CREATE TABLE public.role_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role public.app_role NOT NULL,
    permission text NOT NULL,
    enabled boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(role, permission)
);

ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
GRANT SELECT ON public.role_permissions TO anon;

-- 2. Criar uma VIEW para forçar o recarregamento do cache do PostgREST
CREATE OR REPLACE VIEW public.role_permissions_view AS SELECT * FROM public.role_permissions;
GRANT SELECT ON public.role_permissions_view TO authenticated;

-- 3. Função com nome muito curto e simples para evitar truncamento ou erros de cache
CREATE OR REPLACE FUNCTION public.set_perms(p jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.role_permissions (role, permission, enabled)
    SELECT (item->>'role')::public.app_role, item->>'permission', (item->>'enabled')::boolean
    FROM jsonb_array_elements(p) AS item
    ON CONFLICT (role, permission) DO UPDATE SET enabled = EXCLUDED.enabled;
    RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_perms(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_perms(jsonb) TO anon;

-- 4. Forçar recarregamento
NOTIFY pgrst, 'reload schema';
