import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Globe, Loader2, Plus, Power, PowerOff, Building2, Check, Trash2, Copy, RefreshCw } from "lucide-react";

interface NetworkSite {
  id: string;
  domain: string;
  brand_name: string;
  is_active: boolean;
  created_at: string;
  properties_count: number;
  messages_count: number;
  users_count: number;
  views_count: number;
  hostnames: string[];
}

interface DnsRecord {
  type: string;
  name: string;
  value: string;
}

interface DomainStatusResponse {
  domains?: { hostname: string; state: string }[];
  records?: DnsRecord[];
}

const STATUS_LABEL: Record<string, { text: string; className: string; dot: string; pulse?: boolean }> = {
  no_ar: {
    text: "No ar",
    className: "bg-emerald-500/15 text-emerald-600",
    dot: "bg-emerald-500 shadow-[0_0_8px_2px_hsl(152_76%_45%/0.7)]",
    pulse: true,
  },
  aguardando_dns: {
    text: "Aguardando DNS",
    className: "bg-amber-500/15 text-amber-600",
    dot: "bg-amber-500 shadow-[0_0_8px_2px_hsl(38_92%_50%/0.6)]",
    pulse: true,
  },
  verificando: {
    text: "Emitindo certificado",
    className: "bg-sky-500/15 text-sky-600",
    dot: "bg-sky-500 shadow-[0_0_8px_2px_hsl(199_89%_48%/0.6)]",
    pulse: true,
  },
  nao_cadastrado: {
    text: "Não conectado",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
  erro: {
    text: "Não verificado",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/40",
  },
};

function StatusDot({ state, size = "sm" }: { state?: string; size?: "sm" | "lg" }) {
  const st = STATUS_LABEL[state ?? "erro"] ?? STATUS_LABEL.erro;
  const dim = size === "lg" ? "h-3 w-3" : "h-2 w-2";
  return (
    <span className="relative inline-flex items-center justify-center" title={st.text}>
      {st.pulse && (
        <span className={`absolute ${dim} rounded-full ${st.dot} opacity-60 animate-ping`} aria-hidden />
      )}
      <span className={`relative ${dim} rounded-full ${st.dot}`} aria-label={st.text} />
    </span>
  );
}


export default function NetworkTab() {
  const { isSuperAdmin } = useAuth();
  const { siteId, hostSite, overrideSiteId, setOverrideSiteId } = useTenant();
  const [sites, setSites] = useState<NetworkSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ brand_name: "", domain: "", source: "" });
  const [domainDialog, setDomainDialog] = useState<NetworkSite | null>(null);
  const [newHostname, setNewHostname] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [domainStatus, setDomainStatus] = useState<Record<string, string>>({});
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("network_sites_overview");
    if (error) {
      toast.error("Erro ao carregar a rede: " + error.message);
    } else {
      setSites((data ?? []) as unknown as NetworkSite[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isSuperAdmin) load();
  }, [isSuperAdmin, load]);

  if (!isSuperAdmin) {
    return (
      <div className="rounded-xl border border-border bg-card/40 p-6 text-sm text-muted-foreground">
        Somente o Super Admin pode gerenciar a rede de sites.
      </div>
    );
  }

  const handleCreate = async () => {
    const brand = form.brand_name.trim();
    const domain = form.domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!brand || !domain) {
      toast.error("Informe o nome da imobiliária e o domínio.");
      return;
    }
    setSaving(true);
    const source = form.source || sites[0]?.id;
    const { data, error } = await supabase.rpc("duplicate_site", {
      source_site_id: source,
      new_domain: domain,
      new_brand_name: brand,
    });
    if (error) {
      toast.error("Erro ao criar site: " + error.message);
      setSaving(false);
      return;
    }
    const newId = data as unknown as string;
    await supabase.rpc("network_add_domain", { p_site_id: newId, p_hostname: domain });
    toast.success("Site criado! Conecte o domínio nas configurações de publicação.");
    setCreating(false);
    setForm({ brand_name: "", domain: "", source: "" });
    setSaving(false);
    load();
  };

  const toggleActive = async (site: NetworkSite) => {
    const { error } = await supabase.rpc("network_set_site_active", {
      p_site_id: site.id,
      p_active: !site.is_active,
    });
    if (error) {
      toast.error("Erro: " + error.message);
      return;
    }
    toast.success(site.is_active ? "Site desativado" : "Site ativado");
    load();
  };

  const callDomainFn = async (payload: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("manage-domain", { body: payload });
    if (error) {
      const msg = (data as { message?: string } | null)?.message ?? error.message;
      throw new Error(msg);
    }
    if ((data as { error?: string } | null)?.error) {
      throw new Error((data as { message?: string }).message ?? "Falha na operação");
    }
    return data as DomainStatusResponse;
  };

  const checkStatus = async (hostname: string) => {
    try {
      const data = await callDomainFn({ action: "status", hostname });
      setDomainStatus((prev) => {
        const next = { ...prev };
        (data.domains ?? []).forEach((d) => {
          next[d.hostname] = d.state;
        });
        return next;
      });
      setDnsRecords(data.records ?? []);
    } catch (e) {
      setDomainStatus((prev) => ({ ...prev, [hostname]: "erro" }));
    }
  };

  const addDomain = async () => {
    if (!domainDialog || !newHostname.trim()) return;
    setConnecting(true);
    try {
      const host = newHostname.trim();
      await callDomainFn({ action: "add", site_id: domainDialog.id, hostname: host });
      toast.success("Endereço conectado! Agora é só apontar o DNS.");
      setNewHostname("");
      await load();
      await checkStatus(host);
      setDomainDialog((prev) =>
        prev
          ? {
              ...prev,
              hostnames: Array.from(
                new Set([...(prev.hostnames ?? []), host.replace(/^www\./, ""), `www.${host.replace(/^www\./, "")}`]),
              ),
            }
          : prev,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao conectar o endereço");
    } finally {
      setConnecting(false);
    }
  };

  const removeDomain = async (hostname: string) => {
    try {
      await callDomainFn({ action: "remove", site_id: domainDialog?.id, hostname });
      toast.success("Domínio removido");
      setDomainDialog(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao remover");
    }
  };

  const manage = (site: NetworkSite) => {
    if (site.id === hostSite?.siteId) {
      setOverrideSiteId(null);
    } else {
      setOverrideSiteId(site.id);
    }
    toast.success(`Gerenciando: ${site.brand_name}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Rede de Sites
          </h2>
          <p className="text-xs text-muted-foreground">
            Cada site tem sua marca, seus imóveis e seu domínio. As melhorias do sistema valem para todos.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Novo site
        </Button>
      </div>

      {overrideSiteId && (
        <div className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-xs flex items-center justify-between gap-2">
          <span>
            Você está gerenciando outro site da rede:{" "}
            <strong>{sites.find((s) => s.id === overrideSiteId)?.brand_name ?? overrideSiteId}</strong>
          </span>
          <Button size="sm" variant="ghost" onClick={() => setOverrideSiteId(null)}>
            Voltar ao site deste domínio
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-6">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando rede...
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {sites.map((site) => {
            const active = site.id === siteId;
            return (
              <div
                key={site.id}
                className={`rounded-xl border p-4 bg-card/40 space-y-3 ${
                  active ? "border-primary" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{site.brand_name}</p>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <Globe className="h-3 w-3" /> {site.domain}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      site.is_active
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {site.is_active ? "ATIVO" : "INATIVO"}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    ["Imóveis", site.properties_count],
                    ["Contatos", site.messages_count],
                    ["Equipe", site.users_count],
                    ["Visitas", site.views_count],
                  ].map(([label, value]) => (
                    <div key={label as string} className="rounded-lg bg-muted/40 py-2">
                      <p className="text-sm font-bold">{Number(value)}</p>
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>

                {site.hostnames?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {site.hostnames.map((h) => (
                      <span
                        key={h}
                        className="text-[10px] px-2 py-0.5 rounded bg-muted/60 text-muted-foreground inline-flex items-center gap-1.5"
                        title={(STATUS_LABEL[domainStatus[h] ?? "erro"] ?? STATUS_LABEL.erro).text}
                      >
                        <StatusDot state={domainStatus[h]} />
                        {h}
                      </span>
                    ))}
                  </div>
                )}


                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant={active ? "secondary" : "default"} onClick={() => manage(site)}>
                    {active ? <Check className="h-4 w-4 mr-1" /> : null}
                    {active ? "Gerenciando" : "Gerenciar este site"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                      setDomainDialog(site);
                      (site.hostnames ?? []).slice(0, 4).forEach((h) => checkStatus(h));
                    }}>
                    <Globe className="h-4 w-4 mr-1" /> Domínios
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(site)}>
                    {site.is_active ? <PowerOff className="h-4 w-4 mr-1" /> : <Power className="h-4 w-4 mr-1" />}
                    {site.is_active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo site na rede</DialogTitle>
            <DialogDescription>
              O site nasce com a identidade visual copiada de um site existente e começa sem imóveis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome da imobiliária</Label>
              <Input
                value={form.brand_name}
                onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                placeholder="Ex: Imobiliária Boa Viagem"
              />
            </div>
            <div>
              <Label>Domínio principal</Label>
              <Input
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                placeholder="www.imobiliariaboaviagem.com.br"
              />
            </div>
            <div>
              <Label>Copiar aparência de</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              >
                <option value="">{sites[0]?.brand_name ?? "Site padrão"}</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.brand_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Criar site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!domainDialog} onOpenChange={(o) => !o && setDomainDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Domínios de {domainDialog?.brand_name}</DialogTitle>
            <DialogDescription>
              Digite o endereço e clique em Conectar. Depois é só o cliente colar os registros abaixo
              no painel do provedor dele — o certificado https sai automático.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {domainDialog?.hostnames?.map((h) => {
              const st = STATUS_LABEL[domainStatus[h] ?? "erro"];
              return (
                <div key={h} className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm truncate">{h}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.className}`}>
                      {st.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" title="Verificar" onClick={() => checkStatus(h)}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard?.writeText(h);
                        toast.success("Copiado");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => removeDomain(h)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {dnsRecords.length > 0 && (
              <div className="rounded-lg border border-border p-3 space-y-2">
                <p className="text-xs font-semibold">Registros para o provedor do cliente</p>
                {dnsRecords.map((r) => (
                  <div key={`${r.type}-${r.name}`} className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono truncate">
                      {r.type} · {r.name} · {r.value}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard?.writeText(r.value);
                        toast.success("Valor copiado");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Input
                value={newHostname}
                onChange={(e) => setNewHostname(e.target.value)}
                placeholder="novodominio.com.br"
              />
              <Button onClick={addDomain} disabled={connecting}>
                {connecting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Conectar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
