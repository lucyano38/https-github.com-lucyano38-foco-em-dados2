import type { VercelRequest, VercelResponse } from '@vercel/node';

/* ──────────────────────────────────────────────────────────────────────
   Social Engage API — Sugestões de engajamento por nicho
   Sem dependência externa, algoritmo determinístico
   ────────────────────────────────────────────────────────────────────── */

const HORARIOS_POR_NICHO: Record<string, { melhor: string[]; bom: string[]; ruim: string[] }> = {
  default: { melhor: ['11:00-13:00', '18:00-20:00', '19:00-21:00'], bom: ['08:00-09:00', '14:00-16:00'], ruim: ['22:00-06:00', '12:00-14:00'] },
  restaurantes: { melhor: ['11:30-13:30', '18:00-20:30', '20:00-22:00'], bom: ['10:00-11:00', '15:00-17:00'], ruim: ['06:00-08:00', '14:00-16:00'] },
  saude: { melhor: ['08:00-10:00', '12:00-14:00', '17:00-19:00'], bom: ['10:00-11:30', '15:00-17:00'], ruim: ['20:00-07:00'] },
  advocacia: { melhor: ['09:00-11:00', '14:00-16:00'], bom: ['11:00-12:00', '16:00-18:00'], ruim: ['12:00-14:00', '20:00-07:00'] },
  barbearia: { melhor: ['10:00-12:00', '17:00-20:00'], bom: ['08:00-10:00', '14:00-16:00'], ruim: ['12:00-14:00'] },
  academia: { melhor: ['06:00-08:00', '17:00-19:00'], bom: ['11:00-13:00', '20:00-21:00'], ruim: ['14:00-16:00'] },
  pet: { melhor: ['09:00-11:00', '16:00-18:00'], bom: ['12:00-14:00', '19:00-20:00'], ruim: ['06:00-08:00'] },
  comercio: { melhor: ['10:00-12:00', '18:00-20:00'], bom: ['08:00-10:00', '14:00-16:00'], ruim: ['12:00-14:00'] },
};

const CAPTIONS_POR_NICHO: Record<string, string[]> = {
  default: [
    'Sua empresa merece ser vista! 🚀 Descubra como podemos transformar sua presença digital com um site profissional e moderno.',
    'Você sabia que 75% dos clientes pesquisam online antes de comprar? 📱 Não perca clientes por falta de presença digital!',
    'Um bom site não é gasto, é investimento! 💡 Veja como nossos clientes aumentaram suas vendas em até 3x.',
  ],
  restaurantes: [
    'Seu restaurante merece ser encontrado! 🍽️ Cardápio digital + reservas pelo WhatsApp = mais clientes todo dia.',
    'Apresentamos nosso novo cardápio digital com fotos profissionais! 📸 Peça pelo WhatsApp e receba em casa.',
    'Sabores que pedem Instagram! 📱 Seu restaurante está pronto para a era digital? Peça nosso orçamento.',
  ],
  saude: [
    'Cuidar da saúde começa pela informação! 🏥 Agendamento online pelo WhatsApp — sem filas, sem espera.',
    'Sua clínica está disponível 24h no WhatsApp? 📱 Pacientes querem agendar pelo celular. A gente mostra como.',
    'Transforme a experiência dos seus pacientes: agendamento digital + lembretes automáticos 💊',
  ],
  barbearia: [
    'Barbeiro que está no Instagram, fatura mais! 💈 Transforme sua barbearia com um site + agendamento online.',
    'Sua barbearia merece um visual tão afiado quanto seus cortes! ✂️ Novo site + presença digital completa.',
    'Horário lotado? O WhatsAppResolve! 📱 Agendamento automático que preenche sua agenda.',
  ],
  academia: [
    'Treino começa no Instagram! 💪 Mostre sua academia, aulas e resultados. Mais matrículas, menos celular parado.',
    'Sua academia tem site? 80% dos alunos pesquisam antes de matricular! 🏋️ A gente resolve.',
    'Transforme visitantes em alunos com um site profissional + agendamento de aulas experimentais! 🎯',
  ],
};

const HASHTAGS_POR_NICHO: Record<string, string[]> = {
  default: ['#presençadigital', '#marketingdigital', '#siteprofissional', '#empreendedorismo', '#digitalizar', '#negócionolínea'],
  restaurantes: ['#restaurante', '#comidaboa', '#delivery', '#cardápiodigital', '#foodie', '#restaurantedigital'],
  saude: ['#saúde', '#clinica', '#agendamentoonline', '#dentista', '#médico', '#saúdedigital'],
  barbearia: ['#barbearia', '#barbearosocial', '#cabelo', '#barbshop', '#estética', '#barbeariadigital'],
  academia: ['#academia', '#fitness', '#treino', '#saúde', '#crossfit', '#academiadigital'],
  pet: ['#petshop', '#petlovers', '#animal', '#cãegato', '#petlife', '#petshopdigital'],
};

function getNichoKey(nicho: string): string {
  const n = nicho.toLowerCase();
  if (n.includes('restaur') || n.includes('gastronom')) return 'restaurantes';
  if (n.includes('saúde') || n.includes('saude') || n.includes('odonto') || n.includes('clínic')) return 'saude';
  if (n.includes('advoc') || n.includes('direito')) return 'advocacia';
  if (n.includes('barbeari') || n.includes('estética')) return 'barbearia';
  if (n.includes('academia') || n.includes('fitness')) return 'academia';
  if (n.includes('pet') || n.includes('veterin')) return 'pet';
  if (n.includes('comércio') || n.includes('comercio') || n.includes('varejo')) return 'comercio';
  return 'default';
}

function generateSuggestions(empresa: string, nicho: string, redes: string[]) {
  const nichoKey = getNichoKey(nicho);
  const horarios = HORARIOS_POR_NICHO[nichoKey] || HORARIOS_POR_NICHO.default;
  const captions = CAPTIONS_POR_NICHO[nichoKey] || CAPTIONS_POR_NICHO.default;
  const hashtags = HASHTAGS_POR_NICHO[nichoKey] || HASHTAGS_POR_NICHO.default;

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const calendario = diasSemana.map((dia, i) => ({
    dia,
    tipo: i < 5 ? 'Informativo' : i === 5 ? 'Promocional' : 'Bastidores',
    sugestao: captions[i % captions.length],
    melhorHorario: horarios.melhor[i % horarios.melhor.length],
  }));

  const legendas = captions.map((c, i) => ({
    texto: c,
    hashtags: hashtags.slice(i * 2, i * 2 + 3).join(' '),
    rede: redes[i % redes.length],
    tipo: i === 0 ? 'Informativo' : i === 1 ? 'Engajamento' : 'Promocional',
  }));

  return {
    empresa,
    nicho,
    redes,
    horarios: {
      melhor: horarios.melhor,
      bom: horarios.bom,
      ruim: horarios.ruim,
    },
    legendas,
    estrategiaHashtags: {
      principais: hashtags,
      dicas: [
        'Use 5-10 hashtags relevantes por post',
        'Misture hashtags populares com nicho-específicas',
        'Crie uma hashtag da marca (ex: #NomeDaEmpresa)',
        'Coloque hashtags no primeiro comentário, não na legenda',
      ],
    },
    calendario,
    metricasEstimadas: {
      alcance: Math.floor(Math.random() * 5000 + 2000),
      engajamento: `${(Math.random() * 4 + 2).toFixed(1)}%`,
      melhorRede: redes[0] || 'Instagram',
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { empresa, nicho, redes } = req.body || {};
  if (!empresa || !nicho) {
    return res.status(400).json({ error: 'Empresa e nicho são obrigatórios' });
  }

  const suggestions = generateSuggestions(empresa, nicho, redes || ['Instagram']);
  return res.status(200).json(suggestions);
}
