import { Heart, Ruler, BedDouble, Bath, Car, DoorOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Property, formatPriceFull } from "@/contexts/PropertyContext";
import { useProperties } from "@/contexts/PropertyContext";

export default function PropertyCard({ property, index = 0 }: { property: Property; index?: number }) {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useProperties();
  const isFav = favorites.includes(property.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="bg-card rounded-2xl overflow-hidden ios-shadow cursor-pointer"
      onClick={() => navigate(`/imovel/${property.id}`)}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img alt={property.title} className="w-full h-full object-cover" src={property.images[0]} />
        <div className="absolute top-4 left-4 flex gap-2">
          {property.category && (
            <div className="bg-primary px-3 py-1 rounded-sm shadow-lg">
              <span className="text-[10px] font-bold text-primary-foreground uppercase tracking-[0.15em]">{property.category}</span>
            </div>
          )}
          {property.exclusive && (
            <div className="gold-gradient px-3 py-1 rounded-sm shadow-lg">
              <span className="text-[10px] font-bold text-accent-foreground uppercase tracking-[0.2em]">Exclusivo</span>
            </div>
          )}
        </div>
        <button
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-foreground/20 backdrop-blur-md rounded-full border border-card/30"
          onClick={(e) => { e.stopPropagation(); toggleFavorite(property.id); }}
        >
          <Heart className={`h-5 w-5 ${isFav ? "fill-accent text-accent" : "text-card"}`} />
        </button>
      </div>
      <div className="p-5">
        <h2 className="font-serif text-xl text-foreground">{property.title}</h2>
        <p className="font-serif text-2xl text-accent mb-4 italic">{formatPriceFull(property.price)}</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 border-t border-border pt-4">
          <div className="flex items-center gap-1 min-w-0">
            <Ruler className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="text-[11px] font-semibold text-muted-foreground truncate">{property.area}m²</span>
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <DoorOpen className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="text-[11px] font-semibold text-muted-foreground truncate">{property.bedrooms} Qts</span>
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <BedDouble className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="text-[11px] font-semibold text-muted-foreground truncate">{property.suites} Suítes</span>
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <Bath className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="text-[11px] font-semibold text-muted-foreground truncate">{property.bathrooms} Banh.</span>
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <Car className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="text-[11px] font-semibold text-muted-foreground truncate">{property.parking} Vagas</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
