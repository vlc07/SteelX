import React, { useMemo, useState } from 'react';
import {
  Plus,
  Trash2,
  GitCompare,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Settings2,
  Star,
  Filter,
} from 'lucide-react';
import { Scenario } from '../types';

interface ComparisonProps {
  t: (key: string) => string;
  isDark: boolean;
}

type Params = { temperatura: number; tempo: number; pressao: number; velocidade: number };

const safeNum = (v: any, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);
const fmt = (n: number, d = 1) => safeNum(n).toFixed(d);

const classifyQuality = (q: number) =>
  q >= 365 ? { label: 'Excelente', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
  : q >= 355 ? { label: 'Boa',       cls: 'bg-amber-100  text-amber-800  border-amber-200' }
             : { label: 'Regular',   cls: 'bg-rose-100   text-rose-800   border-rose-200' };

export const Comparison: React.FC<ComparisonProps> = ({ t, isDark }) => {
  // ---------- Paleta premium ----------
  const textMain = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSub  = isDark ? 'text-gray-300' : 'text-gray-600';

  const cardBase = `rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
    isDark ? 'bg-gray-900/60 border-gray-700' : 'bg-white/90 backdrop-blur border-gray-200'
  }`;
  const ringBlue    = 'hover:ring-2 hover:ring-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50';
  const ringEmerald = 'hover:ring-2 hover:ring-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50';
  const ringViolet  = 'hover:ring-2 hover:ring-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400/50';

  const gradHeader = isDark
    ? 'from-blue-950/70 to-indigo-950/60 border-indigo-900/40'
    : 'from-blue-600 to-indigo-600 border-indigo-300/40';

  // ---------- Estado ----------
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      name: t('manualScenario'),
      parameters: { temperatura: 1450, tempo: 30, pressao: 101, velocidade: 300 },
      quality: 350,
      isOptimized: false,
    },
    {
      name: t('optimizedScenario'),
      parameters: { temperatura: 1510, tempo: 80, pressao: 102, velocidade: 310 },
      quality: 370,
      isOptimized: true,
    },
  ]);

  const [baselineIndex, setBaselineIndex] = useState<number>(1); // por padrão, compara contra otimizado
  const [sortByDeltaDesc, setSortByDeltaDesc] = useState<boolean>(true);

  const [newScenario, setNewScenario] = useState<Params & { name: string }>({
    name: '',
    temperatura: 1450,
    tempo: 30,
    pressao: 101,
    velocidade: 300,
  });

  // ---------- Derivados ----------
  const baseline = scenarios[baselineIndex] ?? scenarios[0];

  const enhanced = useMemo(() => {
    if (!baseline) return [];
    const baseQ = safeNum(baseline.quality);
    return scenarios.map((s, i) => {
      const q = safeNum(s.quality);
      const delta = q - baseQ;
      const pct = baseQ > 0 ? (delta / baseQ) * 100 : 0;
      const best = q === Math.max(...scenarios.map(x => safeNum(x.quality)));
      return { idx: i, ...s, delta, pct, best };
    });
  }, [scenarios, baselineIndex]);

  const sorted = useMemo(() => {
    const list = [...enhanced];
    list.sort((a, b) => (sortByDeltaDesc ? b.delta - a.delta : a.idx - b.idx));
    return list;
  }, [enhanced, sortByDeltaDesc]);

  const stats = useMemo(() => {
    if (scenarios.length === 0) return { best: 0, avg: 0, spread: 0, bestName: '-' };
    const qualities = scenarios.map(s => safeNum(s.quality));
    const best = Math.max(...qualities);
    const worst = Math.min(...qualities);
    const avg = qualities.reduce((a, b) => a + b, 0) / qualities.length;
    const bestName = scenarios[qualities.indexOf(best)]?.name ?? '-';
    return { best, avg, spread: best - worst, bestName };
  }, [scenarios]);

  // ---------- Ações ----------
  const addScenario = () => {
    if (!newScenario.name.trim()) return;
    // Exemplo simples de "qualidade" com ênfase em T e tempo
    const quality =
      350 +
      (safeNum(newScenario.temperatura) - 1450) * 0.10 +
      (safeNum(newScenario.tempo) - 30) * 0.20 +
      (safeNum(newScenario.pressao) - 101) * 0.05 +
      (safeNum(newScenario.velocidade) - 300) * 0.03;

    setScenarios(prev => [
      ...prev,
      {
        name: newScenario.name,
        parameters: {
          temperatura: safeNum(newScenario.temperatura),
          tempo: safeNum(newScenario.tempo),
          pressao: safeNum(newScenario.pressao),
          velocidade: safeNum(newScenario.velocidade),
        },
        quality,
        isOptimized: false,
      },
    ]);

    setNewScenario({
      name: '',
      temperatura: 1450,
      tempo: 30,
      pressao: 101,
      velocidade: 300,
    });
  };

  const removeScenario = (index: number) => {
    setScenarios(prev => {
      const next = prev.filter((_, i) => i !== index);
      // Ajusta baseline se necessário
      if (index === baselineIndex) return next.length ? next : [];
      if (index < baselineIndex) setBaselineIndex(Math.max(0, baselineIndex - 1));
      return next;
    });
  };

  // ---------- UI ----------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-8 text-white bg-gradient-to-br ${gradHeader} border shadow-lg`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur border border-white/20">
              <GitCompare className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                {t('Comparar Cenários')}
              </h2>
              <p className="text-sm opacity-90">
                Compare rapidamente cenários manuais e otimizados, com deltas, ranking e insights automáticos.
              </p>
            </div>
          </div>

          {/* Controles */}
          <div className="flex flex-wrap items-center gap-2">
            <div className={`rounded-lg border ${isDark ? 'border-indigo-800 bg-indigo-950/40' : 'border-indigo-200 bg-white/20'} px-3 py-2`}>
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                <span className="text-sm">Referência</span>
                <select
                  value={baselineIndex}
                  onChange={(e) => setBaselineIndex(Number(e.target.value))}
                  className={`ml-2 rounded-md text-sm bg-transparent border px-2 py-1 ${
                    isDark ? 'border-indigo-800' : 'border-white/60'
                  }`}
                >
                  {scenarios.map((s, i) => (
                    <option value={i} key={i} className="text-gray-900">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setSortByDeltaDesc((v) => !v)}
              className={`rounded-lg text-sm px-3 py-2 border ${isDark ? 'border-indigo-800 bg-indigo-950/40' : 'border-indigo-200 bg-white/20'} hover:bg-white/25 transition`}
              title="Alternar ordenação por delta"
            >
              <Filter className="h-4 w-4 inline mr-1" />
              {sortByDeltaDesc ? 'Ordenar por Δ (desc)' : 'Ordenar (original)'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${cardBase} ${ringEmerald} p-5`}>
          <div className="text-xs uppercase tracking-wide text-emerald-600">Melhor Qualidade</div>
          <div className="mt-1 flex items-center gap-2">
            <Crown className="h-5 w-5 text-emerald-500" />
            <div className={`text-2xl font-black ${textMain}`}>{fmt(stats.best)}</div>
          </div>
          <div className={`text-xs mt-1 ${textSub}`}>{stats.bestName}</div>
        </div>

        <div className={`${cardBase} ${ringBlue} p-5`}>
          <div className="text-xs uppercase tracking-wide text-blue-600">Média</div>
          <div className={`mt-1 text-2xl font-black ${textMain}`}>{fmt(stats.avg)}</div>
          <div className={`text-xs mt-1 ${textSub}`}>{scenarios.length} cenário(s)</div>
        </div>

        <div className={`${cardBase} ${ringViolet} p-5`}>
          <div className="text-xs uppercase tracking-wide text-violet-600">Amplitude</div>
          <div className={`mt-1 text-2xl font-black ${textMain}`}>{fmt(stats.spread)}</div>
          <div className={`text-xs mt-1 ${textSub}`}>diferença entre pior e melhor</div>
        </div>

        <div className={`${cardBase} ${ringBlue} p-5`}>
          <div className="text-xs uppercase tracking-wide text-blue-600">Referência</div>
          <div className={`mt-1 text-lg font-extrabold ${textMain}`}>{baseline?.name ?? '—'}</div>
          <div className="mt-2 text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full border bg-white/60 dark:bg-gray-900/40 dark:border-gray-700">
            <Info className="h-3.5 w-3.5" />
            deltas calculados vs este cenário
          </div>
        </div>
      </div>

      {/* Novo Cenário */}
      <div className={`${cardBase} ${ringBlue} p-6`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-lg font-semibold ${textMain}`}>{t('addScenario')}</h3>
          <span className={`text-xs ${textSub}`}>Defina nome e parâmetros — a qualidade é estimada automaticamente.</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className={`block text-sm mb-1 ${textSub}`}>Nome do Cenário</label>
            <input
              type="text"
              value={newScenario.name}
              onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2 bg-transparent ${isDark ? 'text-gray-100 border-gray-700 focus:border-blue-400' : 'text-gray-900 border-gray-300 focus:border-blue-500'}`}
              placeholder="Ex: Teste 1"
            />
          </div>

          {([
            { key: 'temperatura', label: t('temperature'), unit: 'ºC' },
            { key: 'tempo',        label: t('time'),        unit: 'min' },
            { key: 'pressao',      label: t('pressure'),    unit: 'kPa' },
            { key: 'velocidade',   label: t('speed'),       unit: 'rpm' },
          ] as const).map((f) => (
            <div key={f.key}>
              <label className={`block text-sm mb-1 ${textSub}`}>{f.label} ({f.unit})</label>
              <input
                type="number"
                value={(newScenario as any)[f.key]}
                onChange={(e) => setNewScenario({ ...newScenario, [f.key]: Number(e.target.value) } as any)}
                className={`w-full rounded-lg border px-3 py-2 bg-transparent ${isDark ? 'text-gray-100 border-gray-700 focus:border-blue-400' : 'text-gray-900 border-gray-300 focus:border-blue-500'}`}
              />
            </div>
          ))}

          <div className="lg:col-span-5">
            <button
              onClick={addScenario}
              className="w-full md:w-auto px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-600 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Cenários (com deltas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {sorted.map((s) => {
          const badge = classifyQuality(s.quality);
          const up = s.delta > 0;
          const down = s.delta < 0;

          return (
            <div
              key={s.idx}
              className={`${cardBase} p-5 ${s.best ? ringEmerald : ringBlue}`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-semibold ${textMain} truncate`}>{s.name}</h4>
                    {s.isOptimized && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Otimizado
                      </span>
                    )}
                    {s.idx === baselineIndex && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5" /> Referência
                      </span>
                    )}
                    {s.best && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                        <Crown className="h-3.5 w-3.5" /> Melhor
                      </span>
                    )}
                  </div>

                  <div className="mt-1 inline-flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.cls}`}>
                      {badge.label}
                    </span>
                    <span className={`text-xs ${textSub}`}>Qualidade: <b>{fmt(s.quality)}</b></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="text-xs px-2 py-1 rounded-md border hover:bg-white/60 dark:hover:bg-gray-800/60 transition"
                    onClick={() => setBaselineIndex(s.idx)}
                    title="Usar como baseline"
                  >
                    Definir baseline
                  </button>
                  {!s.isOptimized && (
                    <button
                      onClick={() => removeScenario(s.idx)}
                      className="text-rose-600 hover:text-rose-700"
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Barra de qualidade */}
              <div className="mt-3">
                <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-2 rounded-full ${s.best ? 'bg-emerald-500' : s.quality >= 365 ? 'bg-emerald-400' : s.quality >= 355 ? 'bg-amber-400' : 'bg-rose-400'}`}
                    style={{ width: `${Math.min((s.quality / 380) * 100, 100)}%` }}
                  />
                </div>
                <div className={`text-[11px] mt-1 ${textSub}`}>Escala 0–380+</div>
              </div>

              {/* Delta vs baseline */}
              {baseline && s.idx !== baselineIndex && (
                <div className="mt-3 inline-flex items-center gap-2 text-sm">
                  {up && <ArrowUpRight className="h-4 w-4 text-emerald-500" />}
                  {down && <ArrowDownRight className="h-4 w-4 text-rose-500" />}
                  <span className={`${up ? 'text-emerald-600' : down ? 'text-rose-600' : textSub} font-semibold`}>
                    {up ? '+' : ''}{fmt(s.delta)} ({up ? '+' : ''}{fmt(s.pct)}%)
                  </span>
                  <span className={`${textSub}`}>vs {baseline.name}</span>
                </div>
              )}

              {/* Chips de parâmetros */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {([
                  ['Temperatura', s.parameters.temperatura, 'ºC'],
                  ['Tempo', s.parameters.tempo, 'min'],
                  ['Pressão', s.parameters.pressao, 'kPa'],
                  ['Velocidade', s.parameters.velocidade, 'rpm'],
                ] as const).map(([label, val, unit]) => (
                  <div
                    key={label}
                    className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-white/70 backdrop-blur border-gray-200'}`}
                  >
                    <div className="text-[11px] text-gray-500">{label}</div>
                    <div className={`font-semibold ${textMain}`}>{fmt(val, 0)} <span className="text-xs text-gray-500">{unit}</span></div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Insights */}
      <div className={`${cardBase} ${ringEmerald} p-6`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-emerald-500" />
            <h3 className={`text-lg font-semibold ${textMain}`}>Insights Rápidos</h3>
          </div>
          <span className={`text-xs ${textSub}`}>Gerados automaticamente a partir dos cenários atuais</span>
        </div>

        {baseline ? (
          <ul className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm ${textSub}`}>
            {/* Melhor que baseline */}
            <li className="p-3 rounded-xl border bg-gradient-to-br dark:from-emerald-950/40 dark:to-gray-900/30 dark:border-emerald-900/40 from-emerald-50 to-white border-emerald-200">
              {(() => {
                const winners = enhanced.filter(s => s.idx !== baselineIndex && s.delta > 0);
                if (winners.length === 0) return <>Nenhum cenário supera o baseline <b>{baseline.name}</b>.</>;
                const top = winners.sort((a, b) => b.delta - a.delta)[0];
                return <>O cenário <b>{top.name}</b> é o que mais supera o baseline: <b>+{fmt(top.delta)}</b> ({fmt(top.pct)}%).</>;
              })()}
            </li>

            {/* Piores que baseline */}
            <li className="p-3 rounded-xl border bg-gradient-to-br dark:from-rose-950/40 dark:to-gray-900/30 dark:border-rose-900/40 from-rose-50 to-white border-rose-200">
              {(() => {
                const losers = enhanced.filter(s => s.idx !== baselineIndex && s.delta < 0);
                if (losers.length === 0) return <>Todos os cenários estão no mínimo empatados com o baseline.</>;
                const worst = losers.sort((a, b) => a.delta - b.delta)[0];
                return <>O cenário <b>{worst.name}</b> está <b>{fmt(Math.abs(worst.delta))}</b> abaixo do baseline ({fmt(Math.abs(worst.pct))}%).</>;
              })()}
            </li>

            {/* Estabilidade (amplitude) */}
            <li className="p-3 rounded-xl border bg-gradient-to-br dark:from-blue-950/40 dark:to-gray-900/30 dark:border-blue-900/40 from-blue-50 to-white border-blue-200">
              A amplitude entre o pior e o melhor cenário é <b>{fmt(stats.spread)}</b> ponto(s).
              {stats.spread <= 5 ? ' Processo estável.' : stats.spread <= 12 ? ' Variação moderada.' : ' Alta variabilidade — vale investigar parâmetros.'}
            </li>
          </ul>
        ) : (
          <div className={textSub}>Adicione cenários para ver insights.</div>
        )}
      </div>

      {/* Tabela (opcional, para export/visão densa) */}
      <div className={`${cardBase} ${ringBlue} p-6`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-lg font-semibold ${textMain}`}>Visão Tabular</h3>
          <span className={`text-xs ${textSub}`}>Leitura rápida e export-friendly</span>
        </div>

        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={isDark ? 'bg-gray-800/60' : 'bg-gray-50'}>
              <tr>
                {['Cenário', 'Temperatura (ºC)', 'Tempo (min)', 'Pressão (kPa)', 'Velocidade (rpm)', 'Qualidade', `Δ vs ${baseline?.name ?? '—'}`].map((h) => (
                  <th key={h} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`${isDark ? 'bg-gray-900/40' : 'bg-white'}`}>
              {enhanced.map((s) => (
                <tr key={s.idx} className={`${isDark ? 'border-gray-800' : 'border-gray-100'} border-b`}>
                  <td className={`px-6 py-3 ${textMain}`}>
                    <div className="flex items-center gap-2">
                      <span>{s.name}</span>
                      {s.idx === baselineIndex && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
                          <Star className="h-3.5 w-3.5" /> Baseline
                        </span>
                      )}
                      {s.isOptimized && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Otimizado
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-3 ${textSub}`}>{fmt(s.parameters.temperatura, 0)}</td>
                  <td className={`px-6 py-3 ${textSub}`}>{fmt(s.parameters.tempo, 0)}</td>
                  <td className={`px-6 py-3 ${textSub}`}>{fmt(s.parameters.pressao, 0)}</td>
                  <td className={`px-6 py-3 ${textSub}`}>{fmt(s.parameters.velocidade, 0)}</td>
                  <td className={`px-6 py-3 font-semibold ${
                    s.quality >= 365 ? 'text-emerald-600' : s.quality >= 355 ? 'text-amber-600' : 'text-rose-600'
                  }`}>{fmt(s.quality)}</td>
                  <td className="px-6 py-3">
                    {s.idx === baselineIndex ? (
                      <span className={`text-xs ${textSub}`}>—</span>
                    ) : (
                      <span className={`text-sm font-semibold ${s.delta > 0 ? 'text-emerald-600' : s.delta < 0 ? 'text-rose-600' : textSub}`}>
                        {s.delta > 0 ? '+' : ''}{fmt(s.delta)} ({s.pct > 0 ? '+' : ''}{fmt(s.pct)}%)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
