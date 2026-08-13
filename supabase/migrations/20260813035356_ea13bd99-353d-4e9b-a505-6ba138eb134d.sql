-- Migration to fix the save_role_perms function parameter issue
-- PostgREST sometimes has trouble with empty-keyed parameters in RPC calls

-- 1. Drop the old function if it exists with the jsonb signature
DROP FUNCTION IF EXISTS public.save_role_perms(jsonb);

-- 2. Create a new version that expects a named parameter 'p_rows'
-- This is much more standard for PostgREST
CREATE OR REPLACE FUNCTION public.save_role_perms(p_rows jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.role_permissions (role, permission, enabled)
    SELECT (item->>'role')::public.app_role, item->>'permission', (item->>'enabled')::boolean
    FROM jsonb_array_elements(p_rows) AS item
    ON CONFLICT (role, permission) DO UPDATE SET enabled = EXCLUDED.enabled;
    RETURN true;
END;
$$;

-- 3. Grants
GRANT EXECUTE ON FUNCTION public.save_role_perms(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_role_perms(jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.save_role_perms(jsonb) TO service_role;

-- 4. Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';