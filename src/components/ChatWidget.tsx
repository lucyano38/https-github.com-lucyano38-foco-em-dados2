import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'ai' | 'user';
  text: string;
}

const WELCOME_MSG =
  'Olá! Sou a assistente IA do VarejoBI. Posso ajudar com dúvidas sobre planos, funcionalidades ou como conectar sua loja.';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'ai', text: WELCOME_MSG }]);
  const [input, setInput] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Não encontrei essa informação na minha base de conhecimento.' },
      ]);
      setShowOptions(true);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      {open && (
        <div className="w-[360px] max-w-[calc(100vw-48px)] glass-card-strong rounded-2xl shadow-2xl border border-glass-border overflow-hidden animate-[slideIn_0.3s_ease]">
          {/* Header */}
          <div className="p-4 border-b border-glass-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-on-surface">Assistente Virtual Foco</h3>
                <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mt-0.5">
                  IA &mdash; Respostas instantâneas
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-on-surface-variant">close</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="p-4 h-80 overflow-y-auto space-y-3 custom-scrollbar">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-vivid-purple/20 text-on-surface border border-vivid-purple/20'
                      : 'bg-white/5 text-on-surface border border-glass-border'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {showOptions && (
              <div className="flex flex-col gap-2 pt-1">
                <button className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-on-surface-variant hover:text-on-surface bg-white/5 hover:bg-white/10 border border-glass-border transition-colors">
                  <span className="material-symbols-outlined text-sm align-middle mr-1.5">search</span>
                  Buscar na documentação
                </button>
                <button className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-on-surface-variant hover:text-on-surface bg-white/5 hover:bg-white/10 border border-glass-border transition-colors">
                  <span className="material-symbols-outlined text-sm align-middle mr-1.5">mail</span>
                  Enviar por email
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-glass-border">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Digite sua pergunta..."
                className="flex-1 bg-white/5 border border-glass-border rounded-xl px-3.5 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-vivid-purple/50 transition-colors"
              />
              <button
                onClick={handleSend}
                className="p-2.5 rounded-xl bg-vivid-purple/20 border border-vivid-purple/30 text-vivid-purple hover:bg-vivid-purple/30 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full glass-card-strong border border-glass-border shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
      >
        <span className="material-symbols-outlined text-xl text-vivid-purple">
          {open ? 'close' : 'smart_toy'}
        </span>
      </button>
    </div>
  );
}
