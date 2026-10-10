// API Service Layer — roteia chamadas para Edge Functions (Supabase) ou Express (fallback)

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ioijbixifvbosythznhh.supabase.co";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const EXPRESS_URL = ""; // Quando vazio, usa relative path (mesmo servidor)

// Edge Functions que já foram migradas
const EDGE_FUNCTIONS: Record<string, string> = {
  chat: `${SUPABASE_URL}/functions/v1/chat`,
  "churn-predictor": `${SUPABASE_URL}/functions/v1/churn-predictor`,
  insights: `${SUPABASE_URL}/functions/v1/insights`,
  upload: `${SUPABASE_URL}/functions/v1/upload`,
  "get-qr": `${SUPABASE_URL}/functions/v1/get-qr`,
  "auth-register": `${SUPABASE_URL}/functions/v1/auth-register`,
};

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { supabase } = await import("../lib/supabase");
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return { Authorization: `Bearer ${ANON_KEY}` };
}

function getEdgeFunctionUrl(name: string): string | null {
  return EDGE_FUNCTIONS[name] || null;
}

export async function apiPost(endpoint: string, body: any, options?: { useEdge?: string }) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (options?.useEdge) {
    const efUrl = getEdgeFunctionUrl(options.useEdge);
    if (efUrl) {
      Object.assign(headers, await getAuthHeaders(), { "Content-Type": "application/json" });
      const res = await fetch(efUrl, { method: "POST", headers, body: JSON.stringify(body) });
      return res.json();
    }
  }

  Object.assign(headers, { "Content-Type": "application/json" });
  const res = await fetch(`${EXPRESS_URL}${endpoint}`, { method: "POST", headers, body: JSON.stringify(body) });
  return res.json();
}

export async function apiPostFormData(endpoint: string, formData: FormData, options?: { useEdge?: string }) {
  if (options?.useEdge) {
    const efUrl = getEdgeFunctionUrl(options.useEdge);
    if (efUrl) {
      const headers = await getAuthHeaders();
      const res = await fetch(efUrl, { method: "POST", headers, body: formData });
      return res.json();
    }
  }

  const res = await fetch(`${EXPRESS_URL}${endpoint}`, { method: "POST", body: formData });
  return res.json();
}

export async function apiGetBlob(endpoint: string, options?: { useEdge?: string }) {
  if (options?.useEdge) {
    const efUrl = getEdgeFunctionUrl(options.useEdge);
    if (efUrl) {
      const headers = await getAuthHeaders();
      const res = await fetch(efUrl, { method: "GET", headers });
      return res.blob();
    }
  }

  const res = await fetch(`${EXPRESS_URL}${endpoint}`);
  return res.blob();
}

export async function apiGet(endpoint: string, options?: { useEdge?: string }) {
  if (options?.useEdge) {
    const efUrl = getEdgeFunctionUrl(options.useEdge);
    if (efUrl) {
      const headers = await getAuthHeaders();
      const res = await fetch(efUrl, { method: "GET", headers });
      return res.json();
    }
  }

  const res = await fetch(`${EXPRESS_URL}${endpoint}`);
  return res.json();
}
