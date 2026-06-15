import { useState } from "react";
import {
  SiteSettings,
  PriceSection,
  PriceStyle,
  PriceFormat,
  DEFAULT_PRICE_STYLES,
  DEFAULT_PRICE_FORMAT,
  formatPriceWith,
} from "@/contexts/PropertyContext";

interface Props {
  settings: SiteSettings;
  onChange: (patch: Partial<SiteSettings>) => void;
}

const FONT_OPTIONS = [
  "Manrope",
  "Inter",
  "Playfair Display",
  "Georgia, serif",
  "Arial, sans-serif",
  "Roboto",
  "Poppins",
  "Montserrat",
];

const WEIGHT_OPTIONS = ["400", "500", "600", "700", "800", "900"];

const SECTION_LABELS: Record<PriceSection, string> = {
  card: "🪟 Card de Imóvel",
  detail: "📄 Página de Detalhes",
  banner: "🎬 Banner Hero",
  simulator: "💸 Simulador Financiamento",
};

const SAMPLE_PRICE = 1850000;

export default function PriceTypographyPanel({ settings, onChange }: Props) {
  const [active, setActive] = useState<PriceSection>("card");

  const styles = settings.priceStyles ?? DEFAULT_PRICE_STYLES;
  const format = settings.priceFormat ?? DEFAULT_PRICE_FORMAT;
  const cur = styles[active];

  const updateStyle = (patch: Partial<PriceStyle>) => {
    onChange({ priceStyles: { ...styles, [active]: { ...cur, ...patch } } });
  };
  const updateFormat = (patch: Partial<PriceFormat>) => {
    onChange({ priceFormat: { ...format, ...patch } });
  };
  const restoreDefaults = () => {
    onChange({ priceStyles: DEFAULT_PRICE_STYLES, priceFormat: DEFAULT_PRICE_FORMAT });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-sm">💰 Tipografia & Formato do Preço</h3>
          <p className="text-xs text-muted-foreground">
            Fonte, tamanho, peso, cor e formato exibidos em cada seção do site. Pré-visualização ao vivo abaixo.
          </p>
        </div>
        <button
          type="button"
          onClick={restoreDefaults}
          className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-md border border-border hover:bg-muted transition-colors"
        >
          ↺ Restaurar padrão
        </button>
      </div>

      {/* Seletor de seção */}
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(SECTION_LABELS) as PriceSection[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActive(s)}
            className={`text-xs font-medium px-2 py-1.5 rounded-md border transition-colors text-left ${
              active === s
                ? "bg-primary/15 border-primary/50"
                : "border-border hover:bg-muted"
            }`}
          >
            {SECTION_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Controles do estilo */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fonte</label>
          <select
            value={cur.fontFamily}
            onChange={(e) => updateStyle({ fontFamily: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tamanho</label>
              <span className="text-xs font-mono">{cur.fontSize}px</span>
            </div>
            <input
              type="range"
              min={10}
              max={72}
              step={1}
              value={cur.fontSize}
              onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Peso</label>
            <select
              value={cur.fontWeight}
              onChange={(e) => updateStyle({ fontWeight: e.target.value })}
              className="w-full mt-1 px-2 py-2 rounded-lg border border-border bg-background text-sm"
            >
              {WEIGHT_OPTIONS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cor</label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={hexFromColor(cur.color)}
              onChange={(e) => updateStyle({ color: e.target.value })}
              className="h-9 w-12 rounded border border-border bg-background cursor-pointer"
            />
            <input
              type="text"
              value={cur.color}
              onChange={(e) => updateStyle({ color: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono"
              placeholder="hsl(var(--accent)) ou #d4af37"
            />
          </div>
        </div>
      </div>

      {/* Formato */}
      <div className="space-y-3 pt-3 border-t border-border">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Formato dos Valores</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prefixo</label>
            <input
              type="text"
              value={format.prefix}
              onChange={(e) => updateFormat({ prefix: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 rounded border border-border bg-background text-sm"
              placeholder="R$ "
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sufixo</label>
            <input
              type="text"
              value={format.suffix}
              onChange={(e) => updateFormat({ suffix: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 rounded border border-border bg-background text-sm"
              placeholder=""
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Casas decimais</label>
            <input
              type="number"
              min={0}
              max={4}
              value={format.decimals}
              onChange={(e) => updateFormat({ decimals: Math.max(0, Math.min(4, Number(e.target.value) || 0)) })}
              className="w-full mt-1 px-2 py-1.5 rounded border border-border bg-background text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Milhar</label>
              <input
                type="text"
                maxLength={1}
                value={format.thousandsSeparator}
                onChange={(e) => updateFormat({ thousandsSeparator: e.target.value })}
                className="w-full mt-1 px-2 py-1.5 rounded border border-border bg-background text-sm text-center font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Decimal</label>
              <input
                type="text"
                maxLength={1}
                value={format.decimalSeparator}
                onChange={(e) => updateFormat({ decimalSeparator: e.target.value })}
                className="w-full mt-1 px-2 py-1.5 rounded border border-border bg-background text-sm text-center font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pré-visualização */}
      <div className="space-y-2 pt-3 border-t border-border">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Pré-visualização (desktop × mobile) — seção: {SECTION_LABELS[active]}
        </span>
        <div className="grid grid-cols-2 gap-3">
          {([
            { label: "🖥️ Desktop", scale: 1 },
            { label: "📱 Mobile", scale: 0.75 },
          ] as const).map((dev) => (
            <div key={dev.label} className="rounded-md border border-border bg-luxury-dark p-4 flex flex-col items-center justify-center min-h-[100px] gap-1">
              <span className="text-[10px] text-muted-foreground">{dev.label}</span>
              <span
                style={{
                  fontFamily: cur.fontFamily,
                  fontSize: `${cur.fontSize * dev.scale}px`,
                  fontWeight: cur.fontWeight,
                  color: cur.color,
                  lineHeight: 1.1,
                }}
              >
                {formatPriceWith(SAMPLE_PRICE, format)}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center">Valor exemplo: R$ 1.850.000</p>
      </div>
    </div>
  );
}

// Best-effort: extract a #rrggbb for the native color picker.
// CSS vars / hsl(...) are kept as-is in the text input.
function hexFromColor(c: string): string {
  if (!c) return "#d4af37";
  if (c.startsWith("#")) return c.length === 7 ? c : "#d4af37";
  return "#d4af37";
}
