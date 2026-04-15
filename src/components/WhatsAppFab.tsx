import { MessageCircle } from "lucide-react";
import { useProperties } from "@/contexts/PropertyContext";
import { useLocation } from "react-router-dom";
import { trackEvent } from "@/hooks/useTrafficTracker";

export default function WhatsAppFab() {
  const { settings } = useProperties();
  const location = useLocation();

  // Hide on admin/login pages
  if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/login")) return null;

  const handleClick = () => {
    trackEvent("whatsapp_click");
    const message = encodeURIComponent(settings.whatsappMessage || "Olá! Gostaria de mais informações sobre os imóveis da JHR.");
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Fale conosco pelo WhatsApp"
      className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full bg-whatsapp text-white shadow-lg flex items-center justify-center animate-bounce hover:scale-110 transition-transform md:bottom-8 md:right-8"
      style={{ animationDuration: "2s", animationIterationCount: "infinite" }}
    >
      <MessageCircle className="h-7 w-7" />
      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent border-2 border-background animate-pulse" />
    </button>
  );
}
