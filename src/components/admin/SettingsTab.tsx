import { useState, useEffect } from "react";
import { SiteSettings } from "@/contexts/PropertyContext";
import { toast } from "sonner";

interface SettingsTabProps {
  settings: SiteSettings;
  updateSettings: (s: Partial<SiteSettings>) => Promise<void>;
}

const fields = [
  { label: "Título do Hero", key: "heroTitle" },
  { label: "Subtítulo (Marca)", key: "heroSubtitle" },
  { label: "Nome do Concierge", key: "conciergeNome" },
  { label: "Cargo do Concierge", key: "conciergeCargo" },
  { label: "Descrição do Concierge", key: "conciergeDesc" },
  { label: "WhatsApp (com DDI)", key: "whatsappNumber" },
] as const;

export default function SettingsTab({ settings, updateSettings }: SettingsTabProps) {
  const [localSettings, setLocalSettings] = useState<SiteSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    await updateSettings(localSettings);
    toast.success("Configurações salvas!");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Configurações do Site</h2>
      {fields.map(({ label, key }) => (
        <div key={key}>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
          <input
            type="text"
            value={(localSettings as any)[key] || ""}
            onChange={(e) => setLocalSettings((prev) => ({ ...prev, [key]: e.target.value }))}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      ))}
      <button
        onClick={handleSave}
        className="w-full py-3 rounded-xl gold-gradient text-accent-foreground font-bold uppercase tracking-wider text-sm"
      >
        Salvar Configurações
      </button>
    </div>
  );
}
