import { useProperties } from "@/contexts/PropertyContext";

export type WatermarkPosition =
  | "center"
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

interface WatermarkProps {
  /** Tailwind size classes for the logo, e.g. "w-16 h-16" */
  size?: string;
  /** Override position; defaults to site settings */
  position?: WatermarkPosition;
  /** Override 0-100 opacity; defaults to site settings */
  opacity?: number;
}

/**
 * Visual-only watermark overlay. Renders the brand logo (from site settings)
 * on top of any image container set to `position: relative`.
 * Pointer-events are disabled so it never blocks clicks.
 * Opacity and position default to global site settings.
 */
export default function Watermark({ size = "w-20 h-20 md:w-28 md:h-28", position, opacity }: WatermarkProps) {
  const { settings } = useProperties();
  if (!settings.logoUrl) return null;

  const pos = position ?? (settings.watermarkPosition as WatermarkPosition) ?? "center";
  const op = opacity ?? settings.watermarkOpacity ?? 40;

  const posClass = {
    center: "inset-0 flex items-center justify-center",
    "bottom-right": "inset-0 flex items-end justify-end p-3",
    "bottom-left": "inset-0 flex items-end justify-start p-3",
    "top-right": "inset-0 flex items-start justify-end p-3",
    "top-left": "inset-0 flex items-start justify-start p-3",
  }[pos];

  return (
    <div className={`pointer-events-none absolute ${posClass}`} aria-hidden="true">
      <img
        src={settings.logoUrl}
        alt=""
        className={`${size} object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] mix-blend-screen`}
        style={{ opacity: op / 100 }}
        loading="lazy"
      />
    </div>
  );
}
