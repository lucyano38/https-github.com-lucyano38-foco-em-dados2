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
  Instagram,
  Linkedin,
  Compass,
  FileCode
} from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firestore';

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
  const [radius, setRadius] = useState('5000');
  const [selectedCnae, setSelectedCnae] = useState(COMMON_CNAES[0].code);
  const [customCnae, setCustomCnae] = useState('');
  const [sources, setSources] = useState({ maps: true, instagram: true, linkedin: true });
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
      let foundLeads: ProspectLead[] = [];
      if (radius && parseInt(radius) > 0) {
        // Mock geolocation for now - in a real app, use Geolocation API
        const lat = -23.5505; // São Paulo
        const lng = -46.6333;
        const res = await fetch(`/api/nearby-search?lat=${lat}&lng=${lng}&radius=${radius}&type=spa`);
        const data = await res.json();
        if (data.results) {
          foundLeads = data.results.map((place: any) => ({
            id: place.place_id,
            name: place.name,
            category: 'spa',
            city: cityInput,
            phone: 'N/A',
            email: 'N/A',
            rating: place.rating || 0,
            reviewsCount: place.user_ratings_total || 0,
            revenueEst: 'N/A',
            websiteStatus: 'N/A',
            address: place.vicinity
          }));
          // Automatically save to Firestore
          foundLeads.forEach(async (lead) => {
            try {
                await addDoc(collection(db, 'leads'), lead);
            } catch (err) {
                console.error('Error saving lead to Firestore:', err);
            }
          });
        }
      }
      const res = await fetch('/api/prospecting/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: activeNiche,
          city: cityInput.trim(),
          cnae: activeCnae,
          sources
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
    <div className="max-w-[1440px] mx-auto space-y-10 p-4 md:p-8 font-sans bg-[#0f172a] text-[#f4f4f5]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[#1e293b] p-8 rounded-3xl shadow-xl border border-[#334155]">
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="bg-[#22c55e]/20 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Compass className="w-4 h-4" /> Inteligência de Mercado
            </span>
            <span className="bg-[#eab308]/20 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Automação de Redesign
            </span>
          </div>
          <h1 className="text-4xl font-display text-white">
            Prospecção Multicanal B2B
          </h1>
          <p className="text-sm text-white/70 mt-2 max-w-2xl font-sans">
            Enriqueça leads cruzando dados de redes sociais, mapas e CNAE, com automação direta para CRM e túneis de redesign.
          </p>
        </div>
        {onNavigateToCrm && (
          <button
            onClick={onNavigateToCrm}
            className="px-8 py-4 rounded-2xl bg-[#eab308] text-[#0f172a] font-display font-bold text-sm hover:bg-[#facc15] transition shadow-lg flex items-center gap-2 shrink-0"
          >
            Acessar CRM & Redesign Túnel <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Filter Form */}
      <form onSubmit={handleSearch} className="bg-[#1e293b] p-8 rounded-3xl shadow-xl border border-[#334155] space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Niche Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#facc15]" /> Nicho de Mercado
            </label>
            <select
              value={selectedNiche}
              onChange={(e) => {
                setSelectedNiche(e.target.value);
                setCustomNiche('');
              }}
              className="w-full bg-serenity-cream border border-serenity-rose/30 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-serenity-gold"
            >
              {COMMON_NICHES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* CNAE Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#facc15]" /> Código ou Descrição CNAE
            </label>
            <select
              value={selectedCnae}
              onChange={(e) => {
                setSelectedCnae(e.target.value);
                setCustomCnae('');
              }}
              className="w-full bg-serenity-cream border border-serenity-rose/30 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-serenity-gold"
            >
              {COMMON_CNAES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} - {c.desc}</option>
              ))}
            </select>
          </div>

          {/* City Input */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#facc15]" /> Cidade / Estado
            </label>
            <input
              type="text"
              required
              placeholder="Ex: São Paulo - SP"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="w-full bg-serenity-cream border border-serenity-rose/30 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-serenity-gold"
            />
          </div>

          {/* Radius Input */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#facc15]" /> Raio (km)
            </label>
            <input
              type="number"
              placeholder="Ex: 5"
              value={Math.round(parseInt(radius) / 1000)}
              onChange={(e) => setRadius((parseInt(e.target.value) * 1000).toString())}
              className="w-full bg-serenity-cream border border-serenity-rose/30 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-serenity-gold"
            />
          </div>

          {/* Enrichment Sources */}
          <div className="lg:col-span-4 space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#facc15]" /> Fontes de Dados
            </label>
            <div className="flex flex-wrap gap-6 pt-2">
              {[
                { id: 'maps', label: 'Google Maps' },
                { id: 'instagram', label: 'Instagram' },
                { id: 'linkedin', label: 'LinkedIn' },
              ].map(source => (
                <label key={source.id} className="flex items-center gap-3 text-sm text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sources[source.id as keyof typeof sources]}
                    onChange={(e) => setSources(prev => ({ ...prev, [source.id]: e.target.checked }))}
                    className="accent-serenity-gold w-4 h-4"
                  />
                  {source.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-serenity-rose/20">
          <button
            type="submit"
            disabled={isSearching}
            className="px-10 py-4 rounded-2xl bg-[#eab308] text-[#0f172a] font-display font-bold text-sm hover:bg-[#eab308]/80 transition shadow-lg cursor-pointer flex items-center gap-3 disabled:opacity-50"
          >
            {isSearching ? (
              <>Varrendo dados...</>
            ) : (
              <>
                <Search className="w-4 h-4" /> Iniciar Prospecção
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-display text-white">
          Empresas Descobertas ({leads.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {leads.map((lead) => {
            const isAdded = addedIds[lead.id];
            return (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#18181b] p-8 rounded-3xl shadow-xl border border-[#27272a] flex flex-col justify-between hover:border-serenity-gold/50 transition"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#facc15] bg-serenity-cream px-3 py-1 rounded-full border border-serenity-rose/30">
                        CNAE: {lead.cnaeCode || activeCnae}
                      </span>
                      <h3 className="text-xl font-display text-white font-semibold mt-3">
                        {lead.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 bg-serenity-cream px-3 py-1 rounded-full text-xs font-semibold text-white">
                      <Star className="w-4 h-4 text-serenity-gold fill-serenity-gold" />
                      <span>{lead.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-white/80 font-sans">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-[#22c55e]" />
                      <span className="truncate">{lead.address || lead.city}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-[#22c55e]" />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-[#22c55e]" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  {isAdded ? (
                    <button
                      disabled
                      className="w-full py-4 rounded-2xl bg-[#22c55e]/20 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-default"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e]" /> Lead Adicionado
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddToCrm(lead)}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#eab308] to-[#3b82f6] font-display font-bold text-sm hover:opacity-95 transition shadow-lg cursor-pointer flex items-center justify-center gap-2 text-[#0f172a]"
                    >
                      <Sparkles className="w-4 h-4" /> Gerar Redesign & Enviar ao CRM
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
