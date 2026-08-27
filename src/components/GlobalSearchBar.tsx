import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { getLeads, getReports, SavedReport } from '../lib/firestore';
import { Lead } from '../types';

export const GlobalSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [filteredResults, setFilteredResults] = useState<{ type: 'lead' | 'report', id: string, title: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      const [fetchedLeads, fetchedReports] = await Promise.all([getLeads(), getReports()]);
      setLeads(fetchedLeads);
      setReports(fetchedReports);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!query) {
      setFilteredResults([]);
      setIsOpen(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = [
      ...leads
        .filter(l => l.nome.toLowerCase().includes(lowerQuery))
        .map(l => ({ type: 'lead' as const, id: l.slug, title: `Lead: ${l.nome}` })),
      ...reports
        .filter(r => r.report.title.toLowerCase().includes(lowerQuery))
        .map(r => ({ type: 'report' as const, id: r.id, title: `Report: ${r.report.title}` }))
    ];

    setFilteredResults(results);
    setIsOpen(results.length > 0);
  }, [query, leads, reports]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Pesquisar leads ou relatórios..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-full py-2 pl-10 pr-4 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 text-neutral-400 hover:text-neutral-200">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden z-50">
          {filteredResults.map(res => (
            <div key={`${res.type}-${res.id}`} className="px-4 py-3 hover:bg-neutral-800 text-sm cursor-pointer text-neutral-300">
              {res.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
