import { useCallback, useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2, Download, RefreshCw, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProperties, SiteSettings } from "@/contexts/PropertyContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

// ---- Mapeamento flexível de cabeçalhos ----
const norm = (s: any) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

// chave Excel (normalizada) -> chave interna
const EMPRESA_MAP: Record<string, string> = {
  brand_name: "brandName", nome_da_marca: "brandName", nome: "brandName",
  hero_subtitle: "heroSubtitle", subtitulo: "heroSubtitle", slogan: "heroSubtitle",
  logo_url: "logoUrl", logo: "logoUrl", url_da_logo_publica: "logoUrl", url_da_logo: "logoUrl",
  creci_uf: "creciUf", uf_do_creci: "creciUf", creci_uf_: "creciUf",
  creci: "creci", creci_numero: "creci", numero_do_creci: "creci",
  whatsapp_number: "whatsappNumber", whatsapp: "whatsappNumber", whatsapp_com_ddi: "whatsappNumber",
  email_contact: "emailContact", email: "emailContact", e_mail: "emailContact", email_de_contato: "emailContact",
  whatsapp_message: "whatsappMessage", mensagem_padrao_whatsapp: "whatsappMessage",
  footer_text: "footerText", texto_do_rodape: "footerText", rodape: "footerText",
  instagram_url: "instagramUrl", instagram: "instagramUrl",
  facebook_url: "facebookUrl", facebook: "facebookUrl",
  youtube_url: "youtubeUrl", youtube: "youtubeUrl",
  linkedin_url: "linkedinUrl", linkedin: "linkedinUrl",
  website_url: "websiteUrl", website: "websiteUrl", site: "websiteUrl",
  primary_color: "primaryColor", cor_primaria_hsl: "primaryColor", cor_primaria: "primaryColor",
  accent_color: "accentColor", cor_de_destaque_hsl: "accentColor", cor_de_destaque: "accentColor",
};

const IMOVEL_MAP: Record<string, string> = {
  titulo: "title", title: "title", nome: "title",
  tipo: "type", type: "type",
  categoria: "category", category: "category",
  endereco: "address", address: "address",
  bairro: "neighborhood", neighborhood: "neighborhood",
  cidade: "city", city: "city",
  uf: "uf", estado: "uf",
  preco: "price", preco_r: "price", price: "price", valor: "price",
  area: "area", area_m2: "area", area_m: "area",
  quartos: "bedrooms", bedrooms: "bedrooms", dormitorios: "bedrooms",
  suites: "suites",
  banheiros: "bathrooms", bathrooms: "bathrooms",
  vagas: "parking", parking: "parking", garagem: "parking",
  status: "status",
  exclusivo: "exclusive", exclusivo_sim_nao: "exclusive", exclusive: "exclusive",
  destaque: "featured", destaque_sim_nao: "featured", featured: "featured",
  descricao: "description", description: "description",
  comodidades: "amenities", comodidades_separadas_por_virgula: "amenities", amenities: "amenities",
  imagens: "images", urls_das_imagens: "images", urls_das_imagens_separadas_por_virgula: "images", images: "images",
  url_video_tour_virtual: "video_tour_url", video: "video_tour_url", tour_virtual: "video_tour_url", video_tour_url: "video_tour_url",
};

// Cabeçalhos esperados da aba "Imóveis" (na ordem do template)
const EXPECTED_IMOVEIS_HEADERS = [
  "Título","Tipo","Categoria","Endereço","Bairro","Cidade","UF",
  "Preço (R$)","Área (m²)","Quartos","Suítes","Banheiros","Vagas",
  "Status","Exclusivo (sim/não)","Destaque (sim/não)","Descrição",
  "Comodidades (separadas por vírgula)","URLs das imagens (separadas por vírgula)",
  "URL Vídeo / Tour virtual",
];

function validateImoveisHeaders(actual: string[]): string | null {
  const a = actual.map((h) => norm(h));
  const missing = EXPECTED_IMOVEIS_HEADERS.filter((h) => !a.includes(norm(h)));
  if (missing.length) return `Cabeçalhos ausentes na aba "Imóveis": ${missing.join(", ")}. Baixe o modelo oficial e mantenha os nomes/ordem das colunas.`;
  return null;
}

type RowError = { row: number; field?: string; message: string };

interface ParsedResult {
  empresa: Partial<SiteSettings> | null;
  empresaErrors: RowError[];
  imoveis: any[];
  imoveisErrors: RowError[];
  headerError?: string | null;
  rawImoveisRows?: any[];
  imoveisHeaders?: string[];
}

function remap(rows: any[], map: Record<string, string>) {
  return rows.map((r) => {
    const out: any = {};
    for (const [k, v] of Object.entries(r)) {
      const internal = map[norm(k)];
      if (internal) out[internal] = v;
    }
    return out;
  });
}

const toBool = (v: any) => {
  const s = String(v ?? "").trim().toLowerCase();
  return ["sim","s","true","1","yes","y","x"].includes(s);
};
const toNum = (v: any) => {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  const clean = String(v).replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
};
const toList = (v: any) =>
  String(v ?? "").split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);

function parseEmpresaSheet(ws: XLSX.WorkSheet): { data: Partial<SiteSettings> | null; errors: RowError[] } {
  const errors: RowError[] = [];
  const rows = XLSX.utils.sheet_to_json<any>(ws, { defval: "" });
  // Formato vertical: colunas "Campo / Chave / Valor"
  const settings: any = {};
  rows.forEach((r, idx) => {
    const keys = Object.keys(r);
    if (keys.length === 0) return;
    const keyCol = keys.find((k) => /chave/i.test(k)) ?? keys[1];
    const valCol = keys.find((k) => /valor/i.test(k)) ?? keys[2];
    const labelCol = keys[0];
    const rawKey = String(r[keyCol] ?? r[labelCol] ?? "");
    const val = r[valCol];
    const internal = EMPRESA_MAP[norm(rawKey)];
    if (internal && val !== "" && val !== null && val !== undefined) {
      settings[internal] = val;
    }
  });
  if (Object.keys(settings).length === 0) return { data: null, errors: [{ row: 0, message: "Nenhum dado de empresa reconhecido." }] };

  // Validações obrigatórias
  ["brandName","creci","creciUf"].forEach((f) => {
    if (!settings[f] || String(settings[f]).trim() === "") errors.push({ row: 0, field: f, message: `Campo obrigatório ausente: ${f}` });
  });
  if (settings.creciUf && !UFS.includes(String(settings.creciUf).toUpperCase())) {
    errors.push({ row: 0, field: "creciUf", message: `UF do CRECI inválida: ${settings.creciUf}` });
  } else if (settings.creciUf) {
    settings.creciUf = String(settings.creciUf).toUpperCase();
  }
  if (settings.emailContact && !/^\S+@\S+\.\S+$/.test(String(settings.emailContact))) {
    errors.push({ row: 0, field: "emailContact", message: "E-mail inválido" });
  }
  if (settings.whatsappNumber) settings.whatsappNumber = String(settings.whatsappNumber).replace(/\D/g, "");

  return { data: settings, errors };
}

const isUrl = (v: string) => /^https?:\/\/\S+\.\S+/i.test(v);

const FIELD_LABELS: Record<string, string> = {
  title: "Título", type: "Tipo", category: "Categoria",
  address: "Endereço", neighborhood: "Bairro", city: "Cidade",
  price: "Preço", area: "Área", bedrooms: "Quartos",
  bathrooms: "Banheiros", parking: "Vagas", status: "Status",
  images: "Imagens", suites: "Suítes",
};

function parseImoveisSheet(ws: XLSX.WorkSheet): { data: any[]; errors: RowError[]; raw: any[]; headers: string[]; headerError: string | null } {
  const raw = XLSX.utils.sheet_to_json<any>(ws, { defval: "" });
  const headers = raw.length > 0 ? Object.keys(raw[0]) : (XLSX.utils.sheet_to_json<any>(ws, { header: 1 })[0] as string[] ?? []);
  const headerError = validateImoveisHeaders(headers);
  if (headerError) {
    return { data: [], errors: [{ row: 1, message: headerError }], raw, headers, headerError };
  }

  const mapped = remap(raw, IMOVEL_MAP);
  const errors: RowError[] = [];
  const data: any[] = [];

  if (raw.length === 0) {
    return { data: [], errors: [{ row: 1, message: "A aba 'Imóveis' está vazia." }], raw, headers, headerError: null };
  }

  mapped.forEach((m, i) => {
    const rowNum = i + 2;
    if (!Object.values(m).some((v) => String(v ?? "").trim() !== "")) return;

    const rawNum = (k: string) => {
      const v = m[k];
      if (v === "" || v === null || v === undefined) return { ok: false, n: 0, missing: true };
      const n = toNum(v);
      const valid = Number.isFinite(n) && (typeof v === "number" || /^[\d.,\s-]+$/.test(String(v)));
      return { ok: valid, n, missing: false };
    };

    const item: any = {
      title: String(m.title ?? "").trim(),
      type: String(m.type ?? "").trim(),
      category: String(m.category ?? "").trim(),
      address: String(m.address ?? "").trim(),
      neighborhood: String(m.neighborhood ?? "").trim(),
      city: String(m.city ?? "").trim(),
      price: rawNum("price").n,
      area: rawNum("area").n,
      bedrooms: Math.trunc(rawNum("bedrooms").n),
      suites: Math.trunc(rawNum("suites").n),
      bathrooms: Math.trunc(rawNum("bathrooms").n),
      parking: Math.trunc(rawNum("parking").n),
      status: String(m.status ?? "disponivel").trim().toLowerCase(),
      exclusive: toBool(m.exclusive),
      featured: toBool(m.featured),
      description: String(m.description ?? "").trim(),
      amenities: toList(m.amenities),
      images: toList(m.images),
      video_tour_url: String(m.video_tour_url ?? "").trim() || null,
      previous_price: 0,
    };

    (["title","type","category","address","neighborhood","city"] as const).forEach((f) => {
      if (!item[f]) errors.push({ row: rowNum, field: f, message: `Campo obrigatório ausente: ${FIELD_LABELS[f]}` });
    });
    (["price","area","bedrooms","bathrooms","parking"] as const).forEach((f) => {
      const r = rawNum(f);
      if (r.missing) errors.push({ row: rowNum, field: f, message: `${FIELD_LABELS[f]} é obrigatório` });
      else if (!r.ok) errors.push({ row: rowNum, field: f, message: `${FIELD_LABELS[f]} deve ser numérico` });
      else if (r.n <= 0) errors.push({ row: rowNum, field: f, message: `${FIELD_LABELS[f]} deve ser maior que 0` });
    });
    if (m.suites !== "" && m.suites !== undefined && m.suites !== null) {
      const r = rawNum("suites");
      if (!r.ok || r.n < 0) errors.push({ row: rowNum, field: "suites", message: "Suítes deve ser número >= 0" });
    }
    if (!["disponivel","reservado","vendido"].includes(item.status)) {
      errors.push({ row: rowNum, field: "status", message: `Status inválido: "${item.status}". Use disponivel, reservado ou vendido.` });
    }
    if (item.images.length === 0) {
      errors.push({ row: rowNum, field: "images", message: "Adicione ao menos 1 imagem (URL)" });
    } else {
      const bad = item.images.filter((u: string) => !isUrl(u));
      if (bad.length) errors.push({ row: rowNum, field: "images", message: `URL(s) de imagem inválida(s): ${bad.join(", ")}` });
    }
    if (item.video_tour_url && !isUrl(item.video_tour_url)) {
      errors.push({ row: rowNum, field: "video_tour_url", message: "URL de vídeo/tour inválida" });
    }

    data.push({ __row: rowNum, ...item });
  });

  return { data, errors, raw, headers, headerError: null };
}

function findSheet(wb: XLSX.WorkBook, names: string[]) {
  for (const n of names) {
    const found = wb.SheetNames.find((s) => norm(s) === norm(n));
    if (found) return wb.Sheets[found];
  }
  return null;
}

interface HistoryRow {
  id: string;
  file_name: string;
  file_size: number;
  status: string;
  company_updated: boolean;
  properties_total: number;
  properties_created: number;
  properties_failed: number;
  errors: any;
  log: any;
  created_at: string;
}

export default function BulkImportTab() {
  const { updateSettings, refreshProperties } = useProperties() as any;
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number } | null>(null);
  const [upsertMode, setUpsertMode] = useState(true);
  const [progress, setProgress] = useState<{ current: number; total: number; startedAt: number } | null>(null);
  const [importing, setImporting] = useState(false);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [reprocessOf, setReprocessOf] = useState<HistoryRow | null>(null);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    const { data } = await supabase
      .from("import_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(25);
    setHistory((data as any) ?? []);
    setLoadingHistory(false);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const onFile = async (file: File) => {
    if (!file) return;
    setFileMeta({ name: file.name, size: file.size });
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const empresaWs = findSheet(wb, ["Empresa", "empresa", "company"]);
      const imoveisWs = findSheet(wb, ["Imóveis", "Imoveis", "imoveis", "properties"]);

      const emp = empresaWs ? parseEmpresaSheet(empresaWs) : { data: null, errors: [{ row: 0, message: "Aba 'Empresa' não encontrada." } as RowError] };
      const imo = imoveisWs ? parseImoveisSheet(imoveisWs) : { data: [], errors: [{ row: 0, message: "Aba 'Imóveis' não encontrada." } as RowError], raw: [], headers: [], headerError: "Aba 'Imóveis' não encontrada." };

      setParsed({
        empresa: emp.data,
        empresaErrors: emp.errors,
        imoveis: (imo as any).data,
        imoveisErrors: (imo as any).errors,
        headerError: (imo as any).headerError ?? null,
        rawImoveisRows: (imo as any).raw ?? [],
        imoveisHeaders: (imo as any).headers ?? [],
      });
    } catch (e: any) {
      toast.error("Não foi possível ler o arquivo: " + e.message);
      setParsed(null);
    }
  };

  // Relatório por linha: 1 linha por linha-do-Excel com erros, contendo TODAS as colunas originais + "Erros"
  const downloadErrorReport = (
    errs: { row: number; field?: string; message: string; sheet: string }[],
    fileName: string,
  ) => {
    const wb = XLSX.utils.book_new();
    // Aba 1: resumo
    const resumo = [["Aba","Linha","Campo","Mensagem"], ...errs.map((e) => [e.sheet, e.row, e.field ?? "", e.message])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumo), "Erros");
    // Aba 2: linhas inválidas com colunas originais
    if (parsed?.rawImoveisRows && parsed?.imoveisHeaders && parsed.imoveisHeaders.length > 0) {
      const headers = parsed.imoveisHeaders;
      const errsByRow = new Map<number, string[]>();
      errs.filter((e) => e.sheet === "Imóveis").forEach((e) => {
        const arr = errsByRow.get(e.row) ?? [];
        arr.push(e.field ? `${e.field}: ${e.message}` : e.message);
        errsByRow.set(e.row, arr);
      });
      const rows = [[...headers, "Linha", "Erros"]];
      parsed.rawImoveisRows.forEach((r, i) => {
        const rowNum = i + 2;
        if (!errsByRow.has(rowNum)) return;
        rows.push([...headers.map((h) => r[h] ?? ""), rowNum, errsByRow.get(rowNum)!.join(" | ")]);
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "Linhas inválidas");
    }
    XLSX.writeFile(wb, `relatorio_erros_${fileName.replace(/\.[^.]+$/, "")}.xlsx`);
  };

  const reset = () => {
    setParsed(null);
    setFileMeta(null);
    setReprocessOf(null);
    if (fileRef.current) fileRef.current.value = "";
  };


  const confirmImport = async () => {
    if (!parsed || !fileMeta) return;
    const allErrors = [
      ...parsed.empresaErrors.map((e) => ({ ...e, sheet: "Empresa" })),
      ...parsed.imoveisErrors.map((e) => ({ ...e, sheet: "Imóveis" })),
    ];

    setImporting(true);
    const { data: histRow, error: histErr } = await supabase.from("import_history").insert({
      file_name: fileMeta.name,
      file_size: fileMeta.size,
      status: "em_andamento",
      properties_total: parsed.imoveis.length,
      errors: allErrors as any,
    }).select().single();

    if (histErr || !histRow) {
      toast.error("Falha ao iniciar importação: " + (histErr?.message || ""));
      setImporting(false);
      return;
    }

    const log: any[] = [];
    let companyUpdated = false;
    let created = 0;
    let failed = 0;

    try {
      if (parsed.empresa && parsed.empresaErrors.length === 0) {
        await updateSettings(parsed.empresa);
        companyUpdated = true;
        log.push({ at: new Date().toISOString(), msg: "Empresa atualizada" });
      } else if (parsed.empresaErrors.length > 0) {
        log.push({ at: new Date().toISOString(), msg: "Empresa ignorada por erros", errors: parsed.empresaErrors });
      }

      const valid = parsed.imoveis.filter((i) => !parsed.imoveisErrors.some((e) => e.row === i.__row));
      let updated = 0;
      const startedAt = Date.now();
      setProgress({ current: 0, total: valid.length, startedAt });
      for (let idx = 0; idx < valid.length; idx++) {
        const item = valid[idx];
        const { __row, ...payload } = item;
        try {
          let existingId: string | null = null;
          if (upsertMode && Array.isArray(payload.images) && payload.images.length > 0) {
            const { data: found } = await supabase
              .from("properties")
              .select("id")
              .overlaps("images", payload.images)
              .limit(1)
              .maybeSingle();
            existingId = (found as any)?.id ?? null;
          }
          if (existingId) {
            const { error } = await supabase.from("properties").update(payload as any).eq("id", existingId);
            if (error) throw error;
            updated++;
            log.push({ at: new Date().toISOString(), row: __row, msg: "Atualizado", id: existingId });
          } else {
            const { error } = await supabase.from("properties").insert(payload as any);
            if (error) throw error;
            created++;
            log.push({ at: new Date().toISOString(), row: __row, msg: "Criado" });
          }
        } catch (err: any) {
          failed++;
          log.push({ at: new Date().toISOString(), row: __row, error: err.message });
        }
        setProgress({ current: idx + 1, total: valid.length, startedAt });
      }

      const status = failed === 0 && (companyUpdated || !parsed.empresa) ? "concluido" : (created === 0 && updated === 0 && !companyUpdated ? "falhou" : "concluido");
      await supabase.from("import_history").update({
        status, company_updated: companyUpdated,
        properties_created: created + updated, properties_failed: failed,
        log: log as any,
      }).eq("id", histRow.id);

      toast.success(`Importação concluída: ${created} criado(s), ${updated} atualizado(s)${companyUpdated ? ", empresa atualizada" : ""}.`);
      await refreshProperties?.();
      reset();
      loadHistory();
    } catch (e: any) {
      await supabase.from("import_history").update({
        status: "falhou", log: [...log, { at: new Date().toISOString(), fatal: e.message }] as any,
      }).eq("id", histRow.id);
      toast.error("Falha na importação: " + e.message);
      loadHistory();
    } finally {
      setImporting(false);
      setProgress(null);
    }
  };

  const downloadLog = (h: HistoryRow) => {
    const blob = new Blob([JSON.stringify({ ...h }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `import_log_${h.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allErrors = parsed
    ? [
        ...parsed.empresaErrors.map((e) => ({ ...e, sheet: "Empresa" })),
        ...parsed.imoveisErrors.map((e) => ({ ...e, sheet: "Imóveis" })),
      ]
    : [];
  const hasBlockingErrors = parsed
    ? parsed.empresaErrors.length > 0 || parsed.imoveis.length === parsed.imoveisErrors.length
    : false;
  const validImoveis = parsed ? parsed.imoveis.length - parsed.imoveisErrors.filter((e) => parsed.imoveis.some((i) => i.__row === e.row)).length : 0;

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-accent" /> Importação em Massa</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Envie o formulário Excel preenchido. O sistema valida, mostra uma prévia e só importa após sua confirmação.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="default" size="sm" asChild>
              <a href="/modelo-importacao-imoveis.xlsx" download>
                <Download className="h-4 w-4 mr-1" /> Baixar modelo (.xlsx)
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={loadHistory}><RefreshCw className="h-4 w-4 mr-1" /> Atualizar histórico</Button>
          </div>
        </div>

        <label className="mt-4 block">
          <div className="border-2 border-dashed border-border rounded-xl px-4 py-8 text-center cursor-pointer hover:border-accent transition-colors">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm mt-2 font-semibold">{fileMeta ? fileMeta.name : "Selecionar arquivo .xlsx"}</p>
            <p className="text-[11px] text-muted-foreground">Abas esperadas: Empresa, Imóveis</p>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </div>
        </label>
      </div>

      {parsed && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h4 className="font-bold text-sm">📊 Pré-visualização</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Empresa" value={parsed.empresa && parsed.empresaErrors.length === 0 ? "1 pronta" : "0"} ok={!!parsed.empresa && parsed.empresaErrors.length === 0} />
            <Stat label="Imóveis válidos" value={String(validImoveis)} ok={validImoveis > 0} />
            <Stat label="Linhas com erro" value={String(parsed.imoveisErrors.length + parsed.empresaErrors.length)} ok={allErrors.length === 0} warn={allErrors.length > 0} />
            <Stat label="Total no arquivo" value={String(parsed.imoveis.length)} ok />
          </div>

          {allErrors.length > 0 && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs font-bold text-destructive flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> {allErrors.length} erro(s) encontrado(s)</p>
                <Button size="sm" variant="outline" onClick={() => downloadErrorReport(allErrors, fileMeta?.name ?? "arquivo")}>
                  <Download className="h-3 w-3 mr-1" /> Baixar relatório
                </Button>
              </div>
              <ul className="mt-2 max-h-40 overflow-auto text-[11px] space-y-1">
                {allErrors.slice(0, 30).map((e, i) => (
                  <li key={i}>
                    <span className="font-mono text-muted-foreground">[{e.sheet} L{e.row}{e.field ? `/${e.field}` : ""}]</span> {e.message}
                  </li>
                ))}
                {allErrors.length > 30 && <li className="italic text-muted-foreground">... e mais {allErrors.length - 30}</li>}
              </ul>
            </div>
          )}

          <label className="flex items-start gap-2 text-xs cursor-pointer select-none p-3 rounded-lg border border-border bg-muted/30">
            <input
              type="checkbox"
              checked={upsertMode}
              onChange={(e) => setUpsertMode(e.target.checked)}
              className="mt-0.5 accent-current"
              disabled={importing}
            />
            <span>
              <span className="font-semibold">Atualizar registros existentes (upsert)</span>
              <span className="block text-muted-foreground text-[11px] mt-0.5">
                Empresa: sempre atualizada (CRECI + UF). Imóveis: se alguma URL de imagem já existir no banco, o registro é atualizado em vez de criar duplicado.
              </span>
            </span>
          </label>

          {progress && (
            <ProgressBar current={progress.current} total={progress.total} startedAt={progress.startedAt} />
          )}

          <div className="flex gap-2 flex-wrap">
            <Button onClick={confirmImport} disabled={importing || hasBlockingErrors || (validImoveis === 0 && !(parsed.empresa && parsed.empresaErrors.length === 0))}>
              {importing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
              Confirmar e importar
            </Button>
            <Button variant="outline" onClick={reset} disabled={importing}>Cancelar</Button>
          </div>
          {hasBlockingErrors && (
            <p className="text-[11px] text-destructive">Existem erros bloqueantes. Corrija no Excel e reenvie.</p>
          )}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-bold text-sm flex items-center gap-2 mb-3"><History className="h-4 w-4" /> Histórico de importações</h4>
        {loadingHistory ? (
          <p className="text-xs text-muted-foreground">Carregando...</p>
        ) : history.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhuma importação registrada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-2">Data</th>
                  <th className="py-2 pr-2">Arquivo</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 pr-2">Empresa</th>
                  <th className="py-2 pr-2">Imóveis</th>
                  <th className="py-2">Log</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-border/40">
                    <td className="py-2 pr-2 whitespace-nowrap">{new Date(h.created_at).toLocaleString("pt-BR")}</td>
                    <td className="py-2 pr-2">{h.file_name}</td>
                    <td className="py-2 pr-2">
                      <StatusBadge status={h.status} />
                    </td>
                    <td className="py-2 pr-2">{h.company_updated ? "✅" : "—"}</td>
                    <td className="py-2 pr-2">
                      <span className="text-green-600 font-semibold">{h.properties_created}</span>
                      {" / "}
                      <span className="text-destructive font-semibold">{h.properties_failed}</span>
                      <span className="text-muted-foreground"> de {h.properties_total}</span>
                    </td>
                    <td className="py-2">
                      <Button variant="ghost" size="sm" onClick={() => downloadLog(h)}>
                        <Download className="h-3 w-3 mr-1" /> Baixar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, ok, warn }: { label: string; value: string; ok?: boolean; warn?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${warn ? "border-yellow-500/40 bg-yellow-500/5" : ok ? "border-accent/40 bg-accent/5" : "border-border"}`}>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    em_andamento: { label: "Em andamento", cls: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
    concluido: { label: "Concluído", cls: "bg-green-500/15 text-green-600 border-green-500/30" },
    falhou: { label: "Falhou", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  };
  const m = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground border-border" };
  return <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${m.cls}`}>{m.label}</span>;
}

function ProgressBar({ current, total, startedAt }: { current: number; total: number; startedAt: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const elapsedMs = Date.now() - startedAt;
  const perItem = current > 0 ? elapsedMs / current : 0;
  const remainingMs = perItem * Math.max(0, total - current);
  const fmt = (ms: number) => {
    const s = Math.max(0, Math.round(ms / 1000));
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    return `${m}m ${s % 60}s`;
  };
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
        <span>{current} / {total} ({pct}%)</span>
        <span>⏱ {fmt(elapsedMs)} · restam ~{current > 0 ? fmt(remainingMs) : "—"}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
