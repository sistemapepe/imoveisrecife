import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";

export type PropertyStatus = "disponivel" | "reservado" | "vendido";

export interface Property {
  id: string;
  code: string;
  title: string;
  address: string;
  neighborhood: string;
  city: string;
  price: number;
  area: number;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parking: number;
  type: string;
  description: string;
  amenities: string[];
  images: string[];
  exclusive: boolean;
  featured: boolean;
  category: string;
  status: PropertyStatus;
  video_tour_url?: string;
  previous_price?: number;
}

export type PriceSection = "card" | "detail" | "banner" | "simulator";

export interface PriceStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
}

export interface PriceFormat {
  prefix: string;
  suffix: string;
  decimals: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

export interface SiteSettings {
  id?: string;
  heroTitle: string;
  heroSubtitle: string;
  conciergeNome: string;
  conciergeCargo: string;
  conciergeDesc: string;
  whatsappNumber: string;
  brandName: string;
  logoUrl: string;
  footerText: string;
  creci: string;
  creciUf: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  emailContact: string;
  primaryColor: string;
  accentColor: string;
  bannerInterval: number;
  whatsappMessage: string;
  availableAmenities: string[];
  privacyPolicy: string;
  showLocationOnCard: boolean;
  developerName: string;
  developerUrl: string;
  showVisitSchedule: boolean;
  leadModalEnabled: boolean;
  leadModalShowSkip: boolean;
  leadModalTitle: string;
  leadModalDescription: string;
  leadModalNameLabel: string;
  leadModalNamePlaceholder: string;
  leadModalPhoneLabel: string;
  leadModalPhonePlaceholder: string;
  leadModalSubmitText: string;
  leadModalSubmittingText: string;
  leadModalSkipText: string;
  googleSiteVerification: string;
  bingSiteVerification: string;
  headerStyle?: 'normal' | 'compact';
  marqueeText?: string;
  imagesAccessMode?: 'public' | 'signed';
  navbarHeightPx: number;
  logoWidthPx: number;
  logoHeightPx: number;
  marqueePaddingYPx: number;
  watermarkEnabled: boolean;
  watermarkOpacity: number;
  watermarkSizePct: number;
  watermarkPosition: 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  priceStyles: Record<PriceSection, PriceStyle>;
  priceFormat: PriceFormat;
}

export const DEFAULT_PRICE_STYLES: Record<PriceSection, PriceStyle> = {
  card:      { fontFamily: "Manrope", fontSize: 18, fontWeight: "800", color: "hsl(var(--price-color))" },
  detail:    { fontFamily: "Manrope", fontSize: 32, fontWeight: "800", color: "hsl(var(--price-color))" },
  banner:    { fontFamily: "Manrope", fontSize: 20, fontWeight: "700", color: "hsl(var(--price-color-dark))" },
  simulator: { fontFamily: "Manrope", fontSize: 24, fontWeight: "800", color: "hsl(var(--price-color))" },
};

export const DEFAULT_PRICE_FORMAT: PriceFormat = {
  prefix: "R$ ",
  suffix: "",
  decimals: 0,
  thousandsSeparator: ".",
  decimalSeparator: ",",
};

interface PropertyContextType {
  properties: Property[];
  settings: SiteSettings;
  loading: boolean;
  addProperty: (p: Omit<Property, "id" | "code">) => Promise<void>;
  updateProperty: (id: string, p: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  updateSettings: (s: Partial<SiteSettings>) => Promise<void>;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  refreshProperties: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  heroTitle: "Encontre o imóvel dos seus sonhos",
  heroSubtitle: "JHR LUXURY",
  conciergeNome: "Ricardo Almeida",
  conciergeCargo: "Concierge de Luxo",
  conciergeDesc: "Especialista em propriedades exclusivas. Estou pronto para encontrar o seu próximo investimento.",
  whatsappNumber: "5511999999999",
  brandName: "JHR LUXURY",
  logoUrl: "",
  footerText: "© 2024 JHR Imóveis de Luxo. Todos os direitos reservados.",
  creci: "",
  creciUf: "",
  instagramUrl: "",
  facebookUrl: "",
  youtubeUrl: "",
  linkedinUrl: "",
  websiteUrl: "",
  emailContact: "",
  primaryColor: "195 85% 45%",
  accentColor: "42 56% 55%",
  bannerInterval: 5,
  whatsappMessage: "Olá! Gostaria de mais informações sobre os imóveis da JHR.",
  availableAmenities: ["Piscina", "Churrasqueira", "Academia", "Sauna", "Jardim", "Elevador", "Varanda Gourmet", "Playground", "Salão de Festas", "Segurança 24h", "Quadra Esportiva", "Spa", "Home Cinema", "Adega", "Lavabo"],
  privacyPolicy: "",
  showLocationOnCard: false,
  developerName: "",
  developerUrl: "",
  showVisitSchedule: true,
  leadModalEnabled: true,
  leadModalShowSkip: true,
  leadModalTitle: "Antes de continuar",
  leadModalDescription: "Deixe seu contato para o corretor te chamar de volta caso o WhatsApp não responda.",
  leadModalNameLabel: "Seu nome",
  leadModalNamePlaceholder: "Como podemos te chamar?",
  leadModalPhoneLabel: "Telefone / WhatsApp",
  leadModalPhonePlaceholder: "(81) 99999-9999",
  leadModalSubmitText: "Continuar para o WhatsApp",
  leadModalSubmittingText: "Conectando...",
  leadModalSkipText: "Prefiro não informar agora",
  googleSiteVerification: "",
  bingSiteVerification: "",
  headerStyle: 'normal',
  marqueeText: "",
  imagesAccessMode: 'public',
  navbarHeightPx: 100,
  logoWidthPx: 270,
  logoHeightPx: 140,
  marqueePaddingYPx: 4,
  watermarkEnabled: true,
  watermarkOpacity: 40,
  watermarkSizePct: 30,
  watermarkPosition: 'center',
  priceStyles: DEFAULT_PRICE_STYLES,
  priceFormat: DEFAULT_PRICE_FORMAT,
};

const localImages = [property1, property2, property3, property4];

export const PropertyContext = createContext<PropertyContextType | null>(null);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProperties = useCallback(async () => {
    const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
    if (data && !error) {
      setProperties(data.map((p: any, i: number) => ({
        ...p,
        status: (p.status || "disponivel") as PropertyStatus,
        images: p.images.length > 0 ? p.images : [localImages[i % localImages.length]],
      })));
    }
    setLoading(false);
  }, []);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("*").limit(1).single();
    if (data) {
      setSettings((prev) => ({
        ...prev,
        id: data.id,
        heroTitle: data.hero_title,
        heroSubtitle: data.hero_subtitle,
        conciergeNome: data.concierge_nome,
        conciergeCargo: data.concierge_cargo,
        conciergeDesc: data.concierge_desc,
        brandName: data.brand_name,
        logoUrl: data.logo_url,
        footerText: data.footer_text,
        creci: (data as any).creci ?? "",
        creciUf: (data as any).creci_uf ?? "",
        instagramUrl: data.instagram_url,
        facebookUrl: data.facebook_url,
        youtubeUrl: data.youtube_url,
        linkedinUrl: data.linkedin_url,
        websiteUrl: data.website_url,
        primaryColor: data.primary_color,
        accentColor: data.accent_color,
        bannerInterval: (data as any).banner_interval ?? 5,
        whatsappMessage: (data as any).whatsapp_message ?? defaultSettings.whatsappMessage,
        availableAmenities: (data as any).available_amenities ?? defaultSettings.availableAmenities,
        privacyPolicy: (data as any).privacy_policy ?? "",
        showLocationOnCard: (data as any).show_location_on_card ?? true,
        developerName: (data as any).developer_name ?? "",
        developerUrl: (data as any).developer_url ?? "",
        showVisitSchedule: (data as any).show_visit_schedule ?? true,
        leadModalEnabled: (data as any).lead_modal_enabled ?? true,
        leadModalShowSkip: (data as any).lead_modal_show_skip ?? true,
        leadModalTitle: (data as any).lead_modal_title ?? defaultSettings.leadModalTitle,
        leadModalDescription: (data as any).lead_modal_description ?? defaultSettings.leadModalDescription,
        leadModalNameLabel: (data as any).lead_modal_name_label ?? defaultSettings.leadModalNameLabel,
        leadModalNamePlaceholder: (data as any).lead_modal_name_placeholder ?? defaultSettings.leadModalNamePlaceholder,
        leadModalPhoneLabel: (data as any).lead_modal_phone_label ?? defaultSettings.leadModalPhoneLabel,
        leadModalPhonePlaceholder: (data as any).lead_modal_phone_placeholder ?? defaultSettings.leadModalPhonePlaceholder,
        leadModalSubmitText: (data as any).lead_modal_submit_text ?? defaultSettings.leadModalSubmitText,
        leadModalSubmittingText: (data as any).lead_modal_submitting_text ?? defaultSettings.leadModalSubmittingText,
        leadModalSkipText: (data as any).lead_modal_skip_text ?? defaultSettings.leadModalSkipText,
        googleSiteVerification: (data as any).google_site_verification ?? "",
        bingSiteVerification: (data as any).bing_site_verification ?? "",
        headerStyle: (data as any).header_style ?? 'normal',
        marqueeText: (data as any).marquee_text ?? "",
        imagesAccessMode: ((data as any).images_access_mode ?? 'public') as 'public' | 'signed',
        navbarHeightPx: (data as any).navbar_height_px ?? 100,
        logoWidthPx: (data as any).logo_width_px ?? 270,
        logoHeightPx: (data as any).logo_height_px ?? 140,
        marqueePaddingYPx: (data as any).marquee_padding_y_px ?? 4,
        watermarkOpacity: (data as any).watermark_opacity ?? 40,
        watermarkPosition: ((data as any).watermark_position ?? 'center') as any,
        priceStyles: { ...DEFAULT_PRICE_STYLES, ...((data as any).price_styles ?? {}) },
        priceFormat: { ...DEFAULT_PRICE_FORMAT, ...((data as any).price_format ?? {}) },
      }));
    }
  }, []);

  const fetchContactInfo = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-contact-info");
      if (!error && data) {
        setSettings((prev) => ({
          ...prev,
          whatsappNumber: data.whatsapp_number ?? prev.whatsappNumber,
          emailContact: data.email_contact ?? prev.emailContact,
        }));
      }
    } catch (e) {
      console.error("Failed to fetch contact info", e);
    }
  }, []);

  const fetchFavorites = useCallback(async () => {
    if (!user) { setFavorites([]); return; }
    const { data } = await supabase.from("favorites").select("property_id").eq("user_id", user.id);
    if (data) setFavorites(data.map((f) => f.property_id));
  }, [user]);

  useEffect(() => {
    fetchProperties();
    fetchSettings();
    fetchContactInfo();
  }, [fetchProperties, fetchSettings, fetchContactInfo]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addProperty = async (p: Omit<Property, "id" | "code">) => {
    const { error } = await supabase.from("properties").insert({
      title: p.title, address: p.address, neighborhood: p.neighborhood, city: p.city,
      price: p.price, area: p.area, bedrooms: p.bedrooms, suites: p.suites, bathrooms: p.bathrooms, parking: p.parking,
      type: p.type, description: p.description, amenities: p.amenities, images: p.images,
      exclusive: p.exclusive, featured: p.featured, category: p.category,
    } as any);
    if (error) { toast.error("Erro ao criar: " + error.message); return; }
    await fetchProperties();
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    const { error } = await supabase.from("properties").update(updates).eq("id", id);
    if (error) { toast.error("Erro ao atualizar: " + error.message); return; }
    await fetchProperties();
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) { toast.error("Erro ao remover: " + error.message); return; }
    await fetchProperties();
  };

  const updateSettings = async (s: Partial<SiteSettings>) => {
    const dbUpdate: Record<string, any> = {};
    const map: Record<string, string> = {
      heroTitle: "hero_title", heroSubtitle: "hero_subtitle",
      conciergeNome: "concierge_nome", conciergeCargo: "concierge_cargo",
      conciergeDesc: "concierge_desc",
      brandName: "brand_name", logoUrl: "logo_url", footerText: "footer_text",
      creci: "creci",
      creciUf: "creci_uf",
      instagramUrl: "instagram_url", facebookUrl: "facebook_url",
      youtubeUrl: "youtube_url", linkedinUrl: "linkedin_url",
      websiteUrl: "website_url",
      primaryColor: "primary_color", accentColor: "accent_color",
      bannerInterval: "banner_interval",
      whatsappMessage: "whatsapp_message",
      availableAmenities: "available_amenities",
      privacyPolicy: "privacy_policy",
      showLocationOnCard: "show_location_on_card",
      developerName: "developer_name",
      developerUrl: "developer_url",
      showVisitSchedule: "show_visit_schedule",
      leadModalEnabled: "lead_modal_enabled",
      leadModalShowSkip: "lead_modal_show_skip",
      leadModalTitle: "lead_modal_title",
      leadModalDescription: "lead_modal_description",
      leadModalNameLabel: "lead_modal_name_label",
      leadModalNamePlaceholder: "lead_modal_name_placeholder",
      leadModalPhoneLabel: "lead_modal_phone_label",
      leadModalPhonePlaceholder: "lead_modal_phone_placeholder",
      leadModalSubmitText: "lead_modal_submit_text",
      leadModalSubmittingText: "lead_modal_submitting_text",
      leadModalSkipText: "lead_modal_skip_text",
      googleSiteVerification: "google_site_verification",
      bingSiteVerification: "bing_site_verification",
      headerStyle: "header_style",
      marqueeText: "marquee_text",
      imagesAccessMode: "images_access_mode",
      navbarHeightPx: "navbar_height_px",
      logoWidthPx: "logo_width_px",
      logoHeightPx: "logo_height_px",
      marqueePaddingYPx: "marquee_padding_y_px",
      watermarkOpacity: "watermark_opacity",
      watermarkPosition: "watermark_position",
      priceStyles: "price_styles",
      priceFormat: "price_format",
    };
    for (const [key, dbKey] of Object.entries(map)) {
      if ((s as any)[key] !== undefined) dbUpdate[dbKey] = (s as any)[key];
    }

    if (settings.id && Object.keys(dbUpdate).length > 0) {
      await supabase.from("site_settings").update(dbUpdate).eq("id", settings.id);
    }

    // Contact info lives in a separate, admin-only table
    const contactUpdate: Record<string, any> = {};
    if (s.whatsappNumber !== undefined) contactUpdate.whatsapp_number = s.whatsappNumber;
    if (s.emailContact !== undefined) contactUpdate.email_contact = s.emailContact;
    if (Object.keys(contactUpdate).length > 0) {
      const { data: existing } = await supabase
        .from("contact_info" as any)
        .select("id")
        .limit(1)
        .maybeSingle();
      if (existing && (existing as any).id) {
        await supabase.from("contact_info" as any).update(contactUpdate).eq("id", (existing as any).id);
      } else {
        await supabase.from("contact_info" as any).insert(contactUpdate);
      }
    }

    setSettings((prev) => ({ ...prev, ...s }));
  };

  const toggleFavorite = async (id: string) => {
    if (!user) {
      // Local-only for non-logged-in users
      setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
      return;
    }
    if (favorites.includes(id)) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("property_id", id);
      setFavorites((prev) => prev.filter((f) => f !== id));
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, property_id: id });
      setFavorites((prev) => [...prev, id]);
    }
  };

  return (
    <PropertyContext.Provider value={{ properties, settings, loading, addProperty, updateProperty, deleteProperty, updateSettings, favorites, toggleFavorite, refreshProperties: fetchProperties }}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperties() {
  const ctx = useContext(PropertyContext);
  if (!ctx) throw new Error("useProperties must be used within PropertyProvider");
  return ctx;
}

export function formatPrice(price: number): string {
  if (price >= 1000000) return `R$ ${(price / 1000000).toFixed(1).replace(".", ",")}M`;
  return `R$ ${price.toLocaleString("pt-BR")}`;
}

export function formatPriceFull(price: number): string {
  return `R$ ${price.toLocaleString("pt-BR")}`;
}

export function formatPriceWith(price: number, fmt?: PriceFormat): string {
  const f: PriceFormat = { ...DEFAULT_PRICE_FORMAT, ...(fmt ?? {}) };
  const fixed = Math.abs(price).toFixed(Math.max(0, Math.min(4, f.decimals)));
  const [intPart, decPart] = fixed.split(".");
  const intWithSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, f.thousandsSeparator);
  const body = decPart ? `${intWithSep}${f.decimalSeparator}${decPart}` : intWithSep;
  const sign = price < 0 ? "-" : "";
  return `${f.prefix}${sign}${body}${f.suffix}`;
}
