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
  const { settings } = useProperties();

  useEffect(() => {
    const root = document.documentElement;
    
    // 1. Cores Individuais do Site (Prioridade)
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

    // 2. Fallback para Cores Globais da Rede (Network Settings) se as do site não existirem
    const applyGlobalFallbacks = async () => {
      if (!primary || !accent) {
        try {
          const { data } = await supabase
            .from("network_settings")
            .select("key, value")
            .eq("key", "theme_defaults")
            .maybeSingle();
          
          if (data?.value && typeof data.value === 'object' && !Array.isArray(data.value)) {
            const defaults = data.value as Record<string, any>;
            if (!primary && defaults.primary && typeof defaults.primary === 'string') {
              const globalPrimary = clampHslLightness(defaults.primary);
              root.style.setProperty("--primary", globalPrimary);
              root.style.setProperty("--ring", globalPrimary);
            }
            if (!accent && defaults.accent && typeof defaults.accent === 'string') {
              const globalAccent = clampHslLightness(defaults.accent);
              root.style.setProperty("--accent", globalAccent);
              root.style.setProperty("--gold", globalAccent);
            }
          }
        } catch (e) {
          console.error("Failed to fetch global theme fallbacks", e);
        }
      }
    };

    applyGlobalFallbacks();

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

    // Atualiza favicon e apple-touch-icon dinamicamente com a logo do site.
    if (settings.logoUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const size = 64;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          // Fundo escuro com cantos arredondados
          const radius = 12;
          ctx.fillStyle = "#0a0a0a";
          ctx.beginPath();
          ctx.moveTo(radius, 0);
          ctx.lineTo(size - radius, 0);
          ctx.quadraticCurveTo(size, 0, size, radius);
          ctx.lineTo(size, size - radius);
          ctx.quadraticCurveTo(size, size, size - radius, size);
          ctx.lineTo(radius, size);
          ctx.quadraticCurveTo(0, size, 0, size - radius);
          ctx.lineTo(0, radius);
          ctx.quadraticCurveTo(0, 0, radius, 0);
          ctx.closePath();
          ctx.fill();
          // Desenha a logo centralizada com padding
          const pad = 6;
          const maxW = size - pad * 2;
          const maxH = size - pad * 2;
          const ratio = Math.min(maxW / img.width, maxH / img.height);
          const w = img.width * ratio;
          const h = img.height * ratio;
          ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
          const dataUrl = canvas.toDataURL("image/png");
          const setIcon = (rel: string) => {
            let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
            if (!link) {
              link = document.createElement("link");
              link.rel = rel;
              document.head.appendChild(link);
            }
            link.type = "image/png";
            link.href = dataUrl;
          };
          setIcon("icon");
          setIcon("apple-touch-icon");
        } catch {
          // Fallback: usa diretamente a URL da logo
          const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
          if (link) link.href = settings.logoUrl!;
        }
      };
      img.onerror = () => {/* mantém favicon atual */};
      img.src = settings.logoUrl;
    }


    // Atualiza o título da aba com o nome da marca
    if (settings.brandName) {
      const current = document.title;
      if (!current.includes(settings.brandName)) {
        document.title = `${settings.brandName} — ${current}`;
      }
    }
  }, [
    settings.primaryColor,
    settings.accentColor,
    settings.navbarHeightPx,
    settings.logoWidthPx,
    settings.logoHeightPx,
    settings.marqueePaddingYPx,
    settings.logoUrl,
    settings.brandName,
  ]);

  return <div ref={ref} style={{ display: 'none' }} />;
});

DynamicTheme.displayName = "DynamicTheme";

export default DynamicTheme;
