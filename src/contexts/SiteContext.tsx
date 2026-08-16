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

export const SiteProvider = ({ children }: { children: ReactNode }) => {
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolveSite = useCallback(async () => {
    logger.startTimer("resolveSite");
    const pathname = window.location.pathname;
    const isNetworkPath = pathname.startsWith('/network-admin');
    const isAdminPath = pathname.startsWith('/admin');
    const isLoginPath = pathname === '/login';
    
    // Para rotas administrativas, não bloqueia o carregamento por erro de domínio
    const isManagementPath = isNetworkPath || isAdminPath || isLoginPath || pathname === '/auth/callback';
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const siteIdParam = urlParams.get('site_id');
      const hostname = window.location.hostname;
      
      const cleanHostname = hostname.replace(/^www\./, "");
      const domainToSearch = cleanHostname.includes('lovable.app') ? 'localhost' : cleanHostname;
      
      // Cache local para resultados de resolução de domínio (1 hora)
      const cacheKey = `site_resolution_${siteIdParam || domainToSearch}`;
      const cachedResult = sessionStorage.getItem(cacheKey);
      
      if (cachedResult && !siteIdParam) {
        try {
          const { data, timestamp } = JSON.parse(cachedResult);
          if (Date.now() - timestamp < 3600000) { // 1 hora
            setSite(data);
            setLoading(false);
            return;
          }
        } catch (e) {}
      }

      let query = supabase.from('sites' as any).select('*');
      
      if (siteIdParam) {
        query = query.eq('id', siteIdParam);
      } else {
        query = query.or(`domain.eq.${domainToSearch},domain.eq.www.${domainToSearch}`);
      }

      const { data, error: siteError } = await query.maybeSingle();

      if (siteError) throw siteError;

      if (!data) {
        if (!isManagementPath) {
          setError("Domínio não configurado na plataforma.");
        }
        if (hostname.includes('lovable.app') && !siteIdParam) {
          const { data: localhostSite } = await supabase
            .from('sites' as any)
            .select('*')
            .eq('domain', 'localhost')
            .maybeSingle();
          
          if (localhostSite) {
            setSite(localhostSite as any);
            setLoading(false);
            return;
          }
        }
        
        setError("Domínio não configurado na plataforma.");
        setSite(null);
      } else {
        setSite(data as any);
        sessionStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
      }
    } catch (err) {
      logger.error("Failed to resolve site", { domain: window.location.hostname }, err as Error);
      if (!isManagementPath) {
        setError("Erro ao carregar configurações do site.");
      }
      setSite(null);
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
};

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}