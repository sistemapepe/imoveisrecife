import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { useSite } from "./SiteContext";
import type { User } from "@supabase/supabase-js";

type AppRole = "super_admin" | "admin" | "supervisor" | "corretor" | "user";

type PermissionKey =
  | "view_properties"
  | "manage_properties"
  | "delete_properties"
  | "view_contacts"
  | "manage_settings"
  | "manage_users"
  | "view_analytics"
  | "view_visits"
  | "view_traffic"
  | "manage_seo"
  | "bulk_import"
  | "manage_privacy"
  | "manage_bucket";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  role: AppRole | null;
  loading: boolean;
  isInitializing: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  canManageProperties: boolean;
  canDeleteProperties: boolean;
  canViewProperties: boolean;
  canManageSettings: boolean;
  canManageUsers: boolean;
  canViewContacts: boolean;
  canViewAnalytics: boolean;
  canViewVisits: boolean;
  canViewTraffic: boolean;
  canManageSeo: boolean;
  canBulkImport: boolean;
  canManagePrivacy: boolean;
  canManageBucket: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = React.forwardRef<HTMLDivElement, { children: ReactNode }>(({ children }, ref) => {
...
  return (
    <AuthContext.Provider value={{ user, isAdmin, isSuperAdmin, role, loading, isInitializing, signIn, signUp, signOut, canManageProperties, canDeleteProperties, canViewProperties, canManageSettings, canManageUsers, canViewContacts, canViewAnalytics, canViewVisits, canViewTraffic, canManageSeo, canBulkImport, canManagePrivacy, canManageBucket }}>
      <div ref={ref} className="contents">
        {children}
      </div>
    </AuthContext.Provider>
  );
});

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
