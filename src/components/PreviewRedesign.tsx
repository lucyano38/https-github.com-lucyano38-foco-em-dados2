import React, { useState, useEffect } from 'react';
import { Phone, Clock, MapPin, Star, CheckCircle, ArrowRight, MessageCircle, ChevronDown, Leaf, Flame, Award, Heart, Scissors, Store, Wrench, Globe, ShieldCheck, BookOpen, Car, Building2, GraduationCap, Laptop, Dumbbell, PawPrint, Fuel, Hotel, Timer, Wifi, Search, Share2 } from 'lucide-react';

/* ── Niche configs ── */
interface NicheTheme {
  label: string;
  emoji: string;
  color: string;        // tailwind text color
  bg: string;           // tailwind bg color
  border: string;       // tailwind border color
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  features: { title: string; desc: string; icon: any }[];
  services: string[];
  ctaText: string;
  auditProblems: string[];
  auditSolutions: string[];
  waMessage: string;
}

const THEMES: Record<string, NicheTheme> = {
  'Restaurantes & Gastronomia': {
    label: 'Gastronomia', emoji: '🍽️', color: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30',
    heroTitle: 'Sabor Incomparável & Experiência Única',
    heroSubtitle: 'Cardápio Digital & Reservas de Mesa Instantâneas no WhatsApp. Seu restaurante merece ser encontrado.',
    heroImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=85',
    features: [
      { title: 'Cardápio Digital Interativo', desc: 'Seus pratos favoritos com fotos profissionais e preços atualizados em tempo real.', icon: Heart },
      { title: 'Reservas via WhatsApp', desc: 'Clientes reservam mesa pelo WhatsApp com confirmação automática.', icon: MessageCircle },
      { title: 'Galeria de Fotos', desc: 'Showcase dos seus melhores pratos e do ambiente.', icon: Star },
    ],
    services: ['Cardápio Digital', 'Reservas Online', 'Delivery Próprio', 'Eventos & Festas', 'Happy Hour Automático'],
    ctaText: 'Reservar Mesa Agora',
    auditProblems: [
      'Sem presença digital — clientes não encontram você no Google',
      'Cardápio em PDF desatualizado que ninguém baixa',
      'Sem botão direto de WhatsApp na tela principal',
      'Perda de reservas por falta de confirmação automática',
    ],
    auditSolutions: [
      'Landing Page profissional ranqueando no Google da sua região',
      'Cardápio digital com fotos e preços sempre atualizados',
      'Botão flutuante de WhatsApp com mensagem pré-definida',
      'Sistema de reservas com confirmação automática em 30s',
    ],
    waMessage: 'Olá! Vi o site do restaurante e gostaria de fazer uma reserva!',
  },
  'Restaurantes': { label: 'Gastronomia', emoji: '🍽️', color: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30',
    heroTitle: 'Sabor Incomparável & Experiência Única', heroSubtitle: 'Cardápio Digital & Reservas de Mesa Instantâneas no WhatsApp.',
    heroImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=85',
    features: [{ title: 'Cardápio Digital', desc: 'Fotos e preços atualizados em tempo real.', icon: Heart }, { title: 'Reservas via WhatsApp', desc: 'Confirmação automática.', icon: MessageCircle }, { title: 'Galeria', desc: 'Fotos dos melhores pratos.', icon: Star }],
    services: ['Cardápio Digital', 'Reservas Online', 'Delivery', 'Eventos'], ctaText: 'Reservar Mesa',
    auditProblems: ['Sem presença digital', 'Cardápio desatualizado', 'Sem WhatsApp direto', 'Perda de reservas'],
    auditSolutions: ['Landing Page no Google', 'Cardápio digital', 'Botão WhatsApp', 'Reservas automáticas'],
    waMessage: 'Olá! Vi o site do restaurante e gostaria de fazer uma reserva!',
  },
  'Gastronomia': { label: 'Gastronomia', emoji: '🍽️', color: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30',
    heroTitle: 'Sabor Incomparável & Experiência Única', heroSubtitle: 'Cardápio Digital & Reservas de Mesa Instantâneas no WhatsApp.',
    heroImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=85',
    features: [{ title: 'Cardápio Digital', desc: 'Fotos e preços atualizados.', icon: Heart }, { title: 'Reservas WhatsApp', desc: 'Confirmação automática.', icon: MessageCircle }, { title: 'Galeria', desc: 'Fotos dos pratos.', icon: Star }],
    services: ['Cardápio Digital', 'Reservas', 'Delivery', 'Eventos'], ctaText: 'Reservar Mesa',
    auditProblems: ['Sem presença digital', 'Cardápio desatualizado', 'Sem WhatsApp', 'Perda de reservas'],
    auditSolutions: ['Landing Page', 'Cardápio digital', 'Botão WhatsApp', 'Reservas automáticas'],
    waMessage: 'Olá! Vi o site do restaurante e gostaria de reservar!',
  },
  'Odontologia & Estética': {
    label: 'Saúde', emoji: '🏥', color: 'text-sky-400', bg: 'bg-sky-500', border: 'border-sky-500/30',
    heroTitle: 'Excelência e Cuidado Odontológico', heroSubtitle: 'Agende sua Consulta em 10 Segundos. Atendimento humanizado com tecnologia de ponta.',
    heroImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1400&q=85',
    features: [{ title: 'Agendamento Instantâneo', desc: 'Pacientes agendam consultas pelo WhatsApp com escolha de profissional.', icon: Clock }, { title: 'Pré-Atendimento Digital', desc: 'Formulário inteligente que coleta histórico do paciente.', icon: Heart }, { title: 'Lembretes Automáticos', desc: 'Confirmação 24h antes via WhatsApp reduzindo faltas em 40%.', icon: MessageCircle }],
    services: ['Agendamento Online', 'Pré-Atendimento Digital', 'Lembretes Automáticos', 'Convênios & Planos', 'Teleconsulta'],
    ctaText: 'Agendar Consulta Agora',
    auditProblems: ['Clínica invisível no Google Maps', 'Agendamento apenas por telefone', 'Alta taxa de faltas', 'Sem captação online'],
    auditSolutions: ['Landing Page com mapa integrado', 'Agendamento 24/7 via WhatsApp', 'Sistema de lembretes', 'Captação de leads com IA'],
    waMessage: 'Olá! Gostaria de agendar uma consulta na clínica!',
  },
  'Advocacia & Direito': {
    label: 'Jurídico', emoji: '⚖️', color: 'text-indigo-400', bg: 'bg-indigo-500', border: 'border-indigo-500/30',
    heroTitle: 'Assessoria Jurídica de Excelência', heroSubtitle: 'Consultoria Online com Atendimento Imediato via WhatsApp.',
    heroImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1400&q=85',
    features: [{ title: 'Consulta Online', desc: 'Primeira consulta via videochamada ou WhatsApp.', icon: Phone }, { title: 'Acompanhamento', desc: 'Atualizações do processo diretamente no WhatsApp.', icon: MessageCircle }, { title: 'Documentos Digitais', desc: 'Envie e receba documentos de forma segura.', icon: Globe }],
    services: ['Consultoria Online', 'Acompanhamento Processual', 'Mediação', 'Direito Digital', 'Contratos'],
    ctaText: 'Agendar Consultoria',
    auditProblems: ['Escritório invisível no Google', 'Atendimento apenas presencial', 'Sem canais digitais', 'Processos manuais'],
    auditSolutions: ['Landing Page profissional', 'Atendimento 24/7 via WhatsApp', 'Captação com IA', 'Dashboard de processos'],
    waMessage: 'Olá! Preciso de assessoria jurídica!',
  },
  'Barbearias & Estética': {
    label: 'Barbearia & Estética', emoji: '✂️', color: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30',
    heroTitle: 'Estilo Que Fala Por Si', heroSubtitle: 'Agende seu Horário pelo WhatsApp em 10 Segundos. Sem fila, sem espera.',
    heroImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1400&q=85',
    features: [{ title: 'Agendamento 24/7', desc: 'Clientes agendam cortes a qualquer hora pelo WhatsApp.', icon: Clock }, { title: 'Retorno Inteligente', desc: 'Lembrete automático quando o cliente está no tempo de cortar.', icon: MessageCircle }, { title: 'Cardápio de Serviços', desc: 'Lista completa com preços e tempo estimado.', icon: Scissors }],
    services: ['Corte & Design', 'Barba & Tratamento', 'Sobrancelha', 'Hidratação', 'Coloração'],
    ctaText: 'Agendar Horário Agora',
    auditProblems: ['Horários perdidos sem sistema', 'Sem presença no Google Maps', 'Sem lembrete de retorno', 'Clientes sem vaga'],
    auditSolutions: ['Sistema de agendamento', 'Landing Page com cardápio', 'Presença no Google Maps', 'Lembrete automático em 20 dias'],
    waMessage: 'Olá! Quero agendar um horário na barbearia!',
  },
  'Comércio Local': {
    label: 'Comércio', emoji: '🛍️', color: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/30',
    heroTitle: 'Sua Loja Sempre Aberta Online', heroSubtitle: 'Catálogo Digital com Preços e WhatsApp Direto.',
    heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=85',
    features: [{ title: 'Catálogo Digital', desc: 'Produtos com fotos, preços e disponibilidade atualizados.', icon: Store }, { title: 'Atendimento Automático', desc: 'Respostas instantâneas para dúvidas de produtos.', icon: MessageCircle }, { title: 'Captação de Leads', desc: 'Capture contatos e faça remarketing.', icon: Phone }],
    services: ['Catálogo Digital', 'Atendimento 24/7', 'Pedidos via WhatsApp', 'Promoções Automáticas', 'Lista de Espera'],
    ctaText: 'Ver Catálogo Digital',
    auditProblems: ['Sem presença online', 'Atendimento manual', 'Sem sistema de pedidos', 'Perda de vendas por falta de follow-up'],
    auditSolutions: ['Landing Page com catálogo', 'Atendimento automatizado', 'Sistema de pedidos', 'Remarketing'],
    waMessage: 'Olá! Vi o catálogo e tenho interesse em um produto!',
  },
  'Construção Civil': {
    label: 'Construção', emoji: '🏗️', color: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500/30',
    heroTitle: 'Construção & Reforma de Qualidade', heroSubtitle: 'Orçamento Online em 5 Minutos via WhatsApp. Obra feita no prazo e com garantia.',
    heroImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=85',
    features: [{ title: 'Orçamento Instantâneo', desc: 'Clientes enviam fotos e recebem orçamento pelo WhatsApp.', icon: Wrench }, { title: 'Portfólio de Obras', desc: 'Galeria de projetos concluídos com antes e depois.', icon: Star }, { title: 'Acompanhamento', desc: 'Updates da obra em tempo real pelo WhatsApp.', icon: MessageCircle }],
    services: ['Reformas', 'Projetos Arquitetônicos', 'Interiores', 'Manutenção', 'Consultoria'],
    ctaText: 'Solicitar Orçamento',
    auditProblems: ['Sem portfólio online', 'Orçamento demorado', 'Sem presença no Google', 'Perda de clientes por demora'],
    auditSolutions: ['Portfólio digital com antes/depois', 'Orçamento rápido via WhatsApp', 'Landing Page no Google', 'Follow-up automático'],
    waMessage: 'Olá! Gostaria de um orçamento para reforma!',
  },
  'Imobiliário': {
    label: 'Imobiliário', emoji: '🏠', color: 'text-blue-400', bg: 'bg-blue-500', border: 'border-blue-500/30',
    heroTitle: 'Encontre o Imóvel dos Seus Sonhos', heroSubtitle: 'Busca Inteligente & Atendimento Personalizado via WhatsApp.',
    heroImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=85',
    features: [{ title: 'Busca Inteligente', desc: 'Filtros por preço, localização e tipo de imóvel.', icon: Building2 }, { title: 'Agendamento de Visitas', desc: 'Agende visitas pelo WhatsApp com confirmação automática.', icon: Clock }, { title: 'Alertas de Novos Imóveis', desc: 'Receba alertas quando imóveis dos seus critérios saírem.', icon: MessageCircle }],
    services: ['Compra & Venda', 'Aluguel', 'Avaliação', 'Consultoria', 'Financiamento'],
    ctaText: 'Ver Imóveis Disponíveis',
    auditProblems: ['Imóveis sem fotos profissionais', 'Sem presença no Google', 'Atendimento lento', 'Sem follow-up'],
    auditSolutions: ['Fotos e tours virtuais', 'Landing Page otimizada', 'WhatsApp com resposta rápida', 'CRM com follow-up automático'],
    waMessage: 'Olá! Tenho interesse em um imóvel!',
  },
  'Educação & Cursos': {
    label: 'Educação', emoji: '🎓', color: 'text-violet-400', bg: 'bg-violet-500', border: 'border-violet-500/30',
    heroTitle: 'Transforme Seu Futuro com Educação', heroSubtitle: 'Matrícula Online em 2 Minutos. Cursos com certificado e mentoria.',
    heroImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&w=1400&q=85',
    features: [{ title: 'Matrícula Online', desc: 'Alunos se matriculam pelo WhatsApp em segundos.', icon: GraduationCap }, { title: 'Grade Horária Digital', desc: 'Veja horários e disponibilidade de turmas.', icon: Clock }, { title: 'Certificado Digital', desc: 'Certificados automáticos ao concluir o curso.', icon: Award }],
    services: ['Cursos Online', 'Presenciais', 'Mentoria', 'Workshops', 'Certificação'],
    ctaText: 'Matricule-se Agora',
    auditProblems: ['Sem presença digital', 'Matrícula presencial apenas', 'Sem divulgação online', 'Perda de alunos'],
    auditSolutions: ['Landing Page com grade de cursos', 'Matrícula via WhatsApp', 'SEO no Google', 'Remarketing para interessados'],
    waMessage: 'Olá! Tenho interesse em um curso!',
  },
  'Tecnologia & SaaS': {
    label: 'Tecnologia', emoji: '💻', color: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500/30',
    heroTitle: 'Soluções Tecnológicas para Seu Negócio', heroSubtitle: 'Demonstração Gratuita em 15 Minutos. ROI comprovado em 30 dias.',
    heroImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=85',
    features: [{ title: 'Demo Gratuita', desc: 'Teste a solução antes de contratar.', icon: Laptop }, { title: 'Integração Fácil', desc: 'Conecta com suas ferramentas existentes.', icon: Globe }, { title: 'Suporte Dedicado', desc: 'Atendimento via WhatsApp em tempo real.', icon: MessageCircle }],
    services: ['Consultoria', 'Implementação', 'Integrações', 'Suporte 24/7', 'Treinamento'],
    ctaText: 'Agendar Demo Gratuita',
    auditProblems: ['Sem presença digital forte', 'Difícil demonstrar valor', 'Sem captação inbound', 'Processo de vendas manual'],
    auditSolutions: ['Landing Page com cases de sucesso', 'Demo interativa online', 'Funil de captação automatizado', 'CRM integrado'],
    waMessage: 'Olá! Gostaria de uma demo do software!',
  },
  'Academia & Fitness': {
    label: 'Fitness', emoji: '💪', color: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500/30',
    heroTitle: 'Seu Corpo Merece o Melhor', heroSubtitle: 'Matrícula Online & Personal Trainer via WhatsApp.',
    heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=85',
    features: [{ title: 'Matrícula Online', desc: 'Matricule-se em 2 minutos pelo WhatsApp.', icon: Dumbbell }, { title: 'Avaliação Física', desc: 'Agende sua avaliação gratuita.', icon: Heart }, { title: 'Horários Flexíveis', desc: 'Veja a grade de horários e aulas disponíveis.', icon: Clock }],
    services: ['Musculação', 'Personal', 'Funcional', 'Pilates', 'Avaliação Física'],
    ctaText: 'Matricule-se Agora',
    auditProblems: ['Sem presença no Google Maps', 'Matrícula presencial apenas', 'Sem divulgação de aulas', 'Perda de alunos'],
    auditSolutions: ['Landing Page comgrade de aulas', 'Matrícula via WhatsApp', 'Google Maps otimizado', 'Lembrete de retorno'],
    waMessage: 'Olá! Gostaria de me matricular na academia!',
  },
  'Pet Shop / Veterinário': {
    label: 'Pet', emoji: '🐾', color: 'text-pink-400', bg: 'bg-pink-500', border: 'border-pink-500/30',
    heroTitle: 'Cuidando do Seu Melhor Amigo', heroSubtitle: 'Agendamento de Consultas & Banho & Tosa pelo WhatsApp.',
    heroImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1400&q=85',
    features: [{ title: 'Agendamento Online', desc: 'Marque consultas e banho & tosa pelo WhatsApp.', icon: Clock }, { title: 'Prontuário Digital', desc: 'Acesse o histórico do seu pet a qualquer momento.', icon: PawPrint }, { title: 'Lembrete de Vacinas', desc: 'Receba alertas para vacinas e check-ups.', icon: MessageCircle }],
    services: ['Veterinária', 'Banho & Tosa', 'Vacinas', 'Pet Shop', 'Hotel Pet'],
    ctaText: 'Agendar Consulta',
    auditProblems: ['Sem agendamento online', 'Sem presença no Google', 'Sem lembretes de vacinas', 'Perda de clientes'],
    auditSolutions: ['Landing Page com serviços', 'Agendamento via WhatsApp', 'Sistema de lembretes', 'Google Maps otimizado'],
    waMessage: 'Olá! Gostaria de agendar uma consulta para meu pet!',
  },
  'Posto de Gasolina': {
    label: 'Combustível', emoji: '⛽', color: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500/30',
    heroTitle: 'Combustível de Qualidade & Preço Justo', heroSubtitle: 'Promoções & Programa de Fidelidade via WhatsApp.',
    heroImage: 'https://images.unsplash.com/photo-1611288875785-04a92e4a12f7?auto=format&fit=crop&w=1400&q=85',
    features: [{ title: 'Preço do Dia', desc: 'Receba as cotações atualizadas no WhatsApp.', icon: Fuel }, { title: 'Programa Fidelidade', desc: 'Acumule pontos e troque por descontos.', icon: Award }, { title: 'Serviços Extras', desc: 'Lavagem, óleo e revisão agendados.', icon: MessageCircle }],
    services: ['Combustível', 'Lavagem', 'Troca de Óleo', 'Pneus', 'Conveniência'],
    ctaText: 'Ver Promoções',
    auditProblems: ['Sem presença digital', 'Sem programa de fidelidade', 'Sem promoções online', 'Perda de clientes'],
    auditSolutions: ['Landing Page com preços', 'Programa via WhatsApp', 'Promoções digitais', 'Google Maps otimizado'],
    waMessage: 'Olá! Quero saber os preços de hoje!',
  },
  'Hotel / Hospedagem': {
    label: 'Hospedagem', emoji: '🏨', color: 'text-teal-400', bg: 'bg-teal-500', border: 'border-teal-500/30',
    heroTitle: 'Hospitalidade com Conforto e Estilo', heroSubtitle: 'Reserve seu Quarto em 30 Segundos via WhatsApp.',
    heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85',
    features: [{ title: 'Reserva Online', desc: 'Reserve quartos pelo WhatsApp com confirmação imediata.', icon: Hotel }, { title: 'Tour Virtual', desc: 'Conheça os quartos antes de reservar.', icon: Globe }, { title: 'Concierge Digital', desc: 'Dicas de passeios e restaurantes na região.', icon: MessageCircle }],
    services: ['Diária', 'Estadia Longa', 'Eventos', 'Café da Manhã', 'Passeios'],
    ctaText: 'Reservar Agora',
    auditProblems: ['Sem reserva online', 'Fotos desatualizadas', 'Sem presença no Google', 'Respostas lentas'],
    auditSolutions: ['Reserva via WhatsApp', 'Galeria profissional', 'Google Hotels integrado', 'Resposta automática'],
    waMessage: 'Olá! Gostaria de reservar um quarto!',
  },
};

/* ── Fallback genérico ── */
const GENERIC_THEME: NicheTheme = {
  label: 'Serviços', emoji: '💼', color: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30',
  heroTitle: 'Excelência em Serviços para sua Região',
  heroSubtitle: 'Presença Digital Profissional com Atendimento Automático via WhatsApp. Seu negócio merece ser encontrado.',
  heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=85',
  features: [
    { title: 'Atendimento 24/7', desc: 'WhatsApp automatizado que responde seus clientes a qualquer hora.', icon: MessageCircle },
    { title: 'Presença Digital', desc: 'Landing Page profissional que ranqueia no Google da sua região.', icon: Globe },
    { title: 'Captação de Leads', desc: 'Formulários inteligentes que qualificam automaticamente.', icon: Phone },
  ],
  services: ['Atendimento WhatsApp', 'Landing Page', 'Captação de Leads', 'CRM Integrado', 'Relatórios'],
  ctaText: 'Fale Conosco Agora',
  auditProblems: [
    'Sem presença digital profissional',
    'Atendimento manual e demorado',
    'Sem captação de novos clientes online',
    'Perda de oportunidades por falta de follow-up',
  ],
  auditSolutions: [
    'Landing Page profissional com SEO local',
    'WhatsApp automatizado com respostas inteligentes',
    'Sistema de captação com qualificação por IA',
    'CRM integrado com pipeline de vendas',
  ],
  waMessage: 'Olá! Vim pelo site e gostaria de mais informações!',
};

/* ── Restaurant-specific items (only for food nichos) ── */
const foodItemImages = [
  'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80',
];

const foodGalleryImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
];

const isFoodNiche = (nicho: string) => {
  const t = nicho.toLowerCase();
  return t.includes('restaurante') || t.includes('gastronomia') || t.includes('food') || t.includes('comida') || t.includes('lanchonete') || t.includes('pizzaria') || t.includes('padaria');
};

function resolveTheme(nicho: string | null): NicheTheme {
  if (!nicho) return GENERIC_THEME;
  // Direct match
  if (THEMES[nicho]) return THEMES[nicho];
  // First word match
  const first = nicho.split(' ')[0];
  if (THEMES[first]) return THEMES[first];
  // Partial match
  for (const key of Object.keys(THEMES)) {
    if (nicho.toLowerCase().includes(key.toLowerCase().split(' ')[0])) return THEMES[key];
  }
  return GENERIC_THEME;
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function PreviewRedesign() {
  const params = new URLSearchParams(window.location.search);
  const nomeEmpresa = params.get('nome') || 'Empresa Modelo';
  const cidadeEmpresa = params.get('cidade') || 'São Paulo';
  const nichoParam = params.get('nicho');
  const theme = resolveTheme(nichoParam);
  const [activeMenuCategory, setActiveMenuCategory] = useState('destaques');
  const [showAudit, setShowAudit] = useState(false);
  const [showSplitScreen, setShowSplitScreen] = useState(false);
  const [showDiagTerminal, setShowDiagTerminal] = useState(false);
  const [diagVisibleItems, setDiagVisibleItems] = useState(0);

  useEffect(() => {
    if (!showDiagTerminal) {
      setDiagVisibleItems(0);
      return;
    }
    const interval = setInterval(() => {
      setDiagVisibleItems((prev) => {
        if (prev >= 4) { clearInterval(interval); return 4; }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [showDiagTerminal]);

  const waEmpresa = `https://wa.me/5511994411307?text=${encodeURIComponent(`Olá! Vi o novo site modelo para o ${nomeEmpresa} e gostaria de ativá-lo.`)}`;
  const waPedido = `https://wa.me/5511994411307?text=${encodeURIComponent(theme.waMessage)}`;

  const isFood = isFoodNiche(nichoParam || '');

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500/30 selection:text-amber-100">

      {/* ===== BARRA SUPERIOR ===== */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border-b border-white/10 px-4 py-3 text-xs md:text-sm flex flex-col sm:flex-row justify-between items-center shadow-2xl gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className={`${theme.bg} text-stone-950 px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-widest font-black`}>
            Demonstração
          </span>
          <span className="font-semibold">Modelo de site para <strong className="font-black text-white">{nomeEmpresa}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDiagTerminal(!showDiagTerminal)} className="px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all border border-white/10 text-white hover:bg-white/5 cursor-pointer">
            {showDiagTerminal ? '🤖 Ocultar Diag' : '🤖 Diagnóstico IA'}
          </button>
          <button onClick={() => { setShowSplitScreen(!showSplitScreen); setShowAudit(false); }} className="px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all border border-white/10 text-white hover:bg-white/5 cursor-pointer">
            {showSplitScreen ? '🌐 Ver Novo Site' : '🔄 Comparar Antes vs Depois'}
          </button>
          <button onClick={() => setShowAudit(!showAudit)} className="px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all border border-white/10 text-white hover:bg-white/5 cursor-pointer">
            {showAudit ? '🌐 Ver Site' : '📊 Auditoria'}
          </button>
          <a href={waEmpresa} target="_blank" rel="noopener noreferrer"
            className="bg-stone-950 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] border border-white/10">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Aprovar Este Site — R$ 39,90/mês</span>
          </a>
        </div>
      </div>

      {/* ===== SPLIT SCREEN: ANTES vs DEPOIS ===== */}
      {showSplitScreen && (
        <div className="fixed inset-y-[56px] left-0 w-full md:w-1/2 z-40 overflow-y-auto bg-gray-100 border-r-4 border-red-500/60 shadow-2xl">
          <div className="relative">
            {/* Label */}
            <div className="sticky top-0 z-10 bg-red-600 text-white text-center py-2 text-xs font-black uppercase tracking-widest shadow-lg">
              ❌ Antes — Site Antigo (Genérico)
            </div>
            {/* Old Site Mockup */}
            <div className="bg-white min-h-[90vh]">
              {/* Generic ugly header */}
              <div className="bg-gray-300 border-b-2 border-gray-400 px-4 py-3">
                <div className="flex items-center justify-between max-w-xl mx-auto">
                  <div className="text-gray-700 font-bold text-sm" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {nomeEmpresa}
                  </div>
                  <div className="flex gap-3 text-[10px] text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>
                    <span>Início</span>
                    <span>Produtos</span>
                    <span>Contato</span>
                  </div>
                </div>
              </div>
              {/* Stock photo hero */}
              <div className="relative h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=60" alt="" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gray-400/30" />
                <div className="absolute text-center">
                  <h1 className="text-xl font-bold text-gray-800 drop-shadow" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {nomeEmpresa}
                  </h1>
                  <p className="text-[10px] text-gray-600 mt-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                    Bem-vindo ao nosso site
                  </p>
                </div>
              </div>
              {/* Bad content blocks */}
              <div className="p-6 max-w-xl mx-auto space-y-4">
                <div className="bg-gray-50 border border-gray-300 p-4 rounded" style={{ fontFamily: 'Times New Roman, serif' }}>
                  <h2 className="text-sm font-bold text-gray-700 mb-2">Sobre Nós</h2>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Somos uma empresa dedicada a oferecer os melhores serviços para nossos clientes. 
                    Com years de experiência no mercado, estamos prontos para atender você.
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-300 p-4 rounded" style={{ fontFamily: 'Times New Roman, serif' }}>
                  <h2 className="text-sm font-bold text-gray-700 mb-2">Nossos Serviços</h2>
                  <ul className="text-[11px] text-gray-500 space-y-1">
                    <li>• Serviço 1</li>
                    <li>• Serviço 2</li>
                    <li>• Serviço 3</li>
                    <li>• Serviço 4</li>
                  </ul>
                </div>
                <div className="bg-gray-200 border border-gray-300 p-4 rounded text-center" style={{ fontFamily: 'Times New Roman, serif' }}>
                  <p className="text-[10px] text-gray-500 mb-2">Ligue para nós:</p>
                  <p className="text-sm font-bold text-gray-700">(11) 99999-9999</p>
                  <p className="text-[10px] text-gray-500 mt-2">Horário: Seg-Sex 8h às 17h</p>
                </div>
                {/* No WhatsApp, no mobile optimization, bad footer */}
                <div className="bg-gray-800 text-gray-400 text-center py-4 text-[9px] mt-8" style={{ fontFamily: 'Times New Roman, serif' }}>
                  <p>© 2019 {nomeEmpresa}. Todos os direitos reservados.</p>
                  <p className="mt-1">Site feito com { '</'}template{'>'} </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== DEPOIS LABEL (visible during split-screen) ===== */}
      {showSplitScreen && (
        <div className="fixed top-[72px] right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/30 flex items-center gap-2 pointer-events-none">
          ✅ Depois — Novo Site Redesigned
        </div>
      )}

      {/* ===== MODO: AUDITORIA ===== */}
      {showAudit ? (
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
          <div className={`${theme.bg}/10 border ${theme.border} rounded-3xl p-8 space-y-4`}>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full ${theme.bg}/10 ${theme.color} text-[10px] font-bold border ${theme.border} uppercase`}>
                Relatório Executivo
              </span>
              <span className="text-[10px] text-stone-500">Gerado automaticamente pelo Agente Hermes</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              {theme.emoji} {nomeEmpresa}
            </h1>
            <p className="text-xs text-stone-400">
              {theme.label} • {cidadeEmpresa} — Auditoria de presença digital
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">❌ Problemas Identificados</h3>
              {theme.auditProblems.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-stone-300">
                  <span className="text-red-400 mt-0.5">•</span> {p}
                </div>
              ))}
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">✅ Nossas Soluções</h3>
              {theme.auditSolutions.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-stone-300">
                  <span className="text-emerald-400 mt-0.5">•</span> {s}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-stone-900/60 border border-white/10 rounded-3xl p-8 space-y-4">
            <h3 className="text-lg font-bold text-white">💰 Investimento</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-stone-950 border border-white/10 rounded-2xl p-5 text-center">
                <div className="text-2xl font-extrabold text-white">R$ 1.500</div>
                <div className="text-[11px] text-stone-400 mt-1">Setup (pagamento único)</div>
              </div>
              <div className="bg-stone-950 border border-white/10 rounded-2xl p-5 text-center">
                <div className={`text-2xl font-extrabold ${theme.color}`}>R$ 39,90</div>
                <div className="text-[11px] text-stone-400 mt-1">Manutenção mensal</div>
              </div>
            </div>
            <div className="text-[11px] text-stone-500 space-y-1">
              <p>✓ Site profissional com hosting incluso</p>
              <p>✓ Atualizações de conteúdo inclusas</p>
              <p>✓ Suporte via WhatsApp</p>
              <p>✓ SEO otimizado para sua região</p>
            </div>
            <a href={waEmpresa} target="_blank" rel="noopener noreferrer"
              className={`w-full py-4 ${theme.bg} hover:opacity-90 text-stone-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]`}>
              <MessageCircle className="w-5 h-5" /> Aprovar & Ativar Site
            </a>
          </div>
        </div>
      ) : (
        /* ===== MODO: SITE DO CLIENTE ===== */
        <div className="min-h-[calc(100vh-56px)] flex flex-col relative">

          {/* HERO */}
          <section className="relative min-h-[85vh] flex items-center justify-center text-center px-4 overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${theme.heroImage}')` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/30" />
            <div className="absolute inset-0 bg-stone-950/20" />

            <div className="relative z-10 max-w-3xl mx-auto pt-16 pb-8">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 ${theme.bg}/15 border ${theme.border} ${theme.color} rounded-full text-xs font-bold mb-8 backdrop-blur-sm`}>
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Referência em {theme.label} em {cidadeEmpresa}</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-5 leading-[1.05]">
                {nomeEmpresa}
              </h1>

              <p className="text-stone-300 text-base md:text-lg max-w-xl mx-auto mb-10 font-medium leading-relaxed">
                {theme.heroSubtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href={waPedido} target="_blank" rel="noopener noreferrer"
                  className={`w-full sm:w-auto ${theme.bg} hover:opacity-90 text-stone-950 font-black px-8 py-4 rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all hover:scale-[1.03] active:scale-[0.97]`}>
                  <MessageCircle className="w-5 h-5" />
                  <span>{theme.ctaText}</span>
                </a>
                <a href="#servicos" className="w-full sm:w-auto bg-stone-900/80 hover:bg-stone-800 border border-stone-700/60 text-white font-bold px-8 py-4 rounded-2xl text-sm flex items-center justify-center gap-2.5 backdrop-blur-sm transition-all hover:border-stone-600">
                  Ver Serviços
                </a>
              </div>

              <div className="mt-12 flex items-center justify-center gap-6 text-[11px] text-stone-500">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Atendimento 24/7</span>
                <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5 text-green-400" /> WhatsApp Direto</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Garantia Incluída</span>
              </div>
            </div>

            <a href="#servicos" className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
              <ChevronDown className="w-6 h-6 text-stone-400" />
            </a>
          </section>

          {/* SERVIÇOS / FEATURES */}
          <section id="servicos" className="py-24 px-4 max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">Nossos Serviços</h2>
              <p className="text-stone-400 text-sm max-w-md mx-auto">Conheça tudo o que oferecemos para você</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {theme.features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div key={idx} className={`bg-stone-900/60 border border-stone-800/80 rounded-3xl p-8 shadow-xl hover:${theme.border} transition-all duration-300 group`}>
                    <div className={`w-14 h-14 ${theme.bg}/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-7 h-7 ${theme.color}`} />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                    <p className="text-xs text-stone-400 leading-relaxed">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* LISTA DE SERVIÇOS */}
          <section className="py-16 px-4 max-w-5xl mx-auto">
            <div className="bg-stone-900/40 border border-stone-800/50 rounded-3xl p-8">
              <h3 className="text-lg font-bold text-white mb-5">O que oferecemos:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {theme.services.map((svc, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-stone-300">
                    <CheckCircle className={`w-4 h-4 ${theme.color} shrink-0`} />
                    {svc}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FOOD-ONLY: CARDÁPIO (restaurantes) */}
          {isFood && (
            <FoodSection activeMenuCategory={activeMenuCategory} setActiveMenuCategory={setActiveMenuCategory} waPedido={waPedido} />
          )}

          {/* CTA FINAL */}
          <section className="py-24 px-4 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Pronto Para Começar?</h2>
            <p className="text-stone-400 text-sm mb-10 max-w-md mx-auto">
              Clique no botão abaixo e fale diretamente com nosso time. Atendimento em menos de 5 minutos.
            </p>
            <a href={waPedido} target="_blank" rel="noopener noreferrer"
              className={`inline-flex items-center gap-3 px-10 py-4 ${theme.bg} hover:opacity-90 text-stone-950 font-black text-sm rounded-2xl shadow-2xl transition-all hover:scale-[1.03] active:scale-[0.97]`}>
              <MessageCircle className="w-5 h-5" />
              {theme.ctaText}
              <ArrowRight className="w-5 h-5" />
            </a>
            <p className="text-[10px] text-stone-600 mt-4">Resposta em até 5 minutos</p>
          </section>

          {/* WHATSAPP FLUTUANTE */}
          <a href={waPedido} target="_blank" rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-2xl shadow-emerald-500/30 flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
            aria-label="WhatsApp">
            <MessageCircle className="w-6 h-6" />
          </a>

          {/* FOOTER */}
          <footer className="border-t border-stone-800/50 py-8 px-6 text-center">
            <p className="text-[11px] text-stone-600">© {new Date().getFullYear()} {nomeEmpresa}. Todos os direitos reservados.</p>
            <p className="text-[10px] text-stone-700 mt-1">Site desenvolvido por Foco em Dados</p>
          </footer>
        </div>
      )}

      {/* ===== DIAGNÓSTICO IA FLUTUANTE ===== */}
      {showDiagTerminal && (
        <div className="fixed bottom-20 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
          <div className="bg-stone-950/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-500/10 overflow-hidden">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-stone-900/80 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[10px] text-stone-500 font-mono ml-1">diagnostico-ia.sh</span>
            </div>
            {/* Terminal body */}
            <div className="p-4 space-y-3 font-mono text-xs">
              <div className="text-emerald-400 text-[10px] font-bold flex items-center gap-1.5 mb-2">
                <span className="text-green-400">$</span> rodar-diagnostico --empresa="{nomeEmpresa}"
              </div>
              {/* Item 1: Tempo de carregamento */}
              <div className={`flex items-start gap-2 transition-all duration-500 ${diagVisibleItems >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <Timer className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-stone-500">Tempo de carregamento:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-red-400 line-through">3.2s</span>
                    <span className="text-stone-600">→</span>
                    <span className="text-emerald-400 font-bold">0.8s</span>
                    <span className="text-emerald-500 text-[9px]">⚡ -75%</span>
                  </div>
                </div>
              </div>
              {/* Item 2: WhatsApp */}
              <div className={`flex items-start gap-2 transition-all duration-500 ${diagVisibleItems >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <MessageCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-stone-500">Presença no WhatsApp:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-red-400">❌ Não encontrado</span>
                    <span className="text-stone-600">→</span>
                    <span className="text-emerald-400 font-bold">✅ Configurado</span>
                  </div>
                </div>
              </div>
              {/* Item 3: SEO */}
              <div className={`flex items-start gap-2 transition-all duration-500 ${diagVisibleItems >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <Search className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-stone-500">Nota SEO:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-red-400 line-through">45/100</span>
                    <span className="text-stone-600">→</span>
                    <span className="text-emerald-400 font-bold">87/100</span>
                    <span className="text-emerald-500 text-[9px]">📈 +93%</span>
                  </div>
                </div>
              </div>
              {/* Item 4: Redes Sociais */}
              <div className={`flex items-start gap-2 transition-all duration-500 ${diagVisibleItems >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <Share2 className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-stone-500">Presença em Redes:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-amber-400">⚠️ Inexistente</span>
                    <span className="text-stone-600">→</span>
                    <span className="text-emerald-400 font-bold">✅ Integrada</span>
                  </div>
                </div>
              </div>
              {/* Summary line */}
              {diagVisibleItems >= 4 && (
                <div className="pt-2 border-t border-white/5 text-[10px] text-emerald-500 animate-pulse">
                  ▸ Diagnóstico completo — Pronto para ativação
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Food-only section (cardápio) ── */
function FoodSection({ activeMenuCategory, setActiveMenuCategory, waPedido }: { activeMenuCategory: string; setActiveMenuCategory: (c: string) => void; waPedido: string }) {
  const menuItems = [
    { img: foodItemImages[0], title: 'Cento de Salgados Sortidos', price: 'R$ 65,00', tag: 'Mais Pedido', desc: 'Coxinhas, kibe, bolinha de queijo e risoles fritos na hora.' },
    { img: foodItemImages[1], title: 'Combo Família Especial', price: 'R$ 89,90', tag: 'Economize 15%', desc: '50 salgados + Guaraná 2L + Doce artesanal de brinde.' },
    { img: foodItemImages[2], title: 'Lanche da Casa Gourmet', price: 'R$ 28,00', tag: '', desc: 'Pão artesanal, hambúrguer 180g, queijo derretido e molho da casa.' },
    { img: foodItemImages[3], title: 'Salada Tropical Premium', price: 'R$ 32,00', tag: 'Saudável', desc: 'Folhas verdes, frutas tropicais, nozes caramelizadas.' },
    { img: foodItemImages[4], title: 'Pizza Artesanal Margherita', price: 'R$ 54,00', tag: '', desc: 'Massa fermentada 48h, molho San Marzano, muzzarela de búfala.' },
    { img: foodItemImages[5], title: 'Petisco da Casa', price: 'R$ 42,00', tag: 'Novidade', desc: 'Porção generosa com ingredientes da estação.' },
  ];

  return (
    <section id="cardapio" className="py-24 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">Destaques do Cardápio</h2>
        <p className="text-stone-400 text-sm max-w-md mx-auto">Escolha seus favoritos e faça seu pedido direto pelo WhatsApp</p>
      </div>
      <div className="flex justify-center gap-2 mb-12">
        {['destaques', 'salgados', 'combos'].map((cat) => (
          <button key={cat} onClick={() => setActiveMenuCategory(cat)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMenuCategory === cat ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20' : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800 border border-stone-800'
            }`}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, idx) => (
          <div key={idx} className="group bg-stone-900/60 border border-stone-800/80 rounded-3xl overflow-hidden shadow-xl hover:border-amber-500/40 transition-all duration-300 hover:shadow-amber-500/5">
            <div className="relative overflow-hidden">
              <img src={item.img} alt={item.title} className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              {item.tag && (
                <span className="absolute top-3 left-3 bg-amber-500 text-stone-950 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg">{item.tag}</span>
              )}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2 gap-3">
                <h3 className="font-bold text-base text-white leading-snug">{item.title}</h3>
                <span className="text-amber-400 font-black text-sm bg-amber-500/10 px-3 py-1 rounded-xl whitespace-nowrap border border-amber-500/20">{item.price}</span>
              </div>
              <p className="text-xs text-stone-400 mb-5 leading-relaxed">{item.desc}</p>
              <a href={waPedido} target="_blank" rel="noopener noreferrer"
                className="w-full py-3 bg-stone-800/80 hover:bg-amber-500 hover:text-stone-950 font-bold text-xs rounded-xl text-stone-200 transition-all flex items-center justify-center gap-2 border border-stone-700/50 hover:border-amber-500">
                Pedir pelo WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
