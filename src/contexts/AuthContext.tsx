import { createContext, useContext, useEffect, useState, ReactNode, useCallback, startTransition } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
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

export function AuthProvider({ children }: { children: ReactNode }) {
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
    if (userRole === "super_admin") return; // super_admin has all
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

  const checkRole = async (userId: string) => {
    try {
      logger.info("Checking user role", { userId });
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      
      if (error) {
        logger.error("Error fetching role", { userId }, error);
        setRole("user");
        return;
      }

      // Se o usuário tiver QUALQUER role administrativo em qualquer site, permitimos o acesso ao admin
      // A filtragem por site_id deve acontecer dentro do dashboard, não no guard da rota se o usuário
      // é globalmente um administrador.
      const roles = data?.map(r => r.role as AppRole) || [];
      let userRole: AppRole = "user";
      
      if (roles.includes("super_admin")) {
        userRole = "super_admin";
      } else if (roles.includes("admin")) {
        userRole = "admin";
      } else if (roles.includes("supervisor")) {
        userRole = "supervisor";
      } else if (roles.includes("corretor")) {
        userRole = "corretor";
      }

      logger.info("User role identified", { userId, identifiedRole: userRole, allRoles: roles });
      startTransition(() => {
        setRole(userRole);
      });
      await loadPermissions(userRole);
    } catch (error) {
      logger.error("Failed to check user role", { userId }, error as Error);
      startTransition(() => {
        setRole("user");
      });
    } finally {
      startTransition(() => {
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      logger.info("Auth state changed", { event, userId: session?.user?.id });
      const newUser = session?.user ?? null;
      
      startTransition(() => {
        setUser(newUser);
        
        if (newUser) {
          setLoading(true);
          checkRole(newUser.id);
        } else {
          setRole(null);
          setLoading(false);
        }
      });
    });

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        const currentUser = session?.user ?? null;
        
        startTransition(() => {
          setUser(currentUser);
          
          if (currentUser) {
            setLoading(true);
            checkRole(currentUser.id);
          } else {
            setLoading(false);
          }
        });
      } catch (error) {
        logger.error("Failed to get session", {}, error as Error);
        if (mounted) setLoading(false);
      }
    };

    initSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
    <AuthContext.Provider value={{ user, isAdmin, isSuperAdmin, role, loading, signIn, signUp, signOut, canManageProperties, canDeleteProperties, canViewProperties, canManageSettings, canManageUsers, canViewContacts, canViewAnalytics, canViewVisits, canViewTraffic, canManageSeo, canBulkImport, canManagePrivacy, canManageBucket }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
