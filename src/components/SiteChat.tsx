import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const SUGGESTIONS = [
  'O que é o Foco em Dados?',
  'Quais planos vocês têm?',
  'Como funciona a prospecção?',
  'Quanto custa o plano Premium?',
];

export const SiteChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Olá! 👋 Sou o assistente do **Foco em Dados**. Posso explicar nossas funcionalidades, planos e como a prospecção inteligente funciona. Como posso ajudar?',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/site-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      // Resilient JSON parsing
      const textBody = await res.text();
      let data: any;
      try {
        data = JSON.parse(textBody);
      } catch {
        data = { reply: 'Desculpe, houve um erro de comunicação. Tente novamente.' };
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply || data.error || 'Sem resposta disponível.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: 'Erro de conexão. Tente novamente ou chame no WhatsApp: 55 11 99441-1307',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING CHAT BUTTON — WhatsApp (esquerda, z-40) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-[0_0_30px_rgba(37,211,102,0.4)] flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* CHAT PANEL — direita, z-50 (acima do botão WhatsApp) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] h-[520px] bg-[#0f1011] rounded-3xl shadow-2xl border border-white/[0.1] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#d4a574] to-[#c49464] text-[#1c1917] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-none">Foco em Dados</h3>
                <p className="text-[11px] text-[#1c1917]/70 mt-0.5">Assistente IA • Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[#1c1917]/60 hover:text-[#1c1917] hover:bg-white/20 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 py-2.5 border-b border-white/[0.06] flex gap-1.5 overflow-x-auto shrink-0">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="shrink-0 px-3 py-1.5 bg-white/[0.06] hover:bg-[#d4a574]/20 text-[#d4a574] text-[11px] font-medium rounded-full border border-[#d4a574]/20 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#010102]">
            {messages.map(m => (
              <div key={m.id} className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                  m.role === 'user'
                    ? 'bg-[#d4a574] text-[#1c1917]'
                    : 'bg-white/[0.08] text-[#d4a574]'
                }`}>
                  {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#d4a574] text-[#1c1917] rounded-tr-sm'
                    : 'bg-white/[0.06] text-[#d4d6e0] border border-white/[0.08] rounded-tl-sm'
                }`}>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div className={`text-[9px] mt-1.5 ${m.role === 'user' ? 'text-[#1c1917]/50 text-right' : 'text-[#555]'}`}>
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-[#8a8f98] bg-white/[0.04] p-3 rounded-2xl border border-white/[0.06] w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d4a574]" />
                <span>Pensando...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={e => { e.preventDefault(); handleSend(); }}
            className="p-3 border-t border-white/[0.08] bg-[#0f1011] flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Pergunte sobre o Foco em Dados..."
              className="flex-1 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[#f7f8f8] placeholder-[#555] focus:outline-none focus:border-[#d4a574]/40"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 bg-[#d4a574] hover:bg-[#e2b98a] disabled:opacity-30 text-[#1c1917] rounded-xl transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default SiteChat;