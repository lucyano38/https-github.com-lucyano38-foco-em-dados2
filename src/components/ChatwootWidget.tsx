import React, { useEffect } from 'react';
import { MessageSquare, PhoneCall } from 'lucide-react';

interface ChatwootWidgetProps {
  whatsappNumber?: string;
}

export const ChatwootWidget: React.FC<ChatwootWidgetProps> = ({
  whatsappNumber = '5511994411307',
}) => {
  useEffect(() => {
    const BASE_URL = 'https://app.chatwoot.com';
    const existingScript = document.querySelector(`script[src="${BASE_URL}/packs/js/sdk.js"]`);
    if (existingScript) return;

    const g = document.createElement('script');
    g.src = BASE_URL + '/packs/js/sdk.js';
    g.defer = true;
    g.async = true;
    document.head.appendChild(g);

    g.onload = () => {
      (window as any).chatwootSettings = {
        hideMessageBubble: false,
        position: 'right',
        locale: 'pt_BR',
        type: 'expanded_bubble',
      };
      if ((window as any).chatwootSDK) {
        (window as any).chatwootSDK.run({
          websiteToken: process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN || 'CHATWOOT_TOKEN',
          baseUrl: BASE_URL,
        });
      }
    };
  }, []);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Olá! Quero ver o robô de IA trabalhando ao vivo na demonstração do Foco em Dados.'
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-[9998] flex flex-col items-end gap-3">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold text-xs shadow-xl transition-all hover:scale-105 border border-emerald-400/30"
      >
        <PhoneCall className="w-4 h-4 text-white animate-pulse" />
        <span>Fale com o nosso Agente no WhatsApp</span>
      </a>
    </div>
  );
};

export default ChatwootWidget;
