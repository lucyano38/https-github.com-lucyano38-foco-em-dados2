import React, { useState } from 'react';
import { Play, Send, CheckCircle, Zap } from 'lucide-react';

interface LeadCaptureCTAProps {
  onOpenPaywall?: () => void;
}

export const LeadCaptureCTA: React.FC<LeadCaptureCTAProps> = ({ onOpenPaywall }) => {
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [nicho, setNicho] = useState('Clínica');
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const wahaWhatsappNumber = '5511994411307';

  const whatsappDemoUrl = `https://wa.me/${wahaWhatsappNumber}?text=${encodeURIComponent(
    'Olá Agente Hermes! Vim do site Foco em Dados e quero ver a demonstração ao vivo agora.'
  )}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    try {
      await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          whatsapp,
          nicho,
          origem: 'focoemdados_dashboard',
          data: new Date().toISOString(),
        }),
      });

      setEnviado(true);
    } catch (err) {
      console.error('Erro ao enviar lead:', err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section id="demonstracao" className="py-20 relative z-20 max-w-5xl mx-auto px-4">
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-10 backdrop-blur-sm shadow-2xl shadow-black/30">
        
        {/* Seção Superior: Demonstração */}
        <div className="text-center mb-16 border-b border-slate-800 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold mb-4">
            <Zap className="w-4 h-4" />
            <span>Demonstração Imediata</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Experimente a Automação Rodando</h2>
          <p className="text-xs text-slate-300 max-w-lg mx-auto mt-2">
            Veja o Agente Hermes trabalhando em tempo real no WhatsApp ou agende uma demonstração personalizada.
          </p>
          
          <a
            href={whatsappDemoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-105 mt-8 border border-amber-300"
          >
            <Play className="w-5 h-5" />
            <span>Ver Demonstração ao Vivo</span>
          </a>
          <p className="text-[11px] font-mono text-amber-300 mt-4">
            Setup em 5 minutos • <span className="text-slate-300">Sem cartão de crédito</span>
          </p>
        </div>

        {/* Seção Inferior: Formulário */}
        <div className="max-w-xl mx-auto">
          <h3 className="text-2xl font-bold text-white text-center mb-3">
            Reservar Minha Vaga de Automação
          </h3>
          <p className="text-xs text-slate-300 text-center mb-10">
            Preencha os dados e receba uma demonstração personalizada diretamente no seu WhatsApp pelo nosso agente autônomo.
          </p>

          {enviado ? (
            <div className="bg-slate-950 border border-emerald-500/30 p-10 rounded-2xl flex flex-col items-center gap-4 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
              <h4 className="text-xl font-bold text-white">Solicitação Recebida!</h4>
              <p className="text-xs text-slate-400">
                Nosso Agente Open Squad já está preparando a demonstração e enviará no seu WhatsApp em instantes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-slate-100 block mb-1.5">Nome Completo / Empresa</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Dra. Mariana Costa"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-5 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-100 block mb-1.5">WhatsApp com DDD</label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ex: (11) 99999-9999"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-5 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-100 block mb-1.5">Nicho do Negócio</label>
                <select
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                >
                  <option value="Clínica">Clínica / Consultório</option>
                  <option value="Barbearia">Barbearia / Estética</option>
                  <option value="Comércio">Comércio Local / Varejo</option>
                  <option value="Serviços">Prestação de Serviços</option>
                  <option value="Outro">Outro segmento</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 border border-amber-300 disabled:bg-slate-700 disabled:cursor-not-allowed"
              >
                {enviando ? (
                  <span>Enviando Solicitação...</span>
                ) : (
                  <>
                    <Send className="w-5 h-5 text-slate-950" />
                    <span>Solicitar Demonstração Gratuita</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default LeadCaptureCTA;
