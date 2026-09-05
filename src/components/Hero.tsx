import React from 'react';

interface HeroProps {
  onOpenPaywall: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenPaywall }) => {
  return (
    <section className="relative z-10 bg-transparent py-20 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 text-center">
        
        {/* Pill de Destaque Superior */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-full text-xs text-emerald-400 font-semibold mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Transforme dados em oportunidades e automatize seu negócio com IA</span>
        </div>

        {/* Título Principal com Sombra para Leitura Limpa */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-md">
          Crie sites, dashboards, automações e{' '}
          <span className="text-amber-400">agentes de IA</span> sem complicação.
        </h1>

        <p className="text-sm md:text-base text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-sm">
          A plataforma 100% online para PMEs criarem presença digital, prospectarem clientes e
          operarem todo o atendimento no WhatsApp, Instagram e Facebook automaticamente.
        </p>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenPaywall}
            className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-xl shadow-amber-500/20 border border-amber-300 flex items-center justify-center gap-2"
          >
            <span>Testar Grátis Agora</span>
            <span>→</span>
          </button>

          <a
            href="#demonstracao"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900/90 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all border border-slate-700/80 backdrop-blur-md flex items-center justify-center gap-2"
          >
            <span>▶</span>
            <span>Ver Demonstração ao Vivo</span>
          </a>
        </div>

      </div>
    </section>
  );
};

export default Hero;
