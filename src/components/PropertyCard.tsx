import { useState } from "react";
import { Heart, Ruler, BedDouble, Bath, Car, DoorOpen, TrendingDown, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Property } from "@/contexts/PropertyContext";
import { PriceDisplay } from "@/components/PriceDisplay";
import { useProperties } from "@/contexts/PropertyContext";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import { trackEvent } from "@/hooks/useTrafficTracker";
import { getOptimizedImageUrl, getImageSrcSet, IMAGE_SIZES } from "@/lib/image-optimization";
import { useResolvedImage } from "@/lib/property-image-url";
import Watermark from "@/components/Watermark";

export default function PropertyCard({ property, index = 0 }: { property: Property; index?: number }) {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, settings } = useProperties();
  const isFav = favorites.includes(property.id);
  const hasPriceDrop = !!property.previous_price && property.previous_price > property.price;
  const dropPercent = hasPriceDrop
    ? Math.round(((property.previous_price! - property.price) / property.previous_price!) * 100)
    : 0;
  const [leadOpen, setLeadOpen] = useState(false);
  const heroImage = useResolvedImage(property.images[0]);

  const openWhatsApp = () => {
    trackEvent("whatsapp_click", property.id);
    const baseMsg = settings.whatsappMessage || "Olá! Gostaria de mais informações sobre este imóvel.";
    const msg = `${baseMsg}\n\nImóvel: ${property.title} (${property.code || property.id})`;
    const message = encodeURIComponent(msg);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <>
    <div
      className="group bg-[#0d1419] rounded-[2.5rem] overflow-hidden premium-shadow cursor-pointer transition-all duration-700 hover:-translate-y-3 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] border border-white/5 hover:border-accent/30"
      onClick={() => navigate(`/imovel/${property.id}`)}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={getOptimizedImageUrl(heroImage, IMAGE_SIZES.CARD)}
          srcSet={getImageSrcSet(heroImage, [300, 450, 600])}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading={index < 2 ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={index === 0 ? "high" : "auto"}
        />
        <Watermark />

        {/* Gradient top scrim for badge legibility */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 via-black/20 to-transparent" />

        <div className="absolute top-3 left-3 right-16 flex flex-wrap gap-1.5 items-center">
          {property.status && property.status !== "disponivel" && (
            <div className={`inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full backdrop-blur-md border shadow-[0_4px_14px_rgba(0,0,0,0.35)] ${
              property.status === "reservado"
                ? "bg-yellow-500/90 border-yellow-200/50"
                : "bg-red-600/90 border-red-200/40"
            }`}>
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-bold text-white uppercase tracking-[0.16em]">
                {property.status === "reservado" ? "Reservado" : "Vendido"}
              </span>
            </div>
          )}
          {property.category && (
            <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-background/85 backdrop-blur-md border border-white/30 shadow-[0_4px_14px_rgba(0,0,0,0.3)]">
              <span className="text-[10px] font-bold text-foreground uppercase tracking-[0.16em]">{property.category}</span>
            </div>
          )}
          {property.exclusive && (
            <div className="relative inline-flex items-center gap-1 px-2.5 py-1 rounded-full gold-gradient border border-accent/60 shadow-[0_6px_20px_-4px_hsl(var(--accent)/0.7)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
              <span className="relative text-[10px] font-extrabold text-accent-foreground uppercase tracking-[0.2em] flex items-center gap-1">
                <span className="text-[11px] leading-none">★</span> Exclusivo
              </span>
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
        <button
          aria-label={`Falar no WhatsApp sobre ${property.title}`}
          className="absolute bottom-4 right-4 w-11 h-11 flex items-center justify-center bg-whatsapp text-white rounded-full shadow-lg hover:scale-110 transition-transform"
          onClick={(e) => { e.stopPropagation(); setLeadOpen(true); }}
        >
          <MessageCircle className="h-5 w-5" />
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
        <h2 className="font-serif font-bold text-2xl text-white line-clamp-2 leading-tight mb-4 group-hover:text-accent transition-colors">{property.title}</h2>
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="px-3 py-1.5 bg-accent/5 rounded-full border border-accent/10">
            <PriceDisplay
              as="p"
              section="card"
              value={property.price}
              className="text-accent font-bold tracking-tight"
            />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">
            {property.neighborhood}
          </span>
          {hasPriceDrop && (
            <PriceDisplay
              as="span"
              section="card"
              value={property.previous_price!}
              className="ml-1 line-through decoration-destructive/40"
              styleOverride={{ fontSize: "0.75em", opacity: 0.7, color: "hsl(var(--muted-foreground))" }}
            />
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
    </div>

    <LeadCaptureModal
      open={leadOpen}
      onClose={() => setLeadOpen(false)}
      onConfirm={() => {
        setLeadOpen(false);
        openWhatsApp();
      }}
      propertyId={property.id}
      propertyTitle={property.title}
      source="property_card"
    />
    </>
  );
}
