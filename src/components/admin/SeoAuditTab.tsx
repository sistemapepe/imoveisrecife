import { useMemo, useState } from "react";
import { useProperties, Property } from "@/contexts/PropertyContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, AlertTriangle, ImageOff, FileX, Tag, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type IssueKey = "no_description" | "short_description" | "no_images" | "short_title" | "no_amenities";

interface AuditedProperty extends Property {
  issues: IssueKey[];
}

const ISSUE_LABELS: Record<IssueKey, { label: string; icon: typeof AlertTriangle; color: string }> = {
  no_description: { label: "Sem descrição", icon: FileX, color: "text-destructive" },
  short_description: { label: "Descrição curta (<120 chars)", icon: AlertTriangle, color: "text-yellow-600" },
  no_images: { label: "Sem imagens", icon: ImageOff, color: "text-destructive" },
  short_title: { label: "Título curto (<25 chars)", icon: AlertTriangle, color: "text-yellow-600" },
  no_amenities: { label: "Sem amenidades", icon: Tag, color: "text-yellow-600" },
};

function audit(p: Property): IssueKey[] {
  const issues: IssueKey[] = [];
  const desc = (p.description || "").trim();
  if (!desc) issues.push("no_description");
  else if (desc.length < 120) issues.push("short_description");
  // Local fallback images may be present; only flag if truly empty in DB-backed array
  if (!p.images || p.images.length === 0) issues.push("no_images");
  if (!p.title || p.title.trim().length < 25) issues.push("short_title");
  if (!p.amenities || p.amenities.length === 0) issues.push("no_amenities");
  return issues;
}

export default function SeoAuditTab() {
  const { properties, updateProperty, refreshProperties } = useProperties();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [filter, setFilter] = useState<"all" | IssueKey>("all");

  const audited: AuditedProperty[] = useMemo(
    () => properties.map((p) => ({ ...p, issues: audit(p) })),
    [properties]
  );

  const withIssues = audited.filter((p) => p.issues.length > 0);

  const counts = useMemo(() => {
    const c: Record<IssueKey, number> = {
      no_description: 0,
      short_description: 0,
      no_images: 0,
      short_title: 0,
      no_amenities: 0,
    };
    audited.forEach((p) => p.issues.forEach((i) => (c[i] += 1)));
    return c;
  }, [audited]);

  const filtered = useMemo(() => {
    if (filter === "all") return withIssues;
    return withIssues.filter((p) => p.issues.includes(filter));
  }, [withIssues, filter]);

  const generateOne = async (p: Property) => {
    const { data, error } = await supabase.functions.invoke("seo-generate", {
      body: {
        title: p.title,
        type: p.type,
        bedrooms: p.bedrooms,
        suites: p.suites,
        bathrooms: p.bathrooms,
        parking: p.parking,
        area: p.area,
        neighborhood: p.neighborhood,
        city: p.city,
        amenities: p.amenities,
        price: p.price,
        description: p.description,
      },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    const updates: Partial<Property> = {};
    if (data.description) updates.description = data.description;
    if (data.title && (!p.title || p.title.length < 25)) updates.title = data.title;
    if (Object.keys(updates).length > 0) {
      await updateProperty(p.id, updates);
    }
  };

  const handleGenerateOne = async (p: Property) => {
    const t = toast.loading(`Gerando SEO: ${p.title || p.code}...`);
    try {
      await generateOne(p);
      toast.success("Imóvel atualizado!", { id: t });
    } catch (e: any) {
      toast.error(e?.message || "Falha ao gerar", { id: t });
    }
  };

  const handleBulkGenerate = async () => {
    const targets = filtered.filter((p) =>
      p.issues.some((i) => i === "no_description" || i === "short_description")
    );
    if (targets.length === 0) {
      toast.info("Nenhum imóvel com descrição faltante na seleção atual.");
      return;
    }
    if (!confirm(`Gerar descrição com IA para ${targets.length} imóveis? Isso pode levar alguns minutos.`)) return;

    setRunning(true);
    setProgress({ done: 0, total: targets.length });
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < targets.length; i++) {
      try {
        await generateOne(targets[i]);
        ok += 1;
      } catch (e) {
        fail += 1;
        console.error("bulk seo error", e);
      }
      setProgress({ done: i + 1, total: targets.length });
      // gentle pacing to avoid 429
      await new Promise((r) => setTimeout(r, 800));
    }
    setRunning(false);
    await refreshProperties();
    toast[fail === 0 ? "success" : "warning"](
      `Concluído: ${ok} ok${fail > 0 ? `, ${fail} falhas` : ""}`
    );
  };

  const totalIssues = withIssues.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif font-bold text-2xl text-accent tracking-[0.2em] uppercase">Auditoria SEO</h2>
          <p className="text-[10px] text-white/40 font-extrabold uppercase tracking-widest mt-2">Identifique lacunas e use IA para preenchê-las.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">Total</CardDescription>
            <CardTitle className="text-2xl">{audited.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">Com problemas</CardDescription>
            <CardTitle className="text-2xl text-destructive">{totalIssues}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">Sem descrição</CardDescription>
            <CardTitle className="text-2xl">{counts.no_description}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">Sem imagens</CardDescription>
            <CardTitle className="text-2xl">{counts.no_images}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">Sem amenidades</CardDescription>
            <CardTitle className="text-2xl">{counts.no_amenities}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-sm">Geração em massa com IA</p>
            <p className="text-xs text-muted-foreground">
              Gera descrição SEO para todos os imóveis filtrados que estão sem descrição ou com texto curto.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refreshProperties()} disabled={running}>
              <RefreshCw className="h-4 w-4 mr-1" /> Recarregar
            </Button>
            <Button onClick={handleBulkGenerate} disabled={running || totalIssues === 0}>
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {progress.done}/{progress.total}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" /> Gerar com IA em massa
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="all">Todos ({totalIssues})</TabsTrigger>
          <TabsTrigger value="no_description">Sem descrição ({counts.no_description})</TabsTrigger>
          <TabsTrigger value="short_description">Descrição curta ({counts.short_description})</TabsTrigger>
          <TabsTrigger value="no_images">Sem imagens ({counts.no_images})</TabsTrigger>
          <TabsTrigger value="short_title">Título curto ({counts.short_title})</TabsTrigger>
          <TabsTrigger value="no_amenities">Sem amenidades ({counts.no_amenities})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
                <p className="font-semibold">Tudo certo!</p>
                <p className="text-sm text-muted-foreground">
                  Nenhum imóvel encontrado nesta categoria de problema.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => (
                <Card key={p.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <img
                      src={p.images?.[0] || "/placeholder.svg"}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm truncate">{p.title || "(sem título)"}</h3>
                        <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">
                          {p.code}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.type} · {p.neighborhood || "—"}, {p.city}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.issues.map((i) => {
                          const cfg = ISSUE_LABELS[i];
                          const Icon = cfg.icon;
                          return (
                            <span
                              key={i}
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded ${cfg.color}`}
                            >
                              <Icon className="h-3 w-3" /> {cfg.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateOne(p)}
                      disabled={running}
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1" /> IA
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
