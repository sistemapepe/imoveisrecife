
-- performance_logs INSERT: replace WITH CHECK (true) with a minimal predicate
DROP POLICY IF EXISTS "Anyone can insert performance logs" ON public.performance_logs;
CREATE POLICY "Anyone can insert performance logs"
ON public.performance_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (metric_name IS NOT NULL AND metric_value IS NOT NULL);

-- visit_requests INSERT: same treatment
DROP POLICY IF EXISTS "Anyone can submit visit request" ON public.visit_requests;
CREATE POLICY "Anyone can submit visit request"
ON public.visit_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (name IS NOT NULL AND phone IS NOT NULL AND property_id IS NOT NULL);
