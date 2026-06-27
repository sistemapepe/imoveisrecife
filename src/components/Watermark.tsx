import { useProperties } from "@/contexts/PropertyContext";

export type WatermarkPosition =
  | "center"
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

interface WatermarkProps {
  /** Override position; defaults to site settings */
  position?: WatermarkPosition;
  /** Override 0-100 opacity; defaults to site settings */
  opacity?: number;
  /** Override size as % of container (1-100); defaults to site settings */
  sizePct?: number;
}

/**
 * Visual-only watermark overlay. Renders the brand logo (from site settings)
 * on top of any image container set to `position: relative`. Size scales with
 * the container so it works for cards, hero images, lightbox and thumbnails.
 */
export default function Watermark({ position, opacity, sizePct }: WatermarkProps) {
  const { settings } = useProperties();
  if (!settings.logoUrl) return null;
  if (settings.watermarkEnabled === false) return null;

  const pos = position ?? (settings.watermarkPosition as WatermarkPosition) ?? "center";
  const op = opacity ?? settings.watermarkOpacity ?? 40;
  const size = Math.max(5, Math.min(100, sizePct ?? settings.watermarkSizePct ?? 30));

  const posClass = {
    center: "inset-0 flex items-center justify-center",
    "bottom-right": "inset-0 flex items-end justify-end p-[3%]",
    "bottom-left": "inset-0 flex items-end justify-start p-[3%]",
    "top-right": "inset-0 flex items-start justify-end p-[3%]",
    "top-left": "inset-0 flex items-start justify-start p-[3%]",
  }[pos];

  return (
    <div className={`pointer-events-none absolute ${posClass}`} aria-hidden="true">
      <img
        src={settings.logoUrl}
        alt=""
        className="object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] mix-blend-screen"
        style={{ opacity: op / 100, width: `${size}%`, height: `${size}%` }}
        loading="lazy"
      />
    </div>
  );
}
