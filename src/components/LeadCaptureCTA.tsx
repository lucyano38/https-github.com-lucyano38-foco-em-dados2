import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

export const LeadCaptureCTA: React.FC = () => {
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [nicho, setNicho] = useState('Clínica');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          whatsapp,
          nicho,
          origem: 'focoemdados_landing',
          data: new Date().toISOString(),
        }),
      });

      setEnviado(true);
    } catch (err) {
      console.error('Erro ao enviar lead:', err);
    }
  };

  return (
    <section id="demonstracao" className="py-20 bg-slate-900 border-t border-slate-800 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-extrabold mb-3">Reservar Minha Vaga de Automação</h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto mb-8">
          Preencha os dados e receba uma demonstração personalizada diretamente no seu WhatsApp pelo nosso agente autônomo.
        </p>

        {enviado ? (
          <div className="bg-slate-950 border border-emerald-500/30 p-8 rounded-2xl max-w-md mx-auto flex flex-col items-center gap-3">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
            <h3 className="text-lg font-bold">Solicitação Recebida!</h3>
            <p className="text-xs text-slate-400">
              Nosso Agente Open Squad já está preparando a demonstração e enviará no seu WhatsApp em instantes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-950 border border-slate-800 p-8 rounded-2xl max-w-md mx-auto space-y-4 text-left shadow-2xl">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Seu Nome / Nome da Empresa</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Dra. Mariana"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">WhatsApp com DDD</label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Nicho do Negócio</label>
              <select
                value={nicho}
                onChange={(e) => setNicho(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Clínica">Clínica / Consultório</option>
                <option value="Barbearia">Barbearia / Estética</option>
                <option value="Comércio">Comércio Local</option>
                <option value="Outro">Outro segmento</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all mt-2"
            >
              <Send className="w-4 h-4" />
              <span>Solicitar Demonstração Gratuita</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default LeadCaptureCTA;
