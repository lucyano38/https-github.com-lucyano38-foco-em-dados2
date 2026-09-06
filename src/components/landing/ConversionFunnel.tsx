import React from 'react';
import { Search, Mail, MessageSquare, FileText, Handshake } from 'lucide-react';

const STEPS = [
  { id: 'discovery', title: 'Discovery', subtitle: 'Identificação de nicho', iconName: 'Search', count: 12845, conversion: '100%' },
  { id: 'approach', title: 'Abordagem', subtitle: 'Primeiro contato frio', iconName: 'Send', count: 4620, conversion: '36%' },
  { id: 'qualification', title: 'Qualificação', subtitle: 'Diagnóstico profundo', iconName: 'MessageSquareCheck', count: 1480, conversion: '32%' },
  { id: 'proposal', title: 'Proposta', subtitle: 'Apresentação de valor', iconName: 'FileText', count: 342, conversion: '23%' },
  { id: 'closing', title: 'Fechamento', subtitle: 'Assinatura do contrato', iconName: 'Handshake', count: 84, conversion: '24.5%' },
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Search': return <Search className="w-6 h-6" />;
    case 'Send': return <Mail className="w-6 h-6" />;
    case 'MessageSquareCheck': return <MessageSquare className="w-6 h-6" />;
    case 'FileText': return <FileText className="w-6 h-6" />;
    case 'Handshake': return <Handshake className="w-6 h-6" />;
    default: return <Search className="w-6 h-6" />;
  }
};

interface ConversionFunnelProps {
  selectedStep?: string;
  onSelectStep?: (stepId: string) => void;
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ selectedStep = 'qualification', onSelectStep }) => {
  return (
    <section id="funil-conversao" className="py-20 px-4 md:px-12 border-y" style={{ background: 'rgba(1,1,2,0.5)', borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14 space-y-2">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Prospecção & Conversão
          </h2>
          <p className="text-sm md:text-base" style={{ color: '#8a8f98' }}>
            Otimize cada etapa da sua jornada de vendas com métricas e automação contínua
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 px-2 md:px-6">
          {/* Progress Line Background */}
          <div className="absolute top-1/2 left-8 right-8 h-[2px] -translate-y-1/2 hidden md:block" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Steps */}
          {STEPS.map((step) => {
            const isSelected = selectedStep === step.id;
            return (
              <div
                key={step.id}
                onClick={() => onSelectStep?.(step.id)}
                className="relative z-10 flex flex-col items-center text-center group cursor-pointer w-full md:w-44"
              >
                <div
                  className="w-16 h-16 rounded-full glass-panel flex items-center justify-center border-2 transition-all duration-300"
                  style={{
                    borderColor: isSelected ? '#d4a574' : 'rgba(255,255,255,0.08)',
                    background: isSelected ? '#d4a574' : undefined,
                    color: isSelected ? '#1c1917' : '#d4a574',
                    boxShadow: isSelected ? '0 0 25px rgba(212,165,116,0.5)' : undefined,
                    transform: isSelected ? 'scale(1.1)' : undefined,
                  }}
                >
                  {getIcon(step.iconName)}
                </div>

                <div className="mt-4 space-y-1">
                  <p className="font-bold text-sm md:text-base transition-colors" style={{ color: isSelected ? '#d4a574' : '#f7f8f8' }}>
                    {step.title}
                  </p>
                  <p className="text-xs" style={{ color: '#8a8f98' }}>{step.subtitle}</p>
                  <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(212,165,116,0.9)' }}>
                    <span>{step.count.toLocaleString('pt-BR')} leads</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded text-emerald-400" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {step.conversion}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
