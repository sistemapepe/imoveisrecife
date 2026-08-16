import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface Site {
  id: string;
  domain: string;
  brand_name: string;
}

interface SiteContextType {
  site: Site | null;
  loading: boolean;
  error: string | null;
}

const SiteContext = createContext<SiteContextType | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolveSite = useCallback(async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const siteIdParam = urlParams.get('site_id');
      const hostname = window.location.hostname;
      
      let query = supabase.from('sites' as any).select('*');
      
      if (siteIdParam) {
        // Se temos um ID específico, verificamos o cache por ID
        const cacheKey = `site_resolved_${siteIdParam}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.id) {
            setSite(parsed);
            setLoading(false);
            return;
          }
        }
        query = query.eq('id', siteIdParam);
      } else {
        const domainToSearch = hostname.includes('lovable.app') ? 'localhost' : hostname;
        const cacheKey = `site_resolved_${domainToSearch}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.id) {
            setSite(parsed);
            setLoading(false);
            return;
          }
        }
        query = query.eq('domain', domainToSearch);
      }

      const { data, error: siteError } = await query.maybeSingle();

      if (siteError) throw siteError;

      if (!data) {
        const { data: fallbackSite } = await supabase
          .from('sites' as any)
          .select('*')
          .limit(1)
          .maybeSingle();
        
        if (fallbackSite) {
          setSite(fallbackSite as any);
        } else {
          setError("Nenhum site configurado.");
        }
      } else {
        setSite(data as any);
        // Salva no cache da sessão para navegação rápida
        const key = siteIdParam || (hostname.includes('lovable.app') ? 'localhost' : hostname);
        sessionStorage.setItem(`site_resolved_${key}`, JSON.stringify(data));
      }
    } catch (err) {
      logger.error("Failed to resolve site", { domain: window.location.hostname }, err as Error);
      setError("Erro ao carregar configurações do site.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    resolveSite();
  }, [resolveSite]);

  return (
    <SiteContext.Provider value={{ site, loading, error }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}
