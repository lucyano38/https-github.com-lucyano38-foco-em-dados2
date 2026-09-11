import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, CheckCircle2, XCircle, Globe, ArrowRight, ShieldCheck, Phone, MapPin, Clock, Utensils, Heart, Scissors, Store, Wrench, Star, ChevronRight } from 'lucide-react';

interface NicheConfig {
  name: string;
  emoji: string;
  primaryColor: string;
  primaryBg: string;
  primaryBorder: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  features: { title: string; desc: string; icon: any }[];
  services: string[];
  auditProblems: string[];
  auditSolutions: string[];
  waMessage: string;
}

const NICHES: Record<string, NicheConfig> = {
  'Restaurantes': {
    name: 'Gastronomia',
    emoji: '🍽️',
    primaryColor: 'text-orange-400',
    primaryBg: 'bg-orange-500',
    primaryBorder: 'border-orange-500/30',
    heroTitle: 'Sabor Incomparável & Experiência Única',
    heroSubtitle: 'Cardápio Digital & Reservas de Mesa Instantâneas no WhatsApp. Seu restaurante merece ser encontrado.',
    ctaText: 'Reservar Mesa Agora',
    features: [
      { title: 'Cardápio Digital Interativo', desc: 'Seus pratos favoritos com fotos profissionais e preços atualizados em tempo real.', icon: Utensils },
      { title: 'Reservas via WhatsApp', desc: 'Clientes reservam mesa pelo WhatsApp com confirmação automática em menos de 30 segundos.', icon: MessageCircle },
      { title: 'Galeria de Fotos', desc: 'Showcase dos seus melhores pratos e do ambiente do restaurante para atrair mais clientes.', icon: Star },
    ],
    services: ['Cardápio Digital', 'Reservas Online', 'Delivery Próprio', 'Eventos & Festas', 'Happy Hour Automático'],
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
    waMessage: 'Olá! Vi o site do restaurante e quero fazer uma reserva!',
  },
  'Restaurantes & Gastronomia': {
    name: 'Gastronomia',
    emoji: '🍽️',
    primaryColor: 'text-orange-400',
    primaryBg: 'bg-orange-500',
    primaryBorder: 'border-orange-500/30',
    heroTitle: 'Sabor Incomparável & Experiência Única',
    heroSubtitle: 'Cardápio Digital & Reservas de Mesa Instantâneas no WhatsApp. Seu restaurante merece ser encontrado.',
    ctaText: 'Reservar Mesa Agora',
    features: [
      { title: 'Cardápio Digital Interativo', desc: 'Seus pratos favoritos com fotos profissionais e preços atualizados em tempo real.', icon: Utensils },
      { title: 'Reservas via WhatsApp', desc: 'Clientes reservam mesa pelo WhatsApp com confirmação automática em menos de 30 segundos.', icon: MessageCircle },
      { title: 'Galeria de Fotos', desc: 'Showcase dos seus melhores pratos e do ambiente do restaurante para atrair mais clientes.', icon: Star },
    ],
    services: ['Cardápio Digital', 'Reservas Online', 'Delivery Próprio', 'Eventos & Festas', 'Happy Hour Automático'],
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
    waMessage: 'Olá! Vi o site do restaurante e quero fazer uma reserva!',
  },
  'Gastronomia': {
    name: 'Gastronomia',
    emoji: '🍽️',
    primaryColor: 'text-orange-400',
    primaryBg: 'bg-orange-500',
    primaryBorder: 'border-orange-500/30',
    heroTitle: 'Sabor Incomparável & Experiência Única',
    heroSubtitle: 'Cardápio Digital & Reservas de Mesa Instantâneas no WhatsApp. Seu restaurante merece ser encontrado.',
    ctaText: 'Reservar Mesa Agora',
    features: [
      { title: 'Cardápio Digital Interativo', desc: 'Seus pratos favoritos com fotos profissionais e preços atualizados em tempo real.', icon: Utensils },
      { title: 'Reservas via WhatsApp', desc: 'Clientes reservam mesa pelo WhatsApp com confirmação automática em menos de 30 segundos.', icon: MessageCircle },
      { title: 'Galeria de Fotos', desc: 'Showcase dos seus melhores pratos e do ambiente do restaurante para atrair mais clientes.', icon: Star },
    ],
    services: ['Cardápio Digital', 'Reservas Online', 'Delivery Próprio', 'Eventos & Festas', 'Happy Hour Automático'],
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
    waMessage: 'Olá! Vi o site do restaurante e quero fazer uma reserva!',
  },
  'Odontologia': {
    name: 'Saúde',
    emoji: '🏥',
    primaryColor: 'text-sky-400',
    primaryBg: 'bg-sky-500',
    primaryBorder: 'border-sky-500/30',
    heroTitle: 'Excelência e Cuidado Odontológico',
    heroSubtitle: 'Agende sua Consulta em 10 Segundos. Atendimento humanizado com tecnologia de ponta.',
    ctaText: 'Agendar Consulta Agora',
    features: [
      { title: 'Agendamento Instantâneo', desc: 'Pacientes agendam consultas pelo WhatsApp com escolha de profissional e horário.', icon: Clock },
      { title: 'Pré-Atendimento Digital', desc: 'Formulário inteligente que coleta histórico do paciente antes da consulta.', icon: Heart },
      { title: 'Lembretes Automáticos', desc: 'Confirmação 24h antes via WhatsApp reduzindo faltas em até 40%.', icon: MessageCircle },
    ],
    services: ['Agendamento Online', 'Pré-Atendimento Digital', 'Lembretes Automáticos', 'Convênios & Planos', 'Teleconsulta'],
    auditProblems: [
      'Pacientes não encontram a clínica no Google Maps',
      'Agendamento apenas por telefone durante horário comercial',
      'Alta taxa de faltas por falta de lembrete',
      'Sem captação de novos pacientes online',
    ],
    auditSolutions: [
      'Landing Page com mapa integrado e botão de ligação',
      'Agendamento 24/7 via WhatsApp com confirmação automática',
      'Sistema de lembretes reduz faltas em 40%',
      'Formulário de captação de leads com qualificação IA',
    ],
    waMessage: 'Olá! Gostaria de agendar uma consulta na clínica!',
  },
  'Odontologia & Estética': {
    name: 'Saúde',
    emoji: '🏥',
    primaryColor: 'text-sky-400',
    primaryBg: 'bg-sky-500',
    primaryBorder: 'border-sky-500/30',
    heroTitle: 'Excelência e Cuidado Odontológico',
    heroSubtitle: 'Agende sua Consulta em 10 Segundos. Atendimento humanizado com tecnologia de ponta.',
    ctaText: 'Agendar Consulta Agora',
    features: [
      { title: 'Agendamento Instantâneo', desc: 'Pacientes agendam consultas pelo WhatsApp com escolha de profissional e horário.', icon: Clock },
      { title: 'Pré-Atendimento Digital', desc: 'Formulário inteligente que coleta histórico do paciente antes da consulta.', icon: Heart },
      { title: 'Lembretes Automáticos', desc: 'Confirmação 24h antes via WhatsApp reduzindo faltas em até 40%.', icon: MessageCircle },
    ],
    services: ['Agendamento Online', 'Pré-Atendimento Digital', 'Lembretes Automáticos', 'Convênios & Planos', 'Teleconsulta'],
    auditProblems: [
      'Pacientes não encontram a clínica no Google Maps',
      'Agendamento apenas por telefone durante horário comercial',
      'Alta taxa de faltas por falta de lembrete',
      'Sem captação de novos pacientes online',
    ],
    auditSolutions: [
      'Landing Page com mapa integrado e botão de ligação',
      'Agendamento 24/7 via WhatsApp com confirmação automática',
      'Sistema de lembretes reduz faltas em 40%',
      'Formulário de captação de leads com qualificação IA',
    ],
    waMessage: 'Olá! Gostaria de agendar uma consulta na clínica!',
  },
  'Advocacia': {
    name: 'Jurídico',
    emoji: '⚖️',
    primaryColor: 'text-indigo-400',
    primaryBg: 'bg-indigo-500',
    primaryBorder: 'border-indigo-500/30',
    heroTitle: 'Assessoria Jurídica de Excelência',
    heroSubtitle: 'Consultoria Online com Atendimento Imediato via WhatsApp. Sua causa merece atenção especializada.',
    ctaText: 'Agendar Consultoria',
    features: [
      { title: 'Consulta Online', desc: 'Primeira consulta via videochamada ou WhatsApp para análise do seu caso.', icon: Phone },
      { title: 'Acompanhamento Processual', desc: 'Receba atualizações do seu processo diretamente no WhatsApp.', icon: MessageCircle },
      { title: 'Documentos Digitais', desc: 'Envie e receba documentos de forma segura e digital.', icon: Globe },
    ],
    services: ['Consultoria Online', 'Acompanhamento Processual', 'Mediação & Conciliação', 'Direito Digital', 'Contratos'],
    auditProblems: [
      'Escritório invisível no Google — clientes vão para a concorrência',
      'Atendimento apenas presencial durante horário comercial',
      'Sem canais digitais para captação de clientes',
      'Processos manuais que geram retrabalho',
    ],
    auditSolutions: [
      'Landing Page profissional com áreas de atuação detalhadas',
      'Atendimento 24/7 via WhatsApp com qualificação de caso',
      'Formulário de captação com triagem automática por IA',
      'Dashboard de acompanhamento de processos para o cliente',
    ],
    waMessage: 'Olá! Preciso de assessoria jurídica e gostaria de uma consulta.',
  },
  'Advocacia & Direito': {
    name: 'Jurídico',
    emoji: '⚖️',
    primaryColor: 'text-indigo-400',
    primaryBg: 'bg-indigo-500',
    primaryBorder: 'border-indigo-500/30',
    heroTitle: 'Assessoria Jurídica de Excelência',
    heroSubtitle: 'Consultoria Online com Atendimento Imediato via WhatsApp. Sua causa merece atenção especializada.',
    ctaText: 'Agendar Consultoria',
    features: [
      { title: 'Consulta Online', desc: 'Primeira consulta via videochamada ou WhatsApp para análise do seu caso.', icon: Phone },
      { title: 'Acompanhamento Processual', desc: 'Receba atualizações do seu processo diretamente no WhatsApp.', icon: MessageCircle },
      { title: 'Documentos Digitais', desc: 'Envie e receba documentos de forma segura e digital.', icon: Globe },
    ],
    services: ['Consultoria Online', 'Acompanhamento Processual', 'Mediação & Conciliação', 'Direito Digital', 'Contratos'],
    auditProblems: [
      'Escritório invisível no Google — clientes vão para a concorrência',
      'Atendimento apenas presencial durante horário comercial',
      'Sem canais digitais para captação de clientes',
      'Processos manuais que geram retrabalho',
    ],
    auditSolutions: [
      'Landing Page profissional com áreas de atuação detalhadas',
      'Atendimento 24/7 via WhatsApp com qualificação de caso',
      'Formulário de captação com triagem automática por IA',
      'Dashboard de acompanhamento de processos para o cliente',
    ],
    waMessage: 'Olá! Preciso de assessoria jurídica e gostaria de uma consulta.',
  },
  'Barbearias': {
    name: 'Barbearia & Estética',
    emoji: '✂️',
    primaryColor: 'text-amber-400',
    primaryBg: 'bg-amber-500',
    primaryBorder: 'border-amber-500/30',
    heroTitle: 'Estilo Que Fala Por Si',
    heroSubtitle: 'Agende seu Horário pelo WhatsApp em 10 Segundos. Sem fila, sem espera, sem dor de cabeça.',
    ctaText: 'Agendar Horário Agora',
    features: [
      { title: 'Agendamento 24/7', desc: 'Clientes agendam cortes e serviços a qualquer hora pelo WhatsApp.', icon: Clock },
      { title: 'Retorno Inteligente', desc: 'Lembrete automático quando o cliente está no tempo de cortar de novo.', icon: MessageCircle },
      { title: 'Cardápio de Serviços', desc: 'Lista completa de serviços com preços e tempo estimado.', icon: Scissors },
    ],
    services: ['Corte & Design', 'Barba & Tratamento', 'Sobrancelha', 'Hidratação', 'Coloração'],
    auditProblems: [
      'Horários perdidos por falta de sistema de agendamento',
      'Clientes chegam e não têm vaga — perdem a ida',
      'Sem presença no Google Maps para novos clientes',
      'Sem lembrete de retorno — cliente esquece e vai a outro lugar',
    ],
    auditSolutions: [
      'Sistema de agendamento que preenche horários cancelados',
      'Landing Page com cardápio de serviços e preços',
      'Presença otimizada no Google Maps com fotos e avaliações',
      'Lembrete automático de retorno em 20 dias',
    ],
    waMessage: 'Olá! Quero agendar um horário na barbearia!',
  },
  'Comércio Local': {
    name: 'Comércio',
    emoji: '🛍️',
    primaryColor: 'text-emerald-400',
    primaryBg: 'bg-emerald-500',
    primaryBorder: 'border-emerald-500/30',
    heroTitle: 'Seu Loja Sempre Aberta Online',
    heroSubtitle: 'Catálogo Digital com Preços e WhatsApp Direto. Seus clientes encontram e compram 24h.',
    ctaText: 'Ver Catálogo Digital',
    features: [
      { title: 'Catálogo Digital', desc: 'Todos os seus produtos com fotos, preços e disponibilidade atualizados.', icon: Store },
      { title: 'Atendimento Automático', desc: 'Respostas instantâneas para dúvidas de produtos, preços e localização.', icon: MessageCircle },
      { title: 'Captação de Leads', desc: 'Capture contatos de clientes interessados e faça remarketing.', icon: Phone },
    ],
    services: ['Catálogo Digital', 'Atendimento 24/7', 'Pedidos via WhatsApp', 'Promoções Automáticas', 'Lista de Espera'],
    auditProblems: [
      'Sem presença online — clientes não sabem que você existe',
      'Atendimento manual demorado no WhatsApp',
      'Sem sistema de pedidos ou reservas',
      'Perda de vendas por falta de follow-up',
    ],
    auditSolutions: [
      'Landing Page com catálogo completo e botão de compra',
      'Atendimento automatizado com respostas inteligentes',
      'Sistema de pedidos com confirmação instantânea',
      'Remarketing para clientes que visitaram o site',
    ],
    waMessage: 'Olá! Vi o catálogo e tenho interesse em um produto!',
  },
};

// Nicho padrão para quando não encontra
const DEFAULT_NICHE: NicheConfig = {
  name: 'Serviços',
  emoji: '💼',
  primaryColor: 'text-amber-400',
  primaryBg: 'bg-amber-500',
  primaryBorder: 'border-amber-500/30',
  heroTitle: 'Excelência em Serviços para sua Região',
  heroSubtitle: 'Presença Digital Profissional com Atendimento Automático via WhatsApp. Seu negócio merece ser encontrado.',
  ctaText: 'Fale Conosco Agora',
  features: [
    { title: 'Atendimento 24/7', desc: 'WhatsApp automatizado que responde seus clientes a qualquer hora.', icon: MessageCircle },
    { title: 'Presença Digital', desc: 'Landing Page profissional que ranqueia no Google da sua região.', icon: Globe },
    { title: 'Captação de Leads', desc: 'Formulários inteligentes que qualificam automaticamente.', icon: Phone },
  ],
  services: ['Atendimento WhatsApp', 'Landing Page', 'Captação de Leads', 'CRM Integrado', 'Relatórios'],
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

export const LivePreviewView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'site' | 'auditoria'>('site');
  const [leadData, setLeadData] = useState({
    nome: 'Clínica Sorriso Perfeito',
    nicho: 'Saúde e Odontologia',
    cidade: 'Campinas - SP',
    telefone: '(19) 98888-1111',
    siteAntigo: 'sorrisoperfeito-antigo.com.br',
  });
  const [nicheConfig, setNicheConfig] = useState<NicheConfig>(DEFAULT_NICHE);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome');
    const nicho = params.get('nicho');
    const cidade = params.get('cidade');
    const site = params.get('site');

    if (nome || nicho) {
      setLeadData({
        nome: nome || 'Empresa Exemplo',
        nicho: nicho || 'Serviços',
        cidade: cidade || 'São Paulo - SP',
        telefone: '(11) 99999-9999',
        siteAntigo: site || 'site-antigo.com.br',
      });

      // Encontra config do nicho
      const config = NICHES[nicho || ''] || NICHES[nicho?.split(' ')[0] || ''] || DEFAULT_NICHE;
      setNicheConfig(config);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* BARRA SUPERIOR DE CONTROLE */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl ${nicheConfig.primaryBg} flex items-center justify-center text-slate-950 text-sm`}>
            {nicheConfig.emoji}
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Preview Personalizado • {leadData.nome}</span>
            <span className="text-[10px] text-slate-400">Nicho: {nicheConfig.name} • {leadData.cidade}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setViewMode('site')} className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${viewMode === 'site' ? `${nicheConfig.primaryBg} text-slate-950` : 'text-slate-300 hover:text-white'}`}>
            🌐 Ver Novo Site
          </button>
          <button onClick={() => setViewMode('auditoria')} className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${viewMode === 'auditoria' ? `${nicheConfig.primaryBg} text-slate-950` : 'text-slate-300 hover:text-white'}`}>
            📊 Auditoria & Proposta
          </button>
        </div>

        <a href="/" className="text-xs text-slate-400 hover:text-white underline">Voltar ao Foco em Dados</a>
      </div>

      {/* MODO 1: O NOVO SITE DO CLIENTE */}
      {viewMode === 'site' && (
        <div className="min-h-[calc(100vh-65px)] flex flex-col relative">
          
          {/* Header do Cliente */}
          <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between border-b border-white/5">
            <div className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${nicheConfig.primaryBg}`} /> {leadData.nome}
            </div>
            <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
              <a href="#sobre" className="hover:text-white transition">Sobre</a>
              <a href="#servicos" className="hover:text-white transition">Serviços</a>
              <a href="#contato" className="hover:text-white transition">Contato</a>
            </div>
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(nicheConfig.waMessage)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </header>

          {/* HERO COM IDENTIDADE DO NICHO */}
          <section className="max-w-5xl mx-auto px-6 py-20 text-center space-y-6 my-auto">
            <span className={`inline-block px-4 py-1.5 rounded-full ${nicheConfig.primaryBg}/10 ${nicheConfig.primaryColor} text-xs font-bold border ${nicheConfig.primaryBorder} uppercase tracking-widest`}>
              {nicheConfig.emoji} Referência em {nicheConfig.name} em {leadData.cidade.split(' - ')[0]}
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {nicheConfig.heroTitle}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {nicheConfig.heroSubtitle}
            </p>
            <div className="pt-4 flex justify-center gap-4 flex-wrap">
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(nicheConfig.waMessage)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`px-8 py-4 ${nicheConfig.primaryBg} hover:opacity-90 text-slate-950 font-bold text-sm rounded-xl shadow-xl transition-all hover:scale-105 flex items-center gap-2`}
              >
                {nicheConfig.ctaText} <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#servicos" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-xl border border-white/10 transition">
                Ver Serviços
              </a>
            </div>
          </section>

          {/* SERVIÇOS DO NICHO */}
          <section id="servicos" className="max-w-7xl mx-auto px-6 py-16 border-t border-white/5">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-extrabold text-white mb-2">Nossos Serviços</h2>
              <p className="text-xs text-slate-400">Conheça tudo o que oferecemos para você</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {nicheConfig.features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div key={idx} className={`bg-white/[0.02] border border-white/5 p-6 rounded-2xl hover:${nicheConfig.primaryBorder} transition-all group`}>
                    <div className={`w-12 h-12 ${nicheConfig.primaryBg}/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${nicheConfig.primaryColor}`} />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* LISTA DE SERVIÇOS */}
          <section className="max-w-5xl mx-auto px-6 py-12">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-white mb-4">O que oferecemos:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {nicheConfig.services.map((svc, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className={`w-4 h-4 ${nicheConfig.primaryColor} shrink-0`} />
                    {svc}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA FINAL */}
          <section id="contato" className="max-w-3xl mx-auto px-6 py-16 text-center">
            <div className={`bg-white/[0.02] border ${nicheConfig.primaryBorder} rounded-3xl p-10 space-y-6`}>
              <h2 className="text-2xl font-extrabold text-white">Pronto para Transformar seu Negócio?</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Clique no botão abaixo e fale diretamente com nosso time. Atendimento em menos de 5 minutos.
              </p>
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(nicheConfig.waMessage)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-3 px-10 py-4 ${nicheConfig.primaryBg} hover:opacity-90 text-slate-950 font-bold text-sm rounded-xl shadow-2xl transition-all hover:scale-105`}
              >
                <MessageCircle className="w-5 h-5" />
                {nicheConfig.ctaText}
                <ArrowRight className="w-5 h-5" />
              </a>
              <p className="text-[10px] text-slate-500">Resposta garantida em até 5 minutos</p>
            </div>
          </section>

          {/* WhatsApp Flutuante */}
          <a 
            href={`https://wa.me/?text=${encodeURIComponent(nicheConfig.waMessage)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
          >
            <MessageCircle className="w-6 h-6" />
          </a>

          <footer className="border-t border-white/5 py-6 px-6 text-center text-[11px] text-slate-600">
            © {new Date().getFullYear()} {leadData.nome}. Site desenvolvido por Foco em Dados.
          </footer>
        </div>
      )}

      {/* MODO 2: RELATÓRIO DE AUDITORIA & PROPOSTA (ISCA DE VENDAS) */}
      {viewMode === 'auditoria' && (
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
          
          {/* Cabeçalho do Relatório */}
          <div className={`bg-white/[0.02] border ${nicheConfig.primaryBorder} rounded-3xl p-8 space-y-4`}>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full ${nicheConfig.primaryBg}/10 ${nicheConfig.primaryColor} text-[10px] font-bold border ${nicheConfig.primaryBorder} uppercase`}>
                Relatório Executivo
              </span>
              <span className="text-[10px] text-slate-500">Gerado automaticamente pelo Agente Hermes</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              {nicheConfig.emoji} {leadData.nome}
            </h1>
            <p className="text-xs text-slate-400">
              Nicho: {nicheConfig.name} • Localização: {leadData.cidade} • Análise: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Problemas Encontrados */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-4">
            <h2 className="text-lg font-extrabold text-red-400 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Problemas Identificados
            </h2>
            <p className="text-xs text-slate-400">Estes são os motivos pelos quais o seu site atual está perdendo clientes:</p>
            <div className="space-y-3">
              {nicheConfig.auditProblems.map((prob, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300">{prob}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Soluções Propostas */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-4">
            <h2 className="text-lg font-extrabold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Nossa Proposta de Solução
            </h2>
            <p className="text-xs text-slate-400">O que entregamos para resolver cada problema:</p>
            <div className="space-y-3">
              {nicheConfig.auditSolutions.map((sol, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300">{sol}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Métricas de Impacto */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
              <div className={`text-2xl font-extrabold ${nicheConfig.primaryColor} font-mono`}>+40%</div>
              <div className="text-[10px] text-slate-400 mt-1">Mais Visitas</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">{'<1s'}</div>
              <div className="text-[10px] text-slate-400 mt-1">Carregamento</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
              <div className="text-2xl font-extrabold text-violet-400 font-mono">24/7</div>
              <div className="text-[10px] text-slate-400 mt-1">Atendimento IA</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
              <div className="text-2xl font-extrabold text-amber-400 font-mono">30s</div>
              <div className="text-[10px] text-slate-400 mt-1">Resposta WhatsApp</div>
            </div>
          </div>

          {/* Proposta Comercial */}
          <div className={`bg-white/[0.02] border ${nicheConfig.primaryBorder} rounded-3xl p-8 space-y-6`}>
            <h2 className="text-lg font-extrabold text-white">Investimento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-white">Setup Único</span>
                <div className="text-2xl font-extrabold text-white">R$ 1.500</div>
                <p className="text-[10px] text-slate-400">Landing Page + Cardápio + WhatsApp + CRM</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-white">Manutenção Mensal</span>
                <div className="text-2xl font-extrabold text-white">R$ 39,90<span className="text-xs text-slate-400">/mês</span></div>
                <p className="text-[10px] text-slate-400">Hospedagem + Suporte + Atualizações + IA</p>
              </div>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-white/5">
              <div className="text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 inline text-emerald-400 mr-1" />
                Garantia de 7 dias ou seu dinheiro de volta
              </div>
              <button className={`px-8 py-3 ${nicheConfig.primaryBg} hover:opacity-90 text-slate-950 font-bold text-xs rounded-xl cursor-pointer shadow-lg flex items-center gap-2 transition-all hover:scale-105`}>
                Aprovar Proposta & Fechar Contrato 🚀
              </button>
            </div>
          </div>

          {/* Botão WhatsApp */}
          <div className="text-center py-8">
            <a 
              href={`https://wa.me/?text=${encodeURIComponent('Olá! Vi o relatório de auditoria do meu negócio e quero contratar o serviço!')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-xl transition-all hover:scale-105"
            >
              <MessageCircle className="w-5 h-5" />
              Falar com Especialista no WhatsApp
            </a>
          </div>
        </div>
      )}

    </div>
  );
};

export default LivePreviewView;
