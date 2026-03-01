import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";

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
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  emailContact: string;
  primaryColor: string;
  accentColor: string;
  bannerInterval: number;
}

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
  instagramUrl: "",
  facebookUrl: "",
  youtubeUrl: "",
  linkedinUrl: "",
  websiteUrl: "",
  emailContact: "",
  primaryColor: "195 85% 45%",
  accentColor: "42 56% 55%",
  bannerInterval: 5,
};

const localImages = [property1, property2, property3, property4];

const PropertyContext = createContext<PropertyContextType | null>(null);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProperties = useCallback(async () => {
    const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
    if (data && !error) {
      setProperties(data.map((p, i) => ({
        ...p,
        images: p.images.length > 0 ? p.images : [localImages[i % localImages.length]],
      })));
    }
    setLoading(false);
  }, []);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("*").limit(1).single();
    if (data) {
      setSettings({
        id: data.id,
        heroTitle: data.hero_title,
        heroSubtitle: data.hero_subtitle,
        conciergeNome: data.concierge_nome,
        conciergeCargo: data.concierge_cargo,
        conciergeDesc: data.concierge_desc,
        whatsappNumber: data.whatsapp_number,
        brandName: data.brand_name,
        logoUrl: data.logo_url,
        footerText: data.footer_text,
        instagramUrl: data.instagram_url,
        facebookUrl: data.facebook_url,
        youtubeUrl: data.youtube_url,
        linkedinUrl: data.linkedin_url,
        websiteUrl: data.website_url,
        emailContact: data.email_contact,
        primaryColor: data.primary_color,
        accentColor: data.accent_color,
        bannerInterval: (data as any).banner_interval ?? 5,
      });
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
  }, [fetchProperties, fetchSettings]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addProperty = async (p: Omit<Property, "id" | "code">) => {
    const { error } = await supabase.from("properties").insert({
      title: p.title, address: p.address, neighborhood: p.neighborhood, city: p.city,
      price: p.price, area: p.area, bedrooms: p.bedrooms, suites: p.suites, bathrooms: p.bathrooms, parking: p.parking,
      type: p.type, description: p.description, amenities: p.amenities, images: p.images,
      exclusive: p.exclusive, featured: p.featured,
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
    const dbUpdate: Record<string, string> = {};
    const map: Record<string, string> = {
      heroTitle: "hero_title", heroSubtitle: "hero_subtitle",
      conciergeNome: "concierge_nome", conciergeCargo: "concierge_cargo",
      conciergeDesc: "concierge_desc", whatsappNumber: "whatsapp_number",
      brandName: "brand_name", logoUrl: "logo_url", footerText: "footer_text",
      instagramUrl: "instagram_url", facebookUrl: "facebook_url",
      youtubeUrl: "youtube_url", linkedinUrl: "linkedin_url",
      websiteUrl: "website_url", emailContact: "email_contact",
      primaryColor: "primary_color", accentColor: "accent_color",
      bannerInterval: "banner_interval",
    };
    for (const [key, dbKey] of Object.entries(map)) {
      if ((s as any)[key] !== undefined) dbUpdate[dbKey] = (s as any)[key];
    }
    
    if (settings.id && Object.keys(dbUpdate).length > 0) {
      await supabase.from("site_settings").update(dbUpdate).eq("id", settings.id);
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
