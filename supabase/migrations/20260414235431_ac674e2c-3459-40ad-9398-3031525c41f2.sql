ALTER TABLE public.properties ADD COLUMN status text NOT NULL DEFAULT 'disponivel';

COMMENT ON COLUMN public.properties.status IS 'Property status: disponivel, reservado, vendido';