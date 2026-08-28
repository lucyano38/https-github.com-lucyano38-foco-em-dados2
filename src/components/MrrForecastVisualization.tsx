import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  Filter,
  Sliders,
  Maximize2,
  Info,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Target,
  BarChart2,
  LineChart as LineChartIcon,
  RefreshCw,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { Lead, LeadStatus } from '../types';

export interface MrrForecastProps {
  leads: Lead[];
  defaultMaintenanceTicket?: number; // default R$ when lead doesn't specify
}

export type ForecastHorizon = 6 | 12 | 18 | 24;
export type ChartDisplayMode = 'scenario-curves' | 'waterfall-composition' | 'arr-runrate';

interface MonthDataPoint {
  monthIndex: number;
  monthLabel: string;
  dateStr: string;
  isHistorical: boolean;
  // Scenario MRRs
  mrrBase: number;
  mrrConservative: number;
  mrrOptimistic: number;
  // Waterfall components for base scenario
  pipelineAddedMrr: number;
  churnMrr: number;
  organicExpansionMrr: number;
  // ARR equivalents
  arrBase: number;
  arrOptimistic: number;
  arrConservative: number;
  // Active client accounts projection
  clientsBase: number;
  growthPct: number;
}

const STAGE_WEIGHTS: Record<LeadStatus, { prob: number; label: string; color: string }> = {
  fechado: { prob: 1.0, label: 'Fechado (100%)', color: '#10b981' },
  respondeu: { prob: 0.7, label: 'Respondeu (70%)', color: '#3b82f6' },
  proposta: { prob: 0.5, label: 'Proposta (50%)', color: '#f59e0b' },
  publicado: { prob: 0.35, label: 'Publicado (35%)', color: '#06b6d4' },
  redesenhado: { prob: 0.25, label: 'Redesenhado (25%)', color: '#8b5cf6' },
  novo: { prob: 0.1, label: 'Novo Lead (10%)', color: '#64748b' },
  descartado: { prob: 0.0, label: 'Descartado (0%)', color: '#94a3b8' },
};

export const MrrForecastVisualization: React.FC<MrrForecastProps> = ({
  leads,
  defaultMaintenanceTicket = 190,
}) => {
  // State for controls
  const [horizon, setHorizon] = useState<ForecastHorizon>(12);
  const [displayMode, setDisplayMode] = useState<ChartDisplayMode>('scenario-curves');
  const [churnRate, setChurnRate] = useState<number>(1.5); // % per month
  const [conversionMultiplier, setConversionMultiplier] = useState<number>(100); // % of default weights (50% - 150%)
  const [ticketOverride, setTicketOverride] = useState<number>(defaultMaintenanceTicket);
  const [activeScenarioFilter, setActiveScenarioFilter] = useState<'all' | 'base' | 'optimistic' | 'conservative'>('all');
  const [showTable, setShowTable] = useState(false);
  const [showDealsList, setShowDealsList] = useState(false);

  // Hover state for tooltip & crosshair
  const [hoveredPoint, setHoveredPoint] = useState<MonthDataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // SVG & Container ref for D3
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // 1. Calculate Pipeline and Baseline Metrics from Real CRM Leads
  const {
    currentMrr,
    currentClosedClients,
    totalPipelineMrrPotential,
    weightedPipelineMrrMonthly,
    dealContributions,
  } = useMemo(() => {
    let closedMrr = 0;
    let closedCount = 0;
    let potentialMrrSum = 0;
    let weightedMrrSum = 0;

    const deals: Array<{
      lead: Lead;
      ticket: number;
      prob: number;
      weightedMrr: number;
      statusCfg: { prob: number; label: string; color: string };
    }> = [];

    leads.forEach((l) => {
      const ticket = l.manutencao && l.manutencao > 0 ? l.manutencao : ticketOverride;
      const statusCfg = STAGE_WEIGHTS[l.status] || STAGE_WEIGHTS.novo;
      const adjustedProb = Math.min(1.0, Math.max(0, (statusCfg.prob * conversionMultiplier) / 100));
      const weightedVal = ticket * adjustedProb;

      if (l.status === 'fechado') {
        closedMrr += ticket;
        closedCount += 1;
      } else if (l.status !== 'descartado') {
        potentialMrrSum += ticket;
        weightedMrrSum += weightedVal;
        deals.push({
          lead: l,
          ticket,
          prob: adjustedProb,
          weightedMrr: weightedVal,
          statusCfg,
        });
      }
    });

    // Sort deals by weighted MRR impact
    deals.sort((a, b) => b.weightedMrr - a.weightedMrr);

    return {
      currentMrr: closedMrr,
      currentClosedClients: closedCount,
      totalPipelineMrrPotential: potentialMrrSum,
      weightedPipelineMrrMonthly: weightedMrrSum,
      dealContributions: deals,
    };
  }, [leads, ticketOverride, conversionMultiplier]);

  // 2. Generate Forecast Points Month by Month
  const forecastData: MonthDataPoint[] = useMemo(() => {
    const points: MonthDataPoint[] = [];
    const now = new Date();

    // Baseline point (Month 0: Today)
    const currentGrowth = 0;
    points.push({
      monthIndex: 0,
      monthLabel: 'Hoje (Atual)',
      dateStr: now.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      isHistorical: true,
      mrrBase: currentMrr,
      mrrConservative: currentMrr,
      mrrOptimistic: currentMrr,
      pipelineAddedMrr: 0,
      churnMrr: 0,
      organicExpansionMrr: 0,
      arrBase: currentMrr * 12,
      arrOptimistic: currentMrr * 12,
      arrConservative: currentMrr * 12,
      clientsBase: currentClosedClients,
      growthPct: 0,
    });

    let runningBaseMrr = currentMrr;
    let runningConsMrr = currentMrr;
    let runningOptMrr = currentMrr;
    let runningClients = currentClosedClients;

    // Monthly pipeline realization distribution over time
    // Most deals close within first 3 to 6 months
    for (let m = 1; m <= horizon; m++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + m, 1);
      const label = `Mês ${m} (${monthDate.toLocaleDateString('pt-BR', { month: 'short' })})`;

      // Conversion distribution decaying over horizon
      // Deals close progressively over time with velocity factor
      const velocityDecay = Math.exp(-0.25 * (m - 1));
      const monthlyRealizationFactor = 0.35 * velocityDecay;

      // Base Scenario Calculations
      const monthlyPipelineInflowBase = weightedPipelineMrrMonthly * monthlyRealizationFactor;
      const monthlyChurnBase = (runningBaseMrr * (churnRate / 100));
      const monthlyOrganicExpansionBase = runningBaseMrr * 0.01; // 1% organic expansion / upsell

      runningBaseMrr = Math.max(0, runningBaseMrr + monthlyPipelineInflowBase + monthlyOrganicExpansionBase - monthlyChurnBase);

      // Conservative Scenario: 50% realization, 2.5x churn, 0% organic
      const monthlyPipelineInflowCons = (weightedPipelineMrrMonthly * 0.5) * monthlyRealizationFactor;
      const monthlyChurnCons = runningConsMrr * ((churnRate * 2.0) / 100);
      runningConsMrr = Math.max(0, runningConsMrr + monthlyPipelineInflowCons - monthlyChurnCons);

      // Optimistic Scenario: 1.4x realization, 0.4x churn, 2.5% organic expansion
      const monthlyPipelineInflowOpt = (weightedPipelineMrrMonthly * 1.4) * monthlyRealizationFactor;
      const monthlyChurnOpt = runningOptMrr * ((churnRate * 0.4) / 100);
      const monthlyOrganicExpansionOpt = runningOptMrr * 0.025;
      runningOptMrr = Math.max(0, runningOptMrr + monthlyPipelineInflowOpt + monthlyOrganicExpansionOpt - monthlyChurnOpt);

      // Estimate active clients
      const avgTicket = ticketOverride > 0 ? ticketOverride : 190;
      runningClients = Math.max(currentClosedClients, Math.round(runningBaseMrr / avgTicket));

      const growthFromBaseline = currentMrr > 0 ? ((runningBaseMrr - currentMrr) / currentMrr) * 100 : 0;

      points.push({
        monthIndex: m,
        monthLabel: label,
        dateStr: monthDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        isHistorical: false,
        mrrBase: Math.round(runningBaseMrr),
        mrrConservative: Math.round(runningConsMrr),
        mrrOptimistic: Math.round(runningOptMrr),
        pipelineAddedMrr: Math.round(monthlyPipelineInflowBase),
        churnMrr: Math.round(monthlyChurnBase),
        organicExpansionMrr: Math.round(monthlyOrganicExpansionBase),
        arrBase: Math.round(runningBaseMrr * 12),
        arrOptimistic: Math.round(runningOptMrr * 12),
        arrConservative: Math.round(runningConsMrr * 12),
        clientsBase: runningClients,
        growthPct: Math.round(growthFromBaseline),
      });
    }

    return points;
  }, [horizon, currentMrr, currentClosedClients, weightedPipelineMrrMonthly, churnRate, ticketOverride]);

  // Forecast Highlights
  const endPoint = forecastData[forecastData.length - 1];
  const projected12MMrr = endPoint?.mrrBase || 0;
  const projected12MArr = endPoint?.arrBase || 0;
  const growthRate12M = endPoint?.growthPct || 0;
  const opt12MMrr = endPoint?.mrrOptimistic || 0;
  const cons12MMrr = endPoint?.mrrConservative || 0;

  // 3. D3 SVG Rendering Engine
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || forecastData.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = 380;
    const margin = { top: 25, right: 35, bottom: 45, left: 75 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', 'max-width: 100%; height: auto;');

    // Defs for gradients & filters
    const defs = svg.append('defs');

    // Confidence Cone Gradient (Emerald / Indigo)
    const coneGrad = defs
      .append('linearGradient')
      .attr('id', 'mrr-cone-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    coneGrad.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.22);
    coneGrad.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.12);

    // Area Under Base Curve Gradient
    const baseAreaGrad = defs
      .append('linearGradient')
      .attr('id', 'mrr-base-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    baseAreaGrad.append('stop').attr('offset', '0%').attr('stop-color', '#2563eb').attr('stop-opacity', 0.28);
    baseAreaGrad.append('stop').attr('offset', '100%').attr('stop-color', '#2563eb').attr('stop-opacity', 0.02);

    // Glow filter for main line
    const filter = defs.append('filter').attr('id', 'glow-shadow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feDropShadow').attr('dx', '0').attr('dy', '3').attr('stdDeviation', '4').attr('flood-color', '#2563eb').attr('flood-opacity', '0.25');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const xScale = d3
      .scaleLinear()
      .domain([0, horizon])
      .range([0, innerWidth]);

    // Y Scale (Max of optimistic or ARR depending on mode)
    const maxVal =
      displayMode === 'arr-runrate'
        ? d3.max(forecastData, (d) => d.arrOptimistic) || 10000
        : d3.max(forecastData, (d) => Math.max(d.mrrOptimistic, d.mrrBase * 1.15)) || 5000;

    const yScale = d3
      .scaleLinear()
      .domain([0, maxVal * 1.12])
      .range([innerHeight, 0])
      .nice();

    // Background Grid lines
    const yGrid = d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid y-grid')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-opacity', 0.8);
    g.select('.y-grid .domain').remove();

    // ─── RENDER MODE: SCENARIO CURVES & CONFIDENCE CONE ───
    if (displayMode === 'scenario-curves') {
      // 1. Confidence Cone Area (between Conservative & Optimistic)
      if (activeScenarioFilter === 'all') {
        const coneAreaGenerator = d3
          .area<MonthDataPoint>()
          .x((d) => xScale(d.monthIndex))
          .y0((d) => yScale(d.mrrConservative))
          .y1((d) => yScale(d.mrrOptimistic))
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(forecastData)
          .attr('fill', 'url(#mrr-cone-gradient)')
          .attr('stroke', 'none')
          .attr('d', coneAreaGenerator);
      }

      // 2. Base Area Fill
      if (activeScenarioFilter === 'all' || activeScenarioFilter === 'base') {
        const baseAreaGenerator = d3
          .area<MonthDataPoint>()
          .x((d) => xScale(d.monthIndex))
          .y0(innerHeight)
          .y1((d) => yScale(d.mrrBase))
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(forecastData)
          .attr('fill', 'url(#mrr-base-area-gradient)')
          .attr('d', baseAreaGenerator);
      }

      // Line generators
      const lineOptimistic = d3
        .line<MonthDataPoint>()
        .x((d) => xScale(d.monthIndex))
        .y((d) => yScale(d.mrrOptimistic))
        .curve(d3.curveMonotoneX);

      const lineConservative = d3
        .line<MonthDataPoint>()
        .x((d) => xScale(d.monthIndex))
        .y((d) => yScale(d.mrrConservative))
        .curve(d3.curveMonotoneX);

      const lineBase = d3
        .line<MonthDataPoint>()
        .x((d) => xScale(d.monthIndex))
        .y((d) => yScale(d.mrrBase))
        .curve(d3.curveMonotoneX);

      // Render Optimistic Line
      if (activeScenarioFilter === 'all' || activeScenarioFilter === 'optimistic') {
        g.append('path')
          .datum(forecastData)
          .attr('fill', 'none')
          .attr('stroke', '#10b981')
          .attr('stroke-width', 2.2)
          .attr('stroke-dasharray', '5,4')
          .attr('d', lineOptimistic);
      }

      // Render Conservative Line
      if (activeScenarioFilter === 'all' || activeScenarioFilter === 'conservative') {
        g.append('path')
          .datum(forecastData)
          .attr('fill', 'none')
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 2.2)
          .attr('stroke-dasharray', '4,4')
          .attr('d', lineConservative);
      }

      // Render Base Line (Main Forecast)
      if (activeScenarioFilter === 'all' || activeScenarioFilter === 'base') {
        g.append('path')
          .datum(forecastData)
          .attr('fill', 'none')
          .attr('stroke', '#2563eb')
          .attr('stroke-width', 3.2)
          .attr('filter', 'url(#glow-shadow)')
          .attr('d', lineBase);
      }

      // Data nodes (circles on base line)
      g.selectAll('.node-base')
        .data(forecastData)
        .enter()
        .append('circle')
        .attr('class', 'node-base')
        .attr('cx', (d) => xScale(d.monthIndex))
        .attr('cy', (d) => yScale(d.mrrBase))
        .attr('r', (d) => (d.monthIndex === 0 || d.monthIndex === horizon ? 5.5 : 3.5))
        .attr('fill', (d) => (d.monthIndex === 0 ? '#1e293b' : '#2563eb'))
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);
    }

    // ─── RENDER MODE: WATERFALL COMPOSITION ───
    else if (displayMode === 'waterfall-composition') {
      const barWidth = Math.max(12, Math.min(32, (innerWidth / horizon) * 0.55));

      forecastData.forEach((d) => {
        if (d.monthIndex === 0) return;
        const xCenter = xScale(d.monthIndex);

        // Stack: Base MRR bar
        const yTop = yScale(d.mrrBase);
        const barHeight = innerHeight - yTop;

        g.append('rect')
          .attr('x', xCenter - barWidth / 2)
          .attr('y', yTop)
          .attr('width', barWidth)
          .attr('height', Math.max(2, barHeight))
          .attr('rx', 4)
          .attr('fill', '#3b82f6')
          .attr('opacity', 0.85);

        // Pipeline Added Indicator
        if (d.pipelineAddedMrr > 0) {
          const addedHeight = Math.max(2, innerHeight - yScale(d.pipelineAddedMrr));
          g.append('rect')
            .attr('x', xCenter - barWidth / 2)
            .attr('y', yTop - addedHeight)
            .attr('width', barWidth)
            .attr('height', addedHeight)
            .attr('rx', 3)
            .attr('fill', '#10b981')
            .attr('opacity', 0.9);
        }
      });
    }

    // ─── RENDER MODE: ARR RUN RATE ───
    else if (displayMode === 'arr-runrate') {
      const lineArrBase = d3
        .line<MonthDataPoint>()
        .x((d) => xScale(d.monthIndex))
        .y((d) => yScale(d.arrBase))
        .curve(d3.curveMonotoneX);

      const arrAreaGenerator = d3
        .area<MonthDataPoint>()
        .x((d) => xScale(d.monthIndex))
        .y0(innerHeight)
        .y1((d) => yScale(d.arrBase))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(forecastData)
        .attr('fill', 'url(#mrr-cone-gradient)')
        .attr('d', arrAreaGenerator);

      g.append('path')
        .datum(forecastData)
        .attr('fill', 'none')
        .attr('stroke', '#6366f1')
        .attr('stroke-width', 3)
        .attr('d', lineArrBase);

      g.selectAll('.node-arr')
        .data(forecastData)
        .enter()
        .append('circle')
        .attr('class', 'node-arr')
        .attr('cx', (d) => xScale(d.monthIndex))
        .attr('cy', (d) => yScale(d.arrBase))
        .attr('r', 4)
        .attr('fill', '#4f46e5')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);
    }

    // 4. Milestone / Current Day Vertical Line
    g.append('line')
      .attr('x1', xScale(0))
      .attr('x2', xScale(0))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,3');

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(horizon, 12))
      .tickFormat((d) => {
        const val = Number(d);
        if (val === 0) return 'Hoje';
        return `M${val}`;
      });

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => {
        const val = Number(d);
        if (val >= 1000) return `R$ ${(val / 1000).toFixed(1)}k`;
        return `R$ ${val}`;
      });

    const gX = g.append('g').attr('class', 'axis x-axis').attr('transform', `translate(0,${innerHeight})`).call(xAxis);
    gX.selectAll('text').attr('font-size', '11px').attr('fill', '#64748b').attr('dy', '12px');
    gX.select('.domain').attr('stroke', '#cbd5e1');

    const gY = g.append('g').attr('class', 'axis y-axis').call(yAxis);
    gY.selectAll('text').attr('font-size', '11px').attr('fill', '#64748b');
    gY.select('.domain').remove();

    // 5. Interactive Bisect & Hover Crosshair Overlay
    const bisect = d3.bisector<MonthDataPoint, number>((d) => d.monthIndex).center;

    // Crosshair elements
    const crosshair = g.append('g').attr('class', 'crosshair').style('display', 'none');

    const crosshairLine = crosshair
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#334155')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3');

    const focusDotBase = crosshair.append('circle').attr('r', 6).attr('fill', '#2563eb').attr('stroke', '#ffffff').attr('stroke-width', 2.5);
    const focusDotOpt = crosshair.append('circle').attr('r', 5).attr('fill', '#10b981').attr('stroke', '#ffffff').attr('stroke-width', 2);
    const focusDotCons = crosshair.append('circle').attr('r', 5).attr('fill', '#f59e0b').attr('stroke', '#ffffff').attr('stroke-width', 2);

    // Full overlay rect to capture mouse events
    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mousemove', function (event) {
        const [mx] = d3.pointer(event);
        const xVal = xScale.invert(mx);
        const index = bisect(forecastData, xVal);
        const point = forecastData[Math.max(0, Math.min(forecastData.length - 1, index))];

        if (point) {
          setHoveredPoint(point);
          const cx = xScale(point.monthIndex);
          crosshair.style('display', null);
          crosshairLine.attr('x1', cx).attr('x2', cx);

          if (displayMode === 'scenario-curves') {
            focusDotBase.attr('cx', cx).attr('cy', yScale(point.mrrBase)).style('display', null);
            focusDotOpt.attr('cx', cx).attr('cy', yScale(point.mrrOptimistic)).style('display', activeScenarioFilter === 'all' || activeScenarioFilter === 'optimistic' ? null : 'none');
            focusDotCons.attr('cx', cx).attr('cy', yScale(point.mrrConservative)).style('display', activeScenarioFilter === 'all' || activeScenarioFilter === 'conservative' ? null : 'none');
          } else if (displayMode === 'arr-runrate') {
            focusDotBase.attr('cx', cx).attr('cy', yScale(point.arrBase)).style('display', null);
            focusDotOpt.style('display', 'none');
            focusDotCons.style('display', 'none');
          } else {
            focusDotBase.attr('cx', cx).attr('cy', yScale(point.mrrBase)).style('display', null);
            focusDotOpt.style('display', 'none');
            focusDotCons.style('display', 'none');
          }

          // Tooltip position relative to container
          const rectBounds = container.getBoundingClientRect();
          setTooltipPos({
            x: Math.min(rectBounds.width - 240, Math.max(10, cx + margin.left - 100)),
            y: Math.max(10, (yScale(point.mrrBase) + margin.top) - 100),
          });
        }
      })
      .on('mouseleave', function () {
        crosshair.style('display', 'none');
        setHoveredPoint(null);
        setTooltipPos(null);
      });
  }, [forecastData, horizon, displayMode, activeScenarioFilter]);

  // Handle Window / Container Resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      // Force trigger state to re-render svg dimensions
      setConversionMultiplier((prev) => prev);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm overflow-hidden flex flex-col space-y-6 p-6">
      {/* ─── HEADER & VALUE PROPOSITION ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-neutral-900 tracking-tight font-sans">
                Previsão de Receita Recorrente Mensal (MRR Forecast)
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Motor D3.js Preditivo
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Projeção estatística ponderada por estágio de funil, velocidade de conversão e taxa de retenção mensal.
            </p>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-neutral-100 p-1 rounded-xl flex items-center border border-neutral-200/70 text-xs">
            <button
              onClick={() => setDisplayMode('scenario-curves')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                displayMode === 'scenario-curves'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              Cenários & Faixas
            </button>
            <button
              onClick={() => setDisplayMode('waterfall-composition')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                displayMode === 'waterfall-composition'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Composição Mensal
            </button>
            <button
              onClick={() => setDisplayMode('arr-runrate')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                displayMode === 'arr-runrate'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              ARR Run Rate (Anual)
            </button>
          </div>

          {/* Horizon Dropdown */}
          <div className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200/70 text-xs font-semibold text-neutral-700">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value) as ForecastHorizon)}
              className="bg-transparent font-bold text-neutral-900 focus:outline-none cursor-pointer"
            >
              <option value={6}>6 Meses</option>
              <option value={12}>12 Meses (1 Ano)</option>
              <option value={18}>18 Meses</option>
              <option value={24}>24 Meses (2 Anos)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── KPI METRIC SUMMARY CARDS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide flex items-center justify-between">
            <span>MRR Atual</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-neutral-900 mt-1">
            R$ {currentMrr.toLocaleString('pt-BR')}/mês
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">
            {currentClosedClients} {currentClosedClients === 1 ? 'cliente ativo' : 'clientes ativos'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide flex items-center justify-between">
            <span>MRR Previsto ({horizon}M)</span>
            <Target className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-blue-900 mt-1">
            R$ {projected12MMrr.toLocaleString('pt-BR')}/mês
          </div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            +{growthRate12M}% vs baseline
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wide flex items-center justify-between">
            <span>ARR Run Rate ({horizon}M)</span>
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-indigo-900 mt-1">
            R$ {projected12MArr.toLocaleString('pt-BR')}
          </div>
          <div className="text-[10px] text-indigo-600 mt-1">
            Receita anual recorrente projetada
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide flex items-center justify-between">
            <span>Cenário Otimista</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-900 mt-1">
            R$ {opt12MMrr.toLocaleString('pt-BR')}/mês
          </div>
          <div className="text-[10px] text-emerald-700 mt-1">
            Alta conversão + expansão orgânica
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide flex items-center justify-between">
            <span>Pipeline em Jogo</span>
            <Layers className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-extrabold text-amber-900 mt-1">
            R$ {totalPipelineMrrPotential.toLocaleString('pt-BR')}/mês
          </div>
          <div className="text-[10px] text-amber-700 mt-1">
            Ponderado: R$ {Math.round(weightedPipelineMrrMonthly).toLocaleString('pt-BR')}/mês
          </div>
        </div>
      </div>

      {/* ─── D3 CHART CANVAS & TOOLTIP CONTAINER ─── */}
      <div className="relative bg-white rounded-2xl border border-neutral-200/80 p-3 pt-4" ref={containerRef}>
        {/* Scenario Legend & Filters */}
        <div className="flex items-center justify-between px-3 pb-2 text-xs flex-wrap gap-2 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <span className="text-neutral-500 font-medium">Séries:</span>
            <button
              onClick={() => setActiveScenarioFilter(activeScenarioFilter === 'base' ? 'all' : 'base')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition font-semibold ${
                activeScenarioFilter === 'all' || activeScenarioFilter === 'base'
                  ? 'text-blue-700 bg-blue-50/80'
                  : 'text-neutral-400 opacity-60'
              }`}
            >
              <span className="w-3 h-1 bg-blue-600 rounded-full" />
              Ponderado (Base)
            </button>
            <button
              onClick={() => setActiveScenarioFilter(activeScenarioFilter === 'optimistic' ? 'all' : 'optimistic')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition font-semibold ${
                activeScenarioFilter === 'all' || activeScenarioFilter === 'optimistic'
                  ? 'text-emerald-700 bg-emerald-50/80'
                  : 'text-neutral-400 opacity-60'
              }`}
            >
              <span className="w-3 h-1 bg-emerald-500 rounded-full border-t border-dashed border-emerald-700" />
              Otimista
            </button>
            <button
              onClick={() => setActiveScenarioFilter(activeScenarioFilter === 'conservative' ? 'all' : 'conservative')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition font-semibold ${
                activeScenarioFilter === 'all' || activeScenarioFilter === 'conservative'
                  ? 'text-amber-700 bg-amber-50/80'
                  : 'text-neutral-400 opacity-60'
              }`}
            >
              <span className="w-3 h-1 bg-amber-500 rounded-full border-t border-dashed border-amber-700" />
              Conservador
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <span>Passe o cursor sobre a curva para inspecionar</span>
          </div>
        </div>

        {/* The SVG element rendered by D3 */}
        <div className="w-full overflow-hidden min-h-[360px] flex items-center justify-center">
          <svg ref={svgRef} className="w-full select-none" />
        </div>

        {/* Floating Tooltip Card */}
        {hoveredPoint && tooltipPos && (
          <div
            className="absolute z-20 pointer-events-none bg-neutral-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-neutral-700 text-xs backdrop-blur-md transition-all duration-75 w-64"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
            }}
          >
            <div className="flex items-center justify-between border-b border-neutral-700/80 pb-2 mb-2">
              <span className="font-bold text-neutral-100 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                {hoveredPoint.monthLabel}
              </span>
              <span className="font-mono text-[10px] text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded">
                {hoveredPoint.dateStr}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-blue-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  MRR Ponderado:
                </span>
                <span>R$ {hoveredPoint.mrrBase.toLocaleString('pt-BR')}/mês</span>
              </div>

              <div className="flex items-center justify-between text-emerald-300 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Cenário Otimista:
                </span>
                <span>R$ {hoveredPoint.mrrOptimistic.toLocaleString('pt-BR')}</span>
              </div>

              <div className="flex items-center justify-between text-amber-300 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Conservador:
                </span>
                <span>R$ {hoveredPoint.mrrConservative.toLocaleString('pt-BR')}</span>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-neutral-300 text-[11px]">
                <span>ARR Run Rate:</span>
                <span className="font-bold text-indigo-300">
                  R$ {hoveredPoint.arrBase.toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="flex items-center justify-between text-neutral-400 text-[10px]">
                <span>Clientes Estimados:</span>
                <span>~{hoveredPoint.clientsBase} contratos</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── SIMULATION & SENSITIVITY CONTROLS PANEL ─── */}
      <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200/80 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
            <Sliders className="w-4 h-4 text-blue-600" />
            Parâmetros & Sensibilidade da Simulação Preditiva
          </div>
          <button
            onClick={() => {
              setChurnRate(1.5);
              setConversionMultiplier(100);
              setTicketOverride(defaultMaintenanceTicket);
            }}
            className="text-[11px] text-neutral-500 hover:text-neutral-800 flex items-center gap-1 font-semibold transition"
          >
            <RefreshCw className="w-3 h-3" />
            Restaurar Padrões
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
          {/* Churn Rate Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700">Taxa Mensal de Cancelamento (Churn)</span>
              <span className="font-bold text-neutral-900 bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                {churnRate}% ao mês
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={6}
              step={0.1}
              value={churnRate}
              onChange={(e) => setChurnRate(Number(e.target.value))}
              className="w-full accent-blue-600 h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>0% (Zero Churn)</span>
              <span>1.5% (Típico B2B)</span>
              <span>6% (Alto)</span>
            </div>
          </div>

          {/* Conversion Multiplier */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700">Força de Conversão do Funil</span>
              <span className="font-bold text-neutral-900 bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                {conversionMultiplier}% da meta
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={150}
              step={5}
              value={conversionMultiplier}
              onChange={(e) => setConversionMultiplier(Number(e.target.value))}
              className="w-full accent-blue-600 h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>50% (Desacelerado)</span>
              <span>100% (Esperado)</span>
              <span>150% (Hipercrescimento)</span>
            </div>
          </div>

          {/* Ticket de Manutenção Médio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700">Ticket de Manutenção Padrão</span>
              <span className="font-bold text-neutral-900 bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                R$ {ticketOverride}/mês
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={500}
              step={10}
              value={ticketOverride}
              onChange={(e) => setTicketOverride(Number(e.target.value))}
              className="w-full accent-blue-600 h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>R$ 100</span>
              <span>R$ 190 (Padrão)</span>
              <span>R$ 500 (Enterprise)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── EXPANDABLE DRILL-DOWN SECTIONS ─── */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => setShowTable(!showTable)}
          className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          {showTable ? 'Ocultar Tabela de Projeção Mês a Mês' : 'Ver Tabela Detalhada Mês a Mês'}
        </button>

        <button
          onClick={() => setShowDealsList(!showDealsList)}
          className="text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
        >
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          {showDealsList ? 'Ocultar Oportunidades do Pipeline' : `Ver Oportunidades no Pipeline (${dealContributions.length})`}
        </button>
      </div>

      {/* Monthly Breakdown Table */}
      <AnimatePresence>
        {showTable && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl border border-neutral-200"
          >
            <div className="p-3.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800">
                Detalhamento Mensal da Projeção de MRR & ARR
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">
                Horizonte: {horizon} Meses
              </span>
            </div>
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-100 text-neutral-600 font-semibold sticky top-0">
                  <tr>
                    <th className="p-3">Período</th>
                    <th className="p-3">MRR Ponderado</th>
                    <th className="p-3">MRR Otimista</th>
                    <th className="p-3">MRR Conservador</th>
                    <th className="p-3">Novas Entradas (Pipeline)</th>
                    <th className="p-3">Cancelamentos (Churn)</th>
                    <th className="p-3">ARR Run Rate</th>
                    <th className="p-3">Contratos Ativos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {forecastData.map((row) => (
                    <tr key={row.monthIndex} className="hover:bg-neutral-50/70">
                      <td className="p-3 font-semibold text-neutral-900">{row.monthLabel}</td>
                      <td className="p-3 font-bold text-blue-700">R$ {row.mrrBase.toLocaleString('pt-BR')}/mês</td>
                      <td className="p-3 text-emerald-700">R$ {row.mrrOptimistic.toLocaleString('pt-BR')}</td>
                      <td className="p-3 text-amber-700">R$ {row.mrrConservative.toLocaleString('pt-BR')}</td>
                      <td className="p-3 text-emerald-600">+{row.pipelineAddedMrr > 0 ? `R$ ${row.pipelineAddedMrr}` : '—'}</td>
                      <td className="p-3 text-rose-500">-{row.churnMrr > 0 ? `R$ ${row.churnMrr}` : '—'}</td>
                      <td className="p-3 font-bold text-indigo-900">R$ {row.arrBase.toLocaleString('pt-BR')}</td>
                      <td className="p-3 text-neutral-600">~{row.clientsBase}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opportunities Breakdown */}
      <AnimatePresence>
        {showDealsList && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl border border-neutral-200"
          >
            <div className="p-3.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800">
                Oportunidades em Aberto Contribuindo para a Previsão
              </span>
              <span className="text-[11px] text-neutral-500">
                Ordenado pelo impacto ponderado em MRR
              </span>
            </div>
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-100 text-neutral-600 font-semibold sticky top-0">
                  <tr>
                    <th className="p-3">Lead / Empresa</th>
                    <th className="p-3">Nicho</th>
                    <th className="p-3">Etapa Atual</th>
                    <th className="p-3">Probabilidade</th>
                    <th className="p-3">Ticket Manutenção</th>
                    <th className="p-3">Impacto Ponderado MRR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {dealContributions.map((deal, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/70">
                      <td className="p-3 font-bold text-neutral-900">{deal.lead.nome}</td>
                      <td className="p-3 text-neutral-600">{deal.lead.nicho}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                          {deal.statusCfg.label}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-semibold text-neutral-700">
                        {Math.round(deal.prob * 100)}%
                      </td>
                      <td className="p-3 text-blue-700 font-medium">
                        R$ {deal.ticket}/mês
                      </td>
                      <td className="p-3 font-bold text-emerald-700">
                        R$ {Math.round(deal.weightedMrr)}/mês
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
