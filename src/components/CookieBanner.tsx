import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('foco_dados_cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('foco_dados_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleClose = () => {
    localStorage.setItem('foco_dados_cookie_consent', 'closed');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-md z-50 bg-[#1e2020] border border-[#4f4632] rounded-3xl p-5 shadow-2xl text-[#e3e2e2] flex flex-col gap-3 animate-fadeIn">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-[#ffe4af]">
          <ShieldCheck className="w-5 h-5 text-[#ffc107]" />
          <h4 className="font-['Hanken_Grotesk'] font-bold text-sm">Privacidade e LGPD</h4>
        </div>
        <button
          onClick={handleClose}
          className="text-[#d4c5ab] hover:text-[#ffe4af] p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <p className="text-xs text-[#d4c5ab] leading-relaxed">
        Utilizamos cookies e tecnologias similares para otimizar sua experiência de prospecção, garantir segurança e analisar métricas de performance conforme a LGPD.
      </p>
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={handleClose}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-[#d4c5ab] hover:text-[#ffe4af] hover:bg-white/5 transition cursor-pointer"
        >
          Apenas Essenciais
        </button>
        <button
          onClick={handleAccept}
          className="px-5 py-2 rounded-xl bg-[#ffc107] text-[#3f2e00] text-xs font-bold hover:bg-[#fabd00] transition shadow-[0_0_15px_rgba(250,189,0,0.2)] cursor-pointer"
        >
          Aceitar Todos
        </button>
      </div>
    </div>
  );
};
