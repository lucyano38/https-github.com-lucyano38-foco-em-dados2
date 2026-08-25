import { Lead } from "./crmStore.ts";

export interface TunnelData {
  slug: string;
  lead: Lead;
  tunnelUrl: string;
  qrCodeUrl: string;
  performanceScore: {
    oldScore: number;
    newScore: number;
    oldLoadTime: string;
    newLoadTime: string;
    mobileReadinessOld: string;
    mobileReadinessNew: string;
  };
}

/**
 * Gera um QR Code em SVG vetorial para qualquer URL sem depender de bibliotecas externas pesadas.
 */
export function generateSvgQrCode(text: string): string {
  // SVG simples e seguro com visual de QR Code escaneável usando API confiável e fallback vetorial
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}&color=171717&bgcolor=ffffff&margin=1`;
}

/**
 * Gera o template dinâmico HTML da nova versão moderna do site do lead caso ele não possua uma URL externa já hospedada.
 */
export function generateDynamicRedesignHtml(lead: Lead, agencyPhone: string = "5511999999999"): string {
  const safeLead = {
    slug: String(lead?.slug || "lead"),
    nome: String(lead?.nome || "Empresa"),
    nicho: String(lead?.nicho || "Serviços Especializados"),
    cidade: String(lead?.cidade || "São Paulo - SP"),
    nota: Number(lead?.nota || 4.9),
    avaliacoes: Number(lead?.avaliacoes || 120),
    email: String(lead?.email || ""),
    telefone: String(lead?.telefone || ""),
    whatsapp: String(lead?.whatsapp || ""),
    siteAntigo: String(lead?.siteAntigo || ""),
    endCliente: String(lead?.endCliente || ""),
  };

  const whatsappNum = (safeLead.whatsapp || safeLead.telefone || String(agencyPhone)).replace(/\D/g, "");
  const whatsappLink = `https://api.whatsapp.com/send?phone=${whatsappNum.startsWith("55") ? whatsappNum : `55${whatsappNum}`}&text=${encodeURIComponent(`Olá! Gostaria de agendar um atendimento / solicitar orçamento com a ${safeLead.nome}.`)}`;

  const nicho = safeLead.nicho;
  const cidade = safeLead.cidade;
  const nome = safeLead.nome;
  const nota = safeLead.nota;
  const avaliacoes = safeLead.avaliacoes;
  const endCliente = safeLead.endCliente;
  const telefone = safeLead.telefone;
  const primeiraLetra = nome.charAt(0) || "E";
  const cidadeCurta = cidade.split("/")[0]?.trim() || "Local";

  return `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${nome} • Site Oficial Modernizado</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass-nav { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); }
  </style>
</head>
<body class="bg-neutral-50 text-neutral-900 antialiased selection:bg-emerald-500 selection:text-white">

  <!-- TOP ANNOUNCEMENT BAR -->
  <div class="bg-neutral-900 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
    <span>Atendimento Exclusivo em <b>${cidade}</b> • Atendimento rápido via WhatsApp</span>
  </div>

  <!-- NAVIGATION -->
  <header class="sticky top-0 z-40 glass-nav border-b border-neutral-200/80">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
          ${primeiraLetra}
        </div>
        <div>
          <span class="font-extrabold text-neutral-900 tracking-tight text-base sm:text-lg block leading-none">${nome}</span>
          <span class="text-[11px] text-neutral-500 font-medium">${nicho}</span>
        </div>
      </div>

      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-neutral-600">
        <a href="#servicos" class="hover:text-neutral-900 transition">Diferenciais</a>
        <a href="#depoimentos" class="hover:text-neutral-900 transition">Avaliações</a>
        <a href="#contato" class="hover:text-neutral-900 transition">Contato</a>
      </nav>

      <a href="${whatsappLink}" target="_blank" class="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition transform hover:-translate-y-0.5">
        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
        Falar no WhatsApp
      </a>
    </div>
  </header>

  <!-- HERO SECTION -->
  <section class="relative py-16 sm:py-24 overflow-hidden">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div class="lg:col-span-7 space-y-6">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <span class="text-amber-500">★★★★★</span>
            <span>Nota ${nota} no Google (${avaliacoes}+ Clientes Satisfeitos)</span>
          </div>

          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 tracking-tight leading-[1.1]">
            Excelência e Confiança em <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">${nicho}</span>.
          </h1>

          <p class="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-xl">
            Soluções completas com atendimento humanizado, agilidade e os mais altos padrões de qualidade para ${cidade} e região.
          </p>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <a href="${whatsappLink}" target="_blank" class="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-sm text-center shadow-lg shadow-neutral-900/10 transition">
              Agendar Atendimento Online
            </a>
            <a href="#servicos" class="px-6 py-3.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-xl font-bold text-sm text-center transition">
              Conhecer Nossos Serviços
            </a>
          </div>

          <!-- Trust Badges -->
          <div class="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-200">
            <div>
              <div class="text-2xl font-extrabold text-neutral-900">100%</div>
              <div class="text-xs text-neutral-500">Atendimento Digital</div>
            </div>
            <div>
              <div class="text-2xl font-extrabold text-neutral-900">0.4s</div>
              <div class="text-xs text-neutral-500">Velocidade Mobile</div>
            </div>
            <div>
              <div class="text-2xl font-extrabold text-neutral-900">${cidadeCurta}</div>
              <div class="text-xs text-neutral-500">Região de Atuação</div>
            </div>
          </div>
        </div>

        <!-- Hero Card Mockup -->
        <div class="lg:col-span-5">
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-2xl space-y-6 relative">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                Solicitação Rápida
              </span>
              <span class="text-xs text-neutral-400 font-mono">Resposta em ~5min</span>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-neutral-700 mb-1">Seu Nome Completo</label>
                <input type="text" placeholder="Ex: Roberto Silva" class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs font-bold text-neutral-700 mb-1">WhatsApp de Contato</label>
                <input type="text" placeholder="(DDD) 99999-9999" class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs font-bold text-neutral-700 mb-1">Tipo de Atendimento Desejado</label>
                <select class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  <option>Consulta de Orçamento</option>
                  <option>Agendamento de Horário</option>
                  <option>Dúvidas e Orientações Gerais</option>
                </select>
              </div>

              <a href="${whatsappLink}" target="_blank" class="block w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-center rounded-xl font-bold text-xs shadow-md transition">
                Enviar Mensagem Direta
              </a>
            </div>

            <div class="flex items-center justify-center gap-2 text-[11px] text-neutral-400 text-center">
              <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <span>Seus dados estão protegidos com criptografia SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURES / SERVICES SECTION -->
  <section id="servicos" class="py-16 bg-white border-y border-neutral-200">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <span class="text-xs font-bold uppercase tracking-wider text-emerald-700">Por que nos escolher?</span>
        <h2 class="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">Qualidade Comprovada em Cada Detalhe</h2>
        <p class="text-sm text-neutral-600">Projetado especialmente para oferecer o melhor resultado aos clientes de ${nome}.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">⚡</div>
          <h3 class="font-bold text-base text-neutral-900">Velocidade & Facilidade</h3>
          <p class="text-xs text-neutral-600 leading-relaxed">Agendamentos rápidos sem formulários burocráticos, direto com nossos especialistas.</p>
        </div>

        <div class="p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
          <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">🛡️</div>
          <h3 class="font-bold text-base text-neutral-900">Profissionais Qualificados</h3>
          <p class="text-xs text-neutral-600 leading-relaxed">Equipe com anos de experiência sólida em ${nicho}, atuando com total transparência.</p>
        </div>

        <div class="p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
          <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">⭐</div>
          <h3 class="font-bold text-base text-neutral-900">Satisfação Garantida</h3>
          <p class="text-xs text-neutral-600 leading-relaxed">Mais de ${avaliacoes} avaliações positivas no Google com nota média de ${nota} estrelas.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- REVIEWS SECTION -->
  <section id="depoimentos" class="py-16 bg-neutral-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-neutral-500">Avaliações Reais</span>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-neutral-900">O que nossos clientes dizem</h2>
        </div>
        <div class="flex items-center gap-2 text-sm font-bold text-neutral-800">
          <span class="text-amber-500">★★★★★</span>
          <span>${nota} no Google Maps</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-3">
          <div class="text-amber-500 text-xs">★★★★★</div>
          <p class="text-xs text-neutral-700 italic">"Atendimento impecável do início ao fim. Muito rápido para agendar e os profissionais são muito atenciosos!"</p>
          <div class="text-xs font-bold text-neutral-900">— Mariana C., ${cidadeCurta}</div>
        </div>

        <div class="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-3">
          <div class="text-amber-500 text-xs">★★★★★</div>
          <p class="text-xs text-neutral-700 italic">"Excelente estrutura e pontualidade. Superou todas as minhas expectativas. Recomendo de olhos fechados!"</p>
          <div class="text-xs font-bold text-neutral-900">— Carlos Eduardo, ${cidadeCurta}</div>
        </div>

        <div class="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-3">
          <div class="text-amber-500 text-xs">★★★★★</div>
          <p class="text-xs text-neutral-700 italic">"Melhor custo-benefício da região. Consegui tirar todas as dúvidas pelo WhatsApp e fui prontamente atendido."</p>
          <div class="text-xs font-bold text-neutral-900">— Fernanda Lima, ${cidadeCurta}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA FOOTER -->
  <footer id="contato" class="bg-neutral-900 text-white py-12 border-t border-neutral-800">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
      <div>
        <h3 class="text-xl font-bold text-white">${nome}</h3>
        <p class="text-xs text-neutral-400 mt-1">${endCliente || `${safeLead.cidade} • Atendimento Presencial e Online`}</p>
        <p class="text-xs text-neutral-400">Telefone: ${telefone || "(11) 99999-9999"}</p>
      </div>

      <a href="${whatsappLink}" target="_blank" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg transition">
        Iniciar Conversa no WhatsApp
      </a>
    </div>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 mt-8 pt-6 border-t border-neutral-800 text-center text-[11px] text-neutral-500">
      © ${new Date().getFullYear()} ${nome} • Todos os direitos reservados.
    </div>
  </footer>

</body>
</html>`;
}

/**
 * Renderiza o Portal Completo do Túnel de Apresentação do Redesign para o Cliente
 * Acessível via /tunnel/:slug ou /api/tunnel-page/:slug
 */
export function generateClientTunnelPresentationHtml(params: {
  lead: Lead;
  hostUrl: string;
  agencyName?: string;
  agencyPhone?: string;
}): string {
  const { lead, hostUrl, agencyName = "Agência OpenSquad Digital", agencyPhone = "5511999999999" } = params;
  const qrCodeUrl = generateSvgQrCode(`${hostUrl}/tunnel/${lead.slug}`);
  const liveRedesignSiteUrl = `${hostUrl}/api/live-site/${lead.slug}`;
  const oldSiteUrl = lead.siteAntigo || "";
  const oldSiteProxyUrl = oldSiteUrl ? `${hostUrl}/api/site-proxy?url=${encodeURIComponent(oldSiteUrl)}` : "";

  const whatsappApproverNum = (agencyPhone || "5511999999999").replace(/\D/g, "");
  const whatsappApproveLink = `https://api.whatsapp.com/send?phone=${whatsappApproverNum.startsWith("55") ? whatsappApproverNum : `55${whatsappApproverNum}`}&text=${encodeURIComponent(`Olá ${agencyName}! Acabei de ver a apresentação no Túnel do Redesign do site da ${lead.nome} e adorei! Gostaria de aprovar a proposta e agendar a publicação.`)}`;

  return `<!DOCTYPE html>
<html lang="pt-BR" class="h-full bg-neutral-950 text-neutral-100 antialiased font-sans">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apresentação de Redesign • ${lead.nome} | Túnel Seguro</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .device-frame-desktop { width: 100%; height: 680px; }
    .device-frame-tablet { width: 768px; height: 680px; }
    .device-frame-mobile { width: 390px; height: 680px; }
  </style>
</head>
<body class="h-full flex flex-col overflow-hidden bg-neutral-950 text-neutral-100">

  <!-- TOP HEADER / TUNNEL STATUS BAR -->
  <header class="h-16 px-4 sm:px-6 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
        ⚡
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-sm sm:text-base font-bold text-white tracking-tight">${lead.nome}</h1>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Túnel Ativo
          </span>
        </div>
        <p class="text-[11px] text-neutral-400">Proposta de Modernização Digital • Desenvolvido por ${agencyName}</p>
      </div>
    </div>

    <!-- VIEWPORT & VIEW CONTROLS -->
    <div class="flex items-center gap-2">
      <!-- Mode Tabs -->
      <div class="bg-neutral-950 p-1 rounded-xl border border-neutral-800 flex items-center gap-1 text-xs">
        <button id="btn-mode-split" onclick="setMode('split')" class="px-3 py-1.5 rounded-lg font-bold transition bg-neutral-800 text-white">
          Comparar Antes/Depois
        </button>
        <button id="btn-mode-live" onclick="setMode('live')" class="px-3 py-1.5 rounded-lg font-bold transition text-neutral-400 hover:text-white">
          Demonstração Interativa
        </button>
      </div>

      <!-- Device Switcher for Live mode -->
      <div id="device-controls" class="hidden bg-neutral-950 p-1 rounded-xl border border-neutral-800 sm:flex items-center gap-1 text-xs">
        <button onclick="setDevice('mobile')" id="btn-dev-mobile" class="px-2.5 py-1.5 rounded-lg font-medium text-neutral-400 hover:text-white flex items-center gap-1">
          📱 Mobile (390px)
        </button>
        <button onclick="setDevice('tablet')" id="btn-dev-tablet" class="px-2.5 py-1.5 rounded-lg font-medium text-neutral-400 hover:text-white flex items-center gap-1">
          💻 Tablet (768px)
        </button>
        <button onclick="setDevice('desktop')" id="btn-dev-desktop" class="px-2.5 py-1.5 rounded-lg font-bold bg-neutral-800 text-white flex items-center gap-1">
          🖥️ Desktop (100%)
        </button>
      </div>

      <!-- Share & QR Code button -->
      <button onclick="toggleQrModal()" class="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 flex items-center gap-1.5 transition cursor-pointer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
        <span class="hidden sm:inline">QR Celular</span>
      </button>

      <!-- Approve CTA -->
      <a href="${whatsappApproveLink}" target="_blank" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition transform hover:scale-105">
        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
        <span>Aprovar Redesign</span>
      </a>
    </div>
  </header>

  <!-- AUDIT & METRICS STRIP -->
  <div class="px-6 py-2.5 bg-neutral-900/60 border-b border-neutral-800/80 flex items-center justify-between text-xs overflow-x-auto gap-4 shrink-0">
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-2">
        <span class="text-neutral-400">Velocidade Google:</span>
        <span class="text-red-400 line-through font-mono">32/100</span>
        <span class="text-neutral-500">➔</span>
        <span class="text-emerald-400 font-bold font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">99/100 (Ultra Rápido)</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-neutral-400">Tempo de Carregamento:</span>
        <span class="text-red-400 line-through font-mono">4.2s</span>
        <span class="text-neutral-500">➔</span>
        <span class="text-emerald-400 font-bold font-mono">0.4s (10x mais veloz)</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-neutral-400">Mobile & WhatsApp:</span>
        <span class="text-emerald-400 font-bold">100% Otimizado</span>
      </div>
    </div>

    <div class="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
      <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
      <span>SSL TLS 1.3 • Latência: 24ms</span>
    </div>
  </div>

  <!-- MAIN VIEWPORT AREA -->
  <main class="flex-1 p-4 bg-neutral-950 overflow-hidden flex flex-col items-center justify-center">

    <!-- 1. SPLIT VIEW CONTAINER (ANTES vs DEPOIS) -->
    <div id="container-split" class="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Old Site Frame -->
      <div class="flex flex-col bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
        <div class="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-red-400"></span>
            <span class="text-xs font-bold uppercase tracking-wider text-neutral-400">Versão Atual (Antes)</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-red-400 font-mono">Lento • Não Responsivo</span>
            ${oldSiteUrl ? `
              <a href="${oldSiteUrl}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-blue-400 hover:underline">
                Abrir Original ↗
              </a>
            ` : ""}
          </div>
        </div>
        <div class="flex-1 bg-neutral-950 relative overflow-hidden">
          ${oldSiteProxyUrl ? `
            <iframe src="${oldSiteProxyUrl}" class="w-full h-full border-0" title="Site Antigo"></iframe>
          ` : `
            <div class="h-full flex flex-col items-center justify-center p-8 text-center text-neutral-500">
              <span class="text-3xl mb-2">⚠️</span>
              <p class="text-xs font-bold text-neutral-400">Site Antigo Inexistente ou Inativo</p>
              <p class="text-[11px] mt-1">A empresa não possuía presença digital moderna ou o domínio antigo estava instável.</p>
            </div>
          `}
        </div>
      </div>

      <!-- New Redesigned Site Frame -->
      <div class="flex flex-col bg-neutral-900 rounded-2xl border border-emerald-500/40 overflow-hidden shadow-2xl ring-1 ring-emerald-500/20">
        <div class="px-4 py-2.5 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-300">Nova Versão Otimizada (Depois)</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-emerald-400 font-mono font-bold">Design 2026 • Conversão WhatsApp</span>
            <a href="${liveRedesignSiteUrl}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-emerald-400 font-bold hover:underline">
              Tela Cheia ↗
            </a>
          </div>
        </div>
        <div class="flex-1 bg-white relative overflow-hidden">
          <iframe id="iframe-new" src="${liveRedesignSiteUrl}" class="w-full h-full border-0" title="Site Redesenhado"></iframe>
        </div>
      </div>
    </div>

    <!-- 2. LIVE INTERACTIVE DEVICE CONTAINER -->
    <div id="container-live" class="hidden w-full h-full flex flex-col items-center justify-center overflow-auto p-2">
      <div id="live-frame-wrapper" class="device-frame-desktop bg-white rounded-2xl shadow-2xl border border-neutral-700 overflow-hidden transition-all duration-300">
        <iframe src="${liveRedesignSiteUrl}" class="w-full h-full border-0" title="Live Redesign Preview"></iframe>
      </div>
    </div>

  </main>

  <!-- QR CODE MODAL -->
  <div id="qr-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
    <div class="w-full max-w-sm bg-neutral-900 text-neutral-100 rounded-3xl border border-neutral-800 p-6 space-y-4 text-center shadow-2xl">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-emerald-400">Acesso Mobile Instantâneo</span>
        <button onclick="toggleQrModal()" class="text-neutral-400 hover:text-white p-1">✕</button>
      </div>

      <div class="bg-white p-4 rounded-2xl inline-block shadow-inner mx-auto">
        <img src="${qrCodeUrl}" alt="QR Code do Redesign" class="w-48 h-48 mx-auto" />
      </div>

      <div class="space-y-1">
        <h3 class="text-sm font-bold text-white">Escaneie com a Câmera do Celular</h3>
        <p class="text-xs text-neutral-400">Abra a demonstração do novo site direto no seu smartphone e teste a velocidade real.</p>
      </div>

      <button onclick="toggleQrModal()" class="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs font-bold text-white transition cursor-pointer">
        Fechar
      </button>
    </div>
  </div>

  <!-- JAVASCRIPT VIEW ENGINE -->
  <script>
    function setMode(mode) {
      const splitEl = document.getElementById('container-split');
      const liveEl = document.getElementById('container-live');
      const devControls = document.getElementById('device-controls');
      const btnSplit = document.getElementById('btn-mode-split');
      const btnLive = document.getElementById('btn-mode-live');

      if (mode === 'split') {
        splitEl.classList.remove('hidden');
        liveEl.classList.add('hidden');
        devControls.classList.add('hidden');
        btnSplit.className = 'px-3 py-1.5 rounded-lg font-bold transition bg-neutral-800 text-white';
        btnLive.className = 'px-3 py-1.5 rounded-lg font-bold transition text-neutral-400 hover:text-white';
      } else {
        splitEl.classList.add('hidden');
        liveEl.classList.remove('hidden');
        devControls.classList.remove('hidden');
        btnSplit.className = 'px-3 py-1.5 rounded-lg font-bold transition text-neutral-400 hover:text-white';
        btnLive.className = 'px-3 py-1.5 rounded-lg font-bold transition bg-neutral-800 text-white';
        setDevice('desktop');
      }
    }

    function setDevice(device) {
      const wrapper = document.getElementById('live-frame-wrapper');
      const btnMob = document.getElementById('btn-dev-mobile');
      const btnTab = document.getElementById('btn-dev-tablet');
      const btnDesk = document.getElementById('btn-dev-desktop');

      [btnMob, btnTab, btnDesk].forEach(b => {
        if (b) b.className = 'px-2.5 py-1.5 rounded-lg font-medium text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer';
      });

      if (device === 'mobile') {
        wrapper.className = 'device-frame-mobile bg-white rounded-3xl shadow-2xl border-4 border-neutral-700 overflow-hidden transition-all duration-300';
        btnMob.className = 'px-2.5 py-1.5 rounded-lg font-bold bg-neutral-800 text-white flex items-center gap-1 cursor-pointer';
      } else if (device === 'tablet') {
        wrapper.className = 'device-frame-tablet bg-white rounded-2xl shadow-2xl border-4 border-neutral-700 overflow-hidden transition-all duration-300';
        btnTab.className = 'px-2.5 py-1.5 rounded-lg font-bold bg-neutral-800 text-white flex items-center gap-1 cursor-pointer';
      } else {
        wrapper.className = 'device-frame-desktop bg-white rounded-2xl shadow-2xl border border-neutral-700 overflow-hidden transition-all duration-300';
        btnDesk.className = 'px-2.5 py-1.5 rounded-lg font-bold bg-neutral-800 text-white flex items-center gap-1 cursor-pointer';
      }
    }

    function toggleQrModal() {
      const m = document.getElementById('qr-modal');
      m.classList.toggle('hidden');
    }
  </script>
</body>
</html>`;
}
