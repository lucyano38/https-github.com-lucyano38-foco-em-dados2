import React, { useState } from 'react';
import { Search, MapPin, Briefcase, Navigation, Sparkles } from 'lucide-react';
import { NICHOS as NICHOS_POPULARES } from '../lib/constants';

export interface SearchFilters {
  nicho: string;
  cidade: string;
  raioKm: number;
  termoBusca: string;
}

export interface ApolloSearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading: boolean;
}

export const ApolloSearchFilters: React.FC<ApolloSearchFiltersProps> = ({ onSearch, isLoading }) => {
  const [nicho, setNicho] = useState(NICHOS_POPULARES[0]);
  const [cidade, setCidade] = useState('São Paulo - SP');
  const [raioKm, setRaioKm] = useState(25);
  const [termoBusca, setTermoBusca] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ nicho, cidade, raioKm, termoBusca });
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 shadow-[0_1px_0_rgba(255,255,255,0.05)] mb-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#d4a574]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#f7f8f8]">Busca Avançada de Leads B2B</h2>
            <p className="text-xs text-[#8a8f98]">Filtre por nicho, cidade e raio de distância com inteligência artificial.</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-[#d4d6e0] bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.08]">
          Base Ativa: 14.892+ Empresas
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Nicho / CNAE */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" /> Nicho / Setor
          </label>
          <select
            value={nicho}
            onChange={(e) => setNicho(e.target.value)}
            className="w-full bg-[#010102] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-[#f7f8f8] focus:border-[#d4a574] outline-none cursor-pointer"
          >
            {NICHOS_POPULARES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Cidade / Região */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" /> Cidade / Estado
          </label>
          <input
            type="text"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Ex: Curitiba - PR"
            className="w-full bg-[#010102] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-[#f7f8f8] focus:border-[#d4a574] outline-none"
            required
          />
        </div>

        {/* Raio de Distância (km) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-amber-400" /> Raio de Busca: {raioKm} km
          </label>
          <div className="flex items-center gap-3 pt-2">
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={raioKm}
              onChange={(e) => setRaioKm(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-xs font-mono text-amber-400 w-12 text-right">{raioKm} km</span>
          </div>
        </div>

        {/* Botão de Busca */}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            {isLoading ? 'Buscando Leads...' : 'Prospectar Empresas'}
          </button>
        </div>
      </form>
    </div>
  );
};
