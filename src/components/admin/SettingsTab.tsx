import { useState, useEffect } from "react";
import { SiteSettings } from "@/contexts/PropertyContext";
import { toast } from "sonner";
import { Globe, Mail, Palette, Type, MessageCircle, User, Timer, Plus, X, Tag, MapPin, Calendar, UserPlus, Search, Copy, Check } from "lucide-react";
// Usando SVG simples para ícones sociais que podem faltar no Lucide
const Instagram = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
const Facebook = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const Youtube = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.42 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.42-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
);
const Linkedin = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
  </svg>
);
import LogoUpload from "./LogoUpload";
import PriceTypographyPanel from "./PriceTypographyPanel";
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
  {
    title: "📣 Banner Marquee",
    description: "Configurações do banner rotativo que aparece no topo do site.",
    fields: [
      { 
        label: "Texto Personalizado (Opcional)", 
        key: "marqueeText", 
        icon: <MessageCircle className="h-4 w-4" />, 
        multiline: true, 
        placeholder: "Se deixado em branco, mostrará os títulos dos imóveis automaticamente. Use '|' para separar frases." 
      },
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

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const normalizeDomain = (raw: string) =>
    raw.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");

  const isValidDomain = (d: string) =>
    /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(d);

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      toast.success("Copiado!");
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const handleSave = async () => {
    const toSave = { ...localSettings } as any;
    const rawDomain = (toSave.customDomain || "").trim();
    if (rawDomain) {
      const normalized = normalizeDomain(rawDomain);
      if (!isValidDomain(normalized)) {
        toast.error("Domínio inválido. Use o formato: meusite.com.br");
        return;
      }
      toSave.customDomain = normalized;
      setLocalSettings(toSave);
    } else {
      toSave.customDomain = "";
    }
    await updateSettings(toSave);
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

      {/* Cabeçalho & Banner — dimensões editáveis */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm">📐 Cabeçalho & Banner</h3>
            <p className="text-xs text-muted-foreground">
              Ajuste o tamanho da logo, a altura da navbar e o espaçamento do banner amarelo. Em telas pequenas a logo escala automaticamente.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setLocalSettings((prev) => ({
                ...prev,
                logoWidthPx: 270,
                logoHeightPx: 140,
                navbarHeightPx: 100,
                marqueePaddingYPx: 4,
              }))
            }
            className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-md border border-border hover:bg-muted transition-colors"
          >
            ↺ Restaurar padrão
          </button>
        </div>

        {/* Presets rápidos */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Presets sugeridos</span>
          <div className="grid grid-cols-2 gap-2">
            {([
              { name: "🖥️ Desktop — Compacto", v: { logoWidthPx: 200, logoHeightPx: 100, navbarHeightPx: 80, marqueePaddingYPx: 2 } },
              { name: "🖥️ Desktop — Padrão",   v: { logoWidthPx: 270, logoHeightPx: 140, navbarHeightPx: 100, marqueePaddingYPx: 4 } },
              { name: "📱 Mobile — Compacto",  v: { logoWidthPx: 150, logoHeightPx: 78,  navbarHeightPx: 70,  marqueePaddingYPx: 2 } },
              { name: "📱 Mobile — Padrão",    v: { logoWidthPx: 180, logoHeightPx: 94,  navbarHeightPx: 80,  marqueePaddingYPx: 4 } },
            ] as const).map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setLocalSettings((prev) => ({ ...prev, ...p.v }))}
                className="text-xs font-medium px-2 py-1.5 rounded-md border border-border hover:bg-primary/10 hover:border-primary/30 transition-colors text-left"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Pré-visualização lado a lado (desktop + mobile) */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pré-visualização (desktop × mobile)</span>
          <div className="grid grid-cols-2 gap-3">
            {([
              { label: "🖥️ Desktop (1024px)", width: 1024, scale: 0.32 },
              { label: "📱 Mobile (375px)", width: 375, scale: 0.7 },
            ] as const).map((device) => {
              const navH = localSettings.navbarHeightPx;
              const logoW = Math.min(localSettings.logoWidthPx, device.width * 0.7);
              const logoH = Math.min(localSettings.logoHeightPx, Math.max(navH - 4, 20));
              return (
                <div key={device.label} className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">{device.label}</span>
                  <div
                    className="rounded-md border border-border bg-luxury-dark overflow-hidden mx-auto"
                    style={{ width: `${device.width * device.scale}px` }}
                  >
                    <div
                      className="flex items-center justify-center w-full bg-card/30"
                      style={{ height: `${navH * device.scale}px` }}
                    >
                      {localSettings.logoUrl ? (
                        <img
                          src={localSettings.logoUrl}
                          alt="preview"
                          style={{ width: `${logoW * device.scale}px`, height: `${logoH * device.scale}px` }}
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-accent font-serif font-bold uppercase" style={{ fontSize: `${10 * device.scale * 2}px` }}>
                          {localSettings.brandName}
                        </span>
                      )}
                    </div>
                    <div
                      className="w-full bg-accent/20 border-t border-accent/30 flex items-center justify-center"
                      style={{
                        paddingTop: `${localSettings.marqueePaddingYPx * device.scale}px`,
                        paddingBottom: `${localSettings.marqueePaddingYPx * device.scale}px`,
                      }}
                    >
                      <span className="font-bold uppercase tracking-[0.15em] text-accent-foreground truncate px-1" style={{ fontSize: `${9 * device.scale * 1.6}px` }}>
                        • CASA • COBERTURA • TERRENO
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Validação / avisos */}
        {(() => {
          const warnings: string[] = [];
          if (localSettings.logoWidthPx > 240) warnings.push("Largura da logo > 240px pode estourar em mobiles ≤ 360px (será reduzida automaticamente).");
          if (localSettings.logoHeightPx > localSettings.navbarHeightPx - 4) warnings.push("Altura da logo é maior que a navbar — a logo será cortada.");
          if (localSettings.navbarHeightPx > 140) warnings.push("Navbar > 140px ocupa muito espaço no mobile.");
          if (localSettings.marqueePaddingYPx > 16) warnings.push("Espessura do banner > 16px deixa o cabeçalho desproporcional no mobile.");
          if (warnings.length === 0) return null;
          return (
            <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 p-2 space-y-1">
              <p className="text-[11px] font-bold text-yellow-600 dark:text-yellow-400">⚠️ Atenção à responsividade</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {warnings.map((w) => (
                  <li key={w} className="text-[11px] text-yellow-700 dark:text-yellow-300">{w}</li>
                ))}
              </ul>
            </div>
          );
        })()}

        {([
          { key: "logoWidthPx" as const, label: "Largura da logo (px)", min: 80, max: 480, step: 5 },
          { key: "logoHeightPx" as const, label: "Altura da logo (px)", min: 40, max: 240, step: 5 },
          { key: "navbarHeightPx" as const, label: "Altura da navbar (px)", min: 60, max: 200, step: 2 },
          { key: "marqueePaddingYPx" as const, label: "Espessura do banner (px)", min: 0, max: 24, step: 1 },
        ]).map(({ key, label, min, max, step }) => {
          const value = Number((localSettings as any)[key] ?? 0);
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
                <span className="text-xs font-mono tabular-nums">{value}px</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => setLocalSettings((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                className="w-full accent-primary"
              />
            </div>
          );
        })}
      </div>

      {/* 💰 Tipografia & Formato do Preço */}
      <PriceTypographyPanel
        settings={localSettings}
        onChange={(patch) => setLocalSettings((prev) => ({ ...prev, ...patch }))}
      />




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

      {/* Domínio Próprio */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <div>
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-accent" /> Domínio Próprio
          </h3>
          <p className="text-xs text-muted-foreground">
            Conecte seu domínio personalizado (ex: meusite.com.br) ao site. Configure os registros DNS abaixo no painel do seu provedor (Registro.br, GoDaddy, Hostgator, Cloudflare, etc).
          </p>
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="h-4 w-4" /> Seu domínio
          </label>
          <input
            type="text"
            value={(localSettings as any).customDomain || ""}
            onChange={(e) => setLocalSettings((prev) => ({ ...prev, customDomain: e.target.value } as any))}
            placeholder="meusite.com.br"
            className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-[11px] text-muted-foreground mt-1">Informe sem http:// ou www.</p>
        </div>

        <div className="rounded-lg border border-border bg-background/50 p-3 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registros DNS necessários</p>

          {[
            { type: "A", name: "@", value: "185.158.133.1", ttl: "3600", desc: "Domínio raiz" },
            { type: "A", name: "www", value: "185.158.133.1", ttl: "3600", desc: "Subdomínio www" },
            { type: "TXT", name: "_lovable", value: "Token gerado no painel da Lovable", ttl: "3600", desc: "Verificação de propriedade" },
          ].map((rec) => (
            <div key={rec.type + rec.name} className="grid grid-cols-[60px_1fr_auto] gap-2 text-xs border-b border-border/60 last:border-0 pb-2 last:pb-0 items-start">
              <span className="font-bold text-primary">{rec.type}</span>
              <div className="space-y-0.5 min-w-0">
                <div><span className="text-muted-foreground">Nome:</span> <code className="font-mono">{rec.name}</code></div>
                <div><span className="text-muted-foreground">Valor:</span> <code className="font-mono break-all">{rec.value}</code></div>
                <div><span className="text-muted-foreground">TTL:</span> <code className="font-mono">{rec.ttl}</code></div>
                <div className="text-[10px] text-muted-foreground italic">{rec.desc}</div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(rec.type + rec.name, rec.value)}
                className="flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-background hover:bg-primary/5 hover:border-primary/40 transition-colors text-[11px] font-semibold"
                title={`Copiar valor do registro ${rec.type} ${rec.name}`}
              >
                {copiedKey === rec.type + rec.name ? (
                  <><Check className="h-3 w-3 text-primary" /> Copiado</>
                ) : (
                  <><Copy className="h-3 w-3" /> Copiar</>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-accent/5 border border-accent/20 p-3 space-y-2">
          <p className="text-xs font-bold text-accent">⚡ Como ativar</p>
          <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
            <li>Acesse o painel do seu provedor de domínio</li>
            <li>Adicione os registros DNS exibidos acima</li>
            <li>Aguarde a propagação (até 72h, normalmente alguns minutos)</li>
            <li>Conclua a ativação e o SSL será emitido automaticamente</li>
          </ol>
        </div>

        <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-border">
          <span className="text-sm font-medium flex items-center gap-2">
            🔒 Forçar HTTPS
          </span>
          <input
            type="checkbox"
            checked={(localSettings as any).forceHttps ?? true}
            onChange={(e) => setLocalSettings((prev) => ({ ...prev, forceHttps: e.target.checked } as any))}
            className="w-5 h-5 accent-primary rounded"
          />
        </label>
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
