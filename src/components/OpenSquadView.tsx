import React, { useState } from 'react';
import { 
  Sparkles, Target, Globe, BarChart3, Bot, Share2, ShieldCheck, 
  ArrowRight, CheckCircle2, RefreshCw, Send, FileText, Database, Layers, Check 
} from 'lucide-react';

export interface Mission {
  id: string;
  title: string;
  category: string;
  description: string;
  expectedResults: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const MISSIONS: Mission[] = [
  {
    id: 'encontrar-clientes',
    title: 'Encontrar Clientes',
    category: 'Prospecção B2B',
    description: 'Encontramos empresas do nicho escolhido, verificamos presença digital e identificamos oportunidades de venda em escala.',
    expectedResults: ['Lista de Leads Qualificados', 'Telefone & E-mail', 'WhatsApp Direto', 'Classificação de Oportunidade'],
    icon: Target
  },
  {
    id: 'redesign-site',
    title: 'Redesign de Site',
    category: 'Presença Digital',
    description: 'Analisamos um site existente e criamos uma proposta visual moderna e responsiva para disparar suas conversões.',
    expectedResults: ['Diagnóstico Visual 0-100', 'Problemas Detectados', 'Novo Layout Antes/Depois', 'Página de Demonstração'],
    icon: Globe
  },
  {
    id: 'dashboard-kpi',
    title: 'Dashboard Inteligente',
    category: 'Inteligência de Dados',
    description: 'Transforme planilhas financeiras, comerciais ou operacionais em dashboards gerenciais profissionais automaticamente.',
    expectedResults: ['KPIs Dinâmicos', 'Gráficos de Tendência', 'Insights de IA', 'Relatórios Executivos'],
    icon: BarChart3
  },
  {
    id: 'agente-hermes',
    title: 'Agente Hermes (WhatsApp)',
    category: 'Automação Omnichannel',
    description: 'Automatize atendimentos e vendas no WhatsApp, Facebook e Instagram 24 horas por dia sem esforço manual.',
    expectedResults: ['Atendimento 24/7', 'Qualificação de Leads', 'Respostas Instantâneas', 'Follow-up Automático'],
    icon: Bot
  },
  {
    id: 'redes-sociais',
    title: 'Redes Sociais Automáticas',
    category: 'Marketing & Engajamento',
    description: 'Crie conteúdo, legendas persuasivas, hashtags e calendários editoriais completos para o Instagram e Facebook.',
    expectedResults: ['Calendário Editorial', 'Posts e Legendas', 'Ideias de Engajamento', 'Relatório de Alcance'],
    icon: Share2
  },
  {
    id: 'auditoria-digital',
    title: 'Auditoria Digital & LGPD',
    category: 'Segurança & SEO',
    description: 'Analise a presença digital da empresa, pontuação de SEO, velocidade, SSL e conformidade com a LGPD.',
    expectedResults: ['Nota Geral de SEO', 'Velocidade & Responsividade', 'Checklist de Segurança', 'Plano de Ação'],
    icon: ShieldCheck
  }
];

const OBJETIVOS_RAPIDOS = [
  'Encontrar Clientes', 'Criar ou Melhorar Site', 'Criar Dashboard', 
  'Automatizar Atendimento', 'Gerenciar Redes Sociais', 'Auditar Concorrentes', 
  'Aumentar Vendas', 'Criar Campanha'
];

export const OpenSquadView: React.FC = () => {
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [executing, setExecuting] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [missionCompleted, setMissionCompleted] = useState(false);

  const steps = [
    'Planejando Estratégia de Crescimento...',
    'Pesquisando Dados de Mercado & Concorrentes...',
    'Analisando Presença Digital e Gargalos...',
    'Gerando Soluções de Alta Conversão...',
    'Validando Resultado Final com IA...'
  ];

  const handleStartMission = (mission: Mission) => {
    setActiveMission(mission);
    setExecuting(true);
    setStepIndex(0);
    setMissionCompleted(false);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setStepIndex(current);
      } else {
        clearInterval(interval);
        setExecuting(false);
        setMissionCompleted(true);
      }
    }, 900);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-10 text-slate-100 font-sans">
      
      {/* HEADER EXECUTIVO */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" /> OpenSquad AI • Departamento Virtual
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            OpenSquad AI
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            "Encontre clientes, analise concorrentes, gere propostas, crie sites, automatize atendimento e aumente suas vendas com Inteligência Artificial — sem entender nada de tecnologia."
          </p>
        </div>
      </div>

      {/* O QUE VOCÊ DESEJA FAZER HOJE? (GRID DE OBJETIVOS) */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">O que você deseja fazer hoje?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {OBJETIVOS_RAPIDOS.map((obj) => (
            <button
              key={obj}
              onClick={() => {
                const found = MISSIONS.find(m => m.title.toLowerCase().includes(obj.toLowerCase().split(' ')[0]));
                if (found) handleStartMission(found);
                else handleStartMission(MISSIONS[0]);
              }}
              className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-2xl text-xs font-semibold text-slate-200 transition-all cursor-pointer text-center shadow-md active:scale-95"
            >
              {obj}
            </button>
          ))}
        </div>
      </div>

      {/* TELA DE EXECUÇÃO EM ANDAMENTO */}
      {executing && activeMission && (
        <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">Missão em Andamento: {activeMission.title}</span>
            <h3 className="text-2xl font-bold text-white">{steps[stepIndex]}</h3>
          </div>
          <div className="max-w-md mx-auto bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="bg-amber-500 h-full transition-all duration-500" 
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* RELATÓRIO EXECUTIVO DE CONCLUSÃO */}
      {missionCompleted && activeMission && !executing && (
        <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Missão Concluída com Sucesso</h3>
                <p className="text-xs text-slate-400">Objetivo atingido: {activeMission.title}</p>
              </div>
            </div>
            <button 
              onClick={() => setMissionCompleted(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Realizar Nova Missão
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
              <div className="text-2xl font-extrabold text-white font-mono">37</div>
              <div className="text-xs text-slate-400 mt-1">Empresas Encontradas</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
              <div className="text-2xl font-extrabold text-red-400 font-mono">12</div>
              <div className="text-xs text-slate-400 mt-1">Sem Presença Digital</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
              <div className="text-2xl font-extrabold text-amber-400 font-mono">15</div>
              <div className="text-xs text-slate-400 mt-1">Sites Desatualizados</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">R$ 14.500</div>
              <div className="text-xs text-slate-400 mt-1">Receita Potencial/mês</div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-3 justify-end">
            <button onClick={() => alert('Leads exportados para o CRM com sucesso!')} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer">
              📁 Adicionar ao CRM
            </button>
            <button onClick={() => alert('Proposta comercial gerada e pronta!')} className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md">
              📄 Gerar Proposta & Contrato
            </button>
            <button onClick={() => alert('Mensagem enviada via WhatsApp!')} className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md flex items-center gap-2">
              <Send className="w-3.5 h-3.5" /> Enviar para WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* GRID DE MISSÕES INTELIGENTES */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Missões Inteligentes Disponíveis</h2>
          <span className="text-xs text-slate-400 font-mono">Execução Automatizada</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MISSIONS.map((mission) => {
            const IconComp = mission.icon;
            return (
              <div 
                key={mission.id}
                className="bg-slate-900 border-2 border-slate-800 hover:border-amber-500/60 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {mission.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{mission.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{mission.description}</p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Resultado Esperado:</div>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {mission.expectedResults.map((res, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{res}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => handleStartMission(mission)}
                  disabled={executing}
                  className="mt-6 w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>Iniciar Missão</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* EQUIPE IA TRABALHANDO (BASTIDORES DISCRETOS) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div>
          <strong className="text-white block mb-0.5">Equipe IA Trabalhando nos Bastidores</strong>
          <span>O motor autônomo coordena múltiplas instâncias em background para garantir precisão máxima.</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium">✅ Estratégia Ativa</span>
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-medium">✅ Pesquisa Ativa</span>
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-medium">✅ Design Ativo</span>
          <span className="px-3 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full font-medium">✅ Qualidade Ativa</span>
        </div>
      </div>

    </div>
  );
};

export default OpenSquadView;
