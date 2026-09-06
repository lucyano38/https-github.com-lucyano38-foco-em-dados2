import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageSquare } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'O Agente Hermes funciona no meu WhatsApp comum ou Business?',
    answer: 'Funciona perfeitamente em ambos! Você pode utilizar tanto no WhatsApp Business quanto no WhatsApp padrão via conexão segura por QR Code, sem risco de perda do número histórico da sua empresa.',
  },
  {
    question: 'Como o Prospector B2B encontra empresas que não têm site?',
    answer: 'Nosso algoritmo varre registros cadastrais, dados públicos e bases de mapas geográficos. Ele detecta os estabelecimentos com atividade regular mas sem domínio web registrado ou com links inativos, permitindo abordagem altamente contextualizada.',
  },
  {
    question: 'Preciso saber programar para configurar os fluxos?',
    answer: 'Zero código. Toda a plataforma possui templates prontos para clínicas, corretores, barbearias e prestadores de serviços em geral. Basta preencher as informações da sua empresa e começar a rodar em minutos.',
  },
  {
    question: 'Como funciona a garantia e o suporte técnico?',
    answer: 'Oferecemos 7 dias de garantia incondicional de satisfação. Se não atender suas expectativas, devolvemos 100% do valor pago. Além disso, nosso suporte atende diretamente por WhatsApp nos planos Business e Premium Especial.',
  },
];

interface FaqSectionProps {
  onAskQuestion?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onAskQuestion }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 px-4 md:px-12 relative border-t" style={{ background: 'rgba(1,1,2,0.5)', borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ border: '1px solid rgba(212,165,116,0.3)', background: 'rgba(212,165,116,0.1)', color: '#d4a574' }}>
            <HelpCircle className="w-3.5 h-3.5 text-[#d4a574]" />
            <span>Tira-Dúvidas</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Perguntas Frequentes
          </h2>

          <p className="text-sm md:text-base" style={{ color: '#8a8f98' }}>
            Tudo o que você precisa saber para ativar sua esteira de prospecção e vendas automáticas.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="glass-panel rounded-2xl overflow-hidden transition-all"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 transition-colors cursor-pointer"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span className="font-bold text-sm md:text-base" style={{ fontFamily: 'var(--font-display)' }}>
                    {item.question}
                  </span>
                  <ChevronDown
                    className="w-5 h-5 text-[#d4a574] shrink-0 transition-transform duration-300"
                    style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm leading-relaxed border-t animate-float" style={{ color: '#d0d6e0', borderColor: 'rgba(255,255,255,0.05)' }}>
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Extra contact box */}
        <div className="text-center pt-4">
          <p className="text-xs" style={{ color: '#8a8f98' }}>
            Ainda tem alguma dúvida específica para seu nicho?{' '}
            <button
              onClick={onAskQuestion}
              className="text-[#d4a574] font-bold underline cursor-pointer inline-flex items-center gap-1 ml-1 hover:text-[#e2b98a]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Pergunte ao Agente Hermes
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};
