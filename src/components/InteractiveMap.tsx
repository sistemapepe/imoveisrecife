import { useState } from "react";
import { MapPin, ShoppingCart, GraduationCap, Pill, UtensilsCrossed, Building2, Bus, Trees } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GOOGLE_MAPS_KEY = "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";

type Category = {
  id: string;
  label: string;
  icon: React.ElementType;
  query: string;
};

const categories: Category[] = [
  { id: "location", label: "Imóvel", icon: MapPin, query: "" },
  { id: "restaurants", label: "Restaurantes", icon: UtensilsCrossed, query: "restaurantes" },
  { id: "markets", label: "Mercados", icon: ShoppingCart, query: "supermercados+mercados" },
  { id: "pharmacies", label: "Farmácias", icon: Pill, query: "farmácias" },
  { id: "schools", label: "Escolas", icon: GraduationCap, query: "escolas+faculdades" },
  { id: "transport", label: "Transporte", icon: Bus, query: "metrô+estação+ponto+de+ônibus" },
  { id: "parks", label: "Parques", icon: Trees, query: "parques+praças" },
  { id: "shopping", label: "Shopping", icon: Building2, query: "shopping+center+mall" },
];

interface InteractiveMapProps {
  address: string;
  neighborhood: string;
  city: string;
}

export default function InteractiveMap({ address, neighborhood, city }: InteractiveMapProps) {
  const [activeCategory, setActiveCategory] = useState("location");
  const locationQuery = encodeURIComponent(`${address}, ${neighborhood}, ${city}`);
  const active = categories.find((c) => c.id === activeCategory)!;

  const mapSrc =
    active.id === "location"
      ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}&q=${locationQuery}&zoom=16`
      : `https://www.google.com/maps/embed/v1/search?key=${GOOGLE_MAPS_KEY}&q=${active.query}+near+${locationQuery}&zoom=15`;

  return (
    <div className="mb-8 md:mb-0">
      <div className="flex justify-between items-end mb-3">
        <h2 className="text-lg font-bold">Localização</h2>
        <span className="text-xs text-primary font-bold uppercase tracking-wide">
          {neighborhood}, {city}
        </span>
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all shrink-0 ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Active label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2 }}
          className="mb-2"
        >
          {active.id !== "location" && (
            <p className="text-xs text-accent font-medium flex items-center gap-1.5">
              <active.icon className="h-3.5 w-3.5" />
              Mostrando {active.label.toLowerCase()} próximos ao imóvel
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Map */}
      <div className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden bg-secondary border border-border">
        <iframe
          key={activeCategory}
          title={`Mapa - ${active.label}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapSrc}
        />
      </div>
    </div>
  );
}
