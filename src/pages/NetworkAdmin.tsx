import { useState, useTransition, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const SitesTab = lazy(() => import("@/components/admin/SitesTab"));
const SecurityDiagnosticTab = lazy(() => import("@/components/admin/SecurityDiagnosticTab"));
const UsersTab = lazy(() => import("@/components/admin/UsersTab"));
const AnalyticsTab = lazy(() => import("@/components/admin/AnalyticsTab"));
const BulkImportTab = lazy(() => import("@/components/admin/BulkImportTab"));

type NetworkTab = "dashboard" | "sites" | "users" | "analytics" | "security" | "settings" | "import";

export default function NetworkAdmin() {
  const navigate = useNavigate();
  const { user, isSuperAdmin, loading: authLoading, signOut } = useAuth();
  const [tab, setTab] = useState<NetworkTab>("dashboard");
  const [isPending, startTransition] = useTransition();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-luxury-dark text-card">Carregando...</div>;
  if (!user || !isSuperAdmin) {
    navigate("/login");
    return null;
  }

  const switchTab = (newTab: NetworkTab) => {
    startTransition(() => {
      setTab(newTab);
      setMobileMenuOpen(false);
    });
  };

  const menuItems = [
    { key: "dashboard", label: "Dashboard Rede", icon: Home },
    { key: "sites", label: "Gerenciar Sites", icon: Globe2 },
    { key: "users", label: "Usuários Globais", icon: Users },
    { key: "analytics", label: "Analytics Global", icon: BarChart3 },
    { key: "import", label: "Importação Massa", icon: Globe2 },
    { key: "security", label: "Segurança", icon: Shield },
    { key: "settings", label: "Configurações", icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-luxury-dark text-card flex flex-col md:flex-row">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 bg-luxury-dark-lighter/80 backdrop-blur-md border-b border-white/5 px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe2 className="h-6 w-6 text-accent" />
            <span className="font-serif font-bold text-accent tracking-wider">NETWORK</span>
          </div>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-luxury-dark border-white/5 text-card p-0">
              <div className="p-6 border-b border-white/5 mb-4">
                <div className="flex items-center gap-3">
                  <Globe2 className="h-8 w-8 text-accent" />
                  <span className="font-serif font-bold text-xl text-accent tracking-widest">NETWORK</span>
                </div>
              </div>
              <nav className="px-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => switchTab(item.key as NetworkTab)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${
                        tab === item.key ? "bg-accent text-luxury-dark shadow-lg shadow-accent/20" : "text-card/60 hover:text-card hover:bg-white/5"
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
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-accent hover:bg-accent/10 transition-all"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Voltar ao Admin Site
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-red-400 hover:bg-red-400/10 transition-all mt-2"
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
        <aside className="hidden md:flex flex-col w-72 bg-luxury-dark-lighter border-r border-white/5 h-screen sticky top-0">
          <div className="p-8 mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 shadow-lg shadow-accent/5">
                <Globe2 className="h-7 w-7 text-accent" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-2xl text-accent tracking-widest">NETWORK</h1>
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
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 relative group ${
                    active 
                      ? "bg-accent text-luxury-dark shadow-xl shadow-accent/20" 
                      : "text-card/50 hover:text-card hover:bg-white/5"
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${active ? "scale-110" : ""}`} />
                  <span className="text-sm uppercase tracking-wider">{item.label}</span>
                  {active && (
                    <motion.div 
                      layoutId="activeNetworkTab"
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-accent hover:bg-accent/10 transition-all mb-3"
            >
              <LayoutDashboard className="h-4 w-4" />
              Admin Site Individual
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-400/10 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Encerrar Sessão
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
          <Suspense fallback={<div className="flex items-center justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-accent" /></div>}>
            {tab === "dashboard" && (
              <div className="space-y-12">
                <header>
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-accent mb-4">Gestão de Rede</h2>
                  <p className="text-muted-foreground text-lg max-w-2xl">Bem-vindo à Central do Super Admin. Aqui você gerencia a infraestrutura global da plataforma e todos os sites tenants.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-luxury-dark-lighter/40 border border-white/5 rounded-3xl p-8 hover:border-accent/30 transition-all cursor-pointer group" onClick={() => switchTab("sites")}>
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Globe2 className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Sites & Domínios</h3>
                    <p className="text-sm text-muted-foreground">Gerencie instâncias, duplique sites e configure domínios personalizados.</p>
                  </div>
                  
                  <div className="bg-luxury-dark-lighter/40 border border-white/5 rounded-3xl p-8 hover:border-accent/30 transition-all cursor-pointer group" onClick={() => switchTab("users")}>
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Users className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Usuários Globais</h3>
                    <p className="text-sm text-muted-foreground">Gestão centralizada de administradores e supervisores de rede.</p>
                  </div>

                  <div className="bg-luxury-dark-lighter/40 border border-white/5 rounded-3xl p-8 hover:border-accent/30 transition-all cursor-pointer group" onClick={() => switchTab("security")}>
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Shield className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Segurança</h3>
                    <p className="text-sm text-muted-foreground">Diagnósticos de permissão RLS e integridade de dados global.</p>
                  </div>
                </div>
              </div>
            )}
            
            {tab === "sites" && <SitesTab />}
            {tab === "users" && <UsersTab isNetwork={true} />}
            {tab === "analytics" && <AnalyticsTab isNetwork={true} />}
            {tab === "import" && <BulkImportTab />}
            {tab === "security" && <SecurityDiagnosticTab />}
            {tab === "settings" && (
              <div className="p-12 text-center border-2 border-dashed border-white/10 rounded-3xl">
                <Settings className="h-12 w-12 text-accent/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Configurações de Rede</h3>
                <p className="text-muted-foreground">Módulo em desenvolvimento. Aqui você poderá gerenciar temas globais e limites de recursos.</p>
              </div>
            )}
          </Suspense>
        </main>
      </div>
    </PageTransition>
  );
}
