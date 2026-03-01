import { useState, useEffect } from "react";
import { SiteSettings } from "@/contexts/PropertyContext";
import { toast } from "sonner";
import { Globe, Instagram, Facebook, Youtube, Linkedin, Mail, Palette, Type, MessageCircle, User } from "lucide-react";

interface SettingsTabProps {
  settings: SiteSettings;
  updateSettings: (s: Partial<SiteSettings>) => Promise<void>;
}

interface FieldDef {
  label: string;
  key: keyof SiteSettings;
  icon?: React.ReactNode;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
}

interface SectionDef {
  title: string;
  description: string;
  fields: FieldDef[];
}

const sections: SectionDef[] = [
  {
    title: "🏷️ Marca",
    description: "Nome e identidade da marca exibidos no site",
    fields: [
      { label: "Nome da Marca", key: "brandName", icon: <Type className="h-4 w-4" />, placeholder: "JHR LUXURY" },
      { label: "Subtítulo / Slogan", key: "heroSubtitle", placeholder: "JHR LUXURY" },
      { label: "Título do Hero", key: "heroTitle", placeholder: "Encontre o imóvel dos seus sonhos" },
    ],
  },
  {
    title: "👤 Concierge",
    description: "Informações do concierge exibidas na página de contato",
    fields: [
      { label: "Nome", key: "conciergeNome", icon: <User className="h-4 w-4" /> },
      { label: "Cargo", key: "conciergeCargo" },
      { label: "Descrição", key: "conciergeDesc", multiline: true },
    ],
  },
  {
    title: "📱 Contato",
    description: "Canais de comunicação com clientes",
    fields: [
      { label: "WhatsApp (com DDI)", key: "whatsappNumber", icon: <MessageCircle className="h-4 w-4" />, placeholder: "5511999999999" },
      { label: "E-mail de contato", key: "emailContact", icon: <Mail className="h-4 w-4" />, type: "email", placeholder: "contato@jhr.com" },
    ],
  },
  {
    title: "🌐 Redes Sociais",
    description: "Links das redes sociais (deixe vazio para ocultar)",
    fields: [
      { label: "Instagram", key: "instagramUrl", icon: <Instagram className="h-4 w-4" />, placeholder: "https://instagram.com/..." },
      { label: "Facebook", key: "facebookUrl", icon: <Facebook className="h-4 w-4" />, placeholder: "https://facebook.com/..." },
      { label: "YouTube", key: "youtubeUrl", icon: <Youtube className="h-4 w-4" />, placeholder: "https://youtube.com/..." },
      { label: "LinkedIn", key: "linkedinUrl", icon: <Linkedin className="h-4 w-4" />, placeholder: "https://linkedin.com/..." },
      { label: "Website", key: "websiteUrl", icon: <Globe className="h-4 w-4" />, placeholder: "https://www.jhr.com" },
    ],
  },
  {
    title: "📝 Rodapé",
    description: "Texto exibido no rodapé do site",
    fields: [
      { label: "Texto do rodapé", key: "footerText", multiline: true, placeholder: "© 2024 JHR Imóveis..." },
    ],
  },
  {
    title: "🎨 Cores",
    description: "Cores principais do site (formato HSL: ex: 195 85% 45%)",
    fields: [
      { label: "Cor Primária (HSL)", key: "primaryColor", icon: <Palette className="h-4 w-4" />, placeholder: "195 85% 45%" },
      { label: "Cor de Destaque (HSL)", key: "accentColor", icon: <Palette className="h-4 w-4" />, placeholder: "42 56% 55%" },
    ],
  },
];

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
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Configurações do Site</h2>

      {sections.map((section) => (
        <div key={section.title} className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div>
            <h3 className="font-bold text-sm">{section.title}</h3>
            <p className="text-xs text-muted-foreground">{section.description}</p>
          </div>

          {section.fields.map(({ label, key, icon, type, placeholder, multiline }) => (
            <div key={key}>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                {icon} {label}
              </label>
              {multiline ? (
                <textarea
                  value={(localSettings as any)[key] || ""}
                  onChange={(e) => setLocalSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type={type || "text"}
                    value={(localSettings as any)[key] || ""}
                    onChange={(e) => setLocalSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {key === "primaryColor" || key === "accentColor" ? (
                    <div
                      className="mt-1 w-8 h-8 rounded-lg border border-border shrink-0"
                      style={{ backgroundColor: `hsl(${(localSettings as any)[key]})` }}
                    />
                  ) : null}
                </div>
              )}
            </div>
          ))}
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
