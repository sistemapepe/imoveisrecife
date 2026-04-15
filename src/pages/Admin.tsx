import { useState, useEffect, useCallback } from "react";
import SettingsTab from "@/components/admin/SettingsTab";
import UsersTab from "@/components/admin/UsersTab";
import MessagesTab from "@/components/admin/MessagesTab";
import PrivacyTab from "@/components/admin/PrivacyTab";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Settings, LayoutDashboard, LogOut, Loader2, Users, MessageSquare, Bell, FileText } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { useProperties, Property, formatPriceFull } from "@/contexts/PropertyContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PageTransition from "@/components/PageTransition";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Tab = "properties" | "settings" | "users" | "messages" | "privacy";

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
  const { user, isAdmin, role, loading: authLoading, signOut, canManageProperties, canDeleteProperties, canManageSettings, canManageUsers, canViewContacts } = useAuth();
  const { properties, settings, addProperty, updateProperty, deleteProperty, updateSettings } = useProperties();
  const [tab, setTab] = useState<Tab>("properties");
  const [newMsgCount, setNewMsgCount] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Property, "id" | "code">>(emptyProperty);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [cep, setCep] = useState("");
  const [cepLoading, setCepLoading] = useState(false);

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

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Realtime notification for new contact messages
  useEffect(() => {
    if (!canViewContacts) return;
    const channel = supabase
      .channel("admin_msg_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contact_messages" },
        () => {
          if (tab !== "messages") {
            setNewMsgCount((c) => c + 1);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [canViewContacts, tab]);

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

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-8">
        <header className="sticky top-0 z-50 glass-header border-b border-border">
          <div className="flex items-center justify-between px-4 h-14">
            <button onClick={() => navigate("/")} className="w-10 h-10 flex items-center justify-center">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold">Painel {role === "admin" ? "Admin" : role === "supervisor" ? "Supervisor" : "Corretor"}</h1>
            <div className="flex items-center gap-1">
              {canViewContacts && (
                <button
                  onClick={() => { setTab("messages"); setEditing(null); setCreating(false); setNewMsgCount(0); }}
                  className="relative w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {newMsgCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold animate-pulse">
                      {newMsgCount}
                    </span>
                  )}
                </button>
              )}
              <button onClick={handleSignOut} className="w-10 h-10 flex items-center justify-center text-destructive">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          {!canManageProperties && (
            <div className="px-4 py-2 bg-primary/10 text-primary text-xs text-center font-semibold">
              📋 Modo visualização — você pode consultar os imóveis cadastrados.
            </div>
          )}
          <div className="flex border-b border-border">
            <button
              onClick={() => { setTab("properties"); setEditing(null); setCreating(false); }}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${tab === "properties" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
            >
              <LayoutDashboard className="h-4 w-4" /> Imóveis
            </button>
            {canViewContacts && (
              <button
                onClick={() => { setTab("messages"); setEditing(null); setCreating(false); }}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${tab === "messages" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
              >
                <MessageSquare className="h-4 w-4" /> Contatos
              </button>
            )}
            {canManageUsers && (
              <button
                onClick={() => { setTab("users"); setEditing(null); setCreating(false); }}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${tab === "users" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
              >
                <Users className="h-4 w-4" /> Equipe
              </button>
            )}
            {canManageSettings && (
              <button
                onClick={() => { setTab("settings"); setEditing(null); setCreating(false); }}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${tab === "settings" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
              >
                <Settings className="h-4 w-4" /> Config
              </button>
            )}
            {canManageSettings && (
              <button
                onClick={() => { setTab("privacy"); setEditing(null); setCreating(false); }}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${tab === "privacy" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
              >
                <FileText className="h-4 w-4" /> LGPD
              </button>
            )}
          </div>
        </header>

        <main className="p-4">
          {tab === "properties" && !editing && !creating && (
            <div className="space-y-4">
              {canManageProperties && (
                <button onClick={startCreate} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gold-gradient text-accent-foreground font-bold uppercase tracking-wider text-sm">
                  <Plus className="h-5 w-5" /> Novo Imóvel
                </button>
              )}
              {properties.map((p) => (
                <div key={p.id} className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
                  <img src={p.images[0] || "/placeholder.svg"} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
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
                    <p className="text-xs text-accent font-semibold">{formatPriceFull(p.price)}</p>
                    <p className="text-xs text-muted-foreground">{p.type} · {p.neighborhood}</p>
                  </div>
                  {(canManageProperties || canDeleteProperties) && (
                    <div className="flex gap-2">
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
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Categoria</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card text-sm"
                >
                  {["Venda", "Locação", "Temporada", "Repasse"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
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
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
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

          {tab === "privacy" && canManageSettings && (
            <PrivacyTab settings={settings} updateSettings={updateSettings} />
          )}

          {tab === "users" && canManageUsers && (
            <UsersTab />
          )}

          {tab === "messages" && (
            <MessagesTab onNewMessage={() => { if (tab !== "messages") setNewMsgCount((c) => c + 1); }} />
          )}
        </main>

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
