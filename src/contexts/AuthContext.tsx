import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type AppRole = "admin" | "supervisor" | "corretor" | "user";

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
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = role === "admin";

  const canManageProperties = isAdmin || permissions.manage_properties;
  const canDeleteProperties = isAdmin || permissions.delete_properties;
  const canViewProperties = isAdmin || permissions.view_properties;
  const canManageSettings = isAdmin || permissions.manage_settings;
  const canManageUsers = isAdmin || permissions.manage_users;
  const canViewContacts = isAdmin || permissions.view_contacts;

  const loadPermissions = useCallback(async (userRole: AppRole) => {
    if (userRole === "admin") return; // admin has all
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
    } catch {
      // keep defaults
    }
  }, []);

  const checkRole = async (userId: string) => {
    try {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
      const userRole = (data?.role as AppRole) || "user";
      setRole(userRole);
      await loadPermissions(userRole);
    } catch {
      setRole("user");
    }
  };

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(async () => {
          if (mounted) {
            await checkRole(session.user.id);
            setLoading(false);
          }
        }, 0);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        checkRole(session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
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
    <AuthContext.Provider value={{ user, isAdmin, role, loading, signIn, signUp, signOut, canManageProperties, canDeleteProperties, canViewProperties, canManageSettings, canManageUsers, canViewContacts }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
