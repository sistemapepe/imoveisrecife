-- 1. Desabilitar RLS de forma agressiva
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'role_permissions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.role_permissions', pol.policyname);
    END LOOP;
END $$;

-- 3. Grant total e absoluto
GRANT ALL PRIVILEGES ON TABLE public.role_permissions TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.role_permissions TO anon;
GRANT ALL PRIVILEGES ON TABLE public.role_permissions TO service_role;

-- 4. Notificar PostgREST
NOTIFY pgrst, 'reload schema';
