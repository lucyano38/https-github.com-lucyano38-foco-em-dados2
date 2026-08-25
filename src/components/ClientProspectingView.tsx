import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Building2,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  Globe,
  Star,
  CheckCircle2,
  Plus,
  ArrowRight,
  Share2,
  MessageSquare,
  Instagram,
  Linkedin,
  Compass,
  FileCode
} from 'lucide-react';

interface ProspectLead {
  id: string;
  slug?: string;
  name: string;
  category: string;
  city: string;
  cnaeCode?: string;
  cnaeDesc?: string;
  phone: string;
  whatsapp?: string;
  email: string;
  instagram?: string;
  instagramFollowers?: string;
  linkedinSize?: string;
  rating: number;
  reviewsCount?: number;
  revenueEst: string;
  websiteStatus: string;
  address?: string;
}

const COMMON_NICHES = [
  'Clínicas Médicas e Odontológicas',
  'Academias e Centros de Fitness',
  'Restaurantes e Gastronomia',
  'Imobiliárias e Construtoras',
  'Escritórios de Advocacia',
  'E-commerce e Varejo Digital',
  'Empresas de Tecnologia (SaaS & TI)',
  'Oficinas Mecânicas e Autopeças',
  'Escolas e Cursos Profissionalizantes'
];

const COMMON_CNAES = [
  { code: '8630-5/03', desc: 'Atividade médica ambulatorial restrita a consultas' },
  { code: '5611-2/01', desc: 'Restaurantes e similares' },
  { code: '6201-5/01', desc: 'Desenvolvimento de programas de computador sob encomenda' },
  { code: '6821-8/01', desc: 'Corretagem na compra e venda e avaliação de imóveis' },
  { code: '6920-6/01', desc: 'Atividades de contabilidade' },
  { code: '9313-5/00', desc: 'Atividades de condicionamento físico (Academias)' },
  { code: '4520-0/01', desc: 'Serviços de manutenção e reparação mecânica de veículos' },
  { code: '8599-6/99', desc: 'Outras atividades de ensino não especificadas anteriormente' }
];

export const ClientProspectingView: React.FC<{
  onLeadAddedToCrm?: (lead: any) => void;
  onNavigateToCrm?: () => void;
}> = ({ onLeadAddedToCrm, onNavigateToCrm }) => {
  const [selectedNiche, setSelectedNiche] = useState(COMMON_NICHES[0]);
  const [customNiche, setCustomNiche] = useState('');
  const [cityInput, setCityInput] = useState('São Paulo - SP');
  const [selectedCnae, setSelectedCnae] = useState(COMMON_CNAES[0].code);
  const [customCnae, setCustomCnae] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [leads, setLeads] = useState<ProspectLead[]>([
    {
      id: 'pros-1',
      slug: 'lead-alpha-saude',
      name: 'Alpha Saúde Integrada',
      category: 'Clínicas Médicas',
      city: 'São Paulo - SP',
      cnaeCode: '8630-5/03',
      cnaeDesc: 'Atividade médica ambulatorial',
      phone: '+55 11 98765-4321',
      whatsapp: '+5511987654321',
      email: 'contato@alphasaude.exemplo',
      instagram: '@alphasaude_sp',
      instagramFollowers: '14.2k',
      linkedinSize: '11-50 funcionários',
      rating: 4.8,
      reviewsCount: 142,
      revenueEst: 'R$ 150k - 300k/mês',
      websiteStatus: 'Sem Automação WhatsApp',
      address: 'Av. Paulista, 1000 - São Paulo, SP'
    },
    {
      id: 'pros-2',
      slug: 'lead-sorriso-perfeito',
      name: 'Clinica Sorriso Perfeito',
      category: 'Clínicas Odontológicas',
      city: 'São Paulo - SP',
      cnaeCode: '8630-5/04',
      cnaeDesc: 'Atividade odontológica',
      phone: '+55 11 97123-8899',
      whatsapp: '+5511971238899',
      email: 'atendimento@sorrisoperfeito.exemplo',
      instagram: '@sorrisoperfeito_clinica',
      instagramFollowers: '9.5k',
      linkedinSize: '1-10 funcionários',
      rating: 4.6,
      reviewsCount: 88,
      revenueEst: 'R$ 80k - 150k/mês',
      websiteStatus: 'Site Lento / Sem Chat',
      address: 'Rua Augusta, 500 - São Paulo, SP'
    },
    {
      id: 'pros-3',
      slug: 'lead-ricardo-medicina',
      name: 'Dr. Ricardo Consultório Especializado',
      category: 'Clínicas Médicas',
      city: 'São Paulo - SP',
      cnaeCode: '8630-5/03',
      cnaeDesc: 'Atividade médica ambulatorial',
      phone: '+55 11 96543-1122',
      whatsapp: '+5511965431122',
      email: 'dr.ricardo@medicina.exemplo',
      instagram: '@drricardocardiologia',
      instagramFollowers: '21.4k',
      linkedinSize: '11-50 funcionários',
      rating: 4.9,
      reviewsCount: 215,
      revenueEst: 'R$ 100k - 200k/mês',
      websiteStatus: 'Oportunidade IA / Redesign',
      address: 'Rua Oscar Freire, 1200 - São Paulo, SP'
    }
  ]);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const activeNiche = customNiche.trim() ? customNiche : selectedNiche;
  const activeCnae = customCnae.trim() ? customCnae : selectedCnae;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) {
      alert('Por favor, informe a cidade.');
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch('/api/prospecting/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: activeNiche,
          city: cityInput.trim(),
          cnae: activeCnae
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.leads) && data.leads.length > 0) {
          setLeads(data.leads);
        }
      }
    } catch (err) {
      console.error('Error fetching prospecting leads:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToCrm = async (lead: ProspectLead) => {
    try {
      const leadSlug = lead.slug || `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const payload = {
        slug: leadSlug,
        nome: lead.name,
        company: lead.name,
        nicho: lead.category,
        cidade: lead.city,
        telefone: lead.phone,
        whatsapp: lead.whatsapp || lead.phone,
        email: lead.email,
        nota: lead.rating,
        avaliacoes: lead.reviewsCount || 120,
        status: 'redesenhado', // Automatically creates a live redesign tunnel lead!
        siteAntigo: `https://www.${lead.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br`,
        valor: 5000,
        manutencao: 500,
        obs: `Prospecção Multi-Canal (Google Maps & Redes Sociais). CNAE: ${lead.cnaeCode || activeCnae}. Instagram: ${lead.instagram || '@empresa'} (${lead.instagramFollowers || '10k'}). LinkedIn: ${lead.linkedinSize || '11-50'} . Faturamento est.: ${lead.revenueEst}. Status: ${lead.websiteStatus}.`
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setAddedIds(prev => ({ ...prev, [lead.id]: true }));
        if (onLeadAddedToCrm) onLeadAddedToCrm(payload);
      } else {
        alert('Erro ao adicionar lead ao CRM.');
      }
    } catch (err) {
      console.error('Error adding lead to CRM:', err);
      alert('Erro de conexão ao salvar lead no CRM.');
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 p-4 md:p-8 font-['Inter'] bg-[#0F172A] text-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#1E293B] border border-[#334155] p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#F59E0B]" /> Google Maps, Instagram & CNAE Intelligence
            </span>
            <span className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Auto-Redesign Ativo
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#F8FAFC]">
            Prospecção Multicanal B2B & Busca por CNAE
          </h1>
          <p className="text-xs md:text-sm text-[#94A3B8] mt-1 max-w-2xl">
            Busque empresas cruzando dados do Google Maps (Avaliações, Endereço), Instagram (Engajamento, Seguidores), LinkedIn e Receita Federal (CNAE), enviando leads diretamente para o CRM com o Redesign pré-configurado.
          </p>
        </div>
        {onNavigateToCrm && (
          <button
            onClick={onNavigateToCrm}
            className="px-5 py-3 rounded-xl bg-[#F59E0B] text-[#0F172A] font-bold text-xs hover:bg-[#d9822b] transition shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer flex items-center gap-2 shrink-0"
          >
            Acessar CRM & Redesign Túnel <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Filter Form */}
      <form onSubmit={handleSearch} className="bg-[#1E293B] border border-[#334155] p-6 rounded-3xl shadow-xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Niche Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#F59E0B]" /> Nicho de Mercado
            </label>
            <select
              value={selectedNiche}
              onChange={(e) => {
                setSelectedNiche(e.target.value);
                setCustomNiche('');
              }}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#F59E0B]"
            >
              {COMMON_NICHES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Ou digite nicho personalizado..."
              value={customNiche}
              onChange={(e) => setCustomNiche(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#F59E0B] mt-2"
            />
          </div>

          {/* CNAE Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-[#F59E0B]" /> Código ou Descrição CNAE
            </label>
            <select
              value={selectedCnae}
              onChange={(e) => {
                setSelectedCnae(e.target.value);
                setCustomCnae('');
              }}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#F59E0B]"
            >
              {COMMON_CNAES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} - {c.desc}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Ou digite CNAE (ex: 8630-5/03)..."
              value={customCnae}
              onChange={(e) => setCustomCnae(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#F59E0B] mt-2"
            />
          </div>

          {/* City Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#F59E0B]" /> Cidade / Estado
            </label>
            <input
              type="text"
              required
              placeholder="Ex: São Paulo - SP, Campinas - SP"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#F59E0B]"
            />
            <p className="text-[11px] text-[#94A3B8]/60 pt-1">
              Varredura integrada no Google Maps, Instagram e base CNAE em tempo real.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSearching}
            className="px-8 py-3.5 rounded-xl bg-[#F59E0B] text-[#0F172A] font-bold text-sm hover:scale-105 transition shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSearching ? (
              <>Varrendo Google Maps, Instagram & CNAE...</>
            ) : (
              <>
                <Search className="w-4 h-4" /> Disparar Prospecção Multicanal
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-bold text-[#F8FAFC]">
            Empresas Descobertas ({leads.length}) • Nicho: "{activeNiche}" em {cityInput}
          </h2>
          <span className="text-xs text-[#94A3B8] font-mono">Prontas para Redesign & CRM</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leads.map((lead) => {
            const isAdded = addedIds[lead.id];
            return (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1E293B] border border-[#334155] p-6 rounded-3xl shadow-xl flex flex-col justify-between hover:border-[#F59E0B]/50 transition space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-full border border-[#F59E0B]/20">
                        CNAE: {lead.cnaeCode || activeCnae}
                      </span>
                      <h3 className="text-lg font-bold text-[#F8FAFC] mt-2">
                        {lead.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 bg-[#0F172A] px-2 py-1 rounded-lg border border-[#334155] text-xs text-[#F8FAFC]">
                      <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                      <span>{lead.rating}</span>
                      <span className="text-[10px] text-[#94A3B8]">({lead.reviewsCount || 120})</span>
                    </div>
                  </div>

                  {/* Multi-Source Badges (Maps, Instagram, LinkedIn) */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-[#0F172A] px-3 py-2 rounded-xl border border-[#334155] flex items-center gap-2">
                      <Instagram className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-[11px] font-bold text-[#F8FAFC] truncate">{lead.instagram || '@empresa'}</div>
                        <div className="text-[9px] text-[#94A3B8]">{lead.instagramFollowers || '10k'} seg.</div>
                      </div>
                    </div>
                    <div className="bg-[#0F172A] px-3 py-2 rounded-xl border border-[#334155] flex items-center gap-2">
                      <Linkedin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-[11px] font-bold text-[#F8FAFC] truncate">LinkedIn</div>
                        <div className="text-[9px] text-[#94A3B8]">{lead.linkedinSize || '11-50 func.'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#94A3B8] pt-2 border-t border-[#334155]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{lead.address || lead.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                  </div>

                  <div className="bg-[#0F172A] p-3 rounded-2xl border border-[#334155] space-y-1 text-xs">
                    <div className="flex justify-between text-[#94A3B8]">
                      <span>Faturamento Est.:</span>
                      <span className="font-semibold text-[#F8FAFC]">{lead.revenueEst}</span>
                    </div>
                    <div className="flex justify-between text-[#94A3B8]">
                      <span>Diagnóstico Web:</span>
                      <span className="font-semibold text-[#F59E0B]">{lead.websiteStatus}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {isAdded ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 font-bold text-xs flex items-center justify-center gap-2 cursor-default"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-400" /> Adicionado & Redesenho Ativo
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddToCrm(lead)}
                      className="w-full py-3 rounded-xl bg-[#F59E0B] text-[#0F172A] font-bold text-xs hover:bg-[#d9822b] transition shadow-[0_0_15px_rgba(245,158,11,0.2)] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Adicionar ao CRM & Ativar Redesign
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
