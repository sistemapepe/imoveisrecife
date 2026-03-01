import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, BedDouble, Car, Ruler, MapPin, Award, Calendar, MessageCircle, Bath, DoorOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useProperties, formatPriceFull } from "@/contexts/PropertyContext";
import PageTransition from "@/components/PageTransition";
import { toast } from "sonner";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, settings, favorites, toggleFavorite } = useProperties();
  const property = properties.find((p) => p.id === id);

  if (!property) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Imóvel não encontrado</div>;

  const isFav = favorites.includes(property.id);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${property.title} - ${formatPriceFull(property.price)} | ${property.neighborhood}, ${property.city}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, text, url });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success("Link copiado!");
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no imóvel: ${property.title} - ${formatPriceFull(property.price)}\n${window.location.href}`
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-32">
        {/* Top bar */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-foreground/40 to-transparent max-w-screen-lg mx-auto">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-md text-card border border-card/30">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button onClick={() => toggleFavorite(property.id)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-md text-card border border-card/30">
              <Heart className={`h-5 w-5 ${isFav ? "fill-accent text-accent" : ""}`} />
            </button>
            <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-md text-card border border-card/30">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Hero image - responsive aspect ratio */}
        <div className="relative w-full aspect-[4/5] md:aspect-[16/9] lg:aspect-[21/9] overflow-hidden">
          <img className="h-full w-full object-cover" src={property.images[0]} alt={property.title} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative -mt-6 rounded-t-3xl bg-background p-6 max-w-screen-lg mx-auto"
        >
          <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-muted md:hidden" />

          {/* Desktop: two-column layout */}
          <div className="md:grid md:grid-cols-[1fr_360px] md:gap-10">
            <div>
              {property.exclusive && (
                <div className="flex items-center gap-2 mb-2 text-primary font-semibold text-xs tracking-widest uppercase">
                  <Award className="h-4 w-4" /> Exclusividade JHR
                </div>
              )}
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight mb-2">{property.title}</h1>
              <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {property.address}, {property.neighborhood}
              </p>
              <div className="text-2xl md:text-3xl font-extrabold text-accent tracking-tight mb-8">{formatPriceFull(property.price)}</div>

              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-8">
                {[
                  { icon: DoorOpen, label: `${(property as any).bedrooms || 0}`, sub: "Quartos" },
                  { icon: BedDouble, label: `${property.suites}`, sub: "Suítes" },
                  { icon: Bath, label: `${property.bathrooms}`, sub: "Banheiros" },
                  { icon: Car, label: `${property.parking}`, sub: "Vagas" },
                  { icon: Ruler, label: `${property.area}`, sub: "m²" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={sub} className="flex flex-col items-center justify-center p-3 md:p-4 rounded-xl bg-card border border-border shadow-sm">
                    <Icon className="h-5 w-5 text-accent mb-1.5" />
                    <span className="text-sm font-bold">{label}</span>
                    <span className="text-[10px] text-muted-foreground">{sub}</span>
                  </div>
                ))}
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-bold mb-3">Descrição</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">{property.description}</p>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-bold mb-3">Comodidades</h2>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {property.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-xs font-medium">{a}</div>
                  ))}
                </div>
              </div>

              <div className="mb-8 md:mb-0">
                <div className="flex justify-between items-end mb-3">
                  <h2 className="text-lg font-bold">Localização</h2>
                  <span className="text-xs text-primary font-bold uppercase tracking-wide">{property.neighborhood}, {property.city}</span>
                </div>
                <div className="relative h-48 md:h-72 w-full rounded-2xl overflow-hidden bg-secondary border border-border">
                  <iframe
                    title="Mapa"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(`${property.address}, ${property.neighborhood}, ${property.city}`)}&output=embed`}
                  />
                </div>
              </div>
            </div>

            {/* Desktop sidebar CTA */}
            <div className="hidden md:block">
              <div className="sticky top-24 space-y-4 p-6 rounded-2xl bg-card border border-border shadow-sm">
                <p className="text-2xl font-extrabold text-accent">{formatPriceFull(property.price)}</p>
                <p className="text-sm text-muted-foreground">{property.title}</p>
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-whatsapp text-white py-3.5 font-bold text-sm active:scale-95 transition-transform"
                >
                  <MessageCircle className="h-5 w-5" /> WhatsApp
                </button>
                <button
                  onClick={() => navigate("/contato")}
                  className="w-full flex items-center justify-center gap-2 rounded-xl gold-gradient py-3.5 text-accent-foreground font-bold text-sm active:scale-95 transition-transform uppercase tracking-widest"
                >
                  <Calendar className="h-5 w-5" /> Agendar Visita
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-card/80 backdrop-blur-xl border-t border-border z-50 max-w-screen-lg mx-auto md:hidden">
          <div className="flex gap-3">
            <button onClick={handleWhatsApp} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-whatsapp text-card shadow-lg active:scale-95 transition-transform">
              <MessageCircle className="h-6 w-6" />
            </button>
            <button onClick={() => navigate("/contato")} className="flex-1 flex items-center justify-center gap-2 rounded-xl gold-gradient py-4 text-accent-foreground font-bold text-base shadow-lg active:scale-95 transition-transform uppercase tracking-widest">
              <Calendar className="h-5 w-5" /> Agendar Visita
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
