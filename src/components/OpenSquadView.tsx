import React, { useState } from 'react';
import {
  Sparkles, Target, Globe, BarChart3, Bot, Send, ShieldCheck,
  CheckCircle2, RefreshCw, FileText,
  MapPin, Phone, Mail, Instagram, Facebook, Star, ExternalLink, AlertTriangle, Layers, Plus, Building2
} from 'lucide-react';

interface ProspectEmpresa {
  id: string;
  nome: string;
  cnpj: string;
  nomeFantasia: string;
  telefone: string;
  whatsapp: string;
  email: string;
  cidade: string;
  estado: string;
  regiao: string;
  endereco: string;
  site: string;
  instagram: string;
  facebook: string;
  googleMaps: string;
  categoria: string;
  avaliacoesCount: number;
  notaGoogle: number;
  possuiSite: boolean;
  siteDesatualizado: boolean;
  possuiHttps: boolean;
  responsivo: boolean;
  whatsappVisivel: boolean;
  formularioContato: boolean;
  redesSociais: boolean;
  classificacao: 'Alta Oportunidade' | 'Média Oportunidade' | 'Baixa Oportunidade';
  score: number;
  motivosScore: string[];
}

const EMPRESAS_MOCK: ProspectEmpresa[] = [
  {
    id: '1',
    nome: 'Clínica Odontológica Sorriso Perfeito Ltda',
    cnpj: '45.123.890/0001-22',
    nomeFantasia: 'Sorriso Perfeito',
    telefone: '(19) 3234-5678',
    whatsapp: '(19) 98888-1111',
    email: 'contato@sorrisoperfeito-antigo.com.br',
    cidade: 'Campinas',
    estado: 'SP',
    regiao: 'Centro',
    endereco: 'Rua 15 de Novembro, 450',
    site: 'sorrisoperfeito-antigo.com.br',
    instagram: '@sorrisoperfeitousuarios',
    facebook: 'fb.com/sorrisoperfeito',
    googleMaps: 'maps.google.com/?q=sorriso+perfeito',
    categoria: 'Saúde e Odontologia',
    avaliacoesCount: 14,
    notaGoogle: 3.8,
    possuiSite: true,
    siteDesatualizado: true,
    possuiHttps: false,
    responsivo: false,
    whatsappVisivel: false,
    formularioContato: false,
    redesSociais: true,
    classificacao: 'Média Oportunidade',
    score: 82,
    motivosScore: ['Site antigo e sem HTTPS', 'Sem botão de WhatsApp visível', 'Baixo volume de avaliações no Google']
  },
  {
    id: '2',
    nome: 'Auto Peças & Oficina Rodagem Total',
    cnpj: '12.444.789/0001-99',
    nomeFantasia: 'Rodagem Peças',
    telefone: '(19) 3277-9900',
    whatsapp: '(19) 97777-2222',
    email: 'vendas@rodagempecas.com',
    cidade: 'Campinas',
    estado: 'SP',
    regiao: 'Industrial',
    endereco: 'Av. Industrial, 1200',
    site: '',
    instagram: '@rodagempecas',
    facebook: 'fb.com/rodagempecas',
    googleMaps: 'maps.google.com/?q=rodagem+pecas',
    categoria: 'Oficinas Mecânicas',
    avaliacoesCount: 5,
    notaGoogle: 3.2,
    possuiSite: false,
    siteDesatualizado: false,
    possuiHttps: false,
    responsivo: false,
    whatsappVisivel: false,
    formularioContato: false,
    redesSociais: true,
    classificacao: 'Alta Oportunidade',
    score: 96,
    motivosScore: ['Não possui site institucional', 'Nenhum canal de captura de leads', 'Google pouco otimizado']
  },
  {
    id: '3',
    nome: 'Empório dos Doces Artesanais',
    cnpj: '78.901.234/0001-10',
    nomeFantasia: 'Doces Artesanais',
    telefone: '(19) 3322-1144',
    whatsapp: '(19) 96666-3333',
    email: 'pedido@emporiodoces.com.br',
    cidade: 'Campinas',
    estado: 'SP',
    regiao: 'Cambuí',
    endereco: 'Rua Coronel Quirino, 890',
    site: 'emporiodoces.com.br',
    instagram: '@emporiodocesartesanais',
    facebook: 'fb.com/emporiodoces',
    googleMaps: 'maps.google.com/?q=emporio+doces',
    categoria: 'Confeitaria & Gastronomia',
    avaliacoesCount: 120,
    notaGoogle: 4.8,
    possuiSite: true,
    siteDesatualizado: false,
    possuiHttps: true,
    responsivo: true,
    whatsappVisivel: true,
    formularioContato: true,
    redesSociais: true,
    classificacao: 'Baixa Oportunidade',
    score: 35,
    motivosScore: ['Site moderno e responsivo', 'Forte presença digital e e-commerce ativo']
  }
];

export const OpenSquadView: React.FC = () => {
  const [segmento, setSegmento] = useState('Dentistas');
  const [cidade, setCidade] = useState('Campinas');
  const [raio, setRaio] = useState('50km');
  const [executing, setExecuting] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [empresas, setEmpresas] = useState<ProspectEmpresa[]>([]);
  const [buscou, setBuscou] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<ProspectEmpresa | null>(null);
  const [activeMission, setActiveMission] = useState<string | null>(null);
  const [missionCompleted, setMissionCompleted] = useState(false);

  const steps = [
    'Conectando aos servidores de varredura B2B...',
    'Pesquisando empresas por segmento e raio de distância...',
    'Coletando CNPJ, telefones, WhatsApp e redes sociais...',
    'Executando auditoria digital (HTTPS, Responsividade, SEO)...',
    'Calculando Score de Oportunidade e enviando para o CRM...'
  ];

  const handleIniciarProspeccao = (e: React.FormEvent) => {
    e.preventDefault();
    setExecuting(true);
    setStepIndex(0);
    setBuscou(false);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setStepIndex(current);
      } else {
        clearInterval(interval);
        setExecuting(false);
        setBuscou(true);
        setEmpresas(EMPRESAS_MOCK);
      }
    }, 700);
  };

  const handleStartMission = (missionId: string) => {
    setActiveMission(missionId);
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
    }, 800);
  };

  const handleEnviarAoCrm = (empresa: ProspectEmpresa) => {
    alert(`Sucesso! ${empresa.nome} foi enviada automaticamente para o CRM → Novo Lead.`);
  };

  const totalEncontradas = empresas.length;
  const semSite = empresas.filter(e => !e.possuiSite).length;
  const siteAntigo = empresas.filter(e => e.siteDesatualizado).length;
  const altoPotencial = empresas.filter(e => e.classificacao === 'Alta Oportunidade').length;
  const receitaPotencial = altoPotencial * 1500 + siteAntigo * 2500;

  return (
    <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-10 text-slate-100 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" /> OpenSquad AI • Prospecção Inteligente
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Prospecção Inteligente OpenSquad
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Encontre empresas, analise concorrentes, gere propostas e feche negócios com automação completa em 1 clique.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" /> Encontrar Novos Clientes
        </h2>
        <form onSubmit={handleIniciarProspeccao} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1">Segmento / Nicho</label>
            <input
              type="text"
              value={segmento}
              onChange={(e) => setSegmento(e.target.value)}
              placeholder="Ex: Dentistas, Clínicas, Oficinas..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:border-amber-500 outline-none"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Cidade</label>
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex: Campinas - SP"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:border-amber-500 outline-none"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Raio de Busca</label>
            <select
              value={raio}
              onChange={(e) => setRaio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:border-amber-500 outline-none cursor-pointer"
            >
              <option value="10km">10 km</option>
              <option value="30km">30 km</option>
              <option value="50km">50 km</option>
              <option value="100km">100 km</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={executing}
            className="w-full sm:w-auto py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Iniciar Prospecção
          </button>
        </form>
      </div>

      {executing && (
        <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">OpenSquad Autônomo em Ação</span>
            <h3 className="text-xl md:text-2xl font-bold text-white">{steps[stepIndex]}</h3>
          </div>
          <div className="max-w-md mx-auto bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {buscou && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Encontradas</div>
              <div className="text-2xl font-extrabold text-white mt-1 font-mono">{totalEncontradas}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Sem Site</div>
              <div className="text-2xl font-extrabold text-red-400 mt-1 font-mono">{semSite}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Site Antigo</div>
              <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">{siteAntigo}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Alto Potencial</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{altoPotencial}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Enviados CRM</div>
              <div className="text-2xl font-extrabold text-blue-400 mt-1 font-mono">{totalEncontradas}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Receita Potencial</div>
              <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">R$ {receitaPotencial.toLocaleString('pt-BR')}</div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Oportunidades Qualificadas pelo OpenSquad</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {empresas.map((emp) => (
                <div key={emp.id} className="bg-slate-900 border-2 border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-white">{emp.nome}</h3>
                        <p className="text-xs text-slate-400 mt-1">CNPJ: {emp.cnpj}</p>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${emp.classificacao === 'Alta Oportunidade' ? 'bg-red-500/10 text-red-400 border-red-500/30' : emp.classificacao === 'Média Oportunidade' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                        {emp.classificacao}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-500" /> <span className="text-xs text-slate-300">{emp.telefone}</span></div>
                      <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-500" /> <span className="truncate">{emp.email}</span></div>
                      <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-slate-500" /> <span className="text-slate-300 truncate">{emp.site || 'Sem site'}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
