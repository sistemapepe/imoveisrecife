import { useState, useEffect, useCallback } from "react";
import SettingsTab from "@/components/admin/SettingsTab";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Settings, LayoutDashboard, LogOut, Loader2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { useProperties, Property, formatPriceFull } from "@/contexts/PropertyContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Tab = "properties" | "settings";

const maskCep = (v: string) => v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9);

const maskCurrency = (value: number) => {
  if (!value) return "";
  return value.toLocaleString("pt-BR");
};

const parseCurrency = (v: string): number => {
  const clean = v.replace(/\D/g, "");
  return clean ? Number(clean) : 0;
};

const emptyProperty: Omit<Property, "id"> = {
  title: "", address: "", neighborhood: "", city: "São Paulo",
  price: 0, area: 0, suites: 0, bathrooms: 0, parking: 0,
  type: "Casa", description: "", amenities: [],
  images: [], exclusive: false, featured: false,
};

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { properties, settings, addProperty, updateProperty, deleteProperty, updateSettings } = useProperties();
  const [tab, setTab] = useState<Tab>("properties");
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Property, "id">>(emptyProperty);
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

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!user) return null;

  const startEdit = (p: Property) => {
    setEditing(p.id);
    setCreating(false);
    const { id, ...rest } = p;
    setForm(rest);
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(emptyProperty);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error("Título obrigatório"); return; }
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
            <h1 className="text-lg font-bold">Painel Admin</h1>
            <button onClick={handleSignOut} className="w-10 h-10 flex items-center justify-center text-destructive">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          {!isAdmin && (
            <div className="px-4 py-2 bg-destructive/10 text-destructive text-xs text-center font-semibold">
              ⚠️ Você não tem permissão de admin. Operações de escrita serão bloqueadas.
            </div>
          )}
          <div className="flex border-b border-border">
            <button
              onClick={() => { setTab("properties"); setEditing(null); setCreating(false); }}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${tab === "properties" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
            >
              <LayoutDashboard className="h-4 w-4" /> Imóveis
            </button>
            <button
              onClick={() => { setTab("settings"); setEditing(null); setCreating(false); }}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${tab === "settings" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
            >
              <Settings className="h-4 w-4" /> Config
            </button>
          </div>
        </header>

        <main className="p-4">
          {tab === "properties" && !editing && !creating && (
            <div className="space-y-4">
              <button onClick={startCreate} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gold-gradient text-accent-foreground font-bold uppercase tracking-wider text-sm">
                <Plus className="h-5 w-5" /> Novo Imóvel
              </button>
              {properties.map((p) => (
                <div key={p.id} className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
                  <img src={p.images[0] || "/placeholder.svg"} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate">{p.title}</h3>
                    <p className="text-xs text-accent font-semibold">{formatPriceFull(p.price)}</p>
                    <p className="text-xs text-muted-foreground">{p.type} · {p.neighborhood}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)} className="p-2 rounded-lg bg-primary/10 text-primary"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
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

          {tab === "settings" && (
            <SettingsTab settings={settings} updateSettings={updateSettings} />
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
