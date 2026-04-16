-- 1) Endurecer INSERT público em contact_messages com limites de tamanho
DROP POLICY IF EXISTS "Anyone can send contact message" ON public.contact_messages;

CREATE POLICY "Anyone can send contact message"
ON public.contact_messages
FOR INSERT
TO public
WITH CHECK (
  length(name) > 0 AND length(name) <= 200
  AND length(email) > 0 AND length(email) <= 255
  AND length(phone) <= 50
  AND length(interest) <= 100
  AND length(message) <= 5000
);

-- 2) Permitir que administradores vejam todos os papéis de usuários
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));