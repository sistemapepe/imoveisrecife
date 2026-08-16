import { useState, useEffect, useCallback, useTransition, Suspense, lazy } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProperties, Property, formatPriceFull } from "@/contexts/PropertyContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Plus, Pencil, Trash2, Settings, LayoutDashboard, LogOut, Loader2, Users, MessageSquare, Bell, FileText, BarChart3, Calendar, Globe, TagIcon, TrendingDown, Menu, Home, Search, X, Sparkles, Image as ImageIcon, Upload, Zap, Globe2, Shield } from "lucide-react";
import BackButton from "@/components/BackButton";
import ImageUpload from "@/components/ImageUpload";
import { getOptimizedImageUrl, IMAGE_SIZES } from "@/lib/image-optimization";
import PageTransition from "@/components/PageTransition";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const DashboardTab = lazy(() => import("@/components/admin/DashboardTab"));
const BucketAccessTab = lazy(() => import("@/components/admin/BucketAccessTab"));
const SettingsTab = lazy(() => import("@/components/admin/SettingsTab"));
const UsersTab = lazy(() => import("@/components/admin/UsersTab"));
const MessagesTab = lazy(() => import("@/components/admin/MessagesTab"));
const PrivacyTab = lazy(() => import("@/components/admin/PrivacyTab"));

type Tab = "dashboard" | "properties" | "settings" | "users" | "messages" | "privacy" | "analytics" | "visits" | "traffic" | "seo" | "bucket" | "import" | "performance" | "security";

// Lazy loaded for performance optimization
const SecurityDiagnosticTab = lazy(() => import("@/components/admin/SecurityDiagnosticTab"));
const AnalyticsTab = lazy(() => import("@/components/admin/AnalyticsTab"));
const VisitsTab = lazy(() => import("@/components/admin/VisitsTab"));
const TrafficTab = lazy(() => import("@/components/admin/TrafficTab"));
const PerformanceTab = lazy(() => import("@/components/admin/PerformanceTab"));
const BulkImportTab = lazy(() => import("@/components/admin/BulkImportTab"));
const SeoAuditTab = lazy(() => import("@/components/admin/SeoAuditTab"));

const maskCep = (v: string) => v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9);

const maskCurrency = (value: number) => {
  if (!value) return "";
  return value.toLocaleString("pt-BR");
};

const parseCurrency = (v: string): number => {
  const clean = v.replace(/\D/g, "");
  return clean ? Number(clean) : 0;
};

const emptyProperty: Omit<Property, "id" | "code"> = {
  title: "", address: "", neighborhood: "", city: "São Paulo",
  price: 0, area: 0, bedrooms: 0, suites: 0, bathrooms: 0, parking: 0,
  type: "Casa", description: "", amenities: [],
  images: [], exclusive: false, featured: false, category: "Venda",
  status: "disponivel",
};

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin, role, loading: authLoading, signOut, canViewProperties, canManageProperties, canDeleteProperties, canManageSettings, canManageUsers, canViewContacts, canViewAnalytics, canViewVisits, canViewTraffic, canManageSeo, canBulkImport, canManagePrivacy, canManageBucket } = useAuth();
  const { properties, settings, addProperty, updateProperty, deleteProperty, updateSettings } = useProperties();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [search, setSearch] = useState("");
  const [newMsgCount, setNewMsgCount] = useState(0);
  const [pendingVisitsCount, setPendingVisitsCount] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Property, "id" | "code">>(emptyProperty);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [cep, setCep] = useState("");
  const [generatingSeo, setGeneratingSeo] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const DEFAULT_CATEGORIES = ["Venda", "Locação", "Temporada", "Repasse"];
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("admin_property_categories") || "null");
      if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch {}
    return DEFAULT_CATEGORIES;
  });
  useEffect(() => {
    localStorage.setItem("admin_property_categories", JSON.stringify(categories));
  }, [categories]);

  const fetchCep = async (value: string) => {
    const clean = value.replace(/\D/g, "");
    setCep(value);
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          address: data.logradouro || prev.address,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
        }));
        toast.success("Endereço preenchido!");
      } else {
        toast.error("CEP não encontrado");
      }
    } catch {
      toast.error("Erro ao buscar CEP");
    }
    setCepLoading(false);
  };

  // A proteção agora é feita via ProtectedRoute no App.tsx

  // Poll for new contact messages (secure alternative to Realtime)
  const lastMsgCountRef = useCallback(() => {}, []);
  useEffect(() => {
    if (!canViewContacts) return;
    let lastCount = 0;
    const checkNewMessages = async () => {
      const { count } = await supabase.from("contact_messages").select("id", { count: "exact", head: true });
      if (count !== null && count > lastCount && lastCount > 0 && tab !== "messages") {
        setNewMsgCount((c) => c + (count - lastCount));
      }
      if (count !== null) lastCount = count;
    };
    checkNewMessages();
    const interval = setInterval(checkNewMessages, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [canViewContacts, tab]);

  // Poll for pending visit requests
  useEffect(() => {
    const canViewVisits = isAdmin || role === "supervisor";
    if (!canViewVisits) return;
    const checkPendingVisits = async () => {
      const { count } = await supabase
        .from("visit_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      setPendingVisitsCount(count ?? 0);
    };
    checkPendingVisits();
    const interval = setInterval(checkPendingVisits, 30000);
    return () => clearInterval(interval);
  }, [isAdmin, role, tab]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!user) return null;

  const startEdit = (p: Property) => {
    setEditing(p.id);
    setCreating(false);
    const { id, code, ...rest } = p;
    setForm(rest);
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(emptyProperty);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error("Título obrigatório"); return; }
    if (!form.price || form.price <= 0) { toast.error("Preço obrigatório"); return; }
    if (!form.type) { toast.error("Tipo obrigatório"); return; }
    if (!form.status) { toast.error("Status obrigatório"); return; }
    if (!form.category) { toast.error("Categoria obrigatória"); return; }
    if (!form.description || !form.description.trim()) { toast.error("Descrição obrigatória"); return; }
    if (creating) {
      await addProperty(form);
      toast.success("Imóvel criado!");
    } else if (editing) {
      await updateProperty(editing, form);
      toast.success("Imóvel atualizado!");
    }
    setEditing(null);
    setCreating(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteProperty(deleteId);
    toast.success("Imóvel removido!");
    setDeleteId(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const allTabs: { key: Tab; label: string; icon: typeof Settings; show: boolean; badge?: number }[] = [
    { key: "dashboard", label: "Resumo", icon: Home, show: true },
    { key: "properties", label: "Imóveis", icon: LayoutDashboard, show: !!canViewProperties || !!canManageProperties },
    { key: "import", label: "Importar (Excel)", icon: Upload, show: !!canBulkImport },
    { key: "messages", label: "Contatos", icon: MessageSquare, show: !!canViewContacts, badge: newMsgCount },
    { key: "visits", label: "Visitas", icon: Calendar, show: !!canViewVisits, badge: pendingVisitsCount },
    { key: "analytics", label: "Analytics", icon: BarChart3, show: !!canViewAnalytics },
    { key: "traffic", label: "Tráfego", icon: Globe, show: !!canViewTraffic },
    { key: "seo", label: "SEO Audit", icon: Sparkles, show: !!canManageSeo },
    { key: "users", label: "Equipe", icon: Users, show: !!canManageUsers },
    { key: "settings", label: "Configurações", icon: Settings, show: !!canManageSettings },
    { key: "bucket", label: "Imagens (Acesso)", icon: ImageIcon, show: !!canManageBucket },
    { key: "performance", label: "Performance", icon: Zap, show: !!canViewAnalytics },
    { key: "privacy", label: "LGPD", icon: FileText, show: !!canManagePrivacy },
    { key: "security", label: "Segurança", icon: Shield, show: true },
  ];
  const networkTabs: { key: string; label: string; icon: typeof Settings; show: boolean; badge?: number }[] = [];
  
  const visibleTabs = [...allTabs.filter((t) => t.show), ...networkTabs];

  const switchTab = (newTab: any) => {
    if (newTab === 'sites') {
      navigate("/network-admin");
      return;
    }
    startTransition(() => {
      setTab(newTab);
      setEditing(null);
      setCreating(null);
      if (newTab === "messages") setNewMsgCount(0);
      setMobileMenuOpen(false);
    });
  };

  const currentTabLabel = visibleTabs.find((t) => t.key === tab)?.label ?? "Painel";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-8">
        <header className="sticky top-0 z-50 glass-header border-b border-border">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center">
              <BackButton variant="ghost" onClick={() => navigate("/")} />
              {/* Removido botão de menu mobile lateral conforme solicitado */}
            </div>
            <h1 className="text-base md:text-lg font-bold truncate px-2">
              <span className="md:hidden">{currentTabLabel}</span>
              <span className="hidden md:inline">Painel {role === "super_admin" ? "Super Admin" : role === "admin" ? "Admin" : role === "supervisor" ? "Supervisor" : "Corretor"}</span>
            </h1>
            <div className="flex items-center gap-1">
              {canViewContacts && (
                <button
                  onClick={() => switchTab("messages")}
                  className="relative w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Contatos"
                >
                  <Bell className="h-5 w-5" />
                  {newMsgCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold animate-pulse">
                      {newMsgCount}
                    </span>
                  )}
                </button>
              )}
              <button onClick={handleSignOut} className="hidden md:flex w-10 h-10 items-center justify-center text-destructive" aria-label="Sair">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          {!canManageProperties && (
            <div className="px-4 py-2 bg-primary/10 text-primary text-xs text-center font-semibold">
              📋 Modo visualização — você pode consultar os imóveis cadastrados.
            </div>
          )}
        </header>

        <div className="md:flex md:items-start">
          {/* Vertical sidebar (desktop) */}
          <aside className="hidden md:flex md:flex-col sticky top-14 self-start h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r border-border bg-card/40 overflow-y-auto py-3 transform transition-transform duration-300">
            <nav className="flex flex-col gap-1 px-2">
              {visibleTabs.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                const componentMap: Record<string, any> = {
                  dashboard: DashboardTab,
                  bucket: BucketAccessTab,
                  settings: SettingsTab,
                  users: UsersTab,
                  messages: MessagesTab,
                  privacy: PrivacyTab,
                  security: SecurityDiagnosticTab,
                  analytics: AnalyticsTab,
                  visits: VisitsTab,
                  traffic: TrafficTab,
                  performance: PerformanceTab,
                  import: BulkImportTab,
                  seo: SeoAuditTab,
                };

                if (t.key === 'sites' && isSuperAdmin) {
                  return (
                    <button
                      key={t.key}
                      onClick={() => navigate("/network-admin")}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-accent hover:bg-accent/10 border-l-2 border-transparent transition-all"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate flex-1 text-left">{t.label} (Rede)</span>
                      <ArrowRight className="h-3 w-3 opacity-50" />
                    </button>
                  );
                }

                return (
                  <button
                    key={t.key}
                    onClick={() => switchTab(t.key)}
                    onMouseEnter={() => {
                      // Prefetch the component on hover
                      const loader = componentMap[t.key] as any;
                      if (loader && typeof loader === 'function') {
                        try { 
                          // React lazy components have a _payload or similar if we want to be deep, 
                          // but just calling the factory function triggers the dynamic import.
                          const factory = (loader as any)._payload?._result || loader;
                          if (typeof factory === 'function') factory(); 
                        } catch(e) {}
                      }
                    }}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      active
                        ? "bg-primary/15 text-primary border-l-2 border-primary translate-x-1"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border-l-2 border-transparent"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 transition-transform ${active ? "scale-110" : "group-hover:scale-110"}`} />
                    <span className="truncate flex-1 text-left">{t.label}</span>
                    {!!t.badge && t.badge > 0 && (
                      <span className="h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                        {t.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 min-w-0 p-4">

          <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            {tab === "dashboard" && (
              <DashboardTab onNavigate={(t) => switchTab(t)} />
            )}
          </Suspense>

          {tab === "properties" && !editing && !creating && (
            <div className="space-y-4">
              {canManageProperties && (
                <button onClick={startCreate} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gold-gradient text-accent-foreground font-bold uppercase tracking-wider text-sm">
                  <Plus className="h-5 w-5" /> Novo Imóvel
                </button>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por título, código, bairro..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                    aria-label="Limpar busca"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {(() => {
                const q = search.trim().toLowerCase();
                const filtered = q
                  ? properties.filter((p) =>
                      [p.title, p.code, p.neighborhood, p.city, p.type]
                        .filter(Boolean)
                        .some((v) => v.toLowerCase().includes(q))
                    )
                  : properties;
                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-10 text-sm text-muted-foreground">
                      Nenhum imóvel encontrado para "{search}".
                    </div>
                  );
                }
                return (
                  <>
                    {q && (
                      <p className="text-xs text-muted-foreground">
                        {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                      </p>
                    )}
                    {filtered.map((p) => (
                <div key={p.id} className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
                  <img 
                    src={getOptimizedImageUrl(p.images[0], IMAGE_SIZES.THUMBNAIL) || "/placeholder.svg"} 
                    alt="" 
                    className="w-16 h-16 rounded-lg object-cover shrink-0" 
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm truncate">{p.title}</h3>
                      <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">{p.code}</span>
                      {p.status && p.status !== "disponivel" && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          p.status === "reservado" ? "bg-yellow-500/20 text-yellow-700" : "bg-red-500/20 text-red-700"
                        }`}>
                          {p.status === "reservado" ? "Reservado" : "Vendido"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs text-accent font-semibold">{formatPriceFull(p.price)}</p>
                      {!!p.previous_price && p.previous_price > p.price && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                          <TrendingDown className="h-3 w-3" /> Baixou
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{p.type}{settings.showLocationOnCard ? ` · ${p.neighborhood}` : ""}</p>
                  </div>
                  {(canManageProperties || canDeleteProperties) && (
                    <div className="flex gap-2">
                      {canManageProperties && !!p.previous_price && p.previous_price > p.price && (
                        <button
                          onClick={async () => {
                            await updateProperty(p.id, { previous_price: 0 } as any);
                            toast.success("Tag de baixa removida!");
                          }}
                          title="Limpar tag de baixa"
                          className="p-2 rounded-lg bg-destructive/10 text-destructive"
                        >
                          <TagIcon className="h-4 w-4" />
                        </button>
                      )}
                      {canManageProperties && (
                        <button onClick={() => startEdit(p)} className="p-2 rounded-lg bg-primary/10 text-primary"><Pencil className="h-4 w-4" /></button>
                      )}
                      {canDeleteProperties && (
                        <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  )}
                </div>
              ))}
                  </>
                );
              })()}
            </div>
          )}

          {(editing || creating) && tab === "properties" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">{creating ? "Novo Imóvel" : "Editar Imóvel"}</h2>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Título</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CEP</label>
                <div className="relative">
                   <input
                    type="text"
                    value={maskCep(cep)}
                    onChange={(e) => fetchCep(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {cepLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />}
                </div>
              </div>
              {[
                { label: "Endereço", key: "address", type: "text" },
                { label: "Bairro", key: "neighborhood", type: "text" },
                { label: "Cidade", key: "city", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Preço (R$)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.price ? `R$ ${maskCurrency(form.price)}` : ""}
                  onChange={(e) => setForm({ ...form, price: parseCurrency(e.target.value) })}
                  placeholder="R$ 0"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {[
                { label: "Área (m²)", key: "area", type: "number" },
                { label: "Quartos", key: "bedrooms", type: "number" },
                { label: "Suítes", key: "suites", type: "number" },
                { label: "Banheiros", key: "bathrooms", type: "number" },
                { label: "Vagas", key: "parking", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card text-sm"
                >
                  {[
                    { value: "disponivel", label: "Disponível" },
                    { value: "reservado", label: "Reservado" },
                    { value: "vendido", label: "Vendido" },
                  ].map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Categoria</label>
                  <button
                    type="button"
                    onClick={() => {
                      const name = window.prompt("Nome da nova categoria:")?.trim();
                      if (!name) return;
                      if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
                        toast.error("Categoria já existe");
                        return;
                      }
                      setCategories((prev) => [...prev, name]);
                      setForm((prev) => ({ ...prev, category: name }));
                      toast.success(`Categoria "${name}" adicionada`);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                    title="Adicionar nova categoria"
                  >
                    <Plus className="h-3 w-3" /> Nova
                  </button>
                </div>
                <div className="flex gap-2">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {!DEFAULT_CATEGORIES.includes(form.category) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!window.confirm(`Remover categoria "${form.category}"?`)) return;
                        setCategories((prev) => prev.filter((c) => c !== form.category));
                        setForm((prev) => ({ ...prev, category: DEFAULT_CATEGORIES[0] }));
                      }}
                      className="px-2 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
                      title="Remover categoria selecionada"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card text-sm"
                >
                  {["Casa", "Apartamento", "Cobertura", "Terreno", "Comercial"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Descrição</label>
                  <button
                    type="button"
                    disabled={generatingSeo}
                    onClick={async () => {
                      setGeneratingSeo(true);
                      try {
                        const { data, error } = await supabase.functions.invoke("seo-generate", {
                          body: {
                            title: form.title,
                            type: form.type,
                            bedrooms: form.bedrooms,
                            suites: form.suites,
                            bathrooms: form.bathrooms,
                            parking: form.parking,
                            area: form.area,
                            neighborhood: form.neighborhood,
                            city: form.city,
                            amenities: form.amenities,
                            price: form.price,
                            description: form.description,
                          },
                        });
                        if (error) throw error;
                        if (data?.error) throw new Error(data.error);
                        const newDesc = data?.description || form.description;
                        const newTitle = data?.title || form.title;
                        setForm({ ...form, description: newDesc, title: newTitle });
                        toast.success("Descrição SEO gerada!");
                      } catch (err: any) {
                        toast.error(err?.message || "Erro ao gerar SEO");
                      } finally {
                        setGeneratingSeo(false);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-50"
                  >
                    {generatingSeo ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    {generatingSeo ? "Gerando..." : "Gerar com IA"}
                  </button>
                </div>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={6}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Amenidades</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {settings.availableAmenities.map((amenity) => {
                    const selected = form.amenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            amenities: selected
                              ? form.amenities.filter((a) => a !== amenity)
                              : [...form.amenities, amenity],
                          })
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {amenity}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  placeholder="Adicionar outra amenidade e pressione Enter"
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val && !form.amenities.includes(val)) {
                        setForm({ ...form, amenities: [...form.amenities, val] });
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
              </div>
              <ImageUpload
                images={form.images}
                onChange={(imgs) => setForm({ ...form, images: imgs })}
              />
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tour Virtual 360° (URL YouTube/Matterport)</label>
                <input type="url" value={(form as any).video_tour_url || ""} onChange={(e) => setForm({ ...form, video_tour_url: e.target.value } as any)} placeholder="https://youtube.com/watch?v=..." className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.exclusive} onChange={(e) => setForm({ ...form, exclusive: e.target.checked })} className="rounded border-border" />
                  Exclusivo
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded border-border" />
                  Destaque
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="flex-1 py-3 rounded-xl gold-gradient text-accent-foreground font-bold uppercase tracking-wider text-sm">Salvar</button>
                <button onClick={() => { setEditing(null); setCreating(false); }} className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-bold uppercase tracking-wider text-sm">Cancelar</button>
              </div>
            </div>
          )}

          {tab === "settings" && canManageSettings && (
            <SettingsTab settings={settings} updateSettings={updateSettings} />
          )}

          <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            {tab === "privacy" && canManagePrivacy && (
              <PrivacyTab settings={settings} updateSettings={updateSettings} />
            )}

            {tab === "bucket" && canManageBucket && (
              <BucketAccessTab settings={settings} updateSettings={updateSettings} />
            )}

            {tab === "users" && canManageUsers && (
              <UsersTab />
            )}

            {tab === "settings" && canManageSettings && (
              <SettingsTab settings={settings} updateSettings={updateSettings} />
            )}

            {tab === "messages" && canViewContacts && (
              <MessagesTab onNewMessage={() => { if (tab !== "messages") setNewMsgCount((c) => c + 1); }} />
            )}

            {tab === "analytics" && canViewAnalytics && (
              <AnalyticsTab />
            )}

            {tab === "visits" && canViewVisits && (
              <VisitsTab />
            )}

            {tab === "traffic" && canViewTraffic && (
              <TrafficTab />
            )}

            {tab === "seo" && canManageSeo && (
              <SeoAuditTab />
            )}

            {tab === "import" && canBulkImport && (
              <BulkImportTab />
            )}

            {tab === "performance" && canViewAnalytics && (
              <PerformanceTab />
            )}
          </Suspense>


          {tab === "security" && (
            <Suspense fallback={<div className="p-8 text-center animate-pulse text-muted-foreground italic">Carregando diagnóstico...</div>}>
              <SecurityDiagnosticTab />
            </Suspense>
          )}
          </main>
        </div>



        <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>Tem certeza que deseja remover este imóvel? Esta ação não pode ser desfeita.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
