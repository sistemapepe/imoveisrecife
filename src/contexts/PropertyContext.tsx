import React, { createContext, useContext, useState, ReactNode } from "react";
import { Property, defaultProperties } from "@/data/properties";

interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  conciergeNome: string;
  conciergeCargo: string;
  conciergeDesc: string;
  whatsappNumber: string;
}

interface PropertyContextType {
  properties: Property[];
  settings: SiteSettings;
  addProperty: (p: Omit<Property, "id">) => void;
  updateProperty: (id: string, p: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  updateSettings: (s: Partial<SiteSettings>) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

const defaultSettings: SiteSettings = {
  heroTitle: "Encontre o imóvel dos seus sonhos",
  heroSubtitle: "JHR LUXURY",
  conciergeNome: "Ricardo Almeida",
  conciergeCargo: "Concierge de Luxo",
  conciergeDesc: "Especialista em propriedades exclusivas. Estou pronto para encontrar o seu próximo investimento.",
  whatsappNumber: "5511999999999",
};

const PropertyContext = createContext<PropertyContextType | null>(null);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(defaultProperties);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [favorites, setFavorites] = useState<string[]>([]);

  const addProperty = (p: Omit<Property, "id">) => {
    const newProp: Property = { ...p, id: Date.now().toString() };
    setProperties((prev) => [...prev, newProp]);
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const updateSettings = (s: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...s }));
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  return (
    <PropertyContext.Provider value={{ properties, settings, addProperty, updateProperty, deleteProperty, updateSettings, favorites, toggleFavorite }}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperties() {
  const ctx = useContext(PropertyContext);
  if (!ctx) throw new Error("useProperties must be used within PropertyProvider");
  return ctx;
}
