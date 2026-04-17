import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useProperties } from "@/contexts/PropertyContext";
import { useLocation, useParams } from "react-router-dom";
import { trackEvent } from "@/hooks/useTrafficTracker";
import LeadCaptureModal from "@/components/LeadCaptureModal";

export default function WhatsAppFab() {
  const { settings, properties } = useProperties();
  const location = useLocation();
  const params = useParams();
  const [open, setOpen] = useState(false);

  const currentProperty = useMemo(() => {
    if (!location.pathname.startsWith("/imovel/")) return null;
    const id = params.id || location.pathname.split("/imovel/")[1]?.split("/")[0];
    return properties.find((p) => p.id === id) || null;
  }, [location.pathname, params.id, properties]);

  // Hide on admin/login pages
  if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/login")) return null;

  const source = currentProperty ? "whatsapp_fab_property" : "whatsapp_fab_global";

  const openWhatsApp = () => {
    trackEvent("whatsapp_click");
    const baseMsg = settings.whatsappMessage || "Olá! Gostaria de mais informações sobre os imóveis.";
    const msg = currentProperty
      ? `${baseMsg}\n\nImóvel: ${currentProperty.title} (${currentProperty.code || currentProperty.id})`
      : baseMsg;
    const message = encodeURIComponent(msg);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Fale conosco pelo WhatsApp"
        className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full bg-whatsapp text-white shadow-lg flex items-center justify-center animate-bounce hover:scale-110 transition-transform md:bottom-8 md:right-8"
        style={{ animationDuration: "2s", animationIterationCount: "infinite" }}
      >
        <MessageCircle className="h-7 w-7" />
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent border-2 border-background animate-pulse" />
      </button>

      <LeadCaptureModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          openWhatsApp();
        }}
        propertyId={currentProperty?.id}
        propertyTitle={currentProperty?.title}
        source={source}
      />
    </>
  );
}
