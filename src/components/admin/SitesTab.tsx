import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Globe, Plus, Trash2, CheckCircle2, XCircle, Copy, ArrowRight } from "lucide-react";
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
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState(false);

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
      setSites((data as any) || []);
    }
    setLoading(false);
  }

  async function handleCreate() {
    if (!newDomain || !newBrandName) {
      toast.error("Preencha todos os campos");
      return;
    }

    const mainSite = sites.find(s => s.domain === 'localhost' || s.brand_name.toLowerCase().includes('imoveis recife'));

    if (mainSite) {
      setCreating(true);
      const { data, error } = await supabase.rpc('duplicate_site', {
        source_site_id: mainSite.id,
        new_domain: newDomain,
        new_brand_name: newBrandName
      });
      
      setCreating(false);
      if (error) {
        toast.error("Erro ao criar site baseado no original: " + error.message);
      } else {
        toast.success("Novo site criado com sucesso baseado no original!");
        setShowCreate(false);
        setNewDomain("");
        setNewBrandName("");
        setTimeout(() => fetchSites(), 500);
      }
    } else {
      // Fallback para criação vazia caso não ache o original
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
        toast.success("Site criado com sucesso (vazio)!");
        setShowCreate(false);
        setNewDomain("");
        setNewBrandName("");
        fetchSites();
      }
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

  async function handleDuplicate() {
    if (!duplicateId || !newDomain || !newBrandName) {
      toast.error("Preencha todos os campos");
      return;
    }
    setDuplicating(true);
    const { data, error } = await supabase.rpc('duplicate_site', {
      source_site_id: duplicateId,
      new_domain: newDomain,
      new_brand_name: newBrandName
    });

    setDuplicating(false);
    if (error) {
      toast.error("Erro ao duplicar site: " + error.message);
    } else {
      toast.success("Site duplicado com sucesso! Você já tem permissão para editá-lo.");
      setDuplicateId(null);
      setNewDomain("");
      setNewBrandName("");
      // Pequeno delay para garantir que o banco processou tudo antes de atualizar a lista
      setTimeout(() => fetchSites(), 500);
    }
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
        <div className="flex gap-2">
          <Button
            onClick={() => {
              const mainSite = sites.find(s => s.domain === 'localhost' || s.brand_name.toLowerCase().includes('imoveis recife'));
              if (mainSite) {
                setDuplicateId(mainSite.id);
                setNewBrandName("");
              } else {
                toast.error("Site original não encontrado para duplicação rápida");
              }
            }}
            variant="outline"
            className="flex items-center gap-1.5 border-accent/30 text-accent hover:bg-accent/10 font-bold"
          >
            <Copy className="h-4 w-4" /> Duplicar Principal
          </Button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider"
          >
            <Plus className="h-4 w-4" /> Novo Site (Vazio)
          </button>
        </div>
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
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setDuplicateId(site.id);
                          setNewBrandName(`${site.brand_name} (Cópia)`);
                        }}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                        title="Duplicar Site"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(site.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        title="Excluir Site"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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

              <div className="pt-2 border-t border-border/50 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>ID: {site.id.slice(0, 8)}...</span>
                  <span>{new Date(site.created_at).toLocaleDateString()}</span>
                </div>
                <Button 
                  size="sm" 
                  className="w-full h-8 text-xs font-bold bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-luxury-dark transition-all"
                  onClick={() => {
                    const isLocal = site.domain === 'localhost' || site.domain.includes('8080');
                    let url = '';
                    
                    if (isLocal) {
                      url = `${window.location.origin}/admin`;
                    } else {
                      // Para domínios externos, assume HTTPS e porta padrão, 
                      // a menos que o domínio já contenha um protocolo
                      url = site.domain.startsWith('http') 
                        ? site.domain 
                        : `https://${site.domain}/admin`;
                    }
                    
                    window.open(url, '_blank');
                  }}
                >
                  Editar Site <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
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

      <Dialog open={!!duplicateId} onOpenChange={(open) => {
        if (!open) {
          setDuplicateId(null);
          setNewDomain("");
          setNewBrandName("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicar Site</DialogTitle>
            <DialogDescription>
              Crie uma nova instância baseada nas configurações deste site.
              As configurações visuais e permissões serão copiadas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Novo Domínio</label>
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                placeholder="ex: nova-imobiliaria.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Novo Nome da Marca</label>
              <input
                type="text"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                placeholder="ex: Imobiliária Beta"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDuplicateId(null)}>Cancelar</Button>
            <Button onClick={handleDuplicate} disabled={duplicating}>
              {duplicating ? "Duplicando..." : "Duplicar Agora"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
