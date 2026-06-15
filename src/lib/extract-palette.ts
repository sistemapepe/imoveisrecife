/**
 * Extrai a paleta dominante de uma imagem (logo).
 * Retorna `primary` e `accent` no formato HSL "H S% L%" (compatível com CSS vars).
 *
 * Estratégia: amostra os pixels da imagem, ignora pixels transparentes/quase brancos/quase pretos,
 * agrupa por hue em "baldes" de 30°, escolhe os 2 baldes mais frequentes.
 */
export async function extractPaletteFromImage(src: string): Promise<{ primary: string; accent: string }> {
  if (!src) throw new Error("Logo ausente");

  const img = await loadImage(src);
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");
  ctx.drawImage(img, 0, 0, size, size);

  let pixels: ImageData;
  try {
    pixels = ctx.getImageData(0, 0, size, size);
  } catch {
    throw new Error("Imagem bloqueada por CORS — hospede a logo no mesmo domínio.");
  }

  // 12 baldes de 30° (hue 0..360)
  const buckets: Array<{ count: number; h: number; s: number; l: number }> = Array.from(
    { length: 12 },
    () => ({ count: 0, h: 0, s: 0, l: 0 })
  );

  for (let i = 0; i < pixels.data.length; i += 4) {
    const r = pixels.data[i];
    const g = pixels.data[i + 1];
    const b = pixels.data[i + 2];
    const a = pixels.data[i + 3];
    if (a < 128) continue;
    const [h, s, l] = rgbToHsl(r, g, b);
    if (s < 0.15) continue; // pula tons de cinza
    if (l < 0.12 || l > 0.92) continue; // pula quase preto/branco
    const idx = Math.min(11, Math.floor(h / 30));
    const b0 = buckets[idx];
    b0.count++;
    b0.h += h;
    b0.s += s;
    b0.l += l;
  }

  const ranked = buckets
    .filter((b) => b.count > 0)
    .map((b) => ({ h: b.h / b.count, s: b.s / b.count, l: b.l / b.count, count: b.count }))
    .sort((a, b) => b.count - a.count);

  if (ranked.length === 0) throw new Error("Não foi possível identificar cores na logo");

  const primaryRaw = ranked[0];
  const accentRaw = ranked[1] ?? shiftHue(primaryRaw, 30);

  return {
    primary: toHslString(primaryRaw),
    accent: toHslString(accentRaw),
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar imagem"));
    img.src = src;
  });
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}

function shiftHue(c: { h: number; s: number; l: number }, deg: number) {
  return { ...c, h: (c.h + deg + 360) % 360 };
}

function toHslString(c: { h: number; s: number; l: number }): string {
  // garante saturação/luminosidade legíveis para uso como cor de marca
  const s = Math.round(Math.max(0.45, Math.min(0.85, c.s)) * 100);
  const l = Math.round(Math.max(0.35, Math.min(0.6, c.l)) * 100);
  return `${Math.round(c.h)} ${s}% ${l}%`;
}
