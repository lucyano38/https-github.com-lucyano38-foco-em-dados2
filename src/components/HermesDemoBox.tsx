import React, { useState } from 'react';
import { Sparkles, Bot, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface HermesDemoBoxProps {
  onUpgradeClick: () => void;
}

export const HermesDemoBox: React.FC<HermesDemoBoxProps> = ({ onUpgradeClick }) => {
  const [nicho, setNicho] = useState('Restaurantes');
  const [cidade, setCidade] = useState('São Paulo - SP');
  const [loading, setLoading] = useState(false);
  const [simulatedResult, setSimulatedResult] = useState<any | null>(null);

  const handleRunDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSimulatedResult(null);

    // Simulação interativa do Agente Hermes (Gemini) gerando prospecção e preview de redesign
    setTimeout(() => {
      setSimulatedResult({
        leadName: 'Bistrô Sabor & Arte',
        siteAtual: 'bistrosabor.com.br (Sem mobile, nota 3.2)',
        redesignPreview: 'https://preview.focoemdados.com.br/bistro-sabor',
        mensagemIa: `Olá! Analisei o site do ${nicho} em ${cidade}. Identifiquei que o site atual não é responsivo e perde 60% dos clientes mobile. Preparamos um Redesign completo de alta conversão.`,
        contratoGerado: 'Contrato de Prestação de Serviços de Redesign + Tráfego (R$ 1.500/mês + R$ 39,90 Foco em Dados)'
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="bg-[#1E293B]/90 border border-[#334155] rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl text-left">
      <div className="flex items-center justify-between pb-6 border-b border-[#334155] flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC]">Demonstração Interativa · Agente Hermes (Gemini AI)</h3>
            <p className="text-xs text-[#94A3B8]">Veja como a IA prospecta, analisa o site do cliente e gera o contrato.</p>
          </div>
        </div>
        <span className="text-xs font-medium bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
          Modo Exemplo Gratuito
        </span>
      </div>

      <form onSubmit={handleRunDemo} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
        <div>
          <label className="block text-xs font-medium text-[#94A3B8] mb-1">Nicho do Cliente</label>
          <input
            type="text"
            value={nicho}
            onChange={(e) => setNicho(e.target.value)}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-xs text-[#F8FAFC] focus:border-amber-500 outline-none"
            placeholder="Ex: Clínicas, Restaurantes..."
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#94A3B8] mb-1">Cidade / Região</label>
          <input
            type="text"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-xs text-[#F8FAFC] focus:border-amber-500 outline-none"
            placeholder="Ex: Curitiba - PR"
            required
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-blue-500 text-[#0F172A] font-bold py-2.5 px-4 rounded-xl text-xs hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Hermes analisando...' : 'Testar Exemplo da IA'}
          </button>
        </div>
      </form>

      {simulatedResult && (
        <div className="mt-6 bg-[#0F172A] border border-amber-500/30 rounded-2xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <CheckCircle2 className="w-4 h-4 text-green-400" /> Lead Qualificado Encontrado
            </div>
            <span className="text-[11px] font-mono text-[#94A3B8]">Score de Conversão: 94%</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#1E293B] p-3.5 rounded-xl border border-[#334155]">
              <div className="text-[#94A3B8] font-mono uppercase text-[10px]">Empresa Alvo</div>
              <div className="font-bold text-[#F8FAFC] text-sm mt-0.5">{simulatedResult.leadName}</div>
              <div className="text-red-400 text-[11px] mt-1">Situação: {simulatedResult.siteAtual}</div>
            </div>
            <div className="bg-[#1E293B] p-3.5 rounded-xl border border-[#334155]">
              <div className="text-[#94A3B8] font-mono uppercase text-[10px]">Redesign Gerado</div>
              <a href="#preview" onClick={(e) => { e.preventDefault(); alert("Esta é uma prévia do exemplo. Para gerar para seus próprios clientes, assine o plano Pro."); }} className="font-bold text-blue-400 text-sm mt-0.5 underline block">
                {simulatedResult.redesignPreview} ↗
              </a>
              <div className="text-green-400 text-[11px] mt-1">Status: Pronto para envio via WhatsApp</div>
            </div>
          </div>
          <div className="bg-[#1E293B]/60 p-3.5 rounded-xl border border-[#334155] text-xs text-[#d4c5ab] italic">
            "{simulatedResult.mensagemIa}"
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[#94A3B8]">
          Gostou da demonstração? Para prospectar leads reais e fechar contratos ilimitados:
        </div>
        <button
          onClick={onUpgradeClick}
          className="bg-amber-500 text-[#0F172A] px-6 py-3 rounded-xl font-bold text-xs hover:bg-amber-400 transition cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0 flex items-center gap-2"
        >
          Desbloquear Tudo por R$ 39,90/mês <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
