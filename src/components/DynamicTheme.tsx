import { useEffect } from "react";
import { useProperties } from "@/contexts/PropertyContext";
import { parseHsl, formatHsl, pickBestContrast, adjustForContrast } from "@/lib/color-contrast";

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

export default function DynamicTheme() {
  const { settings } = useProperties();

  useEffect(() => {
    const root = document.documentElement;
    const primary = settings.primaryColor ? clampHslLightness(settings.primaryColor) : null;
    const accent = settings.accentColor ? clampHslLightness(settings.accentColor) : null;

    if (primary) {
      root.style.setProperty("--primary", primary);
      root.style.setProperty("--ring", primary);
    }
    if (accent) {
      root.style.setProperty("--accent", accent);
      root.style.setProperty("--gold", accent);
    }

    // Calcula --price-color: melhor contraste entre primary/accent contra fundos claro e escuro.
    const pc = parseHsl(primary ?? "195 85% 45%");
    const ac = parseHsl(accent ?? "42 56% 55%");
    if (pc && ac) {
      const best = pickBestContrast([pc, ac], [LIGHT_CARD]);
      const safe = adjustForContrast(best, LIGHT_CARD, 4.5);
      root.style.setProperty("--price-color", formatHsl(safe));

      const bestDark = pickBestContrast([pc, ac], [DARK_CARD]);
      const safeDark = adjustForContrast(bestDark, DARK_CARD, 4.5);
      root.style.setProperty("--price-color-dark", formatHsl(safeDark));
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
