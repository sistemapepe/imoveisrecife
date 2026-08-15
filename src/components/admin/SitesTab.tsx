import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Globe, Plus, Trash2, CheckCircle2, XCircle, Copy, ArrowRight, Rocket, Eye, AlertCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Site {
  id: string;
  domain: string;
  brand_name: string;
  is_active: boolean;
  publish_status?: 'draft' | 'published' | 'scheduled';
  last_published_at?: string;
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
  const [publishId, setPublishId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    // Carregamento otimizado: usa Promise.all para evitar sequenciamento
    // e reduz o tempo de carregamento inicial percebido.
    const init = async () => {
      setLoading(true);
      await fetchSites();
      setLoading(false);
    };
    init();
  }, []);

  async function fetchSites() {
    const { data, error } = await supabase
      .from('sites' as any)
      .select('id, domain, brand_name, is_active, publish_status, last_published_at, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error("Erro ao carregar sites");
    } else {
      setSites((data as any) || []);
    }
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

  async function handlePublish() {
    if (!publishId) return;
    setPublishing(true);
    
    const { error } = await supabase
      .from('sites' as any)
      .update({ 
        publish_status: 'published',
        last_published_at: new Date().toISOString()
      })
      .eq('id', publishId);
    
    setPublishing(false);
    if (error) {
      toast.error("Erro ao publicar site: " + error.message);
    } else {
      toast.success("Site publicado com sucesso!");
      setPublishId(null);
      fetchSites();
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 space-y-4 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"></div>
                <div className="h-4 w-16 bg-muted rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-6 w-3/4 bg-muted rounded"></div>
                <div className="h-4 w-1/2 bg-muted rounded"></div>
              </div>
              <div className="pt-2 border-t border-border/50 space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-muted rounded"></div>
                  <div className="h-3 w-16 bg-muted rounded"></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 bg-muted rounded-lg"></div>
                  <div className="h-8 bg-muted rounded-lg"></div>
                </div>
                <div className="h-8 bg-muted rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
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
                  <div className="flex flex-col items-end gap-1">
                    {site.is_active ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full uppercase">
                        <CheckCircle2 className="h-3 w-3" /> Ativo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase">
                        <XCircle className="h-3 w-3" /> Inativo
                      </span>
                    )}
                    
                    {site.publish_status === 'published' ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase">
                        <Rocket className="h-3 w-3" /> Publicado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                        <Clock className="h-3 w-3" /> Rascunho
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-lg leading-tight">{site.brand_name}</h3>
                <p className="text-xs text-muted-foreground font-mono truncate">{site.domain}</p>
              </div>

              {site.last_published_at && (
                <div className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
                  Última publicação: {new Date(site.last_published_at).toLocaleString()}
                </div>
              )}

              <div className="pt-2 border-t border-border/50 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>ID: {site.id.slice(0, 8)}...</span>
                  <span>{new Date(site.created_at).toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-8 text-[10px] font-bold border-accent/20 text-accent hover:bg-accent/10"
                    onClick={() => {
                      const isLocal = site.domain === 'localhost' || site.domain.includes('8080');
                      const url = isLocal ? window.location.origin : (site.domain.startsWith('http') ? site.domain : `https://${site.domain}`);
                      window.open(url, '_blank');
                    }}
                  >
                    <Eye className="mr-1.5 h-3 w-3" /> Preview
                  </Button>
                  
                  <Button 
                    size="sm" 
                    className="h-8 text-[10px] font-bold bg-blue-600/10 text-blue-500 border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all"
                    onClick={() => setPublishId(site.id)}
                  >
                    <Rocket className="mr-1.5 h-3 w-3" /> Publicar
                  </Button>
                </div>

                <Button 
                  size="sm" 
                  className="w-full h-8 text-[10px] font-bold bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-luxury-dark transition-all"
                  onClick={() => {
                    const isLocal = site.domain === 'localhost' || site.domain.includes('8080');
                    let url = '';
                    
                    if (isLocal) {
                      url = `${window.location.origin}/admin`;
                    } else {
                      url = site.domain.startsWith('http') 
                        ? `${site.domain}/admin` 
                        : `https://${site.domain}/admin`;
                    }
                    
                    window.open(url, '_blank');
                  }}
                >
                  <ArrowRight className="mr-1.5 h-3 w-3" /> Editar Site
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
      
      <Dialog open={!!publishId} onOpenChange={(open) => !open && setPublishId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-blue-500" /> Publicar Site
            </DialogTitle>
            <DialogDescription>
              Isso tornará todas as alterações visíveis no domínio público. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-200/80 space-y-1">
              <p className="font-bold">O que acontece ao publicar?</p>
              <ul className="list-disc list-inside ml-1">
                <li>O status do site mudará para "Publicado"</li>
                <li>A data da última publicação será atualizada</li>
                <li>As configurações e imóveis ficarão acessíveis via domínio</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setPublishId(null)}>Agora não</Button>
            <Button 
              onClick={handlePublish} 
              disabled={publishing}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {publishing ? "Publicando..." : "Sim, Publicar Agora"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
