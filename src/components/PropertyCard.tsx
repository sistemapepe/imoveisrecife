import { Heart, Ruler, BedDouble, Bath, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Property, formatPriceFull } from "@/data/properties";
import { useProperties } from "@/contexts/PropertyContext";

export default function PropertyCard({ property }: { property: Property }) {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useProperties();
  const isFav = favorites.includes(property.id);

  return (
    <div
      className="bg-card rounded-2xl overflow-hidden ios-shadow cursor-pointer"
      onClick={() => navigate(`/imovel/${property.id}`)}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img alt={property.title} className="w-full h-full object-cover" src={property.images[0]} />
        {property.exclusive && (
          <div className="absolute top-4 left-4 gold-gradient px-3 py-1 rounded-sm shadow-lg">
            <span className="text-[10px] font-bold text-accent-foreground uppercase tracking-[0.2em]">Exclusive</span>
          </div>
        )}
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
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-1.5">
            <Ruler className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold text-muted-foreground">{property.area}m²</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold text-muted-foreground">{property.suites} Suítes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold text-muted-foreground">{property.bathrooms} Banh.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Car className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold text-muted-foreground">{property.parking} Vagas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
