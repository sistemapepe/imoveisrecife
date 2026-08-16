import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify the caller via auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAdmin.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const callerId = claimsData.user.id;
    const { data: isSuperAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: callerId, _role: "super_admin" });
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: callerId, _role: "admin" });
    if (!isAdmin && !isSuperAdmin) {
      return new Response(JSON.stringify({ error: "Sem permissão" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { action, email, password, role, userId, perms } = body;

    if (action === "update_perms") {
      if (!perms || !Array.isArray(perms)) {
        return new Response(JSON.stringify({ error: "Permissões inválidas ou ausentes" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      console.log(`Atualizando ${perms.length} permissões...`);

      for (const row of perms) {
        const { error } = await supabaseAdmin
          .from("role_permissions")
          .upsert({
            role: row.role as any,
            permission: row.permission,
            enabled: row.enabled
          }, { 
            onConflict: "role,permission" 
          });
        if (error) {
          console.error("Erro no upsert:", error);
          return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "create") {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
        user_id: newUser.user.id,
        role: role || "corretor",
      });
      if (roleError) {
        return new Response(JSON.stringify({ error: roleError.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ user: newUser.user }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "list") {
      const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { data: roles } = await supabaseAdmin.from("user_roles").select("*");
      const roleMap: Record<string, string> = {};
      (roles || []).forEach((r: any) => { roleMap[r.user_id] = r.role; });

      const result = users.users.map((u: any) => ({
        id: u.id,
        email: u.email,
        role: roleMap[u.id] || "sem função",
        created_at: u.created_at,
      }));

      return new Response(JSON.stringify({ users: result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update_role") {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "delete") {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});