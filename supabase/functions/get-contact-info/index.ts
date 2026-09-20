import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limit per IP (resets on cold start)
const RATE_LIMIT_MAX = 30; // requests
const RATE_LIMIT_WINDOW_MS = 60_000; // per minute
const ipHits: Map<string, { count: number; resetAt: number }> = new Map();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (!rateLimit(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Multi-site: resolve which site the contact info belongs to
    let siteId: string | null = null;
    try {
      const body = req.method === "POST" ? await req.json() : null;
      if (body?.site_id) siteId = String(body.site_id);
    } catch {
      // no body
    }
    if (!siteId) {
      const url = new URL(req.url);
      siteId = url.searchParams.get("site_id");
    }
    if (!siteId) {
      const origin = req.headers.get("origin") || req.headers.get("referer") || "";
      let hostname = "";
      try {
        hostname = origin ? new URL(origin).hostname : "";
      } catch {
        hostname = "";
      }
      if (hostname) {
        const { data: resolved } = await supabase.rpc("resolve_site_by_hostname", { _hostname: hostname });
        const row = Array.isArray(resolved) ? resolved[0] : resolved;
        if (row?.site_id) siteId = row.site_id as string;
      }
    }

    let query = supabase.from("contact_info").select("whatsapp_number, email_contact").limit(1);
    if (siteId) query = query.eq("site_id", siteId);
    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("contact_info fetch error", error);
      return new Response(JSON.stringify({ error: "Internal error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        whatsapp_number: data?.whatsapp_number ?? "",
        email_contact: data?.email_contact ?? "",
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      }
    );
  } catch (e) {
    console.error("get-contact-info exception", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
