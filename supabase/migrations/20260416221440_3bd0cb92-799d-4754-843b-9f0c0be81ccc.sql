-- Add previous_price column to track price drops
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS previous_price numeric NOT NULL DEFAULT 0;

-- Trigger function: when price decreases, store the old price; otherwise clear it
CREATE OR REPLACE FUNCTION public.track_property_price_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.price IS DISTINCT FROM OLD.price THEN
    IF NEW.price < OLD.price THEN
      NEW.previous_price := OLD.price;
    ELSE
      NEW.previous_price := 0;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_property_price_change ON public.properties;
CREATE TRIGGER trg_track_property_price_change
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.track_property_price_change();