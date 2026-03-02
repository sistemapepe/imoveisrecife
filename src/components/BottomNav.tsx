import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Heart, MessageSquare, Plus } from "lucide-react";

const tabs = [
  { path: "/", label: "Início", icon: Home },
  { path: "/busca", label: "Busca", icon: Search },
  { path: "__center__", label: "", icon: Plus },
  { path: "/favoritos", label: "Favoritos", icon: Heart },
  { path: "/contato", label: "Contato", icon: MessageSquare },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border px-6 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 flex justify-between items-center max-w-screen-lg mx-auto">
      {tabs.map((tab, i) => {
        if (tab.path === "__center__") {
          return (
            <div key={i} className="relative -top-6">
              <button
                onClick={() => navigate("/busca")}
                className="gold-gradient p-4 rounded-full shadow-lg"
              >
                <Plus className="h-6 w-6 text-accent-foreground" />
              </button>
            </div>
          );
        }
        const Icon = tab.icon;
        const active = isActive(tab.path);
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-1 ${active ? "text-accent" : "text-muted-foreground"}`}
          >
            <Icon className="h-7 w-7" fill={active ? "currentColor" : "none"} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
