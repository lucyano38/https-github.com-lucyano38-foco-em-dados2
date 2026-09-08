import React, { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { TrendingUp, CreditCard, Users, AlertTriangle, DollarSign, Activity } from 'lucide-react';

interface ParsedData {
  headers: string[];
  rows: Record<string, any>[];
  fileName: string;
}

interface PowerBIDashboardProps {
  data: ParsedData;
}

const COLORS = ['#d4a574', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

function detectColumns(rows: Record<string, any>[], headers: string[]) {
  const categories: string[] = [];
  const numerics: string[] = [];
  const dates: string[] = [];

  for (const h of headers) {
    const sampleValues = rows.slice(0, 20).map(r => r[h]).filter(v => v != null && v !== '');
    if (sampleValues.length === 0) continue;

    const allNum = sampleValues.every(v => !isNaN(Number(String(v).replace(/[R$\.,]/g, '').replace(',', '.'))));
    const allDate = sampleValues.every(v => !isNaN(Date.parse(String(v)).valueOf()));

    if (allNum && sampleValues.length > 0) numerics.push(h);
    else if (allDate && sampleValues.length > 0) dates.push(h);
    else categories.push(h);
  }

  return { categories, numerics, dates };
}

function aggregateByCategory(rows: Record<string, any>[], catCol: string, valCol: string) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = String(row[catCol] || 'Outro');
    const val = Number(String(row[valCol]).replace(/[R$\.,]/g, '').replace(',', '.')) || 0;
    map.set(key, (map.get(key) || 0) + val);
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

function computeKPIs(rows: Record<string, any>[], numerics: string[]) {
  const kpis: { label: string; value: string; icon: any; color: string }[] = [];

  kpis.push({ label: 'Total de Registros', value: rows.length.toLocaleString('pt-BR'), icon: Users, color: 'text-blue-400' });

  for (const col of numerics.slice(0, 4)) {
    const values = rows.map(r => Number(String(r[col]).replace(/[R$\.,]/g, '').replace(',', '.')) || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const max = Math.max(...values);

    if (col.toLowerCase().includes('valor') || col.toLowerCase().includes('preco') || col.toLowerCase().includes('receita') || col.toLowerCase().includes('price')) {
      kpis.push({ label: `Total ${col}`, value: `R$ ${sum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-emerald-400' });
      kpis.push({ label: `Ticket Médio`, value: `R$ ${avg.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: CreditCard, color: 'text-amber-400' });
    } else {
      kpis.push({ label: `Soma ${col}`, value: sum.toLocaleString('pt-BR'), icon: TrendingUp, color: 'text-emerald-400' });
      kpis.push({ label: `Média ${col}`, value: avg.toLocaleString('pt-BR', { maximumFractionDigits: 1 }), icon: Activity, color: 'text-purple-400' });
    }
  }

  if (kpis.length < 6) {
    kpis.push({ label: 'Colunas Detectadas', value: String(rows.length > 0 ? Object.keys(rows[0]).length : 0), icon: AlertTriangle, color: 'text-cyan-400' });
  }

  return kpis;
}

export const PowerBIDashboard: React.FC<PowerBIDashboardProps> = ({ data }) => {
  const { headers, rows, fileName } = data;

  const analysis = useMemo(() => {
    if (!rows.length) return null;
    const { categories, numerics } = detectColumns(rows, headers);
    const kpis = computeKPIs(rows, numerics);

    // Bar chart: first category vs first numeric
    const barData = categories.length > 0 && numerics.length > 0
      ? aggregateByCategory(rows, categories[0], numerics[0])
      : [];

    // Pie chart: first category distribution (by count)
    const pieData = categories.length > 0
      ? aggregateByCategory(rows, categories[0], numerics[0] || headers[0])
      : [];

    // Line chart: if dates exist, aggregate by date
    const lineData: { name: string; value: number }[] = [];
    if (headers.length >= 2) {
      const catCol = categories[0] || headers[0];
      const valCol = numerics[0] || headers[1];
      const map = new Map<string, number>();
      for (const row of rows) {
        const key = String(row[catCol] || 'Outro');
        const val = Number(String(row[valCol]).replace(/[R$\.,]/g, '').replace(',', '.')) || 0;
        map.set(key, (map.get(key) || 0) + val);
      }
      let idx = 0;
      for (const [name, value] of map) {
        lineData.push({ name: name.length > 15 ? `${idx + 1}` : name, value: Math.round(value * 100) / 100 });
        idx++;
        if (idx >= 15) break;
      }
    }

    return { kpis, barData, pieData, lineData, categories, numerics };
  }, [rows, headers]);

  if (!analysis) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            Dashboard Power BI
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            📊 {fileName} • {rows.length} registros • {headers.length} colunas
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
          ● AO VIVO
        </span>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {analysis.kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <Icon className={`w-4 h-4 ${kpi.color}`} />
              <div className="text-lg font-extrabold text-white font-mono truncate">{kpi.value}</div>
              <div className="text-[10px] text-slate-400 truncate">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BAR CHART */}
        {analysis.barData.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-white mb-3">
              📊 {analysis.categories[0]} por {analysis.numerics[0]}
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={analysis.barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="value" fill="#d4a574" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* LINE CHART */}
        {analysis.lineData.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-white mb-3">
              📈 Tendência de {analysis.numerics[0] || 'Valores'}
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={analysis.lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* PIE CHART */}
        {analysis.pieData.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-white mb-3">
              🥧 Distribuição de {analysis.categories[0]}
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={analysis.pieData.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analysis.pieData.slice(0, 8).map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* DATA TABLE PREVIEW */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-white mb-3">
            📋 Preview dos Dados (5 primeiras linhas)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-slate-700">
                  {headers.slice(0, 6).map((h, i) => (
                    <th key={i} className="text-left py-1.5 px-2 text-slate-400 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    {headers.slice(0, 6).map((h, j) => (
                      <td key={j} className="py-1.5 px-2 text-slate-300">{String(row[h] ?? '-').slice(0, 30)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerBIDashboard;
