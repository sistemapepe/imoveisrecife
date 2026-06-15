// AI SEO description generator for properties using Lovable AI Gateway
// No API key required — uses LOVABLE_API_KEY automatically
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PropertyInput {
  title?: string;
  type?: string;
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  parking?: number;
  area?: number;
  neighborhood?: string;
  city?: string;
  amenities?: string[];
  price?: number;
  description?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Auth check — only authenticated users (admins should call this)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: authHeader,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
      },
    });
    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const property: PropertyInput = await req.json();

    // Basic input validation
    if (!property || typeof property !== "object") {
      return new Response(JSON.stringify({ error: "Dados inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway não configurado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Você é um especialista em copywriting para sites de imóveis de alto padrão no Brasil, focado em SEO local para Recife/PE.

Gere uma descrição otimizada para SEO do seguinte imóvel. Inclua palavras-chave relevantes naturalmente (tipo do imóvel, bairro, cidade, características principais), com tom persuasivo, profissional e elegante. Use 120 a 220 palavras. Não invente informações que não estão nos dados. Não use emojis nem hashtags.

Dados do imóvel:
- Título: ${property.title || "—"}
- Tipo: ${property.type || "—"}
- Bairro: ${property.neighborhood || "—"}
- Cidade: ${property.city || "—"}
- Área: ${property.area || "—"} m²
- Quartos: ${property.bedrooms || 0} (${property.suites || 0} suítes)
- Banheiros: ${property.bathrooms || 0}
- Vagas: ${property.parking || 0}
- Diferenciais: ${(property.amenities || []).join(", ") || "—"}
- Descrição existente (use como referência se útil): ${property.description?.slice(0, 500) || "—"}

Retorne APENAS um JSON válido com este formato exato:
{"title":"título SEO de 50-60 caracteres","metaDescription":"meta description de 140-160 caracteres","description":"descrição completa em parágrafos","keywords":"5 a 10 palavras-chave separadas por vírgula"}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você responde sempre em JSON válido, sem markdown, sem explicações." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns segundos." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos da IA esgotados. Adicione fundos no workspace." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("AI error:", aiRes.status, txt);
      return new Response(
        JSON.stringify({ error: "Falha na geração da IA", fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiData = await aiRes.json();
    const content: string = aiData.choices?.[0]?.message?.content || "";

    let parsed: any = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (_) {
      parsed = null;
    }

    if (!parsed) {
      return new Response(
        JSON.stringify({ error: "Resposta inválida da IA", fallback: true, raw: content }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("seo-generate error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno", fallback: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
