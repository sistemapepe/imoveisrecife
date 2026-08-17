import { useTenant } from "@/contexts/TenantContext";

/**
 * Hook to access the current tenant configuration and identity.
 * Wraps the TenantContext for easier usage.
 */
export const useTenantInfo = () => {
  const { tenant, loading, error } = useTenant();
  
  return {
    tenant,
    loading,
    error,
    tenantId: tenant?.id,
    tenantName: tenant?.name,
    tenantSlug: tenant?.slug,
    isMaintenance: tenant?.status === 'maintenance',
    isActive: tenant?.status === 'active'
  };
};
