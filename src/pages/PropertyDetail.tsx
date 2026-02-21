import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, BedDouble, Car, Ruler, MapPin, Award, Calendar, MessageCircle } from "lucide-react";
import { useProperties } from "@/contexts/PropertyContext";
import { formatPriceFull } from "@/data/properties";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, favorites, toggleFavorite } = useProperties();
  const property = properties.find((p) => p.id === id);

  if (!property) return <div className="min-h-screen flex items-center justify-center">Imóvel não encontrado</div>;

  const isFav = favorites.includes(property.id);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-foreground/40 to-transparent max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-md text-card border border-card/30">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
          <button onClick={() => toggleFavorite(property.id)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-md text-card border border-card/30">
            <Heart className={`h-5 w-5 ${isFav ? "fill-accent text-accent" : ""}`} />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-md text-card border border-card/30">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative w-full aspect-[4/5] overflow-hidden">
        <img className="h-full w-full object-cover" src={property.images[0]} alt={property.title} />
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">
          <div className="h-1.5 w-6 rounded-full bg-card" />
          <div className="h-1.5 w-1.5 rounded-full bg-card/40" />
          <div className="h-1.5 w-1.5 rounded-full bg-card/40" />
        </div>
      </div>

      {/* Content */}
      <div className="relative -mt-6 rounded-t-3xl bg-background p-6">
        <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-muted" />
        
        {property.exclusive && (
          <div className="flex items-center gap-2 mb-2 text-primary font-semibold text-xs tracking-widest uppercase">
            <Award className="h-4 w-4" /> Exclusividade JHR
          </div>
        )}

        <h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight mb-2">{property.title}</h1>
        <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
          <MapPin className="h-4 w-4" /> {property.address}, {property.neighborhood}
        </p>
        <div className="text-2xl font-extrabold text-accent tracking-tight mb-8">{formatPriceFull(property.price)}</div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-card border border-border shadow-sm">
            <BedDouble className="h-5 w-5 text-accent mb-2" />
            <span className="text-sm font-bold">{property.suites} Suítes</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-card border border-border shadow-sm">
            <Car className="h-5 w-5 text-accent mb-2" />
            <span className="text-sm font-bold">{property.parking} Vagas</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-card border border-border shadow-sm">
            <Ruler className="h-5 w-5 text-accent mb-2" />
            <span className="text-sm font-bold">{property.area}m²</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3">Descrição</h2>
          <p className="text-muted-foreground leading-relaxed text-sm">{property.description}</p>
        </div>

        {/* Amenities */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3">Comodidades</h2>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar">
            {property.amenities.map((a) => (
              <div key={a} className="flex flex-none items-center gap-2 px-4 py-2 rounded-full bg-secondary text-xs font-medium">
                {a}
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-lg font-bold">Localização</h2>
            <span className="text-xs text-primary font-bold uppercase tracking-wide">{property.neighborhood}, SP</span>
          </div>
          <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-secondary border border-border flex items-center justify-center">
            <MapPin className="h-10 w-10 text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">{property.address}</span>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-card/80 backdrop-blur-xl border-t border-border z-50 max-w-md mx-auto">
        <div className="flex gap-3">
          <button className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-whatsapp text-card shadow-lg active:scale-95 transition-transform">
            <MessageCircle className="h-6 w-6" />
          </button>
          <button
            onClick={() => navigate("/contato")}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl gold-gradient py-4 text-accent-foreground font-bold text-base shadow-lg active:scale-95 transition-transform uppercase tracking-widest"
          >
            <Calendar className="h-5 w-5" /> Agendar Visita
          </button>
        </div>
      </div>
    </div>
  );
}
