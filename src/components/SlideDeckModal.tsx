import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Presentation,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { SlideDeckItem, AnalysisReport } from '../types';

interface SlideDeckModalProps {
  slides?: SlideDeckItem[];
  report?: AnalysisReport;
  datasetName?: string;
  onClose: () => void;
}

export const SlideDeckModal: React.FC<SlideDeckModalProps> = ({
  slides: propSlides,
  report,
  datasetName: propDatasetName,
  onClose,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  const datasetName = propDatasetName || report?.dataset_name || 'Análise de Dados';

  const slides: SlideDeckItem[] = useMemo(() => {
    if (propSlides && propSlides.length > 0) return propSlides;

    if (report) {
      const generated: SlideDeckItem[] = [];

      // Slide 1: Executive Overview
      generated.push({
        id: '1',
        title: report.title || 'Resumo Executivo & Objetivos',
        category: 'Visão Geral & Problema de Negócio',
        metricHighlight: report.insights?.[0]?.value || 'Resultados Chave',
        points: [
          `Pergunta Central: ${report.question || 'Análise de dados estratégica'}`,
          report.executive_summary || 'Análise estruturada e preditiva com o agente autônomo Gemini.',
          `Dataset: ${report.dataset_name || 'Base de dados consolidada'}`
        ],
        recommendation: report.recommendations?.[0] || 'Executar ações priorizadas com base nos insights obtidos.'
      });

      // Slide 2: Key Insights & Discoveries
      if (report.insights && report.insights.length > 0) {
        generated.push({
          id: '2',
          title: 'Principais Insights & Padrões Descobertos',
          category: 'Descobertas Estatísticas',
          metricHighlight: report.insights[1]?.value || report.insights[0]?.value,
          points: report.insights.slice(0, 4).map(ins => `${ins.title}: ${ins.detail || ins.value || ''}`),
          recommendation: 'Monitorar a evolução dessas variáveis nos próximos ciclos operacionais.'
        });
      }

      // Slide 3: Visual Analytics
      if (report.charts && report.charts.length > 0) {
        generated.push({
          id: '3',
          title: report.charts[0].title || 'Evidências Visuais e Tendências',
          category: 'Visual Analytics',
          points: [
            report.charts[0].caption || 'Distribuição analítica dos dados observados.',
            report.charts[1]?.title ? `Visualização complementar: ${report.charts[1].title}` : 'Padrões consistentes com as hipóteses formuladas.'
          ],
          recommendation: 'Utilizar essas métricas como benchmark para tomadas de decisão táticas.'
        });
      }

      // Slide 4: Strategic Recommendations & Action Plan
      if (report.recommendations && report.recommendations.length > 0) {
        generated.push({
          id: '4',
          title: 'Plano de Ação e Recomendações Estratégicas',
          category: 'Direcionamento & Próximos Passos',
          metricHighlight: `${report.recommendations.length} Ações Prioritárias`,
          points: report.recommendations.slice(0, 4),
          recommendation: 'Iniciar implementação imediata nas frentes de maior impacto e retorno sobre investimento.'
        });
      }

      return generated;
    }

    return [];
  }, [propSlides, report]);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIdx];

  const handleNext = () => {
    if (currentIdx < slides.length - 1) setCurrentIdx(currentIdx + 1);
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 backdrop-blur-md p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-5xl h-[85vh] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-neutral-100"
        >
          {/* Top Bar */}
          <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Presentation className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Deck Executivo Gemini
                </span>
                <span className="text-xs text-neutral-400 ml-2">
                  • {datasetName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-neutral-400 font-mono">
                Slide {currentIdx + 1} de {slides.length}
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Slide Content Stage */}
          <div className="flex-1 p-8 sm:p-12 flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-neutral-900 via-neutral-900/90 to-neutral-950">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Category tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                {currentSlide.category}
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug">
                {currentSlide.title}
              </h2>

              {/* Metric Highlight Card if any */}
              {currentSlide.metricHighlight && (
                <div className="inline-block px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30">
                  <div className="flex items-center gap-2 text-xs text-blue-300 font-medium">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Métrica em Destaque
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                    {currentSlide.metricHighlight}
                  </div>
                </div>
              )}

              {/* Key Bullet Points */}
              <div className="space-y-4 pt-2">
                {currentSlide.points.map((point, pIdx) => (
                  <div
                    key={pIdx}
                    className="flex items-start gap-3 text-neutral-300 text-sm sm:text-base leading-relaxed bg-neutral-800/40 p-4 rounded-2xl border border-neutral-800"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {/* Recommendation Footer if any */}
              {currentSlide.recommendation && (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Recomendação Estratégica
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-200 mt-0.5">
                      {currentSlide.recommendation}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Navigation Controls Bar */}
          <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900 flex items-center justify-between">
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentIdx
                      ? 'w-8 bg-blue-500'
                      : 'w-2 bg-neutral-700 hover:bg-neutral-600'
                  }`}
                  title={`Ir para slide ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-neutral-800 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <button
                onClick={handleNext}
                disabled={currentIdx === slides.length - 1}
                className="flex items-center gap-1 px-5 py-2 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed shadow-md transition"
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
