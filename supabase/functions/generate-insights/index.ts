import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  try {
    const { upload_id, segment } = await req.json();
    if (!upload_id) throw new Error("upload_id is required");

    const { data: upload, error: uploadError } = await supabase
      .from("data_uploads")
      .select("processed_data, detected_columns, user_id")
      .eq("id", upload_id)
      .single();

    if (uploadError || !upload) {
      return new Response(JSON.stringify({ error: "Upload not found" }), { status: 404 });
    }

    const rows = (upload.processed_data as any[]) || [];
    const columns = (upload.detected_columns as string[]) || [];

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "No processed_data found" }), { status: 404 });
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey || geminiKey === "placeholder" || geminiKey === "setup_only") {
      console.log("GEMINI_API_KEY not configured — skipping insight generation");
      return new Response(JSON.stringify({ status: "skipped" }), { status: 200 });
    }

    const sample = rows.slice(0, 20);

    const prompt = [
      "Você é um analista de dados especialista em varejo e e-commerce.",
      "Analise os seguintes dados de vendas e retorne UM JSON válido (sem markdown, sem código, apenas JSON puro) com esta estrutura:",
      "",
      '{',
      '  "summary": "Resumo em 2-3 frases do desempenho geral",',
      '  "kpis": {',
      '    "total_revenue": number,',
      '    "total_orders": number,',
      '    "avg_ticket": number,',
      '    "top_product": string,',
      '    "growth_rate": number',
      '  },',
      '  "alerts": [',
      '    {',
      '      "type": "warning|danger|opportunity",',
      '      "title": "Título curto",',
      '      "description": "Descrição detalhada",',
      '      "action": "Ação recomendada"',
      '    }',
      '  ],',
      '  "forecast": {',
      '    "next_30_days_revenue": number,',
      '    "confidence": number (0-1),',
      '    "trend": "up|down|stable"',
      '  }',
      '}',
      "",
      `Segmento: ${segment || "geral"}`,
      `Colunas detectadas: ${JSON.stringify(columns)}`,
      "Amostra de dados (primeiras 20 linhas):",
      JSON.stringify(sample),
    ].join("\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
        }),
      }
    );

    const geminiRes = await response.json();
    const text = geminiRes?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || text.match(/\{[\s\S]*\}/);
    const rawJson = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : "{}";
    let insight: any;
    try {
      insight = JSON.parse(rawJson);
    } catch {
      insight = {};
    }

    if (!insight.summary || !insight.kpis || !insight.alerts || !insight.forecast) {
      throw new Error("Gemini response missing expected fields");
    }

    await supabase.from("data_uploads").update({
      insight_summary: insight.summary,
      insight_kpis: insight.kpis,
      insight_alerts: insight.alerts,
      insight_forecast: insight.forecast,
    }).eq("id", upload_id);

    const dangerAlerts = (insight.alerts as any[]).filter((a: any) => a.type === "danger");
    for (const alert of dangerAlerts) {
      if (upload.user_id) {
        await supabase.from("notifications").insert({
          user_id: upload.user_id,
          type: "insight_alert",
          title: alert.title,
          message: alert.description,
          channel: "in_app",
          metadata: { upload_id, segment, alert_type: "danger" },
        });
      }
    }

    return new Response(JSON.stringify({ status: "completed", insight }), { status: 200 });
  } catch (err: any) {
    console.error("generate-insights error:", err.message, err.stack);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
