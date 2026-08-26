import React from 'react';
import { motion } from 'motion/react';
import {
  Zap,
  PlayCircle,
  TrendingUp,
  Activity,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Users,
  Briefcase,
  Cpu
} from 'lucide-react';

interface LandingProps {
  onStart: (mode: 'crm' | 'analytics' | 'opensquad' | 'evolua_demo' | 'prospecting' | 'indicators') => void;
  onUploadFile: (fileList: FileList) => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart, onUploadFile }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n');
        if (rows.length > 100) {
          alert('Limite de 100 linhas excedido. Por favor, pague R$ 39,90 para continuar.');
        } else {
          onUploadFile(e.target!.files!);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] font-['Inter',sans-serif] selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-[#1E293B] shadow-[0_4px_20px_rgba(15,23,42,0.5)]">
        <div className="flex justify-between items-center px-6 md:px-16 py-4 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F59E0B] to-[#3B82F6] flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              <Zap className="w-4 h-4 text-[#0F172A] fill-[#0F172A]" />
            </div>
            <span className="font-['Inter'] text-xl font-extrabold text-[#F8FAFC] tracking-tight">
              Foco em Dados
            </span>
          </div>
        </div>
      </nav>

      <section className="py-24 px-6 max-w-[1440px] mx-auto pt-32 text-center">
        <div className="bg-[#1E293B] p-8 rounded-2xl border border-[#334155]">
          <h2 className="text-xl font-bold mb-4">Subir Planilha</h2>
          <input type="file" onChange={handleFileUpload} className="block w-full text-sm text-neutral-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-amber-500 file:text-[#0F172A]
            hover:file:bg-amber-400
          "/>
        </div>
      </section>
      
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#F8FAFC] tracking-tight leading-tight">
                Decisões baseadas em dados.
            </h1>
        </div>
      </section>

      <footer className="border-t border-[#1E293B] py-12 px-6 max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#94A3B8]">
        <span>© {new Date().getFullYear()} Foco em Dados.</span>
      </footer>
    </div>
  );
};

