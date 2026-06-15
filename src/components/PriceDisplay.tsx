import { CSSProperties } from "react";
import { useProperties, formatPriceWith, PriceSection } from "@/contexts/PropertyContext";

interface PriceDisplayProps {
  value: number;
  section: PriceSection;
  className?: string;
  /** Override style (e.g., line-through for previous price) */
  styleOverride?: CSSProperties;
  /** Force a specific style (used by admin preview) */
  forceStyle?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string | number;
    color?: string;
  };
  /** Force a specific format (used by admin preview) */
  forceFormat?: Parameters<typeof formatPriceWith>[1];
  as?: "span" | "p" | "div";
}

/**
 * Renders a property price using the admin-configured typography & format
 * for the given section (card / detail / banner / simulator).
 * Inline styles override Tailwind so admin settings win at runtime.
 */
export function PriceDisplay({
  value,
  section,
  className,
  styleOverride,
  forceStyle,
  forceFormat,
  as = "span",
}: PriceDisplayProps) {
  const { settings } = useProperties();
  const style = forceStyle ?? settings.priceStyles?.[section];
  const fmt = forceFormat ?? settings.priceFormat;
  const Tag = as as any;

  // Fallback automático: usa --price-color (auto-calculado por contraste em DynamicTheme)
  // quando o admin não definir cor ou deixar em branco.
  const color = style?.color?.trim() ? style.color : "hsl(var(--price-color))";

  const inline: CSSProperties = {
    fontFamily: style?.fontFamily,
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style?.fontWeight as any,
    color,
    ...styleOverride,
  };

  return <Tag className={className} style={inline}>{formatPriceWith(value, fmt)}</Tag>;
}
