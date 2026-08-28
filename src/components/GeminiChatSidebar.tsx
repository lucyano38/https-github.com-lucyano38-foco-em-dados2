import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Loader2,
  Minimize2,
  Maximize2,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface GeminiChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  contextReport?: any;
  datasetSummary?: string;
}

export const GeminiChatSidebar: React.FC<GeminiChatSidebarProps> = ({
  isOpen,
  onClose,
  contextReport,
  datasetSummary,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Olá! Sou o assistente de inteligência de negócios Gemini. Pergunte qualquer coisa sobre os relatórios gerados, métricas dos datasets ou estratégias para seus leads comerciais!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          contextReport,
          datasetSummary,
          history: messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'Sem resposta disponível no momento.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `Desculpe, ocorreu um erro ao se comunicar com o Gemini: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 340 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 340 }}
        className="fixed bottom-4 right-4 z-40 w-96 max-w-[calc(100vw-32px)] h-[580px] bg-white rounded-3xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden text-neutral-900"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-none">Chat Gemini AI</h3>
              <p className="text-[11px] text-blue-100 mt-0.5">
                Consultoria rápida em tempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Question Prompts if context exists */}
        {contextReport && (
          <div className="px-4 py-2 bg-blue-50/70 border-b border-blue-100 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => handleSend('Resuma as 3 conclusões mais importantes dessa análise.')}
              className="shrink-0 px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 font-medium rounded-full border border-blue-200 shadow-2xs transition"
            >
              💡 3 Conclusões Chave
            </button>
            <button
              onClick={() => handleSend('Qual ação tática você recomenda com base nos dados?')}
              className="shrink-0 px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 font-medium rounded-full border border-blue-200 shadow-2xs transition"
            >
              🎯 Ação Recomendada
            </button>
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${
                m.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white text-neutral-800 border border-neutral-200/80 rounded-tl-xs'
                }`}
              >
                {m.role === 'user' ? (
                  <p>{m.text}</p>
                ) : (
                  <div className="prose prose-xs max-w-none text-neutral-800">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.text}
                    </ReactMarkdown>
                  </div>
                )}
                <div
                  className={`text-[9px] mt-1 ${
                    m.role === 'user' ? 'text-blue-200 text-right' : 'text-neutral-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 bg-white p-3 rounded-2xl border border-neutral-200 w-fit">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Gemini está analisando...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-neutral-200 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte ao Gemini sobre os dados..."
            className="flex-1 text-xs bg-neutral-100 border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl shadow-xs transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};
