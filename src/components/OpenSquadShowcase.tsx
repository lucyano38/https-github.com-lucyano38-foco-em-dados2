import React from 'react';
import { Bot, Cpu, ShieldCheck, Workflow } from 'lucide-react';

export const OpenSquadShowcase: React.FC = () => {
  const agents = [
    {
      title: 'Agente Prospector',
      icon: Bot,
      role: 'Varredura e Mapeamento',
      desc: 'Identifica potenciais clientes via CNAE e redes sociais sem intervenção humana.',
    },
    {
      title: 'Agente Qualificador',
      icon: Cpu,
      role: 'Atendimento & Engajamento',
      desc: 'Conversa com o lead via WhatsApp/Direct, tira dúvidas e agenda reuniões automaticamente.',
    },
    {
      title: 'Agente Supervisor (n8n)',
      icon: ShieldCheck,
      role: 'Auditoria de Qualidade',
      desc: 'Monitora as conversas, valida as regras de negócio e atualiza o CRM em tempo real.',
    },
  ];

  return (
    <section className="py-20 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold mb-3">
            <Workflow className="w-4 h-4" />
            <span>Arquitetura Open Squad</span>
          </div>
          <h2 className="text-3xl font-extrabold">O Poder de uma Equipe de IA Integrada</h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto mt-2">
            Você não está contratando um robô simples de respostas fixas, mas um ecossistema de agentes autônomos que se auto-monitoram.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {agents.map((agent, idx) => {
            const Icon = agent.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative hover:border-amber-500/40 transition-all shadow-xl"
              >
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-1">{agent.title}</h3>
                <span className="text-[11px] font-mono text-amber-400 block mb-3">{agent.role}</span>
                <p className="text-xs text-slate-400 leading-relaxed">{agent.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OpenSquadShowcase;
