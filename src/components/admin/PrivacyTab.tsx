import { useState, useEffect } from "react";
import { SiteSettings } from "@/contexts/PropertyContext";
import { toast } from "sonner";
import { FileText } from "lucide-react";

interface PrivacyTabProps {
  settings: SiteSettings;
  updateSettings: (s: Partial<SiteSettings>) => Promise<void>;
}

export default function PrivacyTab({ settings, updateSettings }: PrivacyTabProps) {
  const [content, setContent] = useState(settings.privacyPolicy || "");

  useEffect(() => {
    setContent(settings.privacyPolicy || "");
  }, [settings.privacyPolicy]);

  const handleSave = async () => {
    await updateSettings({ privacyPolicy: content });
    toast.success("Política de privacidade salva!");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <FileText className="h-5 w-5" /> Política de Privacidade
      </h2>
      <p className="text-xs text-muted-foreground">
        Edite o texto da política de privacidade. Use ## para títulos, ### para subtítulos e - para listas.
      </p>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={20}
        placeholder="## Política de Privacidade&#10;&#10;Texto da sua política aqui..."
        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y min-h-[300px]"
      />
      <button
        onClick={handleSave}
        className="w-full py-3 rounded-xl gold-gradient text-accent-foreground font-bold uppercase tracking-wider text-sm"
      >
        Salvar Política de Privacidade
      </button>
    </div>
  );
}
