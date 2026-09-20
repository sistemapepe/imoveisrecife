const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TARGET_IP = "185.158.133.1";

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;
const ipHits = new Map<string, { count: number; resetAt: number }>();

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

function normalize(input: string): string {
  let h = (input || "").trim().toLowerCase();
  h = h.replace(/^https?:\/\//, "");
  h = h.split("/")[0].split(":")[0];
  return h;
}

async function resolve(name: string, type: "A" | "TXT"): Promise<string[]> {
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
      { headers: { accept: "application/dns-json" } },
    );
    if (!res.ok) return [];
    const json = await res.json();
    const answers = Array.isArray(json?.Answer) ? json.Answer : [];
    return answers
      .filter((a: { type: number }) => (type === "A" ? a.type === 1 : a.type === 16))
      .map((a: { data: string }) => String(a.data).replace(/^"|"$/g, ""));
  } catch {
    return [];
  }
}

type Verdict = "ok" | "ausente" | "apontando_para_outro";

function verdictFor(values: string[]): Verdict {
  if (values.length === 0) return "ausente";
  return values.includes(TARGET_IP) ? "ok" : "apontando_para_outro";
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

    let raw = "";
    if (req.method === "POST") {
      try {
        const body = await req.json();
        raw = String(body?.hostname ?? "");
      } catch {
        raw = "";
      }
    } else {
      raw = new URL(req.url).searchParams.get("hostname") ?? "";
    }

    const host = normalize(raw);
    if (!host || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(host)) {
      return new Response(JSON.stringify({ error: "Domínio inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const root = host.startsWith("www.") ? host.slice(4) : host;
    const www = `www.${root}`;

    const [rootA, wwwA, txt] = await Promise.all([
      resolve(root, "A"),
      resolve(www, "A"),
      resolve(`_lovable.${root}`, "TXT"),
    ]);

    const records = [
      { type: "A", name: "@", host: root, expected: TARGET_IP, found: rootA, verdict: verdictFor(rootA) },
      { type: "A", name: "www", host: www, expected: TARGET_IP, found: wwwA, verdict: verdictFor(wwwA) },
      {
        type: "TXT",
        name: "_lovable",
        host: `_lovable.${root}`,
        expected: "lovable_verify=...",
        found: txt,
        verdict: (txt.length > 0 ? "ok" : "ausente") as Verdict,
      },
    ];

    const pointed = records[0].verdict === "ok" || records[1].verdict === "ok";

    let httpsOk = false;
    try {
      const probe = await fetch(`https://${host}/`, { method: "HEAD", redirect: "manual" });
      httpsOk = probe.status > 0 && probe.status < 500;
    } catch {
      httpsOk = false;
    }

    return new Response(
      JSON.stringify({ hostname: host, root, www, target_ip: TARGET_IP, records, pointed, https_ok: httpsOk }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("check-domain-dns error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
