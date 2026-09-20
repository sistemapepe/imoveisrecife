import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Globe,
  Loader2,
  Copy,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  DOMAIN_TARGET_IP,
  DOMAIN_TXT_NAME,
  PROVIDER_HELP,
  VERDICT_LABEL,
  checkDomainDns,
  isValidHostname,
  normalizeHostname,
  type DomainCheck,
} from "@/lib/domain-dns";

interface SiteDomain {
  hostname: string;
  is_primary: boolean;
  status: string | null;
}

function copy(text: string) {
  navigator.clipboard?.writeText(text);
  toast.success("Copiado");
}

export default function DomainTab() {
  const { isAdmin, canManageSettings } = useAuth();
  const { siteId, hostSite } = useTenant();
  const [domains, setDomains] = useState<SiteDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [input, setInput] = useState("");
  const [check, setCheck] = useState<DomainCheck | null>(null);

  const allowed = isAdmin || canManageSettings;

  const load = useCallback(async () => {
    if (!siteId) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("site_list_domains", { p_site_id: siteId });
    if (error) toast.error("Erro ao carregar domínios: " + error.message);
    else setDomains((data ?? []) as unknown as SiteDomain[]);
    setLoading(false);
  }, [siteId]);

  useEffect(() => {
    if (allowed) load();
  }, [allowed, load]);

  const primary = domains.find((d) => d.is_primary)?.hostname ?? domains[0]?.hostname ?? null;

  const runCheck = useCallback(async (host: string) => {
    setChecking(true);
    try {
      setCheck(await checkDomainDns(host));
    } catch (e) {
      toast.error("Não foi possível verificar o DNS agora. Tente novamente.");
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (primary) runCheck(primary);
  }, [primary, runCheck]);

  if (!allowed) {
    return (
      <div className="rounded-xl border border-border bg-card/40 p-6 text-sm text-muted-foreground">
        Você não tem permissão para configurar o domínio deste site.
      </div>
    );
  }

  const save = async () => {
    const host = normalizeHostname(input);
    if (!isValidHostname(host)) {
      toast.error("Informe um endereço válido, por exemplo: www.suaimobiliaria.com.br");
      return;
    }
    if (!siteId) return;
    setSaving(true);
    const { error } = await supabase.rpc("site_set_custom_domain", { p_site_id: siteId, p_hostname: host });
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    toast.success("Endereço salvo. Agora crie os registros no seu provedor.");
    setInput("");
    load();
    runCheck(host);
  };

  const remove = async (hostname: string) => {
    if (!siteId) return;
    const { error } = await supabase.rpc("site_remove_custom_domain", {
      p_site_id: siteId,
      p_hostname: hostname,
    });
    if (error) {
      toast.error("Erro: " + error.message);
      return;
    }
    toast.success("Endereço removido");
    load();
  };

  const steps = [
    { label: "Endereço cadastrado", done: !!primary },
    { label: "DNS apontado", done: !!check?.pointed },
    { label: "Domínio conectado na publicação", done: !!check?.https_ok },
    { label: "No ar com segurança (https)", done: !!check?.https_ok && !!check?.pointed },
  ];

  const records = [
    { type: "A", name: "@", value: DOMAIN_TARGET_IP, note: "endereço raiz (sem www)" },
    { type: "A", name: "www", value: DOMAIN_TARGET_IP, note: "endereço com www" },
    {
      type: "TXT",
      name: DOMAIN_TXT_NAME,
      value: "lovable_verify=…",
      note: "o código exato aparece nas configurações de publicação do projeto",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" /> Domínio Próprio
        </h2>
        <p className="text-xs text-muted-foreground">
          Cadastre o endereço da sua imobiliária, copie os registros abaixo no seu provedor e confira aqui mesmo
          se já está funcionando.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card/40 p-4 space-y-3">
        <Label>Endereço do site</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="www.suaimobiliaria.com.br"
            onKeyDown={(e) => e.key === "Enter" && save()}
          />
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Salvar
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Salvamos automaticamente a versão com e sem <strong>www</strong>.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        ) : domains.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum endereço cadastrado. Enquanto isso o site continua no endereço atual
            {hostSite?.domain ? ` (${hostSite.domain})` : ""}.
          </p>
        ) : (
          <div className="space-y-2">
            {domains.map((d) => (
              <div
                key={d.hostname}
                className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2"
              >
                <span className="text-sm truncate">
                  {d.hostname}
                  {d.is_primary && (
                    <span className="ml-2 text-[10px] font-bold text-primary uppercase">principal</span>
                  )}
                </span>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => runCheck(d.hostname)}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => copy(d.hostname)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(d.hostname)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card/40 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm">Situação atual</h3>
          <Button size="sm" variant="outline" onClick={() => primary && runCheck(primary)} disabled={!primary || checking}>
            {checking ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            Verificar agora
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.label}
              className={`rounded-lg border px-3 py-2 text-xs flex items-center gap-2 ${
                s.done ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-muted/30 text-muted-foreground"
              }`}
            >
              {s.done ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <Clock className="h-4 w-4 shrink-0" />}
              {s.label}
            </div>
          ))}
        </div>

        {check && (
          <div className="space-y-2">
            {check.records.map((r) => (
              <div key={`${r.type}-${r.name}`} className="rounded-lg bg-muted/40 px-3 py-2 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  {r.verdict === "ok" ? (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                  )}
                  <span className="font-semibold">
                    {r.type} {r.name}
                  </span>
                  <span className="text-muted-foreground">— {VERDICT_LABEL[r.verdict]}</span>
                </div>
                {r.found.length > 0 && (
                  <p className="text-muted-foreground truncate">Encontrado: {r.found.join(", ")}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card/40 p-4 space-y-3">
        <h3 className="font-semibold text-sm">Registros para criar no seu provedor</h3>
        <div className="space-y-2">
          {records.map((r) => (
            <div
              key={`${r.type}-${r.name}`}
              className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs"
            >
              <span className="font-bold w-10">{r.type}</span>
              <span className="font-mono">{r.name}</span>
              <span className="font-mono text-primary">{r.value}</span>
              <span className="text-muted-foreground">{r.note}</span>
              <Button size="icon" variant="ghost" className="ml-auto" onClick={() => copy(r.value)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {PROVIDER_HELP.map((p) => (
            <div key={p.name} className="rounded-lg border border-border/60 px-3 py-2 text-xs">
              <p className="font-semibold mb-1">{p.name}</p>
              <p className="text-muted-foreground">{p.steps}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs space-y-1">
        <p className="font-semibold flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" /> Último passo (feito uma única vez por domínio)
        </p>
        <p className="text-muted-foreground">
          Depois que os registros acima estiverem corretos, o mesmo endereço precisa ser conectado nas
          configurações de publicação do projeto para o certificado de segurança ser emitido. Esse passo depende
          do dono da conta e não pode ser feito por aqui.
        </p>
      </div>
    </div>
  );
}
