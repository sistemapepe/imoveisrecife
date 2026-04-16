import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("lgpd_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("lgpd_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("lgpd_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-screen-lg mx-auto bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <p className="text-sm text-foreground font-semibold">Sua privacidade importa</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Usamos cookies essenciais para uma experiência refinada. Ao continuar, você concorda com nossa{" "}
              <Link to="/privacidade" className="text-primary underline underline-offset-2">
                Política de Privacidade
              </Link>{" "}
              em conformidade com a LGPD.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={accept}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider"
              >
                Aceitar
              </button>
              <button
                onClick={decline}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                Recusar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
