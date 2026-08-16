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
    logger.startTimer("resolveSite");
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const siteIdParam = urlParams.get('site_id');
      const hostname = window.location.hostname;
      
      // Normalização: remove www. e trata lovable.app como localhost para desenvolvimento
      const cleanHostname = hostname.replace(/^www\./, "");
      const domainToSearch = cleanHostname.includes('lovable.app') ? 'localhost' : cleanHostname;
      
      let query = supabase.from('sites' as any).select('*');
      
      if (siteIdParam) {
        // Se temos um ID específico, verificamos o cache por ID
        // Nota: O SiteProvider não valida permissões aqui, isso é feito pelo AuthContext e ProtectedRoute
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
        // Busca tanto o domínio limpo quanto com www (caso o usuário tenha cadastrado com www)
        query = query.or(`domain.eq.${domainToSearch},domain.eq.www.${domainToSearch}`);
      }

      const { data, error: siteError } = await query.maybeSingle();

      if (siteError) throw siteError;

      if (!data) {
        // Se estivermos em um domínio lovable.app e não achamos por ID, tentamos o fallback 'localhost'
        if (hostname.includes('lovable.app') && !siteIdParam) {
          const { data: localhostSite } = await supabase
            .from('sites' as any)
            .select('*')
            .eq('domain', 'localhost')
            .maybeSingle();
          
          if (localhostSite) {
            setSite(localhostSite as any);
            return;
          }
        }
        
        setError("Domínio não configurado na plataforma.");
        setSite(null);
      } else {
        setSite(data as any);
        const key = siteIdParam || domainToSearch;
        sessionStorage.setItem(`site_resolved_${key}`, JSON.stringify(data));
      }
    } catch (err) {
      logger.error("Failed to resolve site", { domain: window.location.hostname }, err as Error);
      setError("Erro ao carregar configurações do site.");
    } finally {
      logger.endTimer("resolveSite", { domain: window.location.hostname });
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
