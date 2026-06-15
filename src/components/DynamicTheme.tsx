import { useEffect } from "react";
import { useProperties } from "@/contexts/PropertyContext";

/**
 * Clamp lightness of an "H S% L%" HSL string so brand colors used as text
 * (e.g. price color via --accent) never become invisible on light backgrounds
 * or unreadable on dark ones. Mantém matiz/saturação escolhidos pelo admin.
 */
function clampHslLightness(hsl: string, min = 25, max = 65): string {
  if (!hsl) return hsl;
  const m = hsl.trim().match(/^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%$/);
  if (!m) return hsl;
  const h = parseFloat(m[1]);
  const s = parseFloat(m[2]);
  let l = parseFloat(m[3]);
  l = Math.min(max, Math.max(min, l));
  return `${h} ${s}% ${l}%`;
}

export default function DynamicTheme() {
  const { settings } = useProperties();

  useEffect(() => {
    const root = document.documentElement;
    if (settings.primaryColor) {
      const safe = clampHslLightness(settings.primaryColor);
      root.style.setProperty("--primary", safe);
      root.style.setProperty("--ring", safe);
    }
    if (settings.accentColor) {
      const safe = clampHslLightness(settings.accentColor);
      root.style.setProperty("--accent", safe);
      root.style.setProperty("--gold", safe);
    }
    root.style.setProperty("--navbar-h", `${settings.navbarHeightPx ?? 100}px`);
    root.style.setProperty("--logo-w", `${settings.logoWidthPx ?? 270}px`);
    root.style.setProperty("--logo-h", `${settings.logoHeightPx ?? 140}px`);
    root.style.setProperty("--marquee-py", `${settings.marqueePaddingYPx ?? 4}px`);
  }, [
    settings.primaryColor,
    settings.accentColor,
    settings.navbarHeightPx,
    settings.logoWidthPx,
    settings.logoHeightPx,
    settings.marqueePaddingYPx,
  ]);

  return null;
}
