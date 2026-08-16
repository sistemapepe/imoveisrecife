import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSite } from "@/contexts/SiteContext";
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

export const PropertyProvider = React.forwardRef<HTMLDivElement, { children: ReactNode }>(({ children }, ref) => {
...
  return (
    <PropertyContext.Provider value={{ properties, settings, loading, addProperty, updateProperty, deleteProperty, updateSettings, favorites, toggleFavorite, refreshProperties }}>
      <div ref={ref} className="contents">
        {children}
      </div>
    </PropertyContext.Provider>
  );
});

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
