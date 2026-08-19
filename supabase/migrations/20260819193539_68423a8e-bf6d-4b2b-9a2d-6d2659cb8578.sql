REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM authenticated, anon, public;

-- Re-grant specific non-security-critical or non-definining functions if necessary.
-- But usually, RLS should call internal functions.
-- Let's check what's left in public.
