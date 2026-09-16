import { useState, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProperties } from "@/contexts/PropertyContext";
import { downloadPropertyPhotos } from "@/lib/download-watermarked";
import { getPublicUrl } from "@/lib/property-image-url";
import type { WatermarkPosition } from "@/components/Watermark";

interface DownloadPhotosButtonProps {
  images: string[];
  /** Used to name the downloaded file (property code or title) */
  baseName: string;
  variant?: "overlay" | "icon";
  className?: string;
}

/**
 * Downloads all property photos with the same watermark shown on the site.
 * Visible only to logged-in admins (or roles allowed to manage properties).
 */
export default function DownloadPhotosButton({
  images,
  baseName,
  variant = "overlay",
  className = "",
}: DownloadPhotosButtonProps) {
  const { user, isAdmin, canManageProperties } = useAuth();
  const { settings } = useProperties();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const handleDownload = useCallback(async () => {
    if (busy || images.length === 0) return;
    setBusy(true);
    setProgress({ done: 0, total: images.length });
    try {
      await downloadPropertyPhotos(
        images.map(getPublicUrl),
        {
          logoUrl: settings.logoUrl ? getPublicUrl(settings.logoUrl) : "",
          enabled: settings.watermarkEnabled !== false,
          position: (settings.watermarkPosition as WatermarkPosition) ?? "center",
          opacity: settings.watermarkOpacity ?? 40,
          sizePct: settings.watermarkSizePct ?? 30,
        },
        baseName,
        (done, total) => setProgress({ done, total }),
      );
      toast.success(
        images.length > 1 ? "Fotos baixadas em .zip!" : "Foto baixada!",
      );
    } catch (e) {
      console.error("Erro ao baixar fotos", e);
      toast.error("Não foi possível preparar as fotos. Tente novamente.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, [busy, images, settings, baseName]);

  if (!user || !(isAdmin || canManageProperties)) return null;
  if (!images || images.length === 0) return null;

  const label = busy
    ? progress && progress.total > 1
      ? `Preparando ${progress.done}/${progress.total}...`
      : "Preparando..."
    : "Baixar fotos";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy}
        title="Baixar fotos com marca d'água"
        className={`p-2 rounded-lg bg-primary/10 text-primary disabled:opacity-60 ${className}`}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={busy}
      title="Baixar fotos com marca d'água"
      className={`inline-flex items-center gap-2 rounded-full border border-card/20 bg-foreground/50 px-3 py-2 text-xs font-semibold text-card backdrop-blur-sm transition-colors hover:bg-foreground/70 disabled:opacity-70 ${className}`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      <span>{label}</span>
    </button>
  );
}
