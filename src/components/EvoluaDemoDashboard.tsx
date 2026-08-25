import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Users,
  MessageSquare,
  Zap,
  CheckCircle2,
  Filter,
  Download,
  Share2,
  Building2,
  Globe,
  Smartphone,
  PieChart,
  BarChart2,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Layers
} from 'lucide-react';

interface EvoluaDemoDashboardProps {
  onBackToLanding: () => void;
  onOpenAppMode: (mode: 'crm' | 'analytics' | 'opensquad') => void;
}

export const EvoluaDemoDashboard: React.FC<EvoluaDemoDashboardProps> = ({
  onBackToLanding,
  onOpenAppMode
}) => {
  const [selectedNiche, setSelectedNiche] = useState<'imobiliaria' | 'infoprodutos' | 'agencia' | 'b2b'>('b2b');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState<'visao_geral' | 'extrator' | 'disparos' | 'crm' | 'ia'>('visao_geral');
  const [isSimulatingDispatch, setIsSimulatingDispatch] = useState(false);
  const [simulatedMsgCount, setSimulatedMsgCount] = useState(12845);

  const handleSimulateDispatch = () => {
    setIsSimulatingDispatch(true);
    setTimeout(() => {
      setSimulatedMsgCount(prev => prev + 250);
      setIsSimulatingDispatch(false);
    }, 1200);
  };

  const nicheData = {
    b2b: {
      name: 'SaaS & Serviços B2B',
      leads: '45,820',
      dispatches: '128,450',
      conversionRate: '14.2%',
      revenue: 'R$ 342.500',
      roi: '14.8x'
    },
    imobiliaria: {
      name: 'Imobiliárias & Construtoras',
      leads: '18,340',
      dispatches: '64,100',
      conversionRate: '9.8%',
      revenue: 'R$ 680.000',
      roi: '22.4x'
    },
    infoprodutos: {
      name: 'Infoprodutos & Lançamentos',
      leads: '92,500',
      dispatches: '310,000',
      conversionRate: '6.4%',
      revenue: 'R$ 512.000',
      roi: '18.1x'
    },
    agencia: {
      name: 'Agências de Marketing & Prospecção',
      leads: '28,900',
      dispatches: '95,400',
      conversionRate: '16.5%',
      revenue: 'R$ 198.000',
      roi: '12.3x'
    }
  };

  const currentMetrics = nicheData[selectedNiche];

  return (
    <div className="min-h-screen bg-[#121414] text-[#e3e2e2] font-['Manrope',sans-serif] selection:bg-amber-500/30 selection:text-amber-200 p-4 md:p-8">
      {/* Top Bar */}
      <div className="max-w-[1440px] mx-auto mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#4f4632]/40 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#ffc107]/10 border border-[#ffc107]/30 text-[#ffe4af] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ffc107]" /> Demonstração Comercial • Modelo Evolua Prospect
            </span>
            <span className="text-xs text-[#d4c5ab]/70 font-mono">Simulação Interativa</span>
          </div>
          <h1 className="font-['Hanken_Grotesk'] text-2xl md:text-4xl font-bold text-[#ffe4af] mt-2">
            Dashboard Executivo de Prospecção & IA
          </h1>
          <p className="text-xs md:text-sm text-[#d4c5ab] mt-1">
            Veja exatamente como seus dados de extração, disparos de WhatsApp e atendimento IA aparecerão para fechar novos clientes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBackToLanding}
            className="px-4 py-2.5 rounded-xl bg-[#1e2020] border border-[#4f4632] text-[#ffe4af] hover:bg-[#292a2a] text-xs font-semibold transition cursor-pointer"
          >
            ← Voltar ao Início
          </button>
          <button
            onClick={() => onOpenAppMode('crm')}
            className="px-5 py-2.5 rounded-xl bg-[#ffc107] text-[#3f2e00] hover:bg-[#fabd00] text-xs font-bold transition shadow-[0_0_20px_rgba(250,189,0,0.3)] cursor-pointer flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-[#3f2e00]" /> Testar Sistema Real
          </button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto space-y-8">
        {/* Niche & Time Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Niche selector */}
          <div className="backdrop-blur-3xl bg-[#1e2020] border border-[#4f4632]/50 p-5 rounded-3xl shadow-xl lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ffe4af] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#ffc107]" /> Segmento de Mercado (Demonstração)
              </span>
              <span className="text-xs text-[#d4c5ab]/60">Alterne para ver dados adaptados</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(nicheData) as Array<keyof typeof nicheData>).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedNiche(key)}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-semibold transition text-left cursor-pointer border ${
                    selectedNiche === key
                      ? 'bg-[#ffc107] text-[#3f2e00] border-[#ffc107] shadow-md font-bold'
                      : 'bg-[#121414] text-[#d4c5ab] border-[#4f4632]/50 hover:border-[#ffe4af]/60'
                  }`}
                >
                  <div className="truncate">{nicheData[key].name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time range selector */}
          <div className="backdrop-blur-3xl bg-[#1e2020] border border-[#4f4632]/50 p-5 rounded-3xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ffe4af] flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-[#ffc107]" /> Período de Análise
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: '7d', label: '7 Dias' },
                { id: '30d', label: '30 Dias' },
                { id: '90d', label: '90 Dias' },
                { id: 'all', label: 'Tudo' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTimeRange(t.id as any)}
                  className={`py-2 rounded-xl text-xs font-semibold transition cursor-pointer border text-center ${
                    timeRange === t.id
                      ? 'bg-[#ffe4af] text-[#3f2e00] border-[#ffe4af] font-bold'
                      : 'bg-[#121414] text-[#d4c5ab] border-[#4f4632]/50 hover:border-[#ffe4af]/50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#4f4632]/40 gap-2 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: 'visao_geral', label: 'Visão Geral & KPIs' },
            { id: 'extrator', label: 'Extrator de Leads (Maps & IG)' },
            { id: 'disparos', label: 'Disparos WhatsApp & IA' },
            { id: 'crm', label: 'Funil CRM & Kanban' },
            { id: 'ia', label: 'Agente SDR & Relatório' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#ffc107] text-[#3f2e00] font-bold shadow-md'
                  : 'bg-[#1e2020] text-[#d4c5ab] hover:text-[#ffe4af] border border-[#4f4632]/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Visão Geral */}
        {activeTab === 'visao_geral' && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="backdrop-blur-3xl bg-[#1e2020] border border-[#4f4632]/50 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-mono tracking-wider text-[#d4c5ab]/80 uppercase">Total de Leads</span>
                  <Users className="w-4 h-4 text-[#ffc107]" />
                </div>
                <div className="text-3xl font-extrabold text-[#ffe4af] mt-3 font-['Hanken_Grotesk']">
                  {currentMetrics.leads}
                </div>
                <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" /> +28.4% vs mês anterior
                </div>
              </div>

              <div className="backdrop-blur-3xl bg-[#1e2020] border border-[#4f4632]/50 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-mono tracking-wider text-[#d4c5ab]/80 uppercase">Disparos WhatsApp</span>
                  <MessageSquare className="w-4 h-4 text-[#ffc107]" />
                </div>
                <div className="text-3xl font-extrabold text-[#ffe4af] mt-3 font-['Hanken_Grotesk']">
                  {simulatedMsgCount.toLocaleString()}
                </div>
                <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 98.4% taxa de entrega
                </div>
              </div>

              <div className="backdrop-blur-3xl bg-[#1e2020] border border-[#4f4632]/50 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-mono tracking-wider text-[#d4c5ab]/80 uppercase">Taxa de Conversão</span>
                  <PieChart className="w-4 h-4 text-[#ffc107]" />
                </div>
                <div className="text-3xl font-extrabold text-[#ffe4af] mt-3 font-['Hanken_Grotesk']">
                  {currentMetrics.conversionRate}
                </div>
                <div className="text-xs text-[#d4c5ab] mt-2">
                  Qualificados por IA
                </div>
              </div>

              <div className="backdrop-blur-3xl bg-[#1e2020] border border-[#4f4632]/50 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-mono tracking-wider text-[#d4c5ab]/80 uppercase">Receita Gerada</span>
                  <BarChart2 className="w-4 h-4 text-[#ffc107]" />
                </div>
                <div className="text-3xl font-extrabold text-[#ffe4af] mt-3 font-['Hanken_Grotesk']">
                  {currentMetrics.revenue}
                </div>
                <div className="text-xs text-emerald-400 mt-2 font-semibold">
                  Fechamentos no CRM
                </div>
              </div>

              <div className="backdrop-blur-3xl bg-[#1e2020] border border-[#4f4632]/50 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-mono tracking-wider text-[#d4c5ab]/80 uppercase">Retorno (ROI)</span>
                  <Zap className="w-4 h-4 text-[#ffc107]" />
                </div>
                <div className="text-3xl font-extrabold text-amber-300 mt-3 font-['Hanken_Grotesk']">
                  {currentMetrics.roi}
                </div>
                <div className="text-xs text-[#d4c5ab] mt-2">
                  Sobre investimento
                </div>
              </div>
            </div>

            {/* Interactive Simulation Banner */}
            <div className="backdrop-blur-3xl bg-gradient-to-r from-[#1e2020] via-[#161818] to-[#1e2020] border border-[#ffc107]/40 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-[#ffc107] text-[#3f2e00] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">Simulador ao Vivo</span>
                  <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#ffe4af]">Teste o Motor de Disparos Evolua</h3>
                </div>
                <p className="text-xs text-[#d4c5ab] max-w-xl">
                  Clique no botão ao lado para simular o envio instantâneo de uma nova lista de leads extraídos do Google Maps direto para o WhatsApp dos clientes.
                </p>
              </div>
              <button
                onClick={handleSimulateDispatch}
                disabled={isSimulatingDispatch}
                className="px-6 py-3.5 rounded-2xl bg-[#ffc107] hover:bg-[#fabd00] text-[#3f2e00] font-bold text-xs transition shadow-[0_0_20px_rgba(250,189,0,0.3)] cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-2"
              >
                {isSimulatingDispatch ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#3f2e00] border-t-transparent rounded-full animate-spin" />
                    Enviando Disparos...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-[#3f2e00]" /> Simular Lote de 250 Disparos
                  </>
                )}
              </button>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Funil de Conversão */}
              <div className="backdrop-blur-3xl bg-[#1e2020] border border-[#4f4632]/50 p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-['Hanken_Grotesk'] text-base font-bold text-[#ffe4af]">Funil de Prospecção & Conversão</h3>
                  <span className="text-xs text-[#d4c5ab]/70">Base: {currentMetrics.leads} leads</span>
                </div>
                <div className="space-y-3 pt-2">
                  {[
                    { step: '1. Leads Extraídos (Maps / IG)', count: '45,820', percent: '100%', width: '100%', color: 'bg-amber-500' },
                    { step: '2. Mensagens Disparadas (WhatsApp)', count: '38,400', percent: '83.8%', width: '84%', color: 'bg-amber-400' },
                    { step: '3. Respostas do Lead (Engajamento)', count: '14,210', percent: '31.0%', width: '65%', color: 'bg-emerald-500' },
                    { step: '4. Qualificados pelo Agente SDR', count: '5,840', percent: '12.7%', width: '42%', color: 'bg-emerald-400' },
                    { step: '5. Negócios Fechados (Conversão Final)', count: '342', percent: '0.74%', width: '22%', color: 'bg-[#ffc107]' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#e3e2e2]">{item.step}</span>
                        <span className="text-[#ffe4af] font-mono">{item.count} ({item.percent})</span>
                      </div>
                      <div className="h-3 w-full bg-[#121414] rounded-full overflow-hidden p-0.5 border border-[#4f4632]/40">
                        <div className={`h-full rounded-full ${item.color} transition-all duration-1000`} style={{ width: item.width }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 2: Canais de Aquisição */}
              <div className="backdrop-blur-3xl bg-[#1e2020] border border-[#4f4632]/50 p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-['Hanken_Grotesk'] text-base font-bold text-[#ffe4af]">Fontes de Extração de Leads</h3>
                  <span className="text-xs text-[#d4c5ab]/70">Canais Ativos</span>
                </div>
                <div className="space-y-4 pt-2">
                  {[
                    { channel: 'Extrator Google Maps (Local)', leads: '21,400 leads', share: '46.7%', bar: 'w-[47%]' },
                    { channel: 'Extrator Instagram (Hashtags/Perfis)', leads: '12,850 leads', share: '28.0%', bar: 'w-[28%]' },
                    { channel: 'Radar CNPJ (Empresas Ativas)', leads: '7,120 leads', share: '15.5%', bar: 'w-[16%]' },
                    { channel: 'Grupos WhatsApp (Comunidades)', leads: '4,450 leads', share: '9.8%', bar: 'w-[10%]' },
                  ].map((chan, i) => (
                    <div key={i} className="bg-[#121414] p-3.5 rounded-2xl border border-[#4f4632]/40 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#ffe4af]">{chan.channel}</span>
                        <span className="text-emerald-400 font-mono">{chan.leads} ({chan.share})</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#1e2020] rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r from-amber-500 to-[#ffc107] rounded-full ${chan.bar}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Extrator */}
        {activeTab === 'extrator' && (
          <div className="space-y-6">
            <div className="backdrop-blur-3xl bg-[#1e2020] border border-[#4f4632]/50 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#ffe4af]">Leads Extraídos em Tempo Real (Google Maps & Instagram)</h3>
                  <p className="text-xs text-[#d4c5ab]">Exibindo amostra de empresas prospectadas automaticamente para o seu negócio.</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-xl bg-[#ffc107] text-[#3f2e00] font-bold text-xs shadow-md">Exportar CSV</button>
                  <button className="px-4 py-2 rounded-xl bg-[#121414] border border-[#4f4632] text-[#ffe4af] font-semibold text-xs">Enviar para CRM</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#121414] border-b border-[#4f4632]/50 text-[#ffe4af]">
                    <tr>
                      <th className="px-4 py-3 font-bold">Empresa / Contato</th>
                      <th className="px-4 py-3 font-bold">Segmento</th>
                      <th className="px-4 py-3 font-bold">WhatsApp / Telefone</th>
                      <th className="px-4 py-3 font-bold">Localização</th>
                      <th className="px-4 py-3 font-bold">Status IA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#4f4632]/30 text-[#e3e2e2]">
                    {[
                      { name: 'Construtora & Imobiliária Alfa', niche: 'Imóveis de Alto Padrão', phone: '+55 11 98822-1144', loc: 'São Paulo - SP', status: 'Qualificado (SDR)' },
                      { name: 'Clinica Odontológica Sorriso Perfeito', niche: 'Saúde & Estética', phone: '+55 21 97711-2233', loc: 'Rio de Janeiro - RJ', status: 'Aguardando Disparo' },
                      { name: 'Tech Solutions Consultoria B2B', niche: 'Software & Cloud', phone: '+55 31 99233-4455', loc: 'Belo Horizonte - MG', status: 'Reunião Agendada' },
                      { name: 'Supermercados Econômico Ltda', niche: 'Varejo & Atacado', phone: '+55 41 98455-6677', loc: 'Curitiba - PR', status: 'Proposta Enviada' },
                      { name: 'Escritório de Advocacia Santos & Lima', niche: 'Jurídico Empresarial', phone: '+55 61 98122-3344', loc: 'Brasília - DF', status: 'Qualificado (SDR)' },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#121414]/50 transition">
                        <td className="px-4 py-3 font-bold text-[#ffe4af]">{row.name}</td>
                        <td className="px-4 py-3 text-[#d4c5ab]">{row.niche}</td>
                        <td className="px-4 py-3 font-mono text-[#ffc107]">{row.phone}</td>
                        <td className="px-4 py-3 text-[#d4c5ab]">{row.loc}</td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Disparos */}
        {activeTab === 'disparos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="backdrop-blur-3xl bg-[#1e2020] border border-[#4f4632]/50 p-6 rounded-3xl shadow-xl space-y-3">
                <span className="text-xs font-mono uppercase text-[#d4c5ab]">Campanha Ativa</span>
                <h4 className="text-lg font-bold text-[#ffe4af]">Disparo em Massa WhatsApp (QR Code Oficial)</h4>
                <p className="text-xs text-[#d4c5ab]/80">Envio automatizado com intervalo anti-ban e variáveis personalizadas (Nome, Cidade, etc.).</p>
                <div className="pt-2">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Progresso do Lote</span>
                    <span className="text-emerald-400 font-mono">100% Concluído</span>
                  </div>
                  <div className="h-2 bg-[#121414] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-full" />
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-3xl bg-[#1e2020] border border-[#4f4632]/50 p-6 rounded-3xl shadow-xl space-y-3">
                <span className="text-xs font-mono uppercase text-[#d4c5ab]">Taxa de Entrega</span>
                <h4 className="text-lg font-bold text-[#ffe4af]">98.4% de Sucesso</h4>
                <p className="text-xs text-[#d4c5ab]/80">Apenas 1.6% de números inválidos filtrados automaticamente pelo validador do Evolua.</p>
                <div className="text-xs text-[#ffe4af] pt-2 font-semibold">✓ Zero bloqueios de chip registrados</div>
              </div>

              <div className="backdrop-blur-3xl bg-[#1e2020] border border-[#4f4632]/50 p-6 rounded-3xl shadow-xl space-y-3">
                <span className="text-xs font-mono uppercase text-[#d4c5ab]">Interação do Agente IA</span>
                <h4 className="text-lg font-bold text-[#ffe4af]">14.210 Respostas</h4>
                <p className="text-xs text-[#d4c5ab]/80">O agente IA respondeu instantaneamente às dúvidas dos leads e agendou reuniões.</p>
                <div className="text-xs text-amber-300 pt-2 font-semibold">⚡ Tempo médio de resposta: 4 segundos</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: CRM */}
        {activeTab === 'crm' && (
          <div className="space-y-6">
            <div className="backdrop-blur-3xl bg-[#1e2020] border border-[#4f4632]/50 p-6 rounded-3xl shadow-xl space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#ffe4af]">Funil de Vendas Kanban (CRM Integrado)</h3>
                  <p className="text-xs text-[#d4c5ab]">Visualização das negociações geradas automaticamente pela prospecção.</p>
                </div>
                <button
                  onClick={() => onOpenAppMode('crm')}
                  className="px-4 py-2.5 rounded-xl bg-[#ffc107] text-[#3f2e00] text-xs font-bold transition shadow-md cursor-pointer"
                >
                  Abrir CRM Completo →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Novos Leads (Extraídos)', count: '142', value: 'R$ 840k', color: 'border-blue-500/40 bg-blue-500/10' },
                  { title: 'Em Qualificação (IA SDR)', count: '64', value: 'R$ 380k', color: 'border-amber-500/40 bg-amber-500/10' },
                  { title: 'Proposta / Reunião', count: '28', value: 'R$ 190k', color: 'border-purple-500/40 bg-purple-500/10' },
                  { title: 'Fechados / Venda Realizada', count: '18', value: 'R$ 125k', color: 'border-emerald-500/40 bg-emerald-500/10' },
                ].map((col, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border ${col.color} space-y-3`}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#ffe4af]">{col.title}</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#121414] text-[#ffe4af]">{col.count}</span>
                    </div>
                    <div className="text-sm font-extrabold text-[#ffe4af]">{col.value}</div>
                    <div className="space-y-2 pt-2">
                      <div className="p-3 rounded-xl bg-[#121414] border border-[#4f4632]/40 text-xs space-y-1">
                        <p className="font-bold text-[#ffe4af]">Cliente Exemplo #{idx + 1}</p>
                        <p className="text-[10px] text-[#d4c5ab]/70">Interesse em automação de WhatsApp</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Agente IA & Relatório */}
        {activeTab === 'ia' && (
          <div className="backdrop-blur-3xl bg-[#1e2020] border border-[#4f4632]/50 p-6 rounded-3xl shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ffc107]/20 border border-[#ffc107]/40 flex items-center justify-center text-[#ffc107]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#ffe4af]">Análise Preditiva & Insights Gemini AI</h3>
                <p className="text-xs text-[#d4c5ab]">Relatório gerado automaticamente para o seu cliente final.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#121414] border border-[#4f4632]/60 space-y-3 text-sm leading-relaxed text-[#e3e2e2]">
              <p className="font-bold text-[#ffe4af]">Resumo Executivo da Operação de Prospecção:</p>
              <p>
                "Com base nos dados extraídos e disparados nos últimos 30 dias, a operação apresentou um <strong>ROI de 14.8x</strong>, impulsionado principalmente pelo canal de extração do Google Maps na região Sudeste. O Agente IA de atendimento (SDR) qualificou 41.6% dos leads respondidos em menos de 10 segundos, reduzindo o CAC (Custo de Aquisição de Cliente) em 68%."
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">✓ Recomendação: Aumentar orçamento de disparos em 30%</span>
                <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">✓ Dica: Focar nos segmentos Imobiliário & SaaS</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => onOpenAppMode('analytics')}
                className="px-6 py-3 rounded-xl bg-[#ffc107] text-[#3f2e00] text-xs font-bold hover:bg-[#fabd00] transition shadow-md cursor-pointer"
              >
                Abrir AI Data Analyst Completo →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
