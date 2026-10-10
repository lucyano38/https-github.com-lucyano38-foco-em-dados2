import { supabaseAdmin, getCorsHeaders } from "../_shared/supabase-admin.ts";

const DOCS = [
  { title: "Upload de Planilhas", content: "Faça upload de arquivos CSV ou Excel (XLSX) no painel. O sistema detecta automaticamente colunas de varejo (vendas, estoque, financeiro)." },
  { title: "Planos e Limites", content: "Grátis: 500 linhas, 1 dashboard. Starter (R$97): 2.000 linhas, 1 dashboard, 1 marketplace. Pro (R$297): 20.000 linhas, 3 dashboards, 3 marketplaces. Business (R$597): 100.000 linhas, 10 dashboards. Enterprise (R$997): Ilimitado." },
  { title: "Insight Diário", content: "O dashboard exibe um insight gerado por IA diariamente. Analisa margem, inadimplência, ticket médio e giro de estoque." },
  { title: "Integração com Marketplaces", content: "Conecte Bling, Mercado Livre, Shopee e outros para consolidar dados automaticamente." },
  { title: "Churn Predictor", content: "O sistema monitora inatividade (7 ou 14 dias), trial expirando e abandono de chatbot para disparar alertas de retenção." },
  { title: "Clube Foco em Dados", content: "Comunidade exclusiva para assinantes com conteúdo sobre BI, análise de dados e varejo." },
  { title: "Fábrica de Bots", content: "Crie chatbots para WhatsApp, Instagram ou webchat. Scripts visuais com integração de dados." },
  { title: "Templates de Dashboard", content: "Modelos prontos de dashboard de vendas, estoque e financeiro para varejo e moda." },
  { title: "Upgrade de Plano", content: "Vá em Configurações → Assinatura para fazer upgrade. O valor é calculado pro rata." },
  { title: "Suporte Técnico", content: "Abra um ticket em Ajuda → Suporte para problemas de billing ou técnicos. Tempo de resposta: até 24h úteis." },
  { title: "Segurança dos Dados", content: "Seus dados são armazenados em PostgreSQL criptografado na Supabase (us-west-2). Conexão SSL obrigatória." },
];

function findRelevantDocs(query: string): string {
  const q = query.toLowerCase();
  const relevant = DOCS.filter((d) =>
    d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)
  );
  if (relevant.length === 0) return DOCS.map((d) => d.content).join("\n\n");
  return relevant.map((d) => `${d.title}:\n${d.content}`).join("\n\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get("origin")) });
  }

  try {
    const { message, history } = await req.json();
    if (!message) throw new Error("Mensagem não fornecida.");

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY não configurada.");

    const context = findRelevantDocs(message);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `Você é o assistente virtual do VarejoBI. Responda com base na documentação oficial abaixo. Seja conciso e direto.\n\nDocumentação:\n${context}` },
          ...(history || []).slice(-10),
          { role: "user", content: message },
        ],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua pergunta.";

    return new Response(JSON.stringify({ reply }), {
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
