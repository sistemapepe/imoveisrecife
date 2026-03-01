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
  }, [settings.primaryColor, settings.accentColor]);

  return null;
}
