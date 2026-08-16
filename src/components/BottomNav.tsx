import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Heart, MessageSquare } from "lucide-react";

const tabs = [
  { path: "/", label: "Início", icon: Home },
  { path: "/busca", label: "Busca", icon: Search },
  { path: "/favoritos", label: "Favoritos", icon: Heart },
  { path: "/contato", label: "Contato", icon: MessageSquare },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  if (location.pathname.startsWith("/admin") || location.pathname === "/login" || location.pathname === "/network-admin") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border px-6 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 flex justify-around items-center max-w-screen-lg mx-auto h-[calc(64px+env(safe-area-inset-bottom))]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.path);
        return (
          <button
            key={tab.path}
            onClick={() => {
              const scrollTop = () => {
                try { window.scrollTo({ top: 0, left: 0, behavior: "smooth" }); } catch { window.scrollTo(0, 0); }
                document.documentElement.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                document.body.scrollTo?.({ top: 0, left: 0, behavior: "smooth" });
              };
              if (location.pathname === tab.path) {
                scrollTop();
              } else {
                navigate(tab.path);
                requestAnimationFrame(scrollTop);
              }
            }}
            aria-label={tab.label}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 transition-colors active:opacity-70 touch-manipulation ${active ? "text-accent" : "text-muted-foreground"}`}
          >
            <Icon className="h-7 w-7" fill={active ? "currentColor" : "none"} aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
