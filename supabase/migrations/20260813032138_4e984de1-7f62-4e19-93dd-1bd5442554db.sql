-- Step 1: Add the value to the enum (must be done in its own transaction/migration usually, but Supabase migration tool handles this)
ALTER TYPE public.app_role ADD VALUE 'super_admin';
