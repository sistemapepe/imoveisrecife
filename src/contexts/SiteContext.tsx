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
      
      const cleanHostname = hostname.replace(/^www\./, "");
      const domainToSearch = cleanHostname.includes('lovable.app') ? 'localhost' : cleanHostname;
      
      let query = supabase.from('sites' as any).select('*');
      
      if (siteIdParam) {
        query = query.eq('id', siteIdParam);
      } else {
        query = query.or(`domain.eq.${domainToSearch},domain.eq.www.${domainToSearch}`);
      }

      const { data, error: siteError } = await query.maybeSingle();

      if (siteError) throw siteError;

      if (!data) {
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
      }
    } catch (err) {
      logger.error("Failed to resolve site", { domain: window.location.hostname }, err as Error);
      setError("Erro ao carregar configurações do site.");
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
      <div style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}
