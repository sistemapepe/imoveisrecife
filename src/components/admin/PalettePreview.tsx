import { useMemo } from "react";
import { parseHsl, contrastRatio, adjustForContrast, formatHsl, pickBestContrast } from "@/lib/color-contrast";

interface Props {
  primary: string;
  accent: string;
  onSuggest?: (primary: string, accent: string) => void;
}

const LIGHT_CARD = { h: 0, s: 0, l: 100 };
const DARK_CARD = { h: 195, s: 25, l: 13 };
const MIN_CONTRAST = 4.5;

/**
 * Mostra um card claro e outro escuro com o preço usando a paleta atual.
 * Avisa quando o contraste é insuficiente e sugere ajuste automático.
 */
export default function PalettePreview({ primary, accent, onSuggest }: Props) {
  const data = useMemo(() => {
    const p = parseHsl(primary);
    const a = parseHsl(accent);
    if (!p || !a) return null;
    const bestLight = pickBestContrast([p, a], [LIGHT_CARD]);
    const bestDark = pickBestContrast([p, a], [DARK_CARD]);
    const ratioLight = contrastRatio(bestLight, LIGHT_CARD);
    const ratioDark = contrastRatio(bestDark, DARK_CARD);
    const lowContrast = ratioLight < MIN_CONTRAST || ratioDark < MIN_CONTRAST;
    return { p, a, bestLight, bestDark, ratioLight, ratioDark, lowContrast };
  }, [primary, accent]);

  if (!data) return null;

  const applySuggestion = () => {
    if (!onSuggest) return;
    const fixedP = adjustForContrast(data.p, LIGHT_CARD, MIN_CONTRAST);
    const fixedA = adjustForContrast(data.a, LIGHT_CARD, MIN_CONTRAST);
    onSuggest(formatHsl(fixedP), formatHsl(fixedA));
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
        Prévia do preço (claro / escuro)
      </p>
      <div className="grid grid-cols-2 gap-2">
        <PreviewCard bg="hsl(0 0% 100%)" fg="hsl(200 30% 10%)" muted="hsl(215 14% 46%)"
          priceColor={`hsl(${formatHsl(data.bestLight)})`} ratio={data.ratioLight} label="Claro" />
        <PreviewCard bg="hsl(195 25% 13%)" fg="hsl(210 40% 96%)" muted="hsl(215 20% 65%)"
          priceColor={`hsl(${formatHsl(data.bestDark)})`} ratio={data.ratioDark} label="Escuro" />
      </div>
      {data.lowContrast && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-2.5">
          <span className="text-base leading-none">⚠️</span>
          <div className="flex-1 space-y-1.5">
            <p className="text-[11px] font-semibold text-destructive">
              Contraste insuficiente — o preço pode ficar invisível.
            </p>
            {onSuggest && (
              <button
                type="button"
                onClick={applySuggestion}
                className="text-[11px] font-semibold px-2 py-1 rounded-md border border-destructive/40 bg-background hover:bg-destructive/10 transition-colors"
              >
                Aplicar correção automática
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewCard({
  bg, fg, muted, priceColor, ratio, label,
}: { bg: string; fg: string; muted: string; priceColor: string; ratio: number; label: string }) {
  const ok = ratio >= MIN_CONTRAST;
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="p-3 space-y-1" style={{ background: bg, color: fg }}>
        <p className="text-[10px] font-bold uppercase opacity-70">{label}</p>
        <p className="text-xs font-bold leading-tight" style={{ color: fg }}>Casa de Praia</p>
        <p className="text-[10px]" style={{ color: muted }}>(Janga)</p>
        <p className="text-base font-extrabold" style={{ color: priceColor }}>R$ 850.000</p>
      </div>
      <div className={`px-2 py-1 text-[10px] font-mono text-center ${ok ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-destructive/15 text-destructive"}`}>
        {ok ? "✓" : "✗"} {ratio.toFixed(2)}:1
      </div>
    </div>
  );
}
