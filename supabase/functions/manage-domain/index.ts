import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VERCEL_TOKEN = Deno.env.get("VERCEL_TOKEN") ?? "";
const VERCEL_PROJECT_ID = Deno.env.get("VERCEL_PROJECT_ID") ?? "";
const VERCEL_TEAM_ID = Deno.env.get("VERCEL_TEAM_ID") ?? "";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function vercel(path: string, init: RequestInit = {}) {
  const sep = path.includes("?") ? "&" : "?";
  const url = `https://api.vercel.com${path}${VERCEL_TEAM_ID ? `${sep}teamId=${encodeURIComponent(VERCEL_TEAM_ID)}` : ""}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch (_e) {
    data = null;
  }
  return { ok: res.ok, status: res.status, data: data as Record<string, unknown> | null };
}

function normalizeHost(raw: string) {
  let h = (raw ?? "").trim().toLowerCase();
  h = h.replace(/^https?:\/\//, "");
  h = h.split("/")[0].split(":")[0];
  return h;
}

const HOST_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
    const { data: userData, error: userErr } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);
    const userId = userData.user.id;

    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userId);
    const isSuperAdmin = (roles ?? []).some((r: { role: string }) => r.role === "super_admin");
    if (!isSuperAdmin) return json({ error: "forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");
    const siteId = body.site_id ? String(body.site_id) : null;
    const host = normalizeHost(String(body.hostname ?? ""));

    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
      return json({ error: "not_configured", message: "Hospedagem não configurada." }, 400);
    }
    if (!host || !HOST_RE.test(host)) {
      return json({ error: "validation_error", message: "Endereço inválido." }, 400);
    }

    const bare = host.startsWith("www.") ? host.slice(4) : host;
    const www = `www.${bare}`;

    if (action === "add") {
      if (!siteId) return json({ error: "validation_error", message: "Site não informado." }, 400);
      const results: Record<string, unknown>[] = [];
      for (const h of [bare, www]) {
        const r = await vercel(`/v10/projects/${VERCEL_PROJECT_ID}/domains`, {
          method: "POST",
          body: JSON.stringify({ name: h }),
        });
        const code = (r.data as { error?: { code?: string } } | null)?.error?.code;
        if (!r.ok && code !== "domain_already_in_use" && code !== "domain_already_exists") {
          return json(
            {
              error: "vercel_error",
              message:
                (r.data as { error?: { message?: string } } | null)?.error?.message ??
                "Não foi possível cadastrar o endereço na hospedagem.",
            },
            400,
          );
        }
        results.push({ hostname: h, ok: r.ok || !!code });
      }

      const { data: siteRow } = await admin.from("sites").select("brand_name").eq("id", siteId).maybeSingle();
      await admin
        .from("tenants")
        .upsert({ id: siteId, name: siteRow?.brand_name ?? bare, slug: `site-${siteId}`, status: "active" }, { onConflict: "id" });
      for (const h of [bare, www]) {
        const { error } = await admin
          .from("tenant_domains")
          .upsert(
            { tenant_id: siteId, hostname: h, is_primary: h === bare, status: "active" },
            { onConflict: "hostname" },
          );
        if (error) return json({ error: "db_error", message: error.message }, 400);
      }
      await admin.from("sites").update({ domain: bare, updated_at: new Date().toISOString() }).eq("id", siteId);
      await admin.from("audit_logs").insert({
        user_id: userId,
        action: "connect_domain",
        entity_type: "site",
        entity_id: siteId,
        site_id: siteId,
        details: { hostname: bare },
      });
      return json({ ok: true, hostnames: [bare, www], results });
    }

    if (action === "status") {
      const out: Record<string, unknown>[] = [];
      for (const h of [bare, www]) {
        const cfg = await vercel(`/v6/domains/${h}/config`);
        const dom = await vercel(`/v9/projects/${VERCEL_PROJECT_ID}/domains/${h}`);
        const verify = await vercel(`/v9/projects/${VERCEL_PROJECT_ID}/domains/${h}/verify`, { method: "POST" });
        const domData = (dom.data ?? {}) as Record<string, unknown>;
        const verData = (verify.data ?? {}) as Record<string, unknown>;
        const misconfigured = Boolean((cfg.data as { misconfigured?: boolean } | null)?.misconfigured);
        const verified = Boolean(domData.verified ?? verData.verified);
        out.push({
          hostname: h,
          registered: dom.ok,
          verified,
          misconfigured,
          state: !dom.ok ? "nao_cadastrado" : misconfigured ? "aguardando_dns" : verified ? "no_ar" : "verificando",
          verification: domData.verification ?? verData.verification ?? null,
        });
      }
      return json({
        ok: true,
        domains: out,
        records: [
          { type: "A", name: "@", value: "76.76.21.21" },
          { type: "CNAME", name: "www", value: "cname.vercel-dns.com" },
        ],
      });
    }

    if (action === "remove") {
      for (const h of [bare, www]) {
        await vercel(`/v9/projects/${VERCEL_PROJECT_ID}/domains/${h}`, { method: "DELETE" });
        await admin.from("tenant_domains").delete().eq("hostname", h);
      }
      await admin.from("audit_logs").insert({
        user_id: userId,
        action: "remove_domain",
        entity_type: "site",
        entity_id: siteId,
        site_id: siteId,
        details: { hostname: bare },
      });
      return json({ ok: true });
    }

    return json({ error: "invalid_action" }, 400);
  } catch (e) {
    return json({ error: "server_error", message: e instanceof Error ? e.message : String(e) }, 500);
  }
});
