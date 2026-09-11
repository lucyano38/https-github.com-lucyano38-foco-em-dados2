import type { VercelRequest, VercelResponse } from '@vercel/node';

/* ──────────────────────────────────────────────────────────────────────
   Site Chat — Assistente do Foco em Dados
   Responde sobre funcionalidades, planos, preços, prospecção, CRM
   Funciona sem API key (pattern matching inteligente)
   Quando GEMINI_API_KEY estiver configurada, usa Gemini automaticamente
   ────────────────────────────────────────────────────────────────────── */

/* ──────────────────────────────────────────────────────────────────────
   Respostas inteligentes por tópico
   ────────────────────────────────────────────────────────────────────── */
function fallbackReply(message: string): string {
  const m = message.toLowerCase();

  if (m.includes('preço') || m.includes('preco') || m.includes('quanto') || m.includes('custa') || m.includes('valor') || m.includes('plano') || m.includes('mensal')) {
    return `📋 Planos Foco em Dados:

🆓 Grátis — Upload de planilha (até 100 linhas)
💎 Plataforma PRO — R$ 39,90/mês — Acesso ilimitado a todas as ferramentas
🛠️ Serviços sob demanda: Landing Page R$297, Site Institucional R$597, E-commerce R$997

O plano PRO inclui: Acesso ilimitado a todas as ferramentas, Automação WhatsApp, CRM completo, Analytics, e todas as funcionalidades.

Quer testar? Acesse focoemdados.com.br e comece grátis!`;
  }

  if (m.includes('prospecção') || m.includes('prospec') || m.includes('buscar') || m.includes('encontr') || m.includes('leads') || m.includes('cliente') || m.includes('empresa')) {
    return `🎯 Hermes Growth Engine — Prospecção Inteligente:

Como funciona:
1. Você escolhe o nicho (ex: barbearias, restaurantes, clínicas)
2. Informa a cidade e raio em km
3. O sistema busca em 3 fontes simultâneas: Google Places, OpenStreetMap e CNAE
4. Cada lead recebe um score de oportunidade (0-100)
5. Detecta quem TEM site (redesign) e quem NÃO TEM (oportunidade)
6. Gera preview de redesign automaticamente
7. Salva no CRM com 1 clique

Experimente agora em focoemdados.com.br! 🚀`;
  }

  if (m.includes('redesign') || m.includes('site novo') || m.includes('página nova') || m.includes('landing')) {
    return `🎨 Redesign Inteligente com IA:

O Foco em Dados gera automaticamente uma página de redesign personalizada para cada lead:

✅ 16 nichos mapeados (restaurantes, clínicas, barbearias, advocacia...)
✅ Cores, hero image e copy específicas do nicho
✅ Auditoria visual: problemas + soluções
✅ Proposta comercial: R$ 1.500 setup + R$ 39,90/mês
✅ WhatsApp flutuante com mensagem pré-definida

O preview fica disponível no Hermes Growth Engine após prospectar!`;
  }

  if (m.includes('whatsapp') || m.includes('contato') || m.includes('falar') || m.includes('atendimento') || m.includes('suporte') || m.includes('equipe')) {
    return `📱 Fale Conosco:

WhatsApp: 55 11 99441-1307
E-mail: atendimento@focoemdados.com.br

Nossa equipe responde rapidamente! Pode tirar dúvidas sobre planos, funcionalidades ou agendar uma demonstração.`;
  }

  if (m.includes('crm') || m.includes('gestão') || m.includes('pipeline') || m.includes('funil') || m.includes('comercial')) {
    return `📊 CRM Integrado:

O pipeline comercial gerencia seus leads do início ao fechamento:

1. Novo lead prospectado (via Hermes Growth Engine)
2. Contatado (follow-up WhatsApp)
3. Qualificado (interesse confirmado)
4. Proposta enviada (setup R$ 1.500 + R$ 39,90/mês)
5. Fechado! 🎉

Tudo integrado com WhatsApp e métricas de conversão.`;
  }

  if (m.includes('open') && (m.includes('squad') || m.includes('agent'))) {
    return `🤖 OpenSquad AI (Plano Premium):

Um time completo de 5 agentes IA trabalhando para você:

👨‍💼 Alexandre — PM & Líder (orquestra tudo)
🔍 Bia — Data Scout (busca e qualifica leads)
💻 Lucas — Redesigner (auditoria UI/UX + redesigns)
✍️ Camila — Copywriter (mensagens WhatsApp + scripts)
🛡️ Gabriel — QA (valida qualidade e fechamento)

Missão unificada: prospectar → auditar → redesign → gerar mensagens → contrato pronto!

Disponível no plano Premium por R$ 39,90/mês.`;
  }

  if (m.includes('o que') || m.includes('explica') || m.includes('como funciona') || m.includes('sobre') || m.includes('foco em dados')) {
    return `👋 O que é o Foco em Dados?

Somos uma plataforma de prospecção B2B com IA para empresas que vendem serviços digitais (sites, redesigns, marketing) para empresas locais.

Como funciona:
🔍 Prospecção automática (Google Maps + OSM + CNAE)
🎨 Redesign gerado por IA para cada lead
📊 CRM integrado para gerenciar o funil
✉️ Automação de mensagens WhatsApp
🤖 Agentes IA (OpenSquad) no plano Premium

Preços: Plataforma PRO R$ 39,90/mês
Site: focoemdados.com.br`;
  }

  if (m.includes('obrigad') || m.includes('valeu') || m.includes('thanks')) {
    return `Por nada! 😊 Se precisar de mais alguma coisa, é só chamar.

Quer experimentar a prospecção? Acesse focoemdados.com.br e busque seu nicho + cidade!

Ou fale com nossa equipe: WhatsApp 55 11 99441-1307`;
  }

  // Default response
  return `Interessante! Posso te ajudar com:

📋 Planos e preços — valores e funcionalidades de cada plano
🎯 Prospecção — como o Hermes Growth Engine encontra leads
🎨 Redesign — como geramos páginas personalizadas com IA
📊 CRM — gestão de leads e funil de vendas
🤖 OpenSquad — agentes IA autônomos
📱 Contato — WhatsApp e e-mail da equipe

O que te interessa mais?`;
}

/* ──────────────────────────────────────────────────────────────────────
   Gemini API call (quando key estiver disponível)
   ────────────────────────────────────────────────────────────────────── */
async function geminiReply(message: string, history: Array<{role: string; text: string}>): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return null;

  try {
    // Dynamic import to avoid build errors when package isn't available
    const genai = await import('@google/genai').catch(() => null);
    if (!genai) return null;

    const ai = new genai.GoogleGenAI({ apiKey });

    const SITE_CONTEXT = `Você é o assistente virtual do "Foco em Dados" (focoemdados.com.br).
Plataforma de prospecção B2B com IA. Plataforma PRO: R$39,90/mês. Serviços sob demanda: Landing Page R$297, Site Institucional R$597, E-commerce R$997, Automação WhatsApp R$197/mês, Hospedagem R$49,90/mês.
Funcionalidades: Hermes Growth Engine (prospecção), Preview Redesign IA, CRM, OpenSquad AI.
WhatsApp: 55 11 99441-1307. Responda em português, seja direto e persuasivo.`;

    const contents = [
      { role: 'model' as const, parts: [{ text: SITE_CONTEXT }] },
      ...history.slice(-10).map(h => ({
        role: (h.role === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: [{ text: h.text }],
      })),
      { role: 'user' as const, parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents,
      config: { temperature: 0.7, maxOutputTokens: 800 },
    });

    return response.text || null;
  } catch {
    return null;
  }
}

/* ──────────────────────────────────────────────────────────────────────
   Vercel serverless handler
   ────────────────────────────────────────────────────────────────────── */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { message, history } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Mensagem obrigatória' });
  }

  // Try Gemini first, fall back to pattern matching
  let reply: string;
  try {
    const geminiResult = await geminiReply(message, history || []);
    reply = geminiResult || fallbackReply(message);
  } catch {
    reply = fallbackReply(message);
  }

  return res.status(200).json({ reply });
}