import type { VercelRequest, VercelResponse } from '@vercel/node';

/* ──────────────────────────────────────────────────────────────────────
   Social Engage API v2 — Gerador de Copywriting + Artifacts B2B
   Gemini API (quando disponível) ou fallback determinístico
   ────────────────────────────────────────────────────────────────────── */

interface Post {
  hook: string;
  legendaCompleta: string;
  textoDaArte: string;
  promptImagem: string;
  hashtags: string[];
  melhorHorario: string;
  formato: 'Carrossel' | 'Reels' | 'Banner';
}

interface CalendarioDay {
  dia: string;
  formato: 'Carrossel' | 'Reels' | 'Banner';
  hook: string;
  legenda: string;
  hashtags: string[];
  melhorHorario: string;
  roteiro?: string[];
}

const UNSPLASH_QUERIES: Record<string, string> = {
  restaurantes: 'restaurant,dining,food',
  saude: 'medical,clinic,healthcare',
  advocacia: 'law,office,legal',
  barbearia: 'barbershop,barber,style',
  academia: 'gym,fitness,workout',
  pet: 'pet,dog,cat',
  comercio: 'store,shopping,retail',
  construcao: 'construction,building',
  imobiliario: 'real estate,house',
  educacao: 'education,school,learning',
  tecnologia: 'technology,laptop,office',
  automotivo: 'car,automotive,garage',
};

const HORARIOS_POR_NICHO: Record<string, string[]> = {
  restaurantes: ['11:30', '18:30', '20:00'],
  saude: ['08:00', '12:30', '17:30'],
  advocacia: ['09:00', '14:30', '16:00'],
  barbearia: ['10:00', '17:30', '19:00'],
  academia: ['06:30', '17:00', '20:00'],
  pet: ['09:30', '16:00', '19:00'],
  comercio: ['10:00', '18:30'],
  default: ['11:00', '18:00', '19:30'],
};

const HASHTAGS_POR_NICHO: Record<string, string[]> = {
  restaurantes: ['#restaurante', '#gastronomia', '#comidaboa', '#chef', '#delivery', '#foodie', '#restaurantedigital', '#comercialocal', '#cardapio', '#sabor'],
  saude: ['#saude', '#clinica', '#odontologia', '#medicina', '#agendamentoonline', '#paciente', '#saude digital', '#doutor', '#tratamento', '#bemestar'],
  advocacia: ['#advocacia', '#direito', '#advogado', '#juridico', '#escritorio', '#justica', '#direitoempresarial', '#contratos', '#advogadodigital'],
  barbearia: ['#barbearia', '#barbeiro', '#barbershop', '#corte', '#estilo', '#barbadefacavbarba', '#barbearialegal', '#cortedecabelo'],
  academia: ['#academia', '#fitness', '#treino', '#musculacao', '#saude', '#crossfit', '#personal', '#exercicio', '#vidasaudavel'],
  pet: ['#pet', '#petshop', '#pets', '#animais', '#cachorro', '#gato', '#petlovers', '#veterinario'],
  comercio: ['#comercio', '#loja', '#varejo', '#promoção', '#ofertas', '#comprasonline', '#negociolocal', '#empreendedorismo'],
  default: ['#presencadigital', '#marketingdigital', '#siteprofissional', '#empreendedorismo', '#negociolocal', '#digital', '#instagram', '#facebook', '#linkedin', '#branding'],
};

const CAPTIONS_AIDA: Record<string, string[]> = {
  restaurantes: [
    '🍽️ **[ATTENÇÃO]** Seu restaurante está INVISÍVEL no Google?\n\n**[INTERESSE]** 78% dos clientes pesquisam "restaurante perto de mim" antes de sair de casa. Se você não aparece, eles vão para o concorrente.\n\n**[DESEJO]** Imagine receber 30+ reservas por semana automaticamente pelo WhatsApp, sem ligar para ninguém.\n\n**[AÇÃO]** 📲 Clique no link e veja como transformamos o cardápio digital do Restaurante Sabor & Arte — 40% mais pedidos em 30 dias.\n\n#RestauranteDigital #CardápioDigital',
    '📱 **[STOP THE SCROLL]** Isso aqui mudou o jogo de 12 restaurantes em SP:\n\n**[INTERESSE]** Um cardápio digital com fotos profissionais + agendamento pelo WhatsApp.\n\n**[DESEJO]** Os clientes pedem direto do celular, sem filas, sem espera. E o melhor: o dono lucra mais trabalhando MENOS.\n\n**[AÇÃO]** 🔥 Quer ver como? Fale comigo agora pelo WhatsApp → wa.me/5511994411307\n\n#RestauranteDigital #FoodieSP',
  ],
  saude: [
    '🏥 **[ATTENÇÃO]** Sua clínica perde 5+ pacientes por semana por falta de agendamento online?\n\n**[INTERESSE]** Pesquisa mostra: 72% dos pacientes preferem agendar pelo celular. Se você não oferece isso, eles vão onde tem.\n\n**[DESEJO]** Imagine uma agenda 100% lotada, com confirmação automática e lembretes no WhatsApp. Sem no-show, sem folga.\n\n**[AÇÃO]** 📲 Demonstração gratuita: como agendar seus primeiros 50 pacientes online. Clique no link!\n\n#ClínicaDigital #AgendamentoOnline',
  ],
  barbearia: [
    '💈 **[STOP]** Barbeiro sem site = barbeiro sem cliente novo.\n\n**[INTERESSE]** Seu Instagram tá bonito, mas e o Google? Quando alguém digita "barbearia perto de mim", você aparece?\n\n**[DESEJO]** Chega de agenda vazia. Um site com agendamento online preenche sua semana em 14 dias.\n\n**[AÇÃO]** 🎯 Fale comigo pelo WhatsApp e veja como o Barbearia Style triplicou os clientes → wa.me/5511994411307\n\n#BarbeariaDigital #Barbeiro',
  ],
  default: [
    '🚀 **[ATENÇÃO]** Você sabia que 75% dos clientes pesquisam ONLINE antes de comprar?\n\n**[INTERESSE]** Se sua empresa não aparece no Google, Instagram ou WhatsApp, você está PERDENDO dinheiro todos os dias.\n\n**[DESEJO]** Imagine um site profissional que trabalha 24h por você, convertendo visitantes em clientes automaticamente.\n\n**[AÇÃO]** 💡 Clique aqui e descubra como transformar sua presença digital → wa.me/5511994411307\n\n#PresençaDigital #MarketingDigital',
    '⚡ **[ATTENÇÃO]** Seu concorrente já tem um site profissional. E você?\n\n**[INTERESSE]** Enquanto você está aqui lendo, ele está capturando clientes pelo Google.\n\n**[DESEJO]** Um site moderno + WhatsApp integrado = mais vendas, menos esforço. Nossos clientes veem resultado em 14 dias.\n\n**[AÇÃO]** 📲 Fale agora com nosso time e ganhe uma auditoria digital gratuita → wa.me/5511994411307\n\n#SiteProfissional #NegócioDigital',
  ],
};

const ARTE_TEXTOS: Record<string, string[]> = {
  restaurantes: ['SEU RESTAURANTE\nMERECE SER\nENCONTRADO', 'CARDÁPIO\nDIGITAL\n+ WHATSAPP\n= MAIS VENDAS'],
  saude: ['AGENDAMENTO\nONLINE\n24 HORAS', 'SUA CLÍNICA\nSEMPRE\nDISPONÍVEL'],
  barbearia: ['AGENDA\nLOTADA\nEM 14 DIAS', 'BARBEIRO\nDIGITAL\nFATURA MAIS'],
  default: ['PRESENÇA\nDIGITAL\nQUE VENDE', 'SEU NEGÓCIO\n24H ONLINE'],
};

const FORMATOS: Array<'Carrossel' | 'Reels' | 'Banner'> = ['Carrossel', 'Reels', 'Banner'];
const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

function getNichoKey(nicho: string): string {
  const n = nicho.toLowerCase();
  if (n.includes('restaur') || n.includes('gastronom')) return 'restaurantes';
  if (n.includes('saúde') || n.includes('saude') || n.includes('odonto') || n.includes('clínic') || n.includes('medic')) return 'saude';
  if (n.includes('advoc') || n.includes('direito')) return 'advocacia';
  if (n.includes('barbeari') || n.includes('estética')) return 'barbearia';
  if (n.includes('academia') || n.includes('fitness')) return 'academia';
  if (n.includes('pet') || n.includes('veterin')) return 'pet';
  if (n.includes('comércio') || n.includes('comercio') || n.includes('varejo')) return 'comercio';
  if (n.includes('constru') || n.includes('engenharia')) return 'construcao';
  if (n.includes('imobili')) return 'imobiliario';
  if (n.includes('educaç') || n.includes('escola') || n.includes('curso')) return 'educacao';
  if (n.includes('tecnolog') || n.includes('software') || n.includes('saas')) return 'tecnologia';
  if (n.includes('automot') || n.includes('oficina') || n.includes('peça')) return 'automotivo';
  return 'default';
}

function getUnsplashQuery(nichoKey: string): string {
  return UNSPLASH_QUERIES[nichoKey] || 'business,office,professional';
}

function generatePosts(empresa: string, nicho: string, redes: string[]): Post[] {
  const nichoKey = getNichoKey(nicho);
  const captions = CAPTIONS_AIDA[nichoKey] || CAPTIONS_AIDA.default;
  const arteTextos = ARTE_TEXTOS[nichoKey] || ARTE_TEXTOS.default;
  const hashtags = HASHTAGS_POR_NICHO[nichoKey] || HASHTAGS_POR_NICHO.default;
  const horarios = HORARIOS_POR_NICHO[nichoKey] || HORARIOS_POR_NICHO.default;

  return captions.map((caption, i) => ({
    hook: caption.split('\n')[0].replace(/[*#]/g, '').trim(),
    legendaCompleta: caption.replace(/\*\*/g, ''),
    textoDaArte: arteTextos[i % arteTextos.length],
    promptImagem: `Professional ${nichoKey} business photo for social media post. Modern, clean, ${nichoKey} atmosphere. Warm lighting, high quality, Instagram style. No text overlay.`,
    hashtags: [...hashtags.slice(i * 3, i * 3 + 8), '#FocoEmDados', '#PresençaDigital'],
    melhorHorario: horarios[i % horarios.length],
    formato: FORMATOS[i % FORMATOS.length],
  }));
}

function generateCalendario(empresa: string, nicho: string): CalendarioDay[] {
  const nichoKey = getNichoKey(nicho);
  const captions = CAPTIONS_AIDA[nichoKey] || CAPTIONS_AIDA.default;
  const hashtags = HASHTAGS_POR_NICHO[nichoKey] || HASHTAGS_POR_NICHO.default;
  const horarios = HORARIOS_POR_NICHO[nichoKey] || HORARIOS_POR_NICHO.default;

  const formatos: Array<'Carrossel' | 'Reels' | 'Banner'> = ['Carrossel', 'Reels', 'Banner', 'Carrossel', 'Reels', 'Banner', 'Banner'];

  const roteiros: Record<string, string[]> = {
    Carrossel: ['Slide 1: Hook impactante (problema)', 'Slide 2: Dados/métricas surpreendentes', 'Slide 3: Solução oferecida', 'Slide 4: Depoimento/caso real', 'Slide 5: CTA + WhatsApp'],
    Reels: ['0-3s: Hook visual (gancho)', '3-10s: Problema do cliente', '10-20s: Solução em ação', '20-30s: Resultado + CTA'],
    Banner: ['Fundo: Imagem profissional do nicho', 'Texto: Hook em 5 palavras', 'Rodapé: Logo + WhatsApp + @handle'],
  };

  return DIAS_SEMANA.map((dia, i) => ({
    dia,
    formato: formatos[i],
    hook: captions[i % captions.length].split('\n')[0].replace(/[*#]/g, '').trim(),
    legenda: captions[i % captions.length].replace(/\*\*/g, ''),
    hashtags: hashtags.slice(i * 2, i * 2 + 8),
    melhorHorario: horarios[i % horarios.length],
    roteiro: roteiros[formatos[i]],
  }));
}

// Gemini-powered generation
async function generateWithGemini(empresa: string, nicho: string, redes: string[]): Promise<{ posts: Post[]; calendario: CalendarioDay[] } | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenAI } = await import('@google/genai').catch(() => ({ GoogleGenAI: null }));
    if (!GoogleGenAI) return null;

    const ai = new GoogleGenAI({ apiKey });
    const nichoKey = getNichoKey(nicho);
    const hashtags = HASHTAGS_POR_NICHO[nichoKey] || HASHTAGS_POR_NICHO.default;

    const prompt = `Você é um copywriter profissional B2B especializado em marketing digital para empresas locais no Brasil.

Gere 3 posts completos para "${empresa}" (nicho: ${nicho}) nas redes: ${redes.join(', ')}.

Para CADA post, retorne um JSON com:
- hook: Gancho de atenção (máx 10 palavras) para parar scroll
- legendaCompleta: Texto persuasivo AIDA (Atenção, Interesse, Desejo, Ação) com emojis e CTA para WhatsApp (wa.me/5511994411307). Máximo 200 palavras.
- textoDaArte: Texto curto de até 6 palavras para sobrepor na imagem/banner
- promptImagem: Instrução detalhada para gerar a imagem (estilo, cores, elementos)
- hashtags: Array de 8-12 hashtags segmentadas para ${nicho} + localização

Retorne APENAS um JSON válido:
{
  "posts": [
    { "hook": "...", "legendaCompleta": "...", "textoDaArte": "...", "promptImagem": "...", "hashtags": ["#..."], "melhorHorario": "HH:MM", "formato": "Carrossel"|"Reels"|"Banner" }
  ]
}

Importante: CADA post deve ter formato diferente (1 Carrossel, 1 Reels, 1 Banner). Seja persuasivo, use gatilhos mentais (Urgência, Prova Social, Autoridade).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: { temperature: 0.8, maxOutputTokens: 2000, responseMimeType: 'application/json' },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);

    if (parsed.posts && Array.isArray(parsed.posts) && parsed.posts.length >= 3) {
      // Merge with horarios
      const horarios = HORARIOS_POR_NICHO[nichoKey] || HORARIOS_POR_NICHO.default;
      const posts = parsed.posts.map((p: any, i: number) => ({
        ...p,
        melhorHorario: p.melhorHorario || horarios[i % horarios.length],
        formato: p.formato || FORMATOS[i % 3],
        hashtags: p.hashtags || hashtags.slice(0, 10),
      }));
      const calendario = generateCalendario(empresa, nicho);
      return { posts, calendario };
    }
  } catch (err: any) {
    console.error('[SocialEngage] Gemini error:', err?.message);
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { empresa, nicho, redes } = req.body || {};
  if (!empresa || !nicho) {
    return res.status(400).json({ error: 'Empresa e nicho são obrigatórios' });
  }

  // Try Gemini first, fallback to deterministic
  let result = await generateWithGemini(empresa, nicho, redes || ['Instagram']);
  let source = 'gemini';

  if (!result) {
    const posts = generatePosts(empresa, nicho, redes || ['Instagram']);
    const calendario = generateCalendario(empresa, nicho);
    result = { posts, calendario };
    source = 'deterministic';
  }

  const nichoKey = getNichoKey(nicho);
  const hashtags = HASHTAGS_POR_NICHO[nichoKey] || HASHTAGS_POR_NICHO.default;
  const horarios = HORARIOS_POR_NICHO[nichoKey] || HORARIOS_POR_NICHO.default;

  return res.status(200).json({
    empresa,
    nicho,
    redes: redes || ['Instagram'],
    posts: result.posts,
    calendario: result.calendario,
    horarios: { melhor: horarios, bom: horarios.slice(0, 1), ruim: ['02:00-06:00'] },
    estrategiaHashtags: {
      principais: hashtags,
      dicas: [
        'Use 8-12 hashtags relevantes por post',
        'Misture hashtags populares com nicho-específicas',
        'Crie uma hashtag da marca (ex: #NomeDaEmpresa)',
        'Coloque hashtags no primeiro comentário, não na legenda',
        'Use hashtags de localização (ex: #SãoPauloSP)',
      ],
    },
    metricasEstimadas: {
      alcance: Math.floor(Math.random() * 8000 + 3000),
      engajamento: `${(Math.random() * 4 + 3).toFixed(1)}%`,
      melhorRede: redes?.[0] || 'Instagram',
      postsGerados: result.posts.length,
    },
    source,
  });
}
