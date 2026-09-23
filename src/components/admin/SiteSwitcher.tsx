import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { Building2, ExternalLink, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SiteRow {
  id: string;
  brand_name: string;
  domain: string;
  is_active: boolean;
  properties_count: number;
}

export default function SiteSwitcher() {
  const { isSuperAdmin } = useAuth();
  const { siteId, hostSite, setOverrideSiteId } = useTenant();
  const [sites, setSites] = useState<SiteRow[]>([]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let active = true;
    (async () => {
      const { data } = await supabase.rpc("network_sites_overview");
      if (active && Array.isArray(data)) {
        setSites(
          (data as any[]).map((s) => ({
            id: s.id,
            brand_name: (s.brand_name || "").trim() || "Sem nome",
            domain: s.domain,
            is_active: s.is_active,
            properties_count: Number(s.properties_count ?? 0),
          }))
        );
      }
    })();
    return () => {
      active = false;
    };
  }, [isSuperAdmin]);

  const current = sites.find((s) => s.id === siteId);
  const label = (current?.brand_name || hostSite?.brandName || "Carregando...").trim();

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/40 text-xs">
        <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-muted-foreground">Gerenciando:</span>
        <span className="font-bold truncate">{label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/40 text-xs flex-wrap">
      <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="text-muted-foreground shrink-0">Gerenciando:</span>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 font-bold hover:bg-muted transition-colors max-w-[60vw]">
          <span className="truncate">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72 z-[60] bg-popover">
          <DropdownMenuLabel className="text-xs">Escolha a imobiliária</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sites.map((s) => (
            <DropdownMenuItem
              key={s.id}
              onClick={() => setOverrideSiteId(s.id)}
              className="flex items-start gap-2 cursor-pointer"
            >
              <Check className={`h-4 w-4 mt-0.5 shrink-0 ${s.id === siteId ? "opacity-100 text-primary" : "opacity-0"}`} />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold truncate">{s.brand_name}</span>
                <span className="block text-[11px] text-muted-foreground truncate">
                  {s.domain} · {s.properties_count} imóvel(is){s.is_active ? "" : " · desativado"}
                </span>
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOverrideSiteId(null)} className="cursor-pointer text-xs">
            Usar a imobiliária do endereço acessado
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {current && current.properties_count === 0 && (
        <span className="rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 font-semibold">
          Site novo · sem imóveis
        </span>
      )}

      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="ml-auto flex items-center gap-1 text-primary font-semibold hover:underline shrink-0"
      >
        Ver vitrine <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
