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

export const SiteProvider = React.forwardRef<HTMLDivElement, { children: ReactNode }>(({ children }, ref) => {
...
  return (
    <SiteContext.Provider value={{ site, loading, error }}>
      <div ref={ref} className="contents">
        {children}
      </div>
    </SiteContext.Provider>
  );
});

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}
