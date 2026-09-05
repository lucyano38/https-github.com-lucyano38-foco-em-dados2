import React, { useState } from 'react';
import { Search, ArrowRight, Filter, Mail, TrendingUp } from 'lucide-react';

interface MarketDiagnosticProps {
  onOpenPaywall?: () => void;
}

export const MarketDiagnostic: React.FC<MarketDiagnosticProps> = ({ onOpenPaywall }) => {
  const [cidade, setCidade] = useState('');
  const [nicho, setNicho] = useState('Dentistas');
  const [resultado, setResultado] = useState<any>(null);
  const [buscando, setBuscando] = useState(false);

  const handleDiagnostico = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cidade) return;

    setBuscando(true);

    setTimeout(() => {
      setResultado({
        totalEmpresas: Math.floor(Math.random() * 30) + 28,
        semAutomacao: '82%',
        perdaEstimada: 'R$ 18.500,00/mês',
      });
      setBuscando(false);
    }, 1000);
  };

  return (
    <section className="py-16 relative z-20 max-w-5xl mx-auto px-4">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
        
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            Inteligência de Mercado B2B
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Prospecção de Verdade Começa na Lista.
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto">
            Encontre, filtre e obtenha contatos atualizados das empresas que realmente fazem sentido para o seu cliente ideal.
          </p>
        </div>

        <form onSubmit={handleDiagnostico} className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Digite sua Cidade (ex: Campinas)"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="w-full bg-slate-950 border-2 border-slate-700 text-white placeholder-slate-400 text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-amber-500 shadow-inner"
              required
            />
          </div>

          <div className="md:w-64">
            <select
              value={nicho}
              onChange={(e) => setNicho(e.target.value)}
              className="w-full bg-slate-950 border-2 border-slate-700 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-amber-500 shadow-inner"
            >
              <option value="Dentistas">Clínicas Dentárias</option>
              <option value="Barbearias">Barbearias & Estética</option>
              <option value="Advogados">Advocacia & Jurídico</option>
              <option value="Comercio">Comércio Local</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={buscando}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer border border-amber-300"
          >
            {buscando ? (
              <span>Analisando Lista...</span>
            ) : (
              <>
                <Search className="w-5 h-5 text-slate-950" />
                <span>Gerar Raio-X</span>
              </>
            )}
          </button>
        </form>

        {/* 4 Pilares Comerciais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-800">
          <div className="flex flex-col items-center text-center p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <Search className="w-6 h-6 text-amber-400 mb-2" />
            <span className="text-xs font-bold text-white uppercase">1. Encontre</span>
            <span className="text-[10px] text-slate-400 mt-1">Empresas no perfil ideal</span>
          </div>

          <div className="flex flex-col items-center text-center p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <Filter className="w-6 h-6 text-amber-400 mb-2" />
            <span className="text-xs font-bold text-white uppercase">2. Filtre</span>
            <span className="text-[10px] text-slate-400 mt-1">Por segmento, cidade e porte</span>
          </div>

          <div className="flex flex-col items-center text-center p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <Mail className="w-6 h-6 text-amber-400 mb-2" />
            <span className="text-xs font-bold text-white uppercase">3. Obtenha</span>
            <span className="text-[10px] text-slate-400 mt-1">WhatsApp, e-mails e contatos</span>
          </div>

          <div className="flex flex-col items-center text-center p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <TrendingUp className="w-6 h-6 text-amber-400 mb-2" />
            <span className="text-xs font-bold text-white uppercase">4. Converta</span>
            <span className="text-[10px] text-slate-400 mt-1">Atendimento com Agente IA</span>
          </div>
        </div>

        {/* Resultado Dinâmico */}
        {resultado && (
          <div className="mt-8 pt-6 border-t border-slate-800 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-xs text-amber-400 font-bold block mb-1">Empresas Identificadas</span>
              <p className="text-2xl font-black text-white">{resultado.totalEmpresas} Leads</p>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-xs text-red-400 font-bold block mb-1">Sem Automação Comercial</span>
              <p className="text-2xl font-black text-white">{resultado.semAutomacao}</p>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between">
              <span className="text-xs text-emerald-400 font-bold block mb-1">Oportunidade de Venda</span>
              <button
                onClick={onOpenPaywall}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-all mt-2"
              >
                <span>Desbloquear Lista Completa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default MarketDiagnostic;
