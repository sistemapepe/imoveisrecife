import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
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
  const { site, loading: siteLoading } = useSite();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean>>({
    view_properties: false,
    manage_properties: false,
    delete_properties: false,
    view_contacts: false,
    manage_settings: false,
    manage_users: false,
    view_analytics: false,
    view_visits: false,
    view_traffic: false,
    manage_seo: false,
    bulk_import: false,
    manage_privacy: false,
    manage_bucket: false,
  });
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  const isSuperAdmin = role === "super_admin";
  const isAdmin = isSuperAdmin || role === "admin";

  const canManageProperties = isAdmin || permissions.manage_properties;
  const canDeleteProperties = isAdmin || permissions.delete_properties;
  const canViewProperties = isAdmin || permissions.view_properties;
  const canManageSettings = isAdmin || permissions.manage_settings;
  const canManageUsers = isSuperAdmin || permissions.manage_users;
  const canViewContacts = isAdmin || permissions.view_contacts;
  const canViewAnalytics = isAdmin || role === "supervisor" || permissions.view_analytics;
  const canViewVisits = isAdmin || role === "supervisor" || permissions.view_visits;
  const canViewTraffic = isAdmin || role === "supervisor" || permissions.view_traffic;
  const canManageSeo = isAdmin || permissions.manage_seo;
  const canBulkImport = isAdmin || permissions.bulk_import;
  const canManagePrivacy = isAdmin || permissions.manage_privacy;
  const canManageBucket = isAdmin || permissions.manage_bucket;

  const loadPermissions = useCallback(async (userRole: AppRole) => {
    if (userRole === "super_admin") return;
    try {
      const { data } = await supabase
        .from("role_permissions")
        .select("permission, enabled")
        .eq("role", userRole);
      if (data) {
        const perms = { ...permissions };
        data.forEach((row: any) => {
          if (row.permission in perms) {
            perms[row.permission as PermissionKey] = row.enabled;
          }
        });
        setPermissions(perms);
      }
    } catch (error) {
      logger.error("Failed to load permissions", { role: userRole }, error as Error);
    }
  }, []);

  const checkRole = useCallback(async (userId: string, mounted = true) => {
    logger.startTimer("checkRole");
    try {
      logger.info("Checking user role", { userId, siteId: site?.id });
      
      const isNetworkPath = window.location.pathname.startsWith('/network-admin');
      const isLoginPath = window.location.pathname === '/login';

      // 1. Resolve global super_admin early if site is pending
      if ((!site?.id || siteLoading) && (isNetworkPath || isLoginPath)) {
        try {
          const { data: superAdminCheck } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId)
            .eq("role", "super_admin")
            .or("site_id.is.null,site_id.eq.00000000-0000-0000-0000-000000000000")
            .maybeSingle();

          if (superAdminCheck) {
            if (mounted) {
              setRole("super_admin");
              sessionStorage.setItem(`is_global_super_admin_${userId}`, 'true');
              setLoading(false);
              setIsInitializing(false);
            }
            return;
          }
        } catch (e) {
          logger.warn("Early super_admin check failed", { userId });
        }
      }

      // 2. Check global super_admin cache for faster response
      const cachedSuperAdmin = sessionStorage.getItem(`is_global_super_admin_${userId}`);
      if (cachedSuperAdmin === 'true') {
        if (mounted) {
          setRole("super_admin");
          setLoading(false);
          setIsInitializing(false);
        }
        return;
      }


      // 3. Main role resolution
      const { data, error } = await supabase
        .from("user_roles")
        .select("role, site_id")
        .eq("user_id", userId);

      if (error) throw error;

      let selectedRole: AppRole = "user";

      if (data && data.length > 0) {
        const globalSuperAdmin = data.find(r => r.role === "super_admin" && (!r.site_id || r.site_id === '00000000-0000-0000-0000-000000000000'));
        const anySuperAdmin = data.find(r => r.role === "super_admin");
        
        if (globalSuperAdmin || anySuperAdmin) {
          selectedRole = "super_admin";
          sessionStorage.setItem(`is_global_super_admin_${userId}`, 'true');
        } else if (site?.id) {
          const siteSpecific = data.find(r => r.site_id === site.id);
          selectedRole = siteSpecific ? (siteSpecific.role as AppRole) : (data[0].role as AppRole);
        } else {
          selectedRole = data[0].role as AppRole;
        }
      }

      if (mounted) {
        setRole(selectedRole);
        await loadPermissions(selectedRole);
      }
    } catch (error) {
      logger.error("Failed to check user role", { userId }, error as Error);
      if (mounted) {
        setRole("user");
        setLoading(false);
        setIsInitializing(false);
      }
    } finally {
      logger.endTimer("checkRole", { userId });
      if (mounted) {
        setLoading(false);
        setIsInitializing(false);
      }
    }
  }, [site?.id, siteLoading, loadPermissions]);

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      authSubscription = subscription;
      if (!mounted) return;
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        setLoading(true);
        await checkRole(currentUser.id, mounted);
      } else {
        setRole(null);
        setLoading(false);
        setIsInitializing(false);
      }
    });

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          await checkRole(currentUser.id, mounted);
        } else {
          setLoading(false);
          setIsInitializing(false);
        }
      } catch (error) {
        logger.error("Initial session check failed", {}, error as Error);
        if (mounted) {
          setLoading(false);
          setIsInitializing(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [checkRole]);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      logger.warn("Sign in failed", { email });
    } else {
      logger.info("User signed in", { userId: data.user?.id });
    }
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

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
