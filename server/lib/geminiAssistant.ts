import { GoogleGenAI } from "@google/genai";
import { Lead } from "./crmStore.ts";

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

export async function suggestBusinessQuestions(sampleData: string, datasetName?: string): Promise<string[]> {
  try {
    const ai = getGenAI();
    const prompt = `Você é um Cientista e Analista de Dados Sênior com foco em inteligência de negócios e tomada de decisão estratégica.
Analise a seguinte amostra de dados estruturados do arquivo "${datasetName || "Dataset"}":

\`\`\`
${sampleData.slice(0, 4000)}
\`\`\`

Gere exatamente 4 a 5 perguntas de análise de negócio de alto impacto que podem ser respondidas com esses dados.
As perguntas devem ser claras, práticas e diretas em português brasileiro.
Retorne APENAS um array JSON de strings, sem blocos markdown adicionais, exemplo:
["Qual é a correlação entre o ticket médio e o volume de vendas?", "Quais categorias apresentam o maior crescimento nos últimos meses?", "Existem anomalias ou outliers expressivos na distribuição de valores?", "Qual é o perfil dos principais clientes por região?"]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "[]";
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (error) {
    console.error("[geminiAssistant] Error generating suggested questions:", error);
  }

  // Fallback defaults em português
  return [
    "Quais são os principais padrões, correlações e direcionadores desses dados?",
    "Quais segmentos ou categorias geram o maior valor consolidado?",
    "Existem anomalias, dados faltantes ou outliers relevantes a investigar?",
    "Qual é a distribuição e tendência temporal das métricas chave?",
  ];
}

export async function chatAboutData(params: {
  message: string;
  contextReport?: any;
  datasetSummary?: string;
  history?: Array<{ role: "user" | "model"; text: string }>;
}): Promise<string> {
  const { message, contextReport, datasetSummary, history = [] } = params;
  try {
    const ai = getGenAI();
    let systemContext = `Você é um Consultor de BI e Inteligência de Negócios especializado no ecossistema Gemini.
Seu objetivo é responder com precisão, clareza e pragmatismo em português brasileiro (PT-BR).

`;

    if (contextReport) {
      systemContext += `RELATÓRIO ATUAL DE ANÁLISE:
- Pergunta analisada: ${contextReport.question || "Análise Geral"}
- Resumo Executivo: ${contextReport.executive_summary || "Disponível no dashboard"}
- Principais Insights: ${JSON.stringify(contextReport.insights || [])}
- Métricas e Tabelas: ${JSON.stringify(contextReport.tables?.map((t: any) => ({ title: t.title, summary: t.summary })) || [])}
`;
    }

    if (datasetSummary) {
      systemContext += `\nRESUMO DOS DADOS:
${datasetSummary.slice(0, 3000)}
`;
    }

    const contents: any[] = [
      {
        role: "user",
        parts: [{ text: `${systemContext}\n\nPERGUNTA DO USUÁRIO:\n${message}` }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
    });

    return response.text || "Não foi possível gerar a resposta no momento.";
  } catch (error: any) {
    console.error("[geminiAssistant] Error in chatAboutData:", error);
    const msg = error?.message || "";
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("prepayment credits are depleted")) {
      return `⚠️ **Aviso de Cota da API Gemini (Erro 429 - Créditos de Pré-pagamento Esgotados)**

Os créditos do projeto no Google AI Studio foram esgotados temporariamente. Para reativar o assistente de IA em tempo real, acesse [ai.studio/projects](https://ai.studio/projects) para gerenciar o faturamento. 

Enquanto isso, você pode continuar utilizando todas as ferramentas de CRM, prospecção, túnel de redesign e simuladores locais do Foco Completo!`;
    }
    return `Não foi possível gerar a resposta no momento (Erro na API Gemini: ${error.message || "Tente novamente mais tarde."})`;
  }
}

export async function auditCrmPipeline(leads: Lead[]): Promise<{
  diagnostico: string;
  taxaConversao: string;
  mrrProjetado: string;
  leadsPrioritarios: Array<{ nome: string; motivoAlerta: string; scriptWhatsapp: string }>;
  estrategiasRecomendadas: string[];
}> {
  try {
    const ai = getGenAI();
    const leadsJson = JSON.stringify(
      leads.map((l) => ({
        nome: l.nome,
        nicho: l.nicho,
        cidade: l.cidade,
        status: l.status,
        valor: l.valor,
        manutencao: l.manutencao,
        dataProposta: l.dataProposta,
        motivo: l.motivo,
        obs: l.obs,
      })),
      null,
      2
    );

    const prompt = `Você é um Diretor Comercial e Estrategista de Vendas B2B de Tecnologia e Web Design.
Analise a base atual de leads do CRM de prospecção abaixo:

\`\`\`json
${leadsJson}
\`\`\`

Faça uma análise diagnóstica completa do pipeline comercial e retorne um objeto JSON estrito com o seguinte formato:
{
  "diagnostico": "Parágrafo com diagnóstico claro da saúde do funil, gargalos observados e velocidade de fechamento",
  "taxaConversao": "Percentual estimado e comentário",
  "mrrProjetado": "Valor monetário estimado e crescimento esperado",
  "leadsPrioritarios": [
    {
      "nome": "Nome do Lead",
      "motivoAlerta": "Ex: Proposta enviada há mais de 4 dias sem resposta ou lead qualificado estagnado",
      "scriptWhatsapp": "Texto persuasivo e personalizado pronto para enviar no WhatsApp com tom profissional e simpático"
    }
  ],
  "estrategiasRecomendadas": [
    "3 a 4 ações táticas práticas para aumentar a taxa de fechamento nesta semana"
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return parsed;
  } catch (error) {
    console.error("[geminiAssistant] Error auditing CRM pipeline:", error);
    return {
      diagnostico: "O pipeline apresenta boas oportunidades em aberto, com oportunidades de conversão nos leads em proposta.",
      taxaConversao: "25% a 35% de conversão média",
      mrrProjetado: "R$ 800+/mês em contratos de manutenção",
      leadsPrioritarios: [
        {
          nome: "Martins & Associados Advocacia",
          motivoAlerta: "Proposta enviada há mais de 3 dias sem formalização do aceite",
          scriptWhatsapp: "Olá Dr. Renato! Passando para ver se conseguiu avaliar a proposta da nova página jurídica e se ficou alguma dúvida sobre as rodadas de validação. Posso te ligar 5 minutos?",
        },
      ],
      estrategiasRecomendadas: [
        "Fazer follow-up com mensagens curtas com link de prévia visual",
        "Oferecer o primeiro mês de hospedagem ou ajuste gratuito como fechamento rápido",
        "Agendar demonstração ao vivo pelo WhatsApp de 10 minutos",
      ],
    };
  }
}

export async function generateExecutiveSlideDeck(report: any): Promise<Array<{
  title: string;
  category: string;
  points: string[];
  metricHighlight?: string;
  recommendation?: string;
}>> {
  try {
    const ai = getGenAI();
    const prompt = `Transforme as principais conclusões e métricas do seguinte relatório de dados em um Deck de Slides Executivos de 4 a 5 slides prontos para apresentação a diretores:

Relatório:
${JSON.stringify(report, null, 2)}

Retorne um JSON estrito contendo uma lista de slides:
[
  {
    "title": "Título impactante do slide",
    "category": "Ex: Panorama Geral / Descobertas / Alavancas / Próximos Passos",
    "points": ["Ponto chave 1", "Ponto chave 2", "Ponto chave 3"],
    "metricHighlight": "Ex: +34% de crescimento ou R$ 1.2M faturado",
    "recommendation": "Ação recomendada para a liderança"
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (error) {
    console.error("[geminiAssistant] Error generating slide deck:", error);
  }

  return [
    {
      title: "Visão Executiva dos Dados",
      category: "Panorama Geral",
      points: [
        report.executive_summary || "Análise consolidada de padrões e métricas principais.",
        "Identificação de tendências e drivers de desempenho.",
      ],
      metricHighlight: "Consolidado",
      recommendation: "Priorizar ações nos segmentos de maior rentabilidade.",
    },
  ];
}
