import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

/* ──────────────────────────────────────────────────────────────────────
   Site Chat — Gemini com contexto do Foco em Dados
   Explica funcionalidades, planos, preços, prospecção, redesign, CRM
   ────────────────────────────────────────────────────────────────────── */

const SITE_CONTEXT = `
Você é o assistente virtual oficial do "Foco em Dados" (focoemdados.com.br).
Seu papel é EXPLICAR as funcionalidades do site, tirar dúvidas de visitantes e converter em leads.

=== O QUE É O FOCO EM DADOS ===
Plataforma de prospecção B2B e redesign de sites para empresas locais no Brasil.
Combina: Google Maps + OpenStreetMap + IA (Gemini) + CRM integrado.

=== FUNCIONALIDADES PRINCIPAIS ===
1. HERMES GROWTH ENGINE (Prospecção Inteligente)
   - Busca empresas reais por nicho + cidade + raio (ex: "barbearias em Barueri raio 10km")
   - Fontes: Google Places, OpenStreetMap/Nominatim, CNAE/BrasilAPI
   - Detecta quem TEM site (precisa de redesign) e quem NÃO TEM site (oportunidade)
   - Score de oportunidade (0-100) baseado em: sem site, rating baixo, poucas avaliações, sem WhatsApp
   - Gera redesign automático com IA para cada lead
   - Exporta para CRM com 1 clique

2. PREVIEW DE REDESIGN DINÂMICO (/preview-redesign)
   - Página personalizada por nicho (16 nichos mapeados)
   - Cores, hero image, features, serviços, CTA, problemas/soluções de auditoria
   - WhatsApp flutuante com mensagem pré-definida por nicho
   - Proposta: R$ 1.500 setup + R$ 39,90/mês manutenção

3. CRM COMERCIAL
   - Pipeline: Novo → Contatado → Qualificado → Proposta → Fechado
   - Gestão de leads, propostas, contratos
   - Integração WhatsApp

4. OPENSQUAD AI (Plano Premium)
   - Squad de 5 agentes IA: PM, Hunter, Redesigner, Copywriter, QA
   - Missão unificada: prospecção → auditoria → redesign → mensagens → contrato
   - Monitoramento 24/7

=== PLANOS E PREÇOS ===
- GRÁTIS: Upload de planilha (até 100 linhas) — apenas visualização
- STARTER: R$ 97/mês — prospecção básica + preview redesign
- BUSINESS: R$ 197/mês — prospecção ilimitada + CRM + redesigns
- PREMIUM: R$ 39,90/mês — ECOSISTEMA COMPLETO (OpenSquad + Automação WhatsApp + CRM + Analytics)
  ⚠️ O plano PREMIUM (R$ 39,90) É O PRINCIPAL — inclui TUDO

=== CONTATOS ===
- WhatsApp: 55 11 99441-1307
- E-mail: atendimento@focoemdados.com.br
- Domínio: focoemdados.com.br

=== REGRAS DE RESPOSTA ===
- Responda SEMPRE em português brasileiro
- Seja direto, útil e persuasivo (foco em conversão)
- Use formatação com bullets, negrito para facilitar leitura
- Se não souber, diga: "Essa informação não tenho no momento, mas posso conectar você com nossa equipe via WhatsApp: 55 11 99441-1307"
- NÃO invente funcionalidades que não existam
- Mencione o plano Premium R$ 39,90/mês quando apropriado
- Convide para testar a prospecção: "Quer ver como funciona? Acesse o Hermes Growth Engine no site e busque seu nicho + cidade"
`;

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

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
    const ai = getAI();

    // Build conversation history
    const contents: ChatMessage[] = [
      { role: 'model', text: SITE_CONTEXT },
    ];

    if (Array.isArray(history)) {
      for (const h of history.slice(-10)) { // last 10 messages
        if (h.role && h.text) {
          contents.push({ role: h.role === 'user' ? 'user' : 'model', text: h.text });
        }
      }
    }

    contents.push({ role: 'user', text: message });

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: contents.map(c => ({ role: c.role, parts: [{ text: c.text }] })),
      config: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    const reply = response.text || 'Desculpe, não consegui gerar uma resposta no momento.';

    return res.status(200).json({ reply });

  } catch (error: any) {
    console.error('[SiteChat Error]:', error);
    return res.status(500).json({
      error: 'Erro interno',
      reply: 'Ops, tive um problema técnico. Tente novamente ou chame no WhatsApp: 55 11 99441-1307',
    });
  }
}