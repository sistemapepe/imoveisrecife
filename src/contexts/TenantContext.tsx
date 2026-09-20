import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";

export interface TenantSite {
  siteId: string;
  brandName: string;
  domain: string;
  isActive: boolean;
  matched: boolean;
}

interface TenantContextType {
  /** Site resolvido pelo domínio acessado */
  hostSite: TenantSite | null;
  /** Site que o painel está gerenciando (super admin pode trocar) */
  siteId: string | null;
  /** Override ativo (apenas super admin) */
  overrideSiteId: string | null;
  setOverrideSiteId: (id: string | null) => void;
  loading: boolean;
}

const STORAGE_KEY = "network_active_site";
const CACHE_KEY = "tenant_site_cache";

const TenantContext = createContext<TenantContextType | null>(null);

/** Site ativo acessível fora de componentes React (trackers, helpers). */
let activeSiteId: string | null = null;
export function getActiveSiteId(): string | null {
  if (activeSiteId) return activeSiteId;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.hostname === window.location.hostname) return parsed.site?.siteId ?? null;
    }
  } catch {}
  return null;
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const { isSuperAdmin } = useAuth();
  const [hostSite, setHostSite] = useState<TenantSite | null>(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.hostname === window.location.hostname) return parsed.site as TenantSite;
      }
    } catch {}
    return null;
  });
  const [overrideSiteId, setOverrideState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!hostSite);

  const setOverrideSiteId = useCallback((id: string | null) => {
    setOverrideState(id);
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  useEffect(() => {
    let mounted = true;
    const resolve = async () => {
      const hostname = window.location.hostname;
      try {
        const { data, error } = await supabase.rpc("resolve_site_by_hostname", { _hostname: hostname });
        if (error) throw error;
        const row: any = Array.isArray(data) ? data[0] : data;
        if (!row || !mounted) return;
        const site: TenantSite = {
          siteId: row.site_id,
          brandName: row.brand_name,
          domain: row.domain,
          isActive: row.is_active,
          matched: row.matched,
        };
        setHostSite(site);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ hostname, site }));
        } catch {}
      } catch (e) {
        logger.error("Failed to resolve tenant by hostname", { hostname }, e as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    resolve();
    return () => {
      mounted = false;
    };
  }, []);

  const siteId = (isSuperAdmin && overrideSiteId) || hostSite?.siteId || null;
  activeSiteId = siteId;

  return (
    <TenantContext.Provider value={{ hostSite, siteId, overrideSiteId, setOverrideSiteId, loading }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
