import React, { useState } from 'react';
import { 
  Sparkles, Target, Globe, BarChart3, Bot, Share2, ShieldCheck, 
  ArrowRight, CheckCircle2, RefreshCw, Send, FileText, Check, 
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

  const steps = [
    'Conectando aos servidores de varredura B2B...',
    'Pesquisando empresas por segmento e raio de distância...',
    'Coletando CNPJ, telefones, WhatsApp e redes sociais...',
    'Executando auditoria digital (HTTPS, Responsividade, SEO)...',
    'Calculando Score de Oportunidade e enviando para o CRM...'
  ];

    const handleIniciarProspeccao = (e) => {
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

        const regiaoAlvo = cidade.trim();
        const ajustados = EMPRESAS_MOCK.map(emp => {
          let novoScore = emp.score;
          let novaClassificacao = emp.classificacao;
          let novosMotivos = [...emp.motivosScore];

          if (emp.site.includes("emporio") && (regiaoAlvo.toLowerCase().includes("itupeva") || regiaoAlvo.toLowerCase().includes("campinas"))) {
            novoScore = 95;
            novaClassificacao = "Alta Oportunidade";
            novosMotivos = ["Domínio inativo / Fora do ar", "Sem presença digital ativa na região", "Oportunidade imediata de criação de site"];
          }

          return {
            ...emp,
            cidade: regiaoAlvo.split("-")[0].trim() || "Itupeva",
            score: novoScore,
            classificacao: novaClassificacao,
            motivosScore: novosMotivos
          };
        });

        setEmpresas(ajustados);
      }
    }, 700);
  };

    const enviarAoCrm = (empresa: ProspectEmpresa) => {
    alert(`Sucesso! ${empresa.nome} foi enviada automaticamente para o CRM → Novo Lead.`);
  };

  // Métricas do Dashboard da Prospecção
  const totalEncontradas = empresas.length;
  const semSite = empresas.filter(e => !e.possuiSite).length;
  const siteAntigo = empresas.filter(e => e.siteDesatualizado).length;
  const altoPotencial = empresas.filter(e => e.classificacao === 'Alta Oportunidade').length;
  const receitaPotencial = altoPotencial * 1500 + siteAntigo * 2500;

  return (
    <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-10 text-slate-100 font-sans">
      
      {/* HEADER EXECUTIVO */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" /> OpenSquad AI • Prospecção Inteligente
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Encontre empresas com potencial de compra em segundos
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            "O OpenSquad pesquisa, analisa, classifica e envia tudo automaticamente para seu CRM. Sem workflows complexos ou conversas com agentes."
          </p>
        </div>
      </div>

      {/* FORMULÁRIO DE 1 CLIQUE */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" /> ENCONTRAR NOVOS CLIENTES
        </h2>
        
        <form onSubmit={handleIniciarProspeccao} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Segmento / Nicho</label>
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

          <div>
            <button
              type="submit"
              disabled={executing}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-xl shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {executing ? 'Executando Missão...' : '🚀 Iniciar Prospecção'}
            </button>
          </div>
        </form>
      </div>

      {/* TELA DE EXECUÇÃO EM ANDAMENTO */}
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

      {/* DASHBOARD DA PROSPECÇÃO (RESUMO) */}
      {buscou && (
        <div className="space-y-8 animate-in fade-in duration-300">
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
            <div className="col-span-2 md:col-span-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Receita Potencial</div>
              <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">R$ {receitaPotencial.toLocaleString('pt-BR')}</div>
            </div>
          </div>

          {/* LISTAGEM DE EMPRESAS ENCONTRADAS */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Oportunidades Qualificadas pelo OpenSquad</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {empresas.map((emp) => (
                <div key={emp.id} className="bg-slate-900 border-2 border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-white">{emp.nome}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">CNPJ: {emp.cnpj}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                        emp.classificacao === 'Alta Oportunidade' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        emp.classificacao === 'Média Oportunidade' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {emp.classificacao}
                      </span>
                    </div>

                    {/* Score de Oportunidade */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Score de Oportunidade</span>
                      <span className="text-sm font-extrabold text-amber-400 font-mono">{emp.score}/100</span>
                    </div>

                    {/* Dados de Contato */}
                    <div className="text-xs text-slate-300 space-y-1 pt-1">
                      <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-500" /> <span>{emp.telefone} / {emp.whatsapp}</span></div>
                      <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-500" /> <span className="truncate">{emp.email}</span></div>
                      <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-slate-500" /> <span className="text-amber-300 font-mono">{emp.site || 'Sem site cadastrado'}</span></div>
                    </div>

                    {/* Motivos do Score */}
                    <div className="space-y-1 pt-2 border-t border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Motivos da Análise:</div>
                      {emp.motivosScore.map((motivo, idx) => (
                        <div key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span>{motivo}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ações Disponíveis */}
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setSelectedEmpresa(emp)}
                        className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer text-center shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Layers className="w-3.5 h-3.5" /> Gerar Redesign
                      </button>
                      <button 
                        onClick={() => enviarAoCrm(emp)}
                        className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer text-center"
                      >
                        Enviar ao CRM
                      </button>
                    </div>
                    <button 
                      onClick={() => alert(`Mensagem e proposta enviadas para o WhatsApp de ${emp.nome}!`)}
                      className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" /> Enviar WhatsApp & Proposta
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE REDESIGN SELECIONADO */}
      {selectedEmpresa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="w-full max-w-3xl bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedEmpresa(null)} className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"><span className="text-lg">✕</span></button>

            <h2 className="text-xl font-bold text-white mb-2">Stitch Redesign Studio: {selectedEmpresa.nome}</h2>
            <p className="text-xs text-slate-400 mb-6">Análise comparativa gerada pelo Agente Hermes • Score: {selectedEmpresa.score}/100</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-950 border border-red-500/30 p-4 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-red-400 uppercase">🔴 ANTES (Situação Atual)</span>
                <div className="text-xs text-slate-300 font-mono">{selectedEmpresa.site || 'Sem presença digital'}</div>
                <p className="text-[11px] text-slate-400">Layout desatualizado, sem conversão e sem otimização mobile.</p>
              </div>
              <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-2xl space-y-2 relative">
                <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded-bl">PRO</div>
                <span className="text-xs font-bold text-emerald-400 uppercase">🟢 DEPOIS (Novo Layout Hermes)</span>
                <div className="text-xs text-amber-300 font-mono">preview.focoemdados.com.br/{selectedEmpresa.id}</div>
                <p className="text-[11px] text-slate-300">100% Mobile-first, botão WhatsApp flutuante e SEO otimizado.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button onClick={() => setSelectedEmpresa(null)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer">Fechar</button>
              <button onClick={() => { alert('Proposta e Redesign aprovados e enviados para o cliente!'); setSelectedEmpresa(null); }} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer shadow-lg">Aprovar e Enviar ao Cliente</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OpenSquadView;
