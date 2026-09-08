import type { VercelRequest, VercelResponse } from '@vercel/node';

/* ──────────────────────────────────────────────────────────────────────
   Chat API Standalone — SEMPRE retorna JSON válido
   Não depende do server.ts Express (que pode falhar no import)
   ────────────────────────────────────────────────────────────────────── */

const SYSTEM_CONTEXT = `Você é um Consultor de BI e Inteligência de Negócios do Foco em Dados.
Seu objetivo é responder com precisão, clareza e pragmatismo em português brasileiro (PT-BR).
Você ajuda com: análise de dados, planilhas, métricas de negócio, prospecção B2B, redesign de sites.
Seja direto, útil e use formatação com bullets quando apropriado.`;

function fallbackReply(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('resuma') || m.includes('resumo')) {
    return '📊 Para gerar um resumo, faça upload de uma planilha (CSV/XLSX) e eu analisarei automaticamente com gráficos e KPIs.';
  }
  if (m.includes('gráfico') || m.includes('chart') || m.includes('dashboard')) {
    return '📈 O dashboard Power BI é gerado automaticamente ao fazer upload de dados. Ele inclui: Barras por Categoria, Linha de Tendência, Pizza de Distribuição e Cards de KPI.';
  }
  if (m.includes('prospecção') || m.includes('lead') || m.includes('cliente')) {
    return '🎯 A prospecção usa Google Places + OpenStreetMap + CNAE para encontrar empresas reais. Cada lead tem score de oportunidade.';
  }
  if (m.includes('contrato') || m.includes('proposta')) {
    return '📄 Contratos são gerados automaticamente no CRM com dados da empresa (Razão Social, CNPJ, Valor, Cláusulas). Visualize e baixe em PDF.';
  }
  if (m.includes('preço') || m.includes('plano') || m.includes('quanto')) {
    return '💰 Planos: Starter R$ 97/mês | Business R$ 197/mês | Premium R$ 197/mês. Taxa de implantação: R$ 997 (única).';
  }
  return `Interessante! Posso ajudar com:

📊 Análise de dados e planilhas
🎯 Prospecção B2B e leads
📄 Contratos e propostas
💰 Planos e preços
🎨 Redesign de sites

O que te interessa mais?`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // HEADERS GARANTIDOS — sempre JSON
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido', reply: 'Use POST' });
  }

  const { message, contextReport, datasetSummary, history } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Mensagem obrigatória', reply: 'Digite uma mensagem.' });
  }

  // Tentar Gemini; fallback para pattern matching
  let reply: string;
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      reply = fallbackReply(message);
    } else {
      const { GoogleGenAI } = await import('@google/genai').catch(() => ({ GoogleGenAI: null }));
      if (!GoogleGenAI) { reply = fallbackReply(message); } else {
        const ai = new GoogleGenAI({ apiKey });
        let ctx = SYSTEM_CONTEXT;
        if (contextReport) {
          ctx += `\nRELATÓRIO: ${contextReport.question || 'Análise Geral'}\nResumo: ${contextReport.executive_summary || ''}`;
        }
        if (datasetSummary) {
          ctx += `\nDADOS: ${datasetSummary.slice(0, 2000)}`;
        }
        const contents = [
          { role: 'user' as const, parts: [{ text: `${ctx}\n\nPERGUNTA: ${message}` }] },
        ];
        // Add history
        if (Array.isArray(history)) {
          for (const h of history.slice(-8)) {
            contents.push({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] });
          }
          contents.push({ role: 'user' as const, parts: [{ text: message }] });
        }
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents,
          config: { temperature: 0.7, maxOutputTokens: 800 },
        });
        reply = response.text || fallbackReply(message);
      }
    }
  } catch (err: any) {
    console.error('[ChatAPI] Gemini error:', err?.message);
    reply = fallbackReply(message);
  }

  // GARANTIR que sempre retornamos JSON válido
  try {
    return res.status(200).json({ reply });
  } catch {
    // Last resort: raw JSON string
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ reply }));
  }
}
