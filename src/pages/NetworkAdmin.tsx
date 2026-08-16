import { useState, useTransition, Suspense, lazy, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Globe2, 
  LayoutDashboard, 
  LogOut, 
  Loader2, 
  Users, 
  Settings, 
  Shield, 
  BarChart3, 
  Home,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Lazy loading components with custom names to avoid conflicts
const SitesTab = lazy(() => import("@/components/admin/SitesTab"));
const SecurityDiagnosticTab = lazy(() => import("@/components/admin/SecurityDiagnosticTab"));
const UsersTab = lazy(() => import("@/components/admin/UsersTab"));
const AnalyticsTab = lazy(() => import("@/components/admin/AnalyticsTab"));
const BulkImportTab = lazy(() => import("@/components/admin/BulkImportTab"));
const NetworkSettingsTab = lazy(() => import("@/components/admin/NetworkSettingsTab"));
const NetworkDashboard = lazy(() => import("@/components/admin/NetworkDashboard"));

type NetworkTab = "dashboard" | "sites" | "users" | "analytics" | "security" | "settings" | "import";

export default function NetworkAdmin() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isSuperAdmin, loading: authLoading, signOut } = useAuth();
  
  // Initialize tab from URL or sessionStorage for persistence and instant hydration
  const [tab, setTab] = useState<NetworkTab>(() => {
    try {
      const urlTab = new URLSearchParams(window.location.search).get("tab") as NetworkTab;
      if (urlTab) return urlTab;
      return (sessionStorage.getItem("network_active_tab") as NetworkTab) || "dashboard";
    } catch (e) {
      return "dashboard";
    }
  });
  
  const [isPending, startTransition] = useTransition();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Persistence and synchronization
  useEffect(() => {
    if (!user || !isSuperAdmin) return;

    logger.startTimer("NetworkAdmin_Mount");
    sessionStorage.setItem("network_active_tab", tab);
    
    // Sincroniza URL sem causar loops
    const currentUrlTab = searchParams.get("tab");
    if (currentUrlTab !== tab) {
      setSearchParams({ tab }, { replace: true });
    }
    
    logger.endTimer("NetworkAdmin_Mount");
  }, [tab, setSearchParams, searchParams, user, isSuperAdmin]);



  // Components map for prefetching
  const componentsMap = useMemo(() => ({
    dashboard: () => import("@/components/admin/NetworkDashboard"),
    sites: () => import("@/components/admin/SitesTab"),
    users: () => import("@/components/admin/UsersTab"),
    analytics: () => import("@/components/admin/AnalyticsTab"),
    import: () => import("@/components/admin/BulkImportTab"),
    security: () => import("@/components/admin/SecurityDiagnosticTab"),
    settings: () => import("@/components/admin/NetworkSettingsTab"),
  }), []);

  const prefetchTab = useCallback((targetTab: NetworkTab) => {
    const importer = componentsMap[targetTab];
    if (importer) importer();
  }, [componentsMap]);

  const switchTab = useCallback((newTab: NetworkTab) => {
    if (tab === newTab) return;
    
    // Prefetch immediately on click before transition
    prefetchTab(newTab);
    
    startTransition(() => {
      setTab(newTab);
      setMobileMenuOpen(false);
    });
  }, [tab, prefetchTab]);

  if (authLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-luxury-dark text-accent space-y-4">
      <Loader2 className="h-10 w-10 animate-spin" />
      <span className="text-xs uppercase tracking-widest opacity-50">Autenticando na Rede...</span>
    </div>
  );
  
  if (!user || !isSuperAdmin) {
    navigate("/login");
    return null;
  }

  const menuItems = [
    { key: "dashboard", label: "Dashboard Rede", icon: Home },
    { key: "sites", label: "Gerenciar Sites", icon: Globe2 },
    { key: "users", label: "Usuários Globais", icon: Users },
    { key: "analytics", label: "Analytics Global", icon: BarChart3 },
    { key: "import", label: "Importação Massa", icon: LayoutDashboard },
    { key: "security", label: "Segurança", icon: Shield },
    { key: "settings", label: "Configurações", icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-luxury-dark text-white flex flex-col md:flex-row dark overflow-x-hidden">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 bg-[#0d1419]/90 backdrop-blur-3xl border-b border-white/5 px-4 h-18 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <Globe2 className="h-6 w-6 text-accent" />
            <span className="font-serif font-bold text-accent tracking-[0.2em] uppercase">Network</span>
          </div>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-luxury-dark border-white/5 text-accent p-0">
              <div className="p-6 border-b border-white/5 mb-4">
                <div className="flex items-center gap-3">
                  <Globe2 className="h-8 w-8 text-accent" />
                  <span className="font-serif font-bold text-xl text-accent tracking-[0.2em] uppercase">Network</span>
                </div>
              </div>
              <nav className="px-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => switchTab(item.key as NetworkTab)}
                      onMouseEnter={() => prefetchTab(item.key as NetworkTab)}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-extrabold transition-all duration-300 ${
                        tab === item.key ? "bg-accent text-luxury-dark shadow-xl shadow-accent/20" : "text-accent/60 hover:text-accent hover:bg-white/5"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  );
                })}
                <div className="pt-8 border-t border-white/5 mt-8">
                   <button
                    onClick={() => navigate("/admin")}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-extrabold text-[10px] uppercase tracking-widest text-accent hover:bg-accent/10 transition-all border border-accent/20"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Painel do Site
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-extrabold text-[10px] uppercase tracking-widest text-red-400/80 hover:bg-red-400/10 transition-all mt-2"
                  >
                    <LogOut className="h-5 w-5" />
                    Sair
                  </button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </header>

        {/* Sidebar Desktop */}
        <aside className="hidden md:flex flex-col w-72 bg-[#0d1419] border-r border-white/5 h-screen sticky top-0">
          <div className="p-8 mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 shadow-lg shadow-accent/5">
                <Globe2 className="h-7 w-7 text-accent" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-2xl text-accent tracking-[0.2em] uppercase">Network</h1>
                <p className="text-[10px] text-accent/60 font-black uppercase tracking-[0.3em]">Gerenciador Global</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => switchTab(item.key as NetworkTab)}
                  onMouseEnter={() => prefetchTab(item.key as NetworkTab)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-extrabold transition-all duration-300 relative group ${
                    active 
                      ? "bg-accent text-luxury-dark shadow-xl shadow-accent/20" 
                      : "text-accent/50 hover:text-accent hover:bg-white/5"
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${active ? "scale-110" : ""}`} />
                  <span className="text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
                  {active && (
                    <div 
                      className="absolute left-0 w-1 h-6 bg-luxury-dark rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-6 border-t border-white/5 mt-auto bg-black/20">
            <button
              onClick={() => navigate("/admin")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-accent hover:bg-accent/10 transition-all mb-3 text-left border border-accent/20"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span>Painel do Site</span>
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-400/10 transition-all border border-red-400/10"
            >
              <LogOut className="h-4 w-4" />
              Encerrar Sessão
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12 overflow-y-auto max-w-7xl mx-auto w-full relative">
          <div className="w-full">
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-accent opacity-50" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent/30">Carregando Aba</p>
              </div>
            }>
              {tab === "dashboard" && <NetworkDashboard />}
              {tab === "sites" && <SitesTab />}
              {tab === "users" && <UsersTab isNetwork={true} />}
              {tab === "analytics" && <AnalyticsTab isNetwork={true} />}
              {tab === "import" && <BulkImportTab />}
              {tab === "security" && <SecurityDiagnosticTab />}
              {tab === "settings" && <NetworkSettingsTab />}
            </Suspense>
          </div>
          
          {isPending && (
            <div className="absolute top-4 right-4">
              <Loader2 className="h-5 w-5 animate-spin text-accent opacity-50" />
            </div>
          )}
        </main>
    </div>
  );
}
