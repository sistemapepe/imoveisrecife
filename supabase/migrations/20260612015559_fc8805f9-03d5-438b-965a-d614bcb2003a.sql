
-- 1. Fix performance_logs SELECT policy
DROP POLICY IF EXISTS "Admins can view performance logs" ON public.performance_logs;
CREATE POLICY "Admins and supervisors view performance logs"
ON public.performance_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'));

-- 2. Revoke EXECUTE on SECURITY DEFINER functions from anon/public; keep authenticated only where needed
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.enforce_contact_message_rate_limit() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_contact_message_rate_limit() TO service_role;

-- 3. Restrict LIST on property-images bucket: replace public SELECT policy with object-level read via signed URLs or path-based
-- Keep public read for individual files (needed for <img> tags) but block listing the bucket
-- Note: storage.objects SELECT controls both read and list. To prevent listing while allowing direct GETs,
-- we can restrict SELECT to admins for authenticated, and rely on the bucket being public for anonymous direct fetches.
DROP POLICY IF EXISTS "Property images are publicly accessible" ON storage.objects;
-- Bucket remains public=true so direct URLs still work for <img>. Authenticated list is restricted.
CREATE POLICY "Admins can list property images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'property-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor')));
