-- Ensure RLS is enabled on performance_logs
ALTER TABLE public.performance_logs ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies to avoid name conflicts
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.performance_logs;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.performance_logs;
DROP POLICY IF EXISTS "Anyone can insert performance logs" ON public.performance_logs;
DROP POLICY IF EXISTS "Admins can view performance logs" ON public.performance_logs;

-- Create policy for anon to insert logs
CREATE POLICY "Anyone can insert performance logs" 
ON public.performance_logs 
FOR INSERT 
WITH CHECK (true);

-- Create policy for admin (authenticated) to read logs
CREATE POLICY "Admins can view performance logs" 
ON public.performance_logs 
FOR SELECT 
USING (auth.role() = 'authenticated');
