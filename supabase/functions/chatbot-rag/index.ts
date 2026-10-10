import { createClient } from "npm:@supabase/supabase-js@2";

interface ChatbotRequest {
  question: string;
  user_id?: string;
  chatbot_id?: string;
}

interface ChatbotResponse {
  answer: string;
  sources: string[];
  confidence: number;
}

interface Document {
  title: string;
  content: string;
}

const DOCUMENTS: Document[] = [
  {
    title: "Como conectar Shopify",
    content:
      "Para conectar sua loja Shopify, vá em Integrações > Shopify e clique em Conectar. Você será redirecionado para o OAuth do Shopify. Autorize o acesso e automaticamente seus produtos e pedidos serão sincronizados.",
  },
  {
    title: "Como conectar Mercado Livre",
    content:
      "Para conectar o Mercado Livre, acesse Integrações > Mercado Livre e clique em Conectar. Faça login na sua conta Mercado Livre e autorize as permissões. A sincronização de produtos e vendas começa imediatamente.",
  },
  {
    title: "Como subir planilha CSV",
    content:
      "Faça upload do seu CSV na página de dashboard arrastando o arquivo ou clicando em Selecionar Arquivo. O sistema detecta colunas automaticamente e mapeia os campos. Você pode revisar o mapeamento antes de confirmar a importação.",
  },
  {
    title: "Como criar alerta de estoque",
    content:
      "Vá em Configurações > Alertas e configure limites mínimos por produto. Você pode definir alertas por email ou WhatsApp quando o estoque atingir o limite configurado. É possível configurar alertas diferentes para cada produto.",
  },
  {
    title: "Como interpretar previsão de vendas",
    content:
      "O gráfico de previsão usa IA para estimar vendas futuras com base no histórico dos últimos 12 meses. As projeções são atualizadas diariamente e consideram sazonalidade, tendências e eventos do calendário.",
  },
  {
    title: "Como fazer upgrade de plano",
    content:
      "Vá em Preços > Escolha o novo plano desejado e confirme. O upgrade é instantâneo e você pode usar todos os recursos do novo plano imediatamente. O valor é proporcional aos dias restantes do ciclo atual.",
  },
  {
    title: "Como configurar chatbot de WhatsApp",
    content:
      "Vá em Fábrica de Bots > Conectar WhatsApp > Leia o QR Code com o aplicativo WhatsApp no seu celular. Após a conexão, você pode configurar mensagens automáticas, horários de atendimento e respostas inteligentes.",
  },
  {
    title: "Política de privacidade e LGPD",
    content:
      "Seus dados são criptografados em repouso e em trânsito. Você pode solicitar exclusão total a qualquer momento via contato@focoemdados.com.br. Nunca compartilhamos seus dados com terceiros sem autorização expressa.",
  },
  {
    title: "Limites de upload",
    content:
      "Planos gratuitos: 2.000 linhas por arquivo. Starter: 50.000 linhas. Pro: 500.000 linhas. Business/Enterprise: ilimitado. Consulte a página de planos para detalhes atualizados.",
  },
  {
    title: "Integrações disponíveis",
    content:
      "Atualmente oferecemos integrações com: Shopify, Mercado Livre, Shopee, WooCommerce, Bling. Novas integrações são adicionadas regularmente. Sugira uma integração pelo email contato@focoemdados.com.br.",
  },
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function log(...args: unknown[]) {
  console.log("[chatbot-rag]", ...args);
}

function logError(...args: unknown[]) {
  console.error("[chatbot-rag]", ...args);
}

function extractKeywords(question: string): string[] {
  const stopWords = new Set([
    "a",
    "o",
    "e",
    "de",
    "da",
    "do",
    "em",
    "para",
    "com",
    "como",
    "que",
    "é",
    "um",
    "uma",
    "os",
    "as",
    "no",
    "na",
    "se",
    "por",
    "pra",
    "voce",
    "você",
    "meu",
    "minha",
    "tem",
    "está",
    "pode",
    "qual",
    "quais",
    "são",
    "sobre",
  ]);

  return question
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

interface MatchResult {
  document: Document;
  score: number;
  matchedKeywords: string[];
}

function searchDocuments(keywords: string[]): MatchResult[] {
  const results: MatchResult[] = DOCUMENTS.map((doc) => {
    const searchableText = (
      doc.title +
      " " +
      doc.content
    ).toLowerCase();

    const matchedKeywords = keywords.filter((keyword) =>
      searchableText.includes(keyword),
    );

    return {
      document: doc,
      score: matchedKeywords.length,
      matchedKeywords,
    };
  });

  return results
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function buildContext(topDocuments: MatchResult[]): string {
  if (topDocuments.length === 0) {
    return "Nenhum documento relevante encontrado.";
  }

  return topDocuments
    .map(
      (doc, i) =>
        `Documento ${i + 1}: ${doc.document.title}\n${doc.document.content}`,
    )
    .join("\n\n");
}

function calculateConfidence(topDocuments: MatchResult[]): number {
  if (topDocuments.length >= 2) return 0.9;
  if (topDocuments.length === 1) return 0.7;
  return 0.5;
}

async function callGemini(
  context: string,
  question: string,
): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const prompt = `Você é o assistente virtual da Foco em Dados, uma plataforma de dashboards de IA para varejo.
Use APENAS a documentação fornecida abaixo para responder.
Se não souber a resposta, diga exatamente: "Não encontrei essa informação na documentação. Posso enviar sua pergunta por email?"
Seja conciso e direto. Responda em português.

Documentação:
${context}

Pergunta do usuário: ${question}`;

  log("Calling Gemini API");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    logError("Gemini API error:", response.status, errorBody);
    throw new Error(
      `Gemini API returned ${response.status}: ${errorBody}`,
    );
  }

  const data = await response.json();

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) {
    logError("Unexpected Gemini response structure:", JSON.stringify(data));
    throw new Error("Failed to parse Gemini response");
  }

  return text;
}

async function saveConversation(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  chatbotId: string,
  question: string,
  answer: string,
  sources: string[],
  confidence: number,
): Promise<void> {
  try {
    const { data: existing, error: fetchError } = await supabaseClient
      .from("chatbot_conversations")
      .select("id, messages")
      .eq("user_id", userId)
      .eq("chatbot_id", chatbotId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      logError("Failed to fetch existing conversation:", fetchError);
      return;
    }

    const newMessage = {
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };

    const newResponse = {
      role: "assistant",
      content: answer,
      sources,
      confidence,
      timestamp: new Date().toISOString(),
    };

    if (existing) {
      const messages = [...(existing.messages || []), newMessage, newResponse];

      const { error: updateError } = await supabaseClient
        .from("chatbot_conversations")
        .update({ messages, updated_at: new Date().toISOString() })
        .eq("id", existing.id);

      if (updateError) {
        logError("Failed to update conversation:", updateError);
      }
    } else {
      const { error: insertError } = await supabaseClient
        .from("chatbot_conversations")
        .insert({
          user_id: userId,
          chatbot_id: chatbotId,
          messages: [newMessage, newResponse],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        logError("Failed to insert conversation:", insertError);
      }
    }
  } catch (err) {
    logError("Error saving conversation:", err);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const body: ChatbotRequest = await req.json();

    if (!body.question || typeof body.question !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'question' field" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const question = body.question.trim();
    if (question.length === 0) {
      return new Response(
        JSON.stringify({ error: "'question' cannot be empty" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    log("Processing question:", question.substring(0, 100));

    const keywords = extractKeywords(question);
    log("Extracted keywords:", keywords);

    const topDocuments = searchDocuments(keywords);
    const sources = topDocuments.map((d) => d.document.title);
    const confidence = calculateConfidence(topDocuments);
    const context = buildContext(topDocuments);

    log(
      `Top documents: ${sources.length}, confidence: ${confidence}`,
    );

    let answer: string;
    try {
      answer = await callGemini(context, question);
    } catch (geminiError) {
      logError("Gemini call failed, using fallback:", geminiError);

      if (topDocuments.length > 0) {
        const doc = topDocuments[0].document;
        answer =
          `De acordo com a documentação: ${doc.content}`;
      } else {
        answer =
          "Não encontrei essa informação na documentação. Posso enviar sua pergunta por email?";
      }
    }

    if (confidence < 0.7) {
      answer +=
        "\n\nSe precisar de mais ajuda, posso enviar sua pergunta por email.";
    }

    if (body.user_id && body.chatbot_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);

        log("Saving conversation for user:", body.user_id);
        await saveConversation(
          supabase,
          body.user_id,
          body.chatbot_id,
          question,
          answer,
          sources,
          confidence,
        );
      } else {
        logError(
          "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set, skipping conversation save",
        );
      }
    }

    const response: ChatbotResponse = { answer, sources, confidence };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    logError("Unhandled error:", err);

    const errorMessage =
      err instanceof Error ? err.message : "Internal server error";

    return new Response(
      JSON.stringify({
        answer:
          "Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente mais tarde.",
        sources: [],
        confidence: 0,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
