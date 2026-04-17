import { Heart, Ruler, BedDouble, Bath, Car, DoorOpen, MapPin, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Property, formatPriceFull } from "@/contexts/PropertyContext";
import { useProperties } from "@/contexts/PropertyContext";

export default function PropertyCard({ property, index = 0 }: { property: Property; index?: number }) {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, settings } = useProperties();
  const isFav = favorites.includes(property.id);
  const hasPriceDrop = !!property.previous_price && property.previous_price > property.price;
  const dropPercent = hasPriceDrop
    ? Math.round(((property.previous_price! - property.price) / property.previous_price!) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="group bg-card rounded-2xl overflow-hidden ios-shadow cursor-pointer transition-shadow duration-300 hover:shadow-2xl"
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/imovel/${property.id}`)}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={property.images[0]}
          loading={index < 2 ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={index === 0 ? "high" : "auto"}
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {property.status && property.status !== "disponivel" && (
            <div className={`px-3 py-1 rounded-sm shadow-lg ${
              property.status === "reservado" ? "bg-yellow-500/90" : "bg-red-500/90"
            }`}>
              <span className="text-[10px] font-bold text-white uppercase tracking-[0.15em]">
                {property.status === "reservado" ? "Reservado" : "Vendido"}
              </span>
            </div>
          )}
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
          aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-pressed={isFav}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-foreground/20 backdrop-blur-md rounded-full border border-card/30"
          onClick={(e) => { e.stopPropagation(); toggleFavorite(property.id); }}
        >
          <Heart className={`h-5 w-5 ${isFav ? "fill-accent text-accent" : "text-card"}`} />
        </button>
        {hasPriceDrop && (
          <motion.div
            initial={{ scale: 0, rotate: -8 }}
            animate={{ scale: 1, rotate: -6 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
            className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-destructive px-3 py-1.5 rounded-sm shadow-2xl border border-destructive-foreground/20"
          >
            <TrendingDown className="h-3.5 w-3.5 text-destructive-foreground" />
            <span className="text-[11px] font-bold text-destructive-foreground uppercase tracking-[0.15em]">
              Baixou {dropPercent}%
            </span>
          </motion.div>
        )}
      </div>
      <div className="p-5">
        <h2 className="font-serif font-bold text-2xl text-foreground line-clamp-2 leading-tight">{property.title}</h2>
        <div className="flex items-baseline gap-2 mb-4 flex-wrap">
          <p className="font-serif text-2xl text-accent italic">{formatPriceFull(property.price)}</p>
          <span className="text-xs text-muted-foreground">
            ({property.neighborhood})
          </span>
          {hasPriceDrop && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPriceFull(property.previous_price!)}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 border-t border-border pt-4">
          <div className="flex items-center gap-1 min-w-0">
            <Ruler className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="text-[11px] font-semibold text-muted-foreground truncate">{property.area}m²</span>
          </div>
        {!!property.bedrooms && (
          <div className="flex items-center gap-1 min-w-0">
            <DoorOpen className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="text-[11px] font-semibold text-muted-foreground truncate">{property.bedrooms} Qts</span>
          </div>
        )}
        {!!property.suites && (
          <div className="flex items-center gap-1 min-w-0">
            <BedDouble className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="text-[11px] font-semibold text-muted-foreground truncate">{property.suites} Suítes</span>
          </div>
        )}
        {!!property.bathrooms && (
          <div className="flex items-center gap-1 min-w-0">
            <Bath className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="text-[11px] font-semibold text-muted-foreground truncate">{property.bathrooms} Banh.</span>
          </div>
        )}
        {!!property.parking && (
          <div className="flex items-center gap-1 min-w-0">
            <Car className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="text-[11px] font-semibold text-muted-foreground truncate">{property.parking} Vagas</span>
          </div>
        )}
        </div>
      </div>
    </motion.div>
  );
}
