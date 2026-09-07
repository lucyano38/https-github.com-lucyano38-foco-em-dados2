import type { VercelRequest, VercelResponse } from '@vercel/node';

/* ──────────────────────────────────────────────────────────────────────
   Site Chat — Gemini com contexto do Foco em Dados
   Com fallback inteligente quando GEMINI_API_KEY não está configurada
   ────────────────────────────────────────────────────────────────────── */

const SITE_CONTEXT = `Você é o assistente virtual oficial do "Foco em Dados" (focoemdados.com.br).
Seu papel é EXPLICAR as funcionalidades do site, tirar dúvidas de visitantes e converter em leads.

=== O QUE É O FOCO EM DADOS ===
Plataforma de prospecção B2B e redesign de sites para empresas locais no Brasil.
Combina: Google Maps + OpenStreetMap + IA (Gemini) + CRM integrado.

=== FUNCIONALIDADES PRINCIPAIS ===
1. HERMES GROWTH ENGINE (Prospecção Inteligente) — Busca empresas reais por nicho + cidade + raio. Fontes: Google Places, OpenStreetMap, CNAE. Detecta quem tem/não tem site. Score de oportunidade. Redesign automático com IA.
2. PREVIEW DE REDESIGN DINÂMICO (/preview-redesign) — Página personalizada por nicho (16 nichos). Cores, hero, features, CTA. WhatsApp flutuante. Proposta: R$ 1.500 setup + R$ 39,90/mês.
3. CRM COMERCIAL — Pipeline: Novo → Contatado → Qualificado → Proposta → Fechado.
4. OPENSQUAD AI (Premium) — 5 agentes IA: PM, Hunter, Redesigner, Copywriter, QA.

=== PLANOS E PREÇOS ===
- GRÁTIS: Upload de planilha (até 100 linhas)
- STARTER: R$ 97/mês — prospecção básica + preview
- BUSINESS: R$ 197/mês — ilimitado + CRM + redesigns
- PREMIUM: R$ 39,90/mês — ECOSISTEMA COMPLETO (OpenSquad + Automação + CRM + Analytics)

=== CONTATOS ===
WhatsApp: 55 11 99441-1307 | E-mail: atendimento@focoemdados.com.br`;

/* ──────────────────────────────────────────────────────────────────────
   Fallback pattern-matching (quando Gemini não está disponível)
   ────────────────────────────────────────────────────────────────────── */
function fallbackReply(message: string): string {
  const m = message.toLowerCase();

  if (m.includes('preço') || m.includes('preco') || m.includes('quanto') || m.includes('custa') || m.includes('valor') || m.includes('plano')) {
    return `📋 **Planos Foco em Dados:**

🆓 **Grátis** — Upload de planilha (até 100 linhas)
💎 **Starter** — R$ 97/mês — prospecção básica + preview redesign
🚀 **Business** — R$ 197/mês — ilimitado + CRM + redesigns
⚡ **Premium** — R$ 39,90/mês — **ECOSISTEMA COMPLETO**

O plano **Premium** inclui: OpenSquad AI (5 agentes), Automação WhatsApp, CRM completo, Analytics, e todas as funcionalidades.

Quer testar? Acesse focoemdados.com.br e comece grátis!`;
  }

  if (m.includes('prospecção') || m.includes('prospec') || m.includes('buscar') || m.includes('encontr') || m.includes('leads') || m.includes('cliente')) {
    return `🎯 **Hermes Growth Engine — Prospecção Inteligente:**

Como funciona:
1. Você escolhe o **nicho** (ex: barbearias, restaurantes, clínicas)
2. Informa a **cidade** e **raio** em km
3. O sistema busca em **3 fontes simultâneas**: Google Places, OpenStreetMap e CNAE
4. Cada lead recebe um **score de oportunidade** (0-100)
5. Detecta quem TEM site (redesign) e quem NÃO TEM (oportunidade)
6. Gera **preview de redesign** automaticamente
7. Salva no **CRM** com 1 clique

Experimente agora em focoemdados.com.br! 🚀`;
  }

  if (m.includes('redesign') || m.includes('site') || m.includes('web') || m.includes('página')) {
    return `🎨 **Redesign Inteligente com IA:**

O Foco em Dados gera automaticamente uma **página de redesign personalizada** para cada lead prospectado:

✅ 16 nichos mapeados (restaurantes, clínicas, barbearias, advocacia...)
✅ Cores, hero image e copy específicas do nicho
✅ Auditoria visual: problemas ❌ + soluções ✅
✅ Proposta comercial embutida: R$ 1.500 setup + R$ 39,90/mês
✅ WhatsApp flutuante com mensagem pré-definida

O preview fica em: /preview-redesign?nome=...&nicho=...&cidade=...
Visível no Hermes Growth Engine após prospectar!`;
  }

  if (m.includes('whatsapp') || m.includes('contato') || m.includes('falar') || m.includes('atendimento') || m.includes('suporte')) {
    return `📱 **Fale Conosco:**

WhatsApp: **55 11 99441-1307**
E-mail: **atendimento@focoemdados.com.br**

Nossa equipe responde rapidamente! Pode tirar dúvidas sobre planos, funcionalidades ou agendar uma demonstração.`;
  }

  if (m.includes('crm') || m.includes('gestão') || m.includes('pipeline') || m.includes('funil')) {
    return `📊 **CRM Integrado:**

O pipeline comercial do Foco em Dados gerencia seus leads do início ao fechamento:

**Etapa 1:** Novo lead prospectado (via Hermes Growth Engine)
**Etapa 2:** Contatado (follow-up WhatsApp)
**Etapa 3:** Qualificado (interesse confirmado)
**Etapa 4:** Proposta enviada (setup R$ 1.500 + R$ 39,90/mês)
**Etapa 5:** Fechado! 🎉

Tudo integrado com WhatsApp e métricas de conversão.`;
  }

  if (m.includes('open') && (m.includes('squad') || m.includes('agent'))) {
    return `🤖 **OpenSquad AI (Plano Premium):**

Um time completo de 5 agentes IA trabalhando para você:

👨‍💼 **Alexandre** — PM & Líder (orquestra tudo)
🔍 **Bia** — Data Scout (busca e qualifica leads)
💻 **Lucas** — Redesigner (auditoria UI/UX + redesigns)
✍️ **Camila** — Copywriter (mensagens WhatsApp + scripts)
🛡️ **Gabriel** — QA (valida qualidade e fechamento)

Missão unificada: prospectar → auditar → redesign → gerar mensagens → contrato pronto!

Disponível no plano **Premium por R$ 39,90/mês**.`;
  }

  if (m.includes('o que') || m.includes('explica') || m.includes('como funciona') || m.includes('sobre')) {
    return `👋 **O que é o Foco em Dados?**

Somos uma plataforma de **prospecção B2B com IA** para empresas que vendem serviços digitais (sites, redesigns, marketing) para empresas locais.

**Como funciona:**
1. 🔍 Prospecção automática (Google Maps + OSM + CNAE)
2. 🎨 Redesign gerado por IA para cada lead
3. 📊 CRM integrado para gerenciar o funil
4. ✉️ Automação de mensagens WhatsApp
5. 🤖 Agentes IA (OpenSquad) no plano Premium

**Preços:** Planos de R$ 39,90/mês a R$ 197/mês
**Site:** focoemdados.com.br`;
  }

  if (m.includes('obrigad') || m<|im_start|>'valeu') {
    return `Por nada! 😊 Se precisar de mais alguma coisa, é só chamar.

Quer experimentar a prospecção? Acesse focoemdados.com.br e busque seu nicho + cidade!

Ou fale com nossa equipe: WhatsApp 55 11 99441-1307`;
  }

  // Default response
  return `Interessante! Posso te ajudar com:

📋 **Planos e preços** — valores e funcionalidades de cada plano
🎯 **Prospecção** — como o Hermes Growth Engine encontra leads
🎨 **Redesign** — como geramos páginas personalizadas com IA
📊 **CRM** — gestão de leads e funil de vendas
🤖 **OpenSquad** — agentes IA autônomos
📱 **Contato** — WhatsApp e e-mail da equipe

O que te interessa mais?`;
}

/* ──────────────────────────────────────────────────────────────────────
   Gemini API call (quando key está disponível)
   ────────────────────────────────────────────────────────────────────── */
async function geminiReply(message: string, history: Array<{role: string; text: string}>): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error('NO_API_KEY');

  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

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
    config: {
      temperature: 0.7,
      maxOutputTokens: 800,
    },
  });

  return response.text || fallbackReply(message);
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

  try {
    // Try Gemini first, fall back to pattern matching
    let reply: string;
    try {
      reply = await geminiReply(message, history || []);
    } catch (err: any) {
      if (err.message === 'NO_API_KEY') {
        // Gemini not configured — use intelligent fallback
        reply = fallbackReply(message);
      } else {
        throw err;
      }
    }

    return res.status(200).json({ reply });

  } catch (error: any) {
    console.error('[SiteChat Error]:', error);
    // Even on error, try to provide a useful fallback
    const reply = fallbackReply(message);
    return res.status(200).json({ reply });
  }
}