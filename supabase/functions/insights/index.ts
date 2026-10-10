import { supabaseAdmin, getCorsHeaders } from "../_shared/supabase-admin.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get("origin")) });
  }

  try {
    const { rows, columns } = await req.json();
    if (!rows?.length || !columns?.length) throw new Error("Nenhum dado enviado.");

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY não configurada.");

    const prompt = `Você é um analista de varejo sênior. Analise os seguintes dados de uma loja:

Colunas: ${columns.join(", ")}
Amostra de ${Math.min(rows.length, 10)} linhas:
${JSON.stringify(rows.slice(0, 10), null, 2)}

Gere:
1. **Insight do Dia** — Uma observação crítica (margem apertada, inadimplência, ticket baixo, etc.)
2. **Recomendação** — Uma ação prática que o lojista pode tomar agora
3. **Alerta** — Se houver algum risco (estoque parado, cliente inadimplente, etc.)

Responda em português, formato JSON:
{"insight": "...", "recomendacao": "...", "alerta": "..."}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
      }),
    });

    const geminiRes = await response.json();
    const text = geminiRes?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { insight: text, recomendacao: "", alerta: "" };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
    });
  }
});
