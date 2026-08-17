import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'maintenance';
}

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: Error | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const resolveTenant = async () => {
      try {
        const hostname = window.location.hostname;
        logger.info("Resolving tenant for hostname", { hostname });

        // First, check if there's a specific domain mapping
        const { data: domainData, error: domainError } = await supabase
          .from('tenant_domains')
          .select('tenant_id')
          .eq('hostname', hostname)
          .maybeSingle();

        if (domainError) throw domainError;

        let tenantId = domainData?.tenant_id;

        // Fallback: If no direct mapping, maybe we're on a subdomain or localhost
        // For development/testing purposes, we might want to default to a specific tenant
        // or extract a slug from the hostname.
        if (!tenantId) {
          logger.warn("No direct domain mapping found, checking for slug fallback", { hostname });
          
          // Example: site-slug.domain.com -> slug = site-slug
          const parts = hostname.split('.');
          if (parts.length > 2) {
            const potentialSlug = parts[0];
            const { data: tenantData } = await supabase
              .from('tenants')
              .select('id')
              .eq('slug', potentialSlug)
              .maybeSingle();
            
            if (tenantData) tenantId = tenantData.id;
          }
        }

        // Final fallback: use a default tenant if one exists (for single-tenant legacy support)
        if (!tenantId) {
          const { data: allTenants } = await supabase
            .from('tenants')
            .select('id')
            .limit(1);
          
          if (allTenants && allTenants.length > 0) {
            tenantId = allTenants[0].id;
            logger.info("Using fallback default tenant", { tenantId });
          }
        }

        if (!tenantId) {
          throw new Error("Could not resolve tenant for this domain.");
        }

        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', tenantId)
          .single();

        if (tenantError) throw tenantError;

        setTenant(tenantData as Tenant);
        logger.info("Tenant resolved successfully", { tenantId, name: tenantData.name });
      } catch (err) {
        logger.error("Failed to resolve tenant", { error: err });
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    resolveTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};
