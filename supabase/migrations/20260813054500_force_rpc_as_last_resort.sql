-- 1. Garantir tabela limpa e sem RLS
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

-- 2. Criar RPC que usa service_role (SECURITY DEFINER)
-- Isso deve ignorar qualquer cache de política persistente
CREATE OR REPLACE FUNCTION public.force_save_permissions(p_perms jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    item jsonb;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(p_perms)
    LOOP
        INSERT INTO public.role_permissions (role, permission, enabled)
        VALUES (
            (item->>'role')::public.app_role,
            item->>'permission',
            (item->>'enabled')::boolean
        )
        ON CONFLICT (role, permission)
        DO UPDATE SET enabled = EXCLUDED.enabled;
    END LOOP;
    RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.force_save_permissions(jsonb) TO authenticated;
NOTIFY pgrst, 'reload schema';
