import React, { useState } from 'react';
import { Search, MapPin, Briefcase, Navigation, Sparkles, ShieldAlert } from 'lucide-react';

export interface SearchFilters {
  nicho: string;
  cidade: string;
  raioKm: number;
  loteTamanho: number;
}

export interface ApolloSearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading: boolean;
}

const NICHOS_POPULARES = [
  'Restaurantes e Gastronomia',
  'Clínicas Médicas e Odontológicas',
  'Academias e Personal Trainers',
  'Imobiliárias e Construtoras',
  'Escritórios de Advocacia',
  'E-commerce e Lojas Virtuais',
  'Oficinas Mecânicas e Automotivo',
  'Escolas e Cursos'
];

export const ApolloSearchFilters: React.FC<ApolloSearchFiltersProps> = ({ onSearch, isLoading }) => {
  const [nicho, setNicho] = useState(NICHOS_POPULARES[0]);
  const [cidade, setCidade] = useState('São Paulo - SP');
  const [raioKm, setRaioKm] = useState(25);
  const [loteTamanho] = useState(5); // Fixo de 5 em 5 para proteger cota

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ nicho, cidade, raioKm, loteTamanho });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl mb-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Prospector IA • Busca Inteligente (Lotes de 5)</h2>
            <p className="text-xs text-slate-400">Varredura controlada para proteger cota de Redesign e Resend de e-mail.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
          <ShieldAlert className="w-3.5 h-3.5" /> Lote seguro: 5 clientes / vez
        </div>
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
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:border-amber-500 outline-none cursor-pointer"
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
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:border-amber-500 outline-none"
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
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            {isLoading ? 'Buscando Lote...' : 'Prospectar Lote de 5 Clientes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApolloSearchFilters;
