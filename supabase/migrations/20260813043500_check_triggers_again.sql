-- 1. Verificar triggers no banco
DO $$
DECLARE
    trig_name text;
BEGIN
    FOR trig_name IN (SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'role_permissions')
    LOOP
        EXECUTE 'DROP TRIGGER ' || trig_name || ' ON public.role_permissions';
    END LOOP;
END $$;

-- 2. Garantir acesso
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.role_permissions TO authenticated;
