import React, { useEffect } from "react";
import { useProperties } from "@/contexts/PropertyContext";
import { parseHsl, formatHsl, pickBestContrast, adjustForContrast } from "@/lib/color-contrast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Clamp lightness para evitar branco/preto puro como cor de marca.
 */
function clampHslLightness(hsl: string, min = 25, max = 65): string {
  const c = parseHsl(hsl);
  if (!c) return hsl;
  c.l = Math.min(max, Math.max(min, c.l));
  return formatHsl(c);
}

const LIGHT_CARD = { h: 0, s: 0, l: 100 };
const DARK_CARD = { h: 195, s: 25, l: 13 };

export const DynamicTheme = React.forwardRef<HTMLDivElement, any>((props, ref) => {
...
  return <div ref={ref} style={{ display: 'none' }} />;
});
export default DynamicTheme;
