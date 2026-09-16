import type { WatermarkPosition } from "@/components/Watermark";

export interface WatermarkConfig {
  logoUrl: string;
  enabled: boolean;
  position: WatermarkPosition;
  /** 0-100 */
  opacity: number;
  /** 1-100, % of the image box */
  sizePct: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`));
    img.src = src;
  });
}

/**
 * Draws the property image on a canvas and overlays the brand logo using the
 * same rules as the on-screen <Watermark /> component.
 */
export async function renderWatermarkedBlob(
  imageUrl: string,
  cfg: WatermarkConfig,
): Promise<Blob> {
  const base = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = base.naturalWidth || base.width;
  canvas.height = base.naturalHeight || base.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");

  ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

  if (cfg.enabled && cfg.logoUrl) {
    try {
      const logo = await loadImage(cfg.logoUrl);
      const pct = Math.max(5, Math.min(100, cfg.sizePct || 30)) / 100;
      // Box the logo can occupy, keeping its aspect ratio (object-contain)
      const boxW = canvas.width * pct;
      const boxH = canvas.height * pct;
      const ratio = Math.min(boxW / logo.width, boxH / logo.height);
      const w = logo.width * ratio;
      const h = logo.height * ratio;
      const pad = canvas.width * 0.03;

      let x = (canvas.width - w) / 2;
      let y = (canvas.height - h) / 2;
      switch (cfg.position) {
        case "bottom-right":
          x = canvas.width - w - pad;
          y = canvas.height - h - pad;
          break;
        case "bottom-left":
          x = pad;
          y = canvas.height - h - pad;
          break;
        case "top-right":
          x = canvas.width - w - pad;
          y = pad;
          break;
        case "top-left":
          x = pad;
          y = pad;
          break;
        default:
          break;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(100, cfg.opacity ?? 40)) / 100;
      ctx.drawImage(logo, x, y, w, h);
      ctx.restore();
    } catch {
      // Logo indisponível: baixa a foto original mesmo assim
    }
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar imagem"))),
      "image/jpeg",
      0.92,
    );
  });
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function sanitizeFilename(name: string): string {
  return (name || "imovel")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Downloads every image already watermarked. A single image is downloaded
 * directly; multiple images are packed into a .zip.
 */
export async function downloadPropertyPhotos(
  images: string[],
  cfg: WatermarkConfig,
  baseName: string,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const total = images.length;
  const safe = sanitizeFilename(baseName);

  if (total === 1) {
    const blob = await renderWatermarkedBlob(images[0], cfg);
    onProgress?.(1, 1);
    triggerBlobDownload(blob, `${safe}.jpg`);
    return;
  }

  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  for (let i = 0; i < total; i++) {
    try {
      const blob = await renderWatermarkedBlob(images[i], cfg);
      zip.file(`${safe}-${String(i + 1).padStart(2, "0")}.jpg`, blob);
    } catch {
      // pula imagens que falharem
    }
    onProgress?.(i + 1, total);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerBlobDownload(zipBlob, `${safe}-fotos.zip`);
}
