import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const VALID_DAYS = [7, 30, 60, 90] as const;
type Days = typeof VALID_DAYS[number];

const VALUE_COLUMN_NAMES = ["venda", "faturamento", "receita", "quantidade"];

function log(...args: unknown[]) {
  console.log("[generate-forecast]", ...args);
}

function logError(...args: unknown[]) {
  console.error("[generate-forecast]", ...args);
}

function detectDateColumn(columns: string[]): string | null {
  const dateKeywords = ["data", "date", "dia", "mes", "periodo", "created_at", "createdat"];
  for (const kw of dateKeywords) {
    const found = columns.find(
      (c) => c.toLowerCase().replace(/[\s_-]/g, "") === kw.toLowerCase().replace(/[\s_-]/g, "")
    );
    if (found) return found;
  }
  for (const kw of dateKeywords) {
    const found = columns.find((c) =>
      c.toLowerCase().includes(kw.toLowerCase())
    );
    if (found) return found;
  }
  return null;
}

function detectValueColumn(columns: string[]): string | null {
  for (const name of VALUE_COLUMN_NAMES) {
    const found = columns.find(
      (c) => c.toLowerCase().replace(/[\s_-]/g, "") === name
    );
    if (found) return found;
  }
  for (const name of VALUE_COLUMN_NAMES) {
    const found = columns.find((c) =>
      c.toLowerCase().includes(name)
    );
    if (found) return found;
  }
  const numericColumns = columns.filter((c) => {
    const lower = c.toLowerCase();
    return (
      lower.includes("valor") ||
      lower.includes("total") ||
      lower.includes("preco") ||
      lower.includes("price") ||
      lower.includes("amount") ||
      lower.includes("sales") ||
      lower.includes("revenue")
    );
  });
  return numericColumns[0] || null;
}

function extractTimeSeries(
  rows: Record<string, unknown>[],
  dateCol: string,
  valueCol: string
): { date: string; value: number }[] {
  return rows
    .map((row) => {
      const rawDate = row[dateCol];
      const rawValue = row[valueCol];
      if (rawDate == null || rawValue == null) return null;
      const dateStr = String(rawDate).trim();
      const value = typeof rawValue === "number" ? rawValue : parseFloat(String(rawValue).replace(",", "."));
      if (!dateStr || isNaN(value)) return null;
      let parsed: string;
      if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        parsed = dateStr.slice(0, 10);
      } else if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
        const [d, m, y] = dateStr.split("/");
        parsed = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      } else {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        parsed = d.toISOString().slice(0, 10);
      }
      return { date: parsed, value };
    })
    .filter((x): x is { date: string; value: number } => x !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildForecastPrompt(
  timeSeries: { date: string; value: number }[],
  days: number
): string {
  return [
    `Com base na série temporal de vendas abaixo, gere uma previsão para os próximos ${days} dias.`,
    "Retorne UM JSON válido (sem markdown, sem ```) com:",
    "{",
    '  "forecast": [',
    '    {"date": "YYYY-MM-DD", "predicted_value": number, "lower_bound": number, "upper_bound": number}',
    "  ],",
    '  "confidence": number (0-1),',
    '  "trend": "up|down|stable",',
    '  "recommendation": "Texto com recomendação de ação em português"',
    "}",
    "",
    `Série temporal (últimos ${timeSeries.length} dias):`,
    JSON.stringify(timeSeries),
    "",
    `Dias a prever: ${days}`,
  ].join("\n");
}

function parseGeminiResponse(text: string): Record<string, unknown> | null {
  const jsonMatch =
    text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ||
    text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  const raw = jsonMatch[1] || jsonMatch[0];
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function validateForecastResponse(data: unknown): {
  forecast: { date: string; predicted_value: number; lower_bound: number; upper_bound: number }[];
  confidence: number;
  trend: string;
  recommendation: string;
} | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.forecast) || obj.forecast.length === 0) return null;
  const validForecast = obj.forecast.every(
    (f: unknown) =>
      f &&
      typeof f === "object" &&
      typeof (f as Record<string, unknown>).date === "string" &&
      typeof (f as Record<string, unknown>).predicted_value === "number" &&
      typeof (f as Record<string, unknown>).lower_bound === "number" &&
      typeof (f as Record<string, unknown>).upper_bound === "number"
  );
  if (!validForecast) return null;

  const confidence = typeof obj.confidence === "number" ? obj.confidence : null;
  const trend = typeof obj.trend === "string" ? obj.trend : null;
  const recommendation = typeof obj.recommendation === "string" ? obj.recommendation : null;

  if (confidence === null || !trend || !recommendation) return null;
  if (!["up", "down", "stable"].includes(trend)) return null;
  if (confidence < 0 || confidence > 1) return null;

  return {
    forecast: obj.forecast as {
      date: string;
      predicted_value: number;
      lower_bound: number;
      upper_bound: number;
    }[],
    confidence,
    trend,
    recommendation,
  };
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { dashboard_id, days } = body as { dashboard_id?: string; days?: number };

    if (!dashboard_id) {
      return new Response(JSON.stringify({ error: "dashboard_id é obrigatório" }), { status: 400 });
    }

    if (!days || !(VALID_DAYS as readonly number[]).includes(days)) {
      return new Response(
        JSON.stringify({ error: `days deve ser um de: ${VALID_DAYS.join(", ")}` }),
        { status: 400 }
      );
    }

    log("Fetching dashboard", dashboard_id);

    const { data: dashboard, error: dashError } = await supabase
      .from("dashboards")
      .select("config_json, user_id")
      .eq("id", dashboard_id)
      .single();

    if (dashError || !dashboard) {
      logError("Dashboard not found", dashError);
      return new Response(JSON.stringify({ error: "Dashboard não encontrado" }), { status: 404 });
    }

    const user_id = dashboard.user_id;
    const configJson =
      typeof dashboard.config_json === "string"
        ? JSON.parse(dashboard.config_json)
        : dashboard.config_json || {};

    log("Fetching data_uploads for user", user_id);

    const { data: uploads, error: uploadsError } = await supabase
      .from("data_uploads")
      .select("processed_data, detected_columns")
      .eq("user_id", user_id)
      .not("processed_data", "is", null)
      .order("created_at", { ascending: false })
      .limit(1);

    if (uploadsError || !uploads || uploads.length === 0) {
      logError("No data uploads found", uploadsError);
      return new Response(JSON.stringify({ error: "Nenhum upload de dados encontrado" }), { status: 404 });
    }

    const upload = uploads[0];
    const rows = (upload.processed_data as Record<string, unknown>[]) || [];
    const columns = (upload.detected_columns as string[]) || [];

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhum dado encontrado no upload" }), { status: 404 });
    }

    log(`Upload has ${rows.length} rows, columns:`, columns);

    const dateCol = detectDateColumn(columns);
    const valueCol = detectValueColumn(columns);

    if (!dateCol || !valueCol) {
      logError("Could not detect date or value column", { dateCol, valueCol, columns });
      return new Response(
        JSON.stringify({
          error: "Não foi possível identificar colunas de data e valor nos dados",
          detected: { dateCol, valueCol, columns },
        }),
        { status: 400 }
      );
    }

    log(`Detected date column: "${dateCol}", value column: "${valueCol}"`);

    const timeSeries = extractTimeSeries(rows, dateCol, valueCol);

    if (timeSeries.length < 7) {
      log(`Insufficient data points: ${timeSeries.length}`);
      return new Response(JSON.stringify({ error: "Dados insuficientes para previsão" }), { status: 400 });
    }

    log(`Extracted ${timeSeries.length} data points`);

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey || geminiKey === "placeholder" || geminiKey === "setup_only") {
      logError("GEMINI_API_KEY not configured");
      return new Response(JSON.stringify({ error: "API key do Gemini não configurada" }), { status: 500 });
    }

    const prompt = buildForecastPrompt(timeSeries, days);

    log("Calling Gemini API");

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      logError("Gemini API error", geminiRes.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao chamar API do Gemini", detail: errorText }),
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) {
      logError("Empty Gemini response", JSON.stringify(geminiData));
      return new Response(JSON.stringify({ error: "Resposta vazia do Gemini" }), { status: 502 });
    }

    log("Parsing Gemini response");

    const parsed = parseGeminiResponse(text);
    if (!parsed) {
      logError("Failed to parse JSON from Gemini response", text);
      return new Response(
        JSON.stringify({ error: "Resposta inválida do Gemini (JSON inválido)", raw: text }),
        { status: 502 }
      );
    }

    const validated = validateForecastResponse(parsed);
    if (!validated) {
      logError("Gemini response missing expected fields", JSON.stringify(parsed));
      return new Response(
        JSON.stringify({ error: "Resposta do Gemini com formato inesperado", raw: parsed }),
        { status: 502 }
      );
    }

    log("Saving forecast to dashboard config");

    const updatedConfig = {
      ...configJson,
      forecast: {
        ...(configJson.forecast || {}),
        [String(days)]: {
          generated_at: new Date().toISOString(),
          days,
          ...validated,
        },
      },
    };

    const { error: updateError } = await supabase
      .from("dashboards")
      .update({ config_json: updatedConfig })
      .eq("id", dashboard_id);

    if (updateError) {
      logError("Failed to update dashboard config", updateError);
    }

    log("Forecast generated successfully");

    return new Response(
      JSON.stringify({
        status: "completed",
        forecast: validated.forecast,
        confidence: validated.confidence,
        trend: validated.trend,
        recommendation: validated.recommendation,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    logError("Unhandled error", message, stack);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
