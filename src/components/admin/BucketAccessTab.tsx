import { useState } from "react";
import { SiteSettings } from "@/contexts/PropertyContext";
import { toast } from "sonner";
import { Lock, Globe, AlertTriangle, Check } from "lucide-react";

interface Props {
  settings: SiteSettings;
  updateSettings: (s: Partial<SiteSettings>) => Promise<void>;
}

export default function BucketAccessTab({ settings, updateSettings }: Props) {
  const current = settings.imagesAccessMode ?? "public";
  const [mode, setMode] = useState<"public" | "signed">(current);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings({ imagesAccessMode: mode });
      toast.success("Modo de acesso atualizado");
    } catch (e: any) {
      toast.error("Erro ao salvar: " + (e?.message ?? "desconhecido"));
    } finally {
      setSaving(false);
    }
  };

  const Option = ({
    value,
    icon: Icon,
    title,
    pros,
    cons,
  }: {
    value: "public" | "signed";
    icon: typeof Globe;
    title: string;
    pros: string[];
    cons: string[];
  }) => {
    const active = mode === value;
    return (
      <button
        onClick={() => setMode(value)}
        className={`text-left p-5 rounded-xl border-2 transition-all ${
          active
            ? "border-accent bg-accent/5 shadow-lg"
            : "border-border bg-card hover:border-accent/40"
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg">{title}</h3>
          {active && <Check className="ml-auto h-5 w-5 text-accent" />}
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <p className="font-semibold text-green-600 dark:text-green-400 mb-1">
              ✓ Vantagens
            </p>
            <ul className="text-muted-foreground list-disc pl-5 space-y-0.5">
              {pros.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-red-600 dark:text-red-400 mb-1">
              ✗ Desvantagens
            </p>
            <ul className="text-muted-foreground list-disc pl-5 space-y-0.5">
              {cons.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold mb-2">Acesso às Imagens dos Imóveis</h2>
        <p className="text-muted-foreground">
          Escolha como as imagens armazenadas no bucket{" "}
          <code className="px-1.5 py-0.5 bg-muted rounded text-sm">property-images</code> são
          servidas aos visitantes.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Option
          value="public"
          icon={Globe}
          title="🌍 Público (recomendado)"
          pros={[
            "Imagens carregam mais rápido (cache CDN)",
            "Preview funciona ao compartilhar links (WhatsApp, LinkedIn, Facebook)",
            "OG images e SEO funcionam normalmente",
            "Não há gasto extra com geração de URLs",
          ]}
          cons={[
            "Qualquer pessoa com a URL acessa o arquivo",
            "Arquivos são indexáveis por buscadores",
          ]}
        />
        <Option
          value="signed"
          icon={Lock}
          title="🔒 URLs Assinadas"
          pros={[
            "Cada URL expira em 1 hora",
            "Maior controle de quem acessa as imagens",
            "Reduz hotlinking de terceiros",
          ]}
          cons={[
            "Quebra previews em links compartilhados",
            "OG images caem (Facebook/LinkedIn não conseguem ler)",
            "Adiciona latência (round-trip extra para assinar)",
            "Cache de CDN menos eficiente",
          ]}
        />
      </div>

      {mode === "signed" && (
        <div className="flex gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold mb-1">Atenção</p>
            <p className="text-muted-foreground">
              Para enforçar privacidade real, é necessário também tornar o bucket privado nas
              configurações de backend. Caso contrário, URLs públicas continuam acessíveis
              diretamente. OG images permanecerão como URL pública para não quebrar o
              compartilhamento social.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="text-sm">
          <span className="text-muted-foreground">Modo atual: </span>
          <span className="font-semibold">
            {current === "signed" ? "🔒 URLs Assinadas" : "🌍 Público"}
          </span>
        </div>
        <button
          onClick={save}
          disabled={saving || mode === current}
          className="px-6 py-2.5 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {saving ? "Salvando..." : "Salvar alteração"}
        </button>
      </div>
    </div>
  );
}
