import { useEffect } from "react";
import { useProperties } from "@/contexts/PropertyContext";

export default function DynamicTheme() {
  const { settings } = useProperties();

  useEffect(() => {
    const root = document.documentElement;
    if (settings.primaryColor) {
      root.style.setProperty("--primary", settings.primaryColor);
      root.style.setProperty("--ring", settings.primaryColor);
    }
    if (settings.accentColor) {
      root.style.setProperty("--accent", settings.accentColor);
      root.style.setProperty("--gold", settings.accentColor);
    }
    root.style.setProperty("--navbar-h", `${settings.navbarHeightPx ?? 100}px`);
    root.style.setProperty("--logo-w", `${settings.logoWidthPx ?? 270}px`);
    root.style.setProperty("--logo-h", `${settings.logoHeightPx ?? 140}px`);
    root.style.setProperty("--marquee-py", `${settings.marqueePaddingYPx ?? 4}px`);
  }, [
    settings.primaryColor,
    settings.accentColor,
    settings.navbarHeightPx,
    settings.logoWidthPx,
    settings.logoHeightPx,
    settings.marqueePaddingYPx,
  ]);

  return null;
}
