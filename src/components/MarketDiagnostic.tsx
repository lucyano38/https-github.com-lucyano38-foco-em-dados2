import React, { useState } from 'react';
import { Search, Building2, BarChart2, ShieldAlert } from 'lucide-react';

export const MarketDiagnostic: React.FC = () => {
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
        totalEmpresas: Math.floor(Math.random() * 30) + 25,
        semAutomacao: '78%',
        perdaEstimada: 'R$ 14.500,00/mês',
      });
      setBuscando(false);
    }, 1200);
  };

  return (
    <section className="py-20 bg-slate-900 border-y border-slate-800 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-3">Raio-X de Mercado para a Sua Região</h2>
        <p className="text-xs text-slate-400 max-w-xl mx-auto mb-8">
          Descubra o potencial de mercado e quantos concorrentes do seu nicho estão disputando clientes na sua cidade sem automação de vendas.
        </p>

        <form onSubmit={handleDiagnostico} className="max-w-2xl mx-auto flex flex-col md:flex-row gap-3 mb-10">
          <input
            type="text"
            placeholder="Digite sua Cidade (ex: Campinas)"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
            required
          />
          <select
            value={nicho}
            onChange={(e) => setNicho(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
          >
            <option value="Dentistas">Clínicas Dentárias</option>
            <option value="Barbearias">Barbearias e Estética</option>
            <option value="Advogados">Escritórios de Advocacia</option>
            <option value="Comercio">Comércio Local</option>
          </select>
          <button
            type="submit"
            disabled={buscando}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {buscando ? (
              <span>Analisando...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Gerar Raio-X</span>
              </>
            )}
          </button>
        </form>

        {resultado && (
          <div className="grid md:grid-cols-3 gap-6 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl text-left">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Building2 className="w-4 h-4" />
                <span className="text-xs font-semibold">Empresas Mapeadas</span>
              </div>
              <p className="text-2xl font-extrabold">{resultado.totalEmpresas} estabelecimentos</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Concorrentes diretos atuando em {cidade}.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-semibold">Sem Automação 24/7</span>
              </div>
              <p className="text-2xl font-extrabold">{resultado.semAutomacao}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Perdem clientes por demora no atendimento no WhatsApp.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <BarChart2 className="w-4 h-4" />
                <span className="text-xs font-semibold">Oportunidade Destravada</span>
              </div>
              <p className="text-2xl font-extrabold text-emerald-400">{resultado.perdaEstimada}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Receita resgatável com atendimento imediato.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MarketDiagnostic;
