/**
 * Utilitários de contraste WCAG para cores em formato "H S% L%".
 */

export type HSL = { h: number; s: number; l: number };

export function parseHsl(input: string): HSL | null {
  if (!input) return null;
  const m = input.trim().match(/^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%$/);
  if (!m) return null;
  return { h: parseFloat(m[1]), s: parseFloat(m[2]), l: parseFloat(m[3]) };
}

export function formatHsl(c: HSL): string {
  return `${Math.round(c.h)} ${Math.round(c.s)}% ${Math.round(c.l)}%`;
}

export function hslToRgb({ h, s, l }: HSL): [number, number, number] {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function relLuminance([r, g, b]: [number, number, number]): number {
  const toLin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [R, G, B] = [toLin(r), toLin(g), toLin(b)];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** Razão WCAG entre duas cores HSL. */
export function contrastRatio(a: HSL, b: HSL): number {
  const la = relLuminance(hslToRgb(a));
  const lb = relLuminance(hslToRgb(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Escolhe a cor (entre candidatas) com melhor contraste mínimo contra todos os fundos. */
export function pickBestContrast(candidates: HSL[], backgrounds: HSL[]): HSL {
  let best = candidates[0];
  let bestScore = -Infinity;
  for (const c of candidates) {
    const score = Math.min(...backgrounds.map((bg) => contrastRatio(c, bg)));
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

/** Ajusta luminosidade até atingir contraste alvo contra um fundo (mantém H/S). */
export function adjustForContrast(color: HSL, bg: HSL, target = 4.5): HSL {
  if (contrastRatio(color, bg) >= target) return color;
  const bgLight = relLuminance(hslToRgb(bg)) > 0.5;
  let l = color.l;
  const step = bgLight ? -2 : 2;
  for (let i = 0; i < 50; i++) {
    l = Math.min(95, Math.max(5, l + step));
    const candidate = { ...color, l };
    if (contrastRatio(candidate, bg) >= target) return candidate;
  }
  return { ...color, l };
}
