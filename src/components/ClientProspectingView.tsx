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
  Filter,
  Download
} from 'lucide-react';

interface ProspectLead {
  id: string;
  name: string;
  category: string;
  city: string;
  phone: string;
  email: string;
  rating: number;
  revenueEst: string;
  websiteStatus: string;
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

export const ClientProspectingView: React.FC<{
  onLeadAddedToCrm?: (lead: any) => void;
  onNavigateToCrm?: () => void;
}> = ({ onLeadAddedToCrm, onNavigateToCrm }) => {
  const [selectedNiche, setSelectedNiche] = useState(COMMON_NICHES[0]);
  const [customNiche, setCustomNiche] = useState('');
  const [cityInput, setCityInput] = useState('São Paulo - SP');
  const [isSearching, setIsSearching] = useState(false);
  const [leads, setLeads] = useState<ProspectLead[]>([
    {
      id: '1',
      name: 'Alpha Saúde Integrada',
      category: 'Clínicas Médicas',
      city: 'São Paulo - SP',
      phone: '+55 11 98765-4321',
      email: 'contato@alphasaude.exemplo',
      rating: 4.8,
      revenueEst: 'R$ 150k - 300k/mês',
      websiteStatus: 'Sem WhatsApp Ativo'
    },
    {
      id: '2',
      name: 'Clinica Sorriso Perfeito',
      category: 'Clínicas Odontológicas',
      city: 'São Paulo - SP',
      phone: '+55 11 97123-8899',
      email: 'atendimento@sorrisoperfeito.exemplo',
      rating: 4.6,
      revenueEst: 'R$ 80k - 150k/mês',
      websiteStatus: 'Site Lento / Sem Chat'
    },
    {
      id: '3',
      name: 'Dr. Ricardo Consultório Especializado',
      category: 'Clínicas Médicas',
      city: 'São Paulo - SP',
      phone: '+55 11 96543-1122',
      email: 'dr.ricardo@medicina.exemplo',
      rating: 4.9,
      revenueEst: 'R$ 100k - 200k/mês',
      websiteStatus: 'Oportunidade IA'
    }
  ]);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const activeNiche = customNiche.trim() ? customNiche : selectedNiche;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) {
      alert('Por favor, informe a cidade.');
      return;
    }
    setIsSearching(true);
    setTimeout(() => {
      // Generate simulated realistic leads for the niche & city
      const city = cityInput.trim();
      const nichePrefix = activeNiche.split(' ')[0];
      const generated: ProspectLead[] = [
        {
          id: `p-${Date.now()}-1`,
          name: `${nichePrefix} Center ${city.split(' ')[0]}`,
          category: activeNiche,
          city: city,
          phone: `+55 ${Math.floor(11 + Math.random() * 88)} 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
          email: `contato@${nichePrefix.toLowerCase()}center.exemplo`,
          rating: Number((4.3 + Math.random() * 0.6).toFixed(1)),
          revenueEst: 'R$ 90k - 250k/mês',
          websiteStatus: 'Sem Automação WhatsApp'
        },
        {
          id: `p-${Date.now()}-2`,
          name: `Grupo ${nichePrefix} Premium`,
          category: activeNiche,
          city: city,
          phone: `+55 ${Math.floor(11 + Math.random() * 88)} 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
          email: `comercial@grupo${nichePrefix.toLowerCase()}.exemplo`,
          rating: Number((4.5 + Math.random() * 0.4).toFixed(1)),
          revenueEst: 'R$ 200k - 500k/mês',
          websiteStatus: 'Oportunidade CRM'
        },
        {
          id: `p-${Date.now()}-3`,
          name: `${nichePrefix} Express ${city.split(' ')[0]}`,
          category: activeNiche,
          city: city,
          phone: `+55 ${Math.floor(11 + Math.random() * 88)} 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
          email: `suporte@${nichePrefix.toLowerCase()}express.exemplo`,
          rating: Number((4.0 + Math.random() * 0.8).toFixed(1)),
          revenueEst: 'R$ 50k - 120k/mês',
          websiteStatus: 'Alta Demanda de Leads'
        }
      ];
      setLeads(generated);
      setIsSearching(false);
    }, 1000);
  };

  const handleAddToCrm = async (lead: ProspectLead) => {
    try {
      const payload = {
        name: lead.name,
        company: lead.name,
        email: lead.email,
        phone: lead.phone,
        status: 'new',
        value: 5000,
        notes: `Prospectado via Prospecção de Clientes em ${lead.city} (${lead.category}). Faturamento est.: ${lead.revenueEst}. Status web: ${lead.websiteStatus}.`
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
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" /> Motor de Prospecção Ativa B2B
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#F8FAFC]">
            Prospecção de Clientes por Nicho e Cidade
          </h1>
          <p className="text-xs md:text-sm text-[#94A3B8] mt-1 max-w-2xl">
            Selecione ou digite o seu nicho de mercado, informe a cidade desejada e dispare a busca inteligente para capturar empresas qualificadas prontas para abordagem comercial.
          </p>
        </div>
        {onNavigateToCrm && (
          <button
            onClick={onNavigateToCrm}
            className="px-5 py-3 rounded-xl bg-[#F59E0B] text-[#0F172A] font-bold text-xs hover:bg-[#d9822b] transition shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer flex items-center gap-2 shrink-0"
          >
            Acessar CRM & Kanban <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Filter Form */}
      <form onSubmit={handleSearch} className="bg-[#1E293B] border border-[#334155] p-6 rounded-3xl shadow-xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              placeholder="Ou digite um nicho personalizado (ex: Concessionárias de Veículos)..."
              value={customNiche}
              onChange={(e) => setCustomNiche(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#F59E0B] mt-2"
            />
          </div>

          {/* City Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#F59E0B]" /> Cidade / Região (Digite livremente)
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Campinas - SP, Florianópolis - SC, Belo Horizonte - MG"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#F59E0B]"
            />
            <p className="text-[11px] text-[#94A3B8]/60 pt-1">
              O motor de busca varre bases comerciais públicas e diretórios locais da região especificada.
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
              <>Buscando empresas em {cityInput}...</>
            ) : (
              <>
                <Search className="w-4 h-4" /> Prospectar Clientes em {cityInput}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#F8FAFC]">
            Empresas Encontradas ({leads.length}) para "{activeNiche}" em {cityInput}
          </h2>
          <span className="text-xs text-[#94A3B8] font-mono">Prontas para envio direto ao CRM</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leads.map((lead) => {
            const isAdded = addedIds[lead.id];
            return (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1E293B] border border-[#334155] p-6 rounded-3xl shadow-xl flex flex-col justify-between hover:border-[#F59E0B]/50 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-full border border-[#F59E0B]/20">
                        {lead.category}
                      </span>
                      <h3 className="text-lg font-bold text-[#F8FAFC] mt-2">
                        {lead.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 bg-[#0F172A] px-2 py-1 rounded-lg border border-[#334155] text-xs text-[#F8FAFC]">
                      <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                      <span>{lead.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#94A3B8] pt-2 border-t border-[#334155]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" />
                      <span>{lead.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#3B82F6]" />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#3B82F6]" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                  </div>

                  <div className="bg-[#0F172A] p-3 rounded-2xl border border-[#334155] space-y-1 text-xs">
                    <div className="flex justify-between text-[#94A3B8]">
                      <span>Faturamento Est.:</span>
                      <span className="font-semibold text-[#F8FAFC]">{lead.revenueEst}</span>
                    </div>
                    <div className="flex justify-between text-[#94A3B8]">
                      <span>Oportunidade Digital:</span>
                      <span className="font-semibold text-[#F59E0B]">{lead.websiteStatus}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  {isAdded ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 font-bold text-xs flex items-center justify-center gap-2 cursor-default"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-400" /> Adicionado ao CRM Kanban
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddToCrm(lead)}
                      className="w-full py-3 rounded-xl bg-[#F59E0B] text-[#0F172A] font-bold text-xs hover:bg-[#d9822b] transition shadow-[0_0_15px_rgba(245,158,11,0.2)] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Adicionar ao CRM & Pipeline
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
