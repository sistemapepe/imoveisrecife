import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Globe, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Site {
  id: string;
  domain: string;
  brand_name: string;
  is_active: boolean;
  created_at: string;
}

export default function SitesTab() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchSites();
  }, []);

  async function fetchSites() {
    setLoading(true);
    const { data, error } = await supabase
      .from('sites' as any)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error("Erro ao carregar sites");
    } else {
      setSites(data || []);
    }
    setLoading(false);
  }

  async function handleCreate() {
    if (!newDomain || !newBrandName) {
      toast.error("Preencha todos os campos");
      return;
    }
    setCreating(true);
    const { error } = await supabase
      .from('sites' as any)
      .insert({
        domain: newDomain,
        brand_name: newBrandName
      });
    
    setCreating(false);
    if (error) {
      toast.error("Erro ao criar site: " + error.message);
    } else {
      toast.success("Site criado com sucesso!");
      setShowCreate(false);
      setNewDomain("");
      setNewBrandName("");
      fetchSites();
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase
      .from('sites' as any)
      .delete()
      .eq('id', deleteId);
    
    if (error) {
      toast.error("Erro ao excluir site");
    } else {
      toast.success("Site excluído");
      fetchSites();
    }
    setDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" /> Gerenciar Sites (Domínios)
          </h2>
          <p className="text-sm text-muted-foreground">Crie e gerencie múltiplas instâncias da plataforma.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider"
        >
          <Plus className="h-4 w-4" /> Novo Site
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center animate-pulse">Carregando sites...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map(site => (
            <div key={site.id} className="bg-card rounded-xl border border-border p-5 space-y-4 hover:border-primary/30 transition-colors group">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div className="flex gap-1">
                  {site.domain !== 'localhost' && (
                    <button
                      onClick={() => setDeleteId(site.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  {site.is_active ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full uppercase">
                      <CheckCircle2 className="h-3 w-3" /> Ativo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase">
                      <XCircle className="h-3 w-3" /> Inativo
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-lg">{site.brand_name}</h3>
                <p className="text-sm text-muted-foreground font-mono">{site.domain}</p>
              </div>

              <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex justify-between">
                <span>ID: {site.id.slice(0, 8)}...</span>
                <span>{new Date(site.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Site</DialogTitle>
            <DialogDescription>Configure um novo domínio para a plataforma.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Domínio</label>
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                placeholder="ex: imobiliaria-a.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nome da Marca</label>
              <input
                type="text"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                placeholder="ex: Imobiliária Alpha"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Criando..." : "Criar Site"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Site</DialogTitle>
            <DialogDescription>Tem certeza? Todos os dados vinculados a este domínio serão afetados.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Confirmar Exclusão</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
