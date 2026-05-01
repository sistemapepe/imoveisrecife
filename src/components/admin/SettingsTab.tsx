import { useState, useEffect } from "react";
import { SiteSettings } from "@/contexts/PropertyContext";
import { toast } from "sonner";
import { Globe, Instagram, Facebook, Youtube, Linkedin, Mail, Palette, Type, MessageCircle, User, Timer, Plus, X, Tag, MapPin, Calendar, UserPlus, Search } from "lucide-react";
import LogoUpload from "./LogoUpload";
import { getAmenityIcon } from "@/lib/amenity-icons";

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
      { label: "Mensagem padrão do WhatsApp", key: "whatsappMessage", icon: <MessageCircle className="h-4 w-4" />, multiline: true, placeholder: "Olá! Gostaria de mais informações..." },
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
    title: "💻 Desenvolvedor",
    description: "Créditos do desenvolvedor exibidos no rodapé",
    fields: [
      { label: "Nome do Desenvolvedor", key: "developerName", placeholder: "Studio Digital" },
      { label: "Link do Desenvolvedor", key: "developerUrl", icon: <Globe className="h-4 w-4" />, placeholder: "https://studiodigital.com" },
    ],
  },
  {
    title: "🔎 SEO / Buscadores",
    description: "Tokens de verificação para Google Search Console e Bing Webmaster Tools. Cole APENAS o valor do atributo content da meta tag fornecida pelo Google/Bing (ex: 'abc123XYZ...'), não a tag inteira.",
    fields: [
      { label: "Google Search Console (token)", key: "googleSiteVerification", icon: <Search className="h-4 w-4" />, placeholder: "abc123XYZ_seu_token..." },
      { label: "Bing Webmaster (token)", key: "bingSiteVerification", icon: <Search className="h-4 w-4" />, placeholder: "ABCDEF1234567890..." },
    ],
  },
];

function hslToHex(hslStr: string): string {
  const parts = hslStr.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return "#0099cc";
  const h = parseFloat(parts[0]), s = parseFloat(parts[1]) / 100, l = parseFloat(parts[2]) / 100;
  const a2 = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a2 * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): string {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const presetColors = [
  { label: "Azul Petróleo", hsl: "195 85% 45%" },
  { label: "Dourado", hsl: "42 56% 55%" },
  { label: "Esmeralda", hsl: "160 84% 39%" },
  { label: "Borgonha", hsl: "345 80% 30%" },
  { label: "Azul Marinho", hsl: "220 60% 25%" },
  { label: "Preto Elegante", hsl: "0 0% 10%" },
  { label: "Rose Gold", hsl: "10 50% 60%" },
  { label: "Púrpura", hsl: "270 50% 40%" },
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

          {section.title.includes("Marca") && (
            <LogoUpload
              logoUrl={localSettings.logoUrl}
              onChange={(url) => setLocalSettings((prev) => ({ ...prev, logoUrl: url }))}
            />
          )}

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
                <input
                  type={type || "text"}
                  value={(localSettings as any)[key] || ""}
                  onChange={(e) => setLocalSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Color Picker Section */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <div>
          <h3 className="font-bold text-sm">🎨 Cores</h3>
          <p className="text-xs text-muted-foreground">Escolha as cores do site visualmente</p>
        </div>

        {([
          { label: "Cor Primária", key: "primaryColor" as keyof SiteSettings },
          { label: "Cor de Destaque", key: "accentColor" as keyof SiteSettings },
        ]).map(({ label, key }) => (
          <div key={key} className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="h-4 w-4" /> {label}
            </label>
            <div className="flex items-center gap-3">
              <label className="relative cursor-pointer">
                <input
                  type="color"
                  value={hslToHex((localSettings as any)[key] || "")}
                  onChange={(e) => {
                    const hsl = hexToHsl(e.target.value);
                    setLocalSettings((prev) => ({ ...prev, [key]: hsl }));
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div
                  className="w-10 h-10 rounded-xl border-2 border-border shadow-sm"
                  style={{ backgroundColor: `hsl(${(localSettings as any)[key]})` }}
                />
              </label>
              <input
                type="text"
                value={(localSettings as any)[key] || ""}
                onChange={(e) => setLocalSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder="195 85% 45%"
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presetColors.map((preset) => (
                <button
                  key={preset.hsl}
                  type="button"
                  title={preset.label}
                  onClick={() => setLocalSettings((prev) => ({ ...prev, [key]: preset.hsl }))}
                  className="w-7 h-7 rounded-lg border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: `hsl(${preset.hsl})` }}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-2 rounded-lg border border-border p-3">
          <div className="flex-1 h-8 rounded-md" style={{ backgroundColor: `hsl(${localSettings.primaryColor})` }} />
          <div className="flex-1 h-8 rounded-md" style={{ backgroundColor: `hsl(${localSettings.accentColor})` }} />
        </div>
        <p className="text-[10px] text-muted-foreground text-center">Pré-visualização: Primária + Destaque</p>
      </div>

      {/* Amenities Management */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div>
          <h3 className="font-bold text-sm">🏷️ Amenidades</h3>
          <p className="text-xs text-muted-foreground">Gerencie as amenidades disponíveis para os imóveis</p>
        </div>
         <div className="flex flex-wrap gap-2">
          {(localSettings.availableAmenities || []).map((amenity) => {
            const AmenityIcon = getAmenityIcon(amenity);
            return (
              <span
                key={amenity}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
              >
                {AmenityIcon ? <AmenityIcon className="h-3 w-3" /> : <Tag className="h-3 w-3" />}
                {amenity}
                <button
                  type="button"
                  onClick={() =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      availableAmenities: prev.availableAmenities.filter((a) => a !== amenity),
                    }))
                  }
                  className="ml-0.5 hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nova amenidade..."
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const val = (e.target as HTMLInputElement).value.trim();
                if (val && !(localSettings.availableAmenities || []).includes(val)) {
                  setLocalSettings((prev) => ({
                    ...prev,
                    availableAmenities: [...(prev.availableAmenities || []), val],
                  }));
                  (e.target as HTMLInputElement).value = "";
                }
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const input = document.querySelector<HTMLInputElement>('input[placeholder="Nova amenidade..."]');
              if (input) {
                const val = input.value.trim();
                if (val && !(localSettings.availableAmenities || []).includes(val)) {
                  setLocalSettings((prev) => ({
                    ...prev,
                    availableAmenities: [...(prev.availableAmenities || []), val],
                  }));
                  input.value = "";
                }
              }
            }}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </div>
      </div>

      {/* Layout Options */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div>
          <h3 className="font-bold text-sm">📐 Layout do Cabeçalho</h3>
          <p className="text-xs text-muted-foreground">Escolha o estilo visual do menu superior</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setLocalSettings(prev => ({ ...prev, headerStyle: 'normal' }))}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
              localSettings.headerStyle !== 'compact' 
                ? 'border-primary bg-primary/5 text-primary' 
                : 'border-border bg-background text-muted-foreground hover:border-primary/50'
            }`}
          >
            <div className="w-full h-8 bg-current/10 rounded-md flex items-center justify-center font-bold text-[10px]">NORMAL</div>
            <span className="text-xs font-bold uppercase tracking-wider">Padrão</span>
          </button>
          <button
            type="button"
            onClick={() => setLocalSettings(prev => ({ ...prev, headerStyle: 'compact' }))}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
              localSettings.headerStyle === 'compact' 
                ? 'border-primary bg-primary/5 text-primary' 
                : 'border-border bg-background text-muted-foreground hover:border-primary/50'
            }`}
          >
            <div className="w-full h-5 bg-current/10 rounded-md flex items-center justify-center font-bold text-[10px]">COMPACTO</div>
            <span className="text-xs font-bold uppercase tracking-wider">Reduzido</span>
          </button>
        </div>
      </div>

      {/* Display Options */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div>
          <h3 className="font-bold text-sm">📍 Exibição</h3>
          <p className="text-xs text-muted-foreground">Controle o que aparece nos cards de imóveis</p>
        </div>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" /> Exibir localização nos cards
          </span>
          <input
            type="checkbox"
            checked={localSettings.showLocationOnCard ?? false}
            onChange={(e) => setLocalSettings((prev) => ({ ...prev, showLocationOnCard: e.target.checked }))}
            className="w-5 h-5 accent-primary rounded"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-accent" /> Exibir formulário de Agendar Visita
          </span>
          <input
            type="checkbox"
            checked={localSettings.showVisitSchedule ?? true}
            onChange={(e) => setLocalSettings((prev) => ({ ...prev, showVisitSchedule: e.target.checked }))}
            className="w-5 h-5 accent-primary rounded"
          />
        </label>
      </div>

      {/* Banner Interval */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div>
          <h3 className="font-bold text-sm">⏱️ Banner</h3>
          <p className="text-xs text-muted-foreground">Tempo de transição entre slides do banner principal</p>
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Timer className="h-4 w-4" /> Intervalo (segundos)
          </label>
          <div className="flex items-center gap-3 mt-1">
            <input
              type="range"
              min={2}
              max={15}
              step={1}
              value={localSettings.bannerInterval || 5}
              onChange={(e) => setLocalSettings((prev) => ({ ...prev, bannerInterval: Number(e.target.value) }))}
              className="flex-1 accent-primary"
            />
            <span className="text-sm font-bold w-8 text-center">{localSettings.bannerInterval || 5}s</span>
          </div>
        </div>
      </div>

      {/* Lead Capture Modal */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div>
          <h3 className="font-bold text-sm flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-accent" /> Modal de Captura de Lead
          </h3>
          <p className="text-xs text-muted-foreground">Personalize o modal exibido antes de abrir o WhatsApp (FAB, cards e detalhes do imóvel)</p>
        </div>

        <label className="flex items-center justify-between cursor-pointer pb-2 border-b border-border">
          <span className="text-sm font-medium">Ativar modal de captura</span>
          <input
            type="checkbox"
            checked={localSettings.leadModalEnabled ?? true}
            onChange={(e) => setLocalSettings((prev) => ({ ...prev, leadModalEnabled: e.target.checked }))}
            className="w-5 h-5 accent-primary rounded"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer pb-2 border-b border-border">
          <span className="text-sm font-medium">Mostrar link "Prefiro não informar"</span>
          <input
            type="checkbox"
            checked={localSettings.leadModalShowSkip ?? true}
            onChange={(e) => setLocalSettings((prev) => ({ ...prev, leadModalShowSkip: e.target.checked }))}
            className="w-5 h-5 accent-primary rounded"
          />
        </label>

        {([
          { label: "Título do modal", key: "leadModalTitle" as keyof SiteSettings, placeholder: "Antes de continuar" },
          { label: "Descrição / texto explicativo", key: "leadModalDescription" as keyof SiteSettings, placeholder: "Deixe seu contato...", multiline: true },
          { label: "Label do campo Nome", key: "leadModalNameLabel" as keyof SiteSettings, placeholder: "Seu nome" },
          { label: "Placeholder do Nome", key: "leadModalNamePlaceholder" as keyof SiteSettings, placeholder: "Como podemos te chamar?" },
          { label: "Label do campo Telefone", key: "leadModalPhoneLabel" as keyof SiteSettings, placeholder: "Telefone / WhatsApp" },
          { label: "Placeholder do Telefone", key: "leadModalPhonePlaceholder" as keyof SiteSettings, placeholder: "(81) 99999-9999" },
          { label: "Texto do botão de envio", key: "leadModalSubmitText" as keyof SiteSettings, placeholder: "Continuar para o WhatsApp" },
          { label: "Texto durante envio", key: "leadModalSubmittingText" as keyof SiteSettings, placeholder: "Conectando..." },
          { label: "Texto do link 'pular'", key: "leadModalSkipText" as keyof SiteSettings, placeholder: "Prefiro não informar agora" },
        ] as { label: string; key: keyof SiteSettings; placeholder: string; multiline?: boolean }[]).map(({ label, key, placeholder, multiline }) => (
          <div key={key}>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {label}
            </label>
            {multiline ? (
              <textarea
                value={(localSettings as any)[key] ?? ""}
                onChange={(e) => setLocalSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                rows={3}
                maxLength={500}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <input
                type="text"
                value={(localSettings as any)[key] ?? ""}
                onChange={(e) => setLocalSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                maxLength={150}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 rounded-xl gold-gradient text-accent-foreground font-bold uppercase tracking-wider text-sm"
      >
        Salvar Configurações
      </button>
    </div>
  );
}
