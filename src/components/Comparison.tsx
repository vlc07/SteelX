// src/components/Comparison.tsx
import React, { useMemo, useState } from 'react';
import {
  GitCompare,
  Plus,
  Trash2,
  Star,
  Crown,
  Info,
  Settings2,
  Thermometer,
  Timer,
  Gauge,
  Wind,
} from 'lucide-react';
import { Scenario } from '../types';

interface ComparisonProps {
  t: (key: string) => string;
  isDark: boolean;
}

type S = Scenario & { idx: number };

export const Comparison: React.FC<ComparisonProps> = ({ t, isDark }) => {
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
  const [baselineIndex, setBaselineIndex] = useState(1);

  const [newScenario, setNewScenario] = useState({
    name: '',
    temperatura: 1450,
    tempo: 30,
    pressao: 101,
    velocidade: 300,
  });

  // ===== tokens premium
  const ringBlue =
    isDark ? 'hover:ring-2 hover:ring-blue-400/50' : 'hover:ring-2 hover:ring-blue-300/60';
  const cardBase =
    `rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl`;
  const gradBlue = isDark
    ? 'bg-gradient-to-br from-blue-950/60 via-gray-900/50 to-gray-900/70 border-blue-900/40'
    : 'bg-gradient-to-br from-blue-50 via-white to-white border-blue-200';
  const gradEmerald = isDark
    ? 'bg-gradient-to-br from-emerald-950/60 via-gray-900/50 to-gray-900/70 border-emerald-900/40'
    : 'bg-gradient-to-br from-emerald-50 via-white to-white border-emerald-200';
  const gradViolet = isDark
    ? 'bg-gradient-to-br from-violet-950/60 via-gray-900/50 to-gray-900/70 border-violet-900/40'
    : 'bg-gradient-to-br from-violet-50 via-white to-white border-violet-200';

  const textMain = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSub = isDark ? 'text-gray-300' : 'text-gray-600';

  // ===== comparação
  const enhanced: (S & { delta: number; pct: number; best?: boolean })[] = useMemo(() => {
    const base = scenarios[baselineIndex]?.quality ?? 0;
    const arr = scenarios.map((s, idx) => ({
      ...s,
      idx,
      delta: s.quality - base,
      pct: base > 0 ? ((s.quality - base) / base) * 100 : 0,
    }));
    const bestIdx = arr.reduce((bi, cur, i, a) => (cur.quality > a[bi].quality ? i : bi), 0);
    if (arr[bestIdx]) arr[bestIdx].best = true;
    return arr;
  }, [scenarios, baselineIndex]);

  const baseline = enhanced[baselineIndex];
  const fmt = (v: number) => (Number.isFinite(v) ? v.toFixed(1) : '—');

  // ===== ações
  const addScenario = () => {
    if (!newScenario.name.trim()) return;
    const quality =
      350 +
      (newScenario.temperatura - 1450) * 0.1 +
      (newScenario.tempo - 30) * 0.2 +
      (newScenario.pressao - 101) * 0.05 +
      (newScenario.velocidade - 300) * 0.03;

    setScenarios((prev) => [
      ...prev,
      {
        name: newScenario.name.trim(),
        parameters: {
          temperatura: newScenario.temperatura,
          tempo: newScenario.tempo,
          pressao: newScenario.pressao,
          velocidade: newScenario.velocidade,
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
    setScenarios((prev) => prev.filter((_, i) => i !== index));
    if (baselineIndex === index) setBaselineIndex(0);
    if (baselineIndex > index) setBaselineIndex((i) => i - 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${cardBase} ${ringBlue} p-6 ${gradBlue}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/40 text-blue-200' : 'bg-blue-600 text-white'}`}>
              <GitCompare className="h-5 w-5" />
            </div>
            <h2 className={`text-xl font-bold ${textMain}`}>{t('Comparar Cenários')}</h2>
          </div>

          {/* Controle de referência */}
          <div
            className={`rounded-lg border px-3 py-2 ${
              isDark ? 'border-indigo-800 bg-indigo-950/40 text-indigo-200' : 'border-indigo-200 bg-indigo-50 text-indigo-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <span className="text-sm">Referência</span>
              <select
                value={baselineIndex}
                onChange={(e) => setBaselineIndex(Number(e.target.value))}
                className={`ml-1 rounded-md text-sm px-2 py-1 border ${
                  isDark
                    ? 'bg-gray-900 text-gray-100 border-indigo-800'
                    : 'bg-white text-gray-900 border-indigo-300'
                }`}
              >
                {scenarios.map((s, i) => (
                  <option key={i} value={i}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Referência */}
          <div className={`${cardBase} p-5 ${gradBlue}`}>
            <div className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-300">Referência</div>
            <div className={`mt-1 text-lg font-extrabold ${textMain}`}>{baseline?.name ?? '—'}</div>
            <div
              className={`mt-2 inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border
                ${isDark ? 'bg-gray-900/40 text-gray-100 border-gray-700' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
            >
              <Info className="h-3.5 w-3.5" />
              deltas calculados vs este cenário
            </div>
          </div>

          {/* Melhor */}
          <div className={`${cardBase} p-5 ${gradEmerald}`}>
            <div className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
              Melhor cenário
            </div>
            <div className={`mt-1 text-lg font-extrabold ${textMain}`}>
              {enhanced.find((s) => s.best)?.name ?? '—'}
            </div>
            <div className="mt-1 text-sm">
              Qualidade: <b>{fmt(enhanced.find((s) => s.best)?.quality ?? NaN)}</b>
            </div>
          </div>

          {/* Amplitude */}
          <div className={`${cardBase} p-5 ${gradViolet}`}>
            <div className="text-xs uppercase tracking-wide text-violet-700 dark:text-violet-300">Amplitude</div>
            <div className={`mt-1 text-lg font-extrabold ${textMain}`}>
              {fmt(
                Math.max(...enhanced.map((s) => s.quality)) -
                  Math.min(...enhanced.map((s) => s.quality))
              )}{' '}
              pts
            </div>
            <div className={`text-xs ${textSub}`}>diferença entre pior e melhor</div>
          </div>
        </div>
      </div>

      {/* Formulário: adicionar cenário */}
      <div className={`${cardBase} ${ringBlue} p-6 ${gradBlue}`}>
        <h3 className={`font-semibold mb-4 ${textMain}`}>{t('addScenario')}</h3>

        {/* grade ajustada para 4 colunas XL */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Nome */}
          <div className="min-w-[220px]">
            <label className={`block text-sm mb-1 ${textSub}`}>Nome do Cenário</label>
            <input
              type="text"
              value={newScenario.name}
              onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
              className="w-full h-11 rounded-md border px-3
                bg-white text-gray-900 placeholder-gray-400 border-gray-300
                dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700
                focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300
                dark:focus:ring-blue-400/40 dark:focus:border-blue-600"
              placeholder="Ex.: Cenário C"
            />
          </div>

          {/* Campos numéricos */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label={t('temperature')}
              icon={<Thermometer className="h-4 w-4" />}
              value={newScenario.temperatura}
              onChange={(v) => setNewScenario({ ...newScenario, temperatura: v })}
            />
            <Field
              label={t('time')}
              icon={<Timer className="h-4 w-4" />}
              value={newScenario.tempo}
              onChange={(v) => setNewScenario({ ...newScenario, tempo: v })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label={t('pressure')}
              icon={<Gauge className="h-4 w-4" />}
              value={newScenario.pressao}
              onChange={(v) => setNewScenario({ ...newScenario, pressao: v })}
            />
            <Field
              label={t('speed')}
              icon={<Wind className="h-4 w-4" />}
              value={newScenario.velocidade}
              onChange={(v) => setNewScenario({ ...newScenario, velocidade: v })}
            />
          </div>

          {/* Botão */}
          <div className="flex xl:col-span-1 items-end">
            <button
              onClick={addScenario}
              aria-label="Adicionar cenário"
              className={`w-full h-11 rounded-lg font-semibold flex items-center justify-center gap-2 text-white 
                bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-700
                shadow-sm transition-all ${ringBlue}`}
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Insights premium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardBase} p-4 ${gradEmerald} text-gray-900 dark:text-gray-100`}>
          {(() => {
            const winners = enhanced.filter((s) => s.idx !== baselineIndex && s.delta > 0);
            if (winners.length === 0)
              return (
                <>
                  Nenhum cenário supera a referência <b>{baseline?.name}</b>.
                </>
              );
            const top = winners.sort((a, b) => b.delta - a.delta)[0];
            return (
              <>
                O cenário <b>{top.name}</b> é o que mais supera a referência:{' '}
                <b>+{fmt(top.delta)}</b> ({fmt(top.pct)}%).
              </>
            );
          })()}
        </div>

        <div className={`${cardBase} p-4 text-gray-900 dark:text-gray-100
            ${isDark
              ? 'bg-gradient-to-br from-rose-950/60 via-gray-900/40 to-gray-900/60 border-rose-900/40'
              : 'bg-gradient-to-br from-rose-50 via-white to-white border-rose-200'}`}>
          {(() => {
            const losers = enhanced.filter((s) => s.idx !== baselineIndex && s.delta < 0);
            if (losers.length === 0)
              return <>Todos os cenários estão no mínimo empatados com a referência.</>;
            const worst = losers.sort((a, b) => a.delta - b.delta)[0];
            return (
              <>
                O cenário <b>{worst.name}</b> está <b>{fmt(Math.abs(worst.delta))}</b> abaixo da
                referência ({fmt(Math.abs(worst.pct))}%).
              </>
            );
          })()}
        </div>

        <div className={`${cardBase} p-4 ${gradViolet} text-gray-900 dark:text-gray-100`}>
          {(() => {
            const values = enhanced.map((s) => s.quality);
            const amp = Math.max(...values) - Math.min(...values);
            return (
              <>
                A amplitude entre o pior e o melhor cenário é <b>{fmt(amp)}</b> ponto(s).{' '}
                {amp >= 15 ? 'Alta variabilidade — vale investigar parâmetros.' : 'Variabilidade sob controle.'}
              </>
            );
          })()}
        </div>
      </div>

      {/* Cards de cenários */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {enhanced.map((s) => {
          const qClass =
            s.quality >= 365
              ? isDark
                ? 'bg-emerald-900/40 text-emerald-200 border-emerald-800'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : s.quality >= 355
              ? isDark
                ? 'bg-amber-900/40 text-amber-200 border-amber-800'
                : 'bg-amber-50 text-amber-700 border-amber-200'
              : isDark
              ? 'bg-rose-900/40 text-rose-200 border-rose-800'
              : 'bg-rose-50 text-rose-700 border-rose-200';

          return (
            <div key={s.idx} className={`${cardBase} ${ringBlue} p-5 ${gradBlue}`}>
              {/* Cabeçalho */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4
                      className={`font-semibold ${textMain} whitespace-normal break-words leading-tight max-w-full pr-2`}
                    >
                      {s.name}
                    </h4>

                    {s.isOptimized && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border
                        ${isDark ? 'bg-emerald-900/40 text-emerald-200 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                      >
                        Otimizado
                      </span>
                    )}
                    {s.idx === baselineIndex && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 border
                        ${isDark ? 'bg-blue-900/40 text-blue-200 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                      >
                        <Star className="h-3.5 w-3.5" />
                        Referência
                      </span>
                    )}
                    {s.best && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 border
                        ${isDark ? 'bg-emerald-900/40 text-emerald-200 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                      >
                        <Crown className="h-3.5 w-3.5" />
                        Melhor
                      </span>
                    )}
                  </div>

                  <div className="mt-2 inline-flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${qClass}`}>
                      {s.quality >= 365 ? 'Excelente' : s.quality >= 355 ? 'Boa' : 'Ruim'}
                    </span>
                    <span className={`${textSub}`}>
                      Qualidade: <b>{fmt(s.quality)}</b>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    className="text-xs px-2 py-1 rounded-md border hover:bg-white/60 dark:hover:bg-gray-800/60 transition"
                    onClick={() => setBaselineIndex(s.idx)}
                    title="Usar como referência"
                  >
                    Definir Referência
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
                    className={`h-2 rounded-full ${
                      s.quality >= 365
                        ? 'bg-emerald-500'
                        : s.quality >= 355
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min((s.quality / 380) * 100, 100)}%` }}
                  />
                </div>
                <div className={`mt-1 text-xs flex items-center justify-between ${textSub}`}>
                  <span>Escala 0–380+</span>
                  {s.idx !== baselineIndex && (
                    <span>
                      Δ vs {baseline.name}: <b>{fmt(s.delta)}</b> ({fmt(s.pct)}%)
                    </span>
                  )}
                  {s.idx === baselineIndex && <span>vs {baseline.name} (referência)</span>}
                </div>
              </div>

              {/* Parâmetros */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <ParamBox label={t('temperature')} value={`${s.parameters.temperatura} ºC`} isDark={isDark} />
                <ParamBox label={t('time')} value={`${s.parameters.tempo} min`} isDark={isDark} />
                <ParamBox label={t('pressure')} value={`${s.parameters.pressao} kPa`} isDark={isDark} />
                <ParamBox label={t('speed')} value={`${s.parameters.velocidade} rpm`} isDark={isDark} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabela tabular */}
      <div className={`${cardBase} ${gradBlue} overflow-x-auto`}>
        <table className="min-w-full">
          <thead className={isDark ? 'bg-gray-900/60' : 'bg-gray-50'}>
            <tr>
              {[
                'Cenário',
                'Temperatura (ºC)',
                'Tempo (min)',
                'Pressão (kPa)',
                'Velocidade (rpm)',
                'Qualidade',
                `Δ vs referência (${baseline?.name ?? '—'})`,
              ].map((h) => (
                <th
                  key={h}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`${isDark ? 'bg-gray-900/30' : 'bg-white'}`}>
            {enhanced.map((s) => (
              <tr key={s.idx} className={isDark ? 'border-t border-gray-800' : 'border-t border-gray-200'}>
                <td className={`px-6 py-3 ${textMain}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>{s.name}</span>
                    {s.idx === baselineIndex && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 border
                        ${isDark ? 'bg-blue-900/40 text-blue-200 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                      >
                        <Star className="h-3.5 w-3.5" />
                        Referência
                      </span>
                    )}
                  </div>
                </td>
                <td className={`px-6 py-3 ${textSub}`}>{s.parameters.temperatura}</td>
                <td className={`px-6 py-3 ${textSub}`}>{s.parameters.tempo}</td>
                <td className={`px-6 py-3 ${textSub}`}>{s.parameters.pressao}</td>
                <td className={`px-6 py-3 ${textSub}`}>{s.parameters.velocidade}</td>
                <td
                  className={`px-6 py-3 font-semibold ${
                    s.quality >= 365
                      ? 'text-emerald-600'
                      : s.quality >= 355
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {fmt(s.quality)}
                </td>
                <td
                  className={`px-6 py-3 ${
                    s.delta > 0 ? 'text-emerald-600' : s.delta < 0 ? 'text-rose-600' : textSub
                  }`}
                >
                  {s.idx === baselineIndex ? '—' : `${fmt(s.delta)} (${fmt(s.pct)}%)`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------- componentes auxiliares ---------- */
function Field({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="min-w-[180px]">
      <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">{label}</label>
      <div className="relative">
        <div className="absolute left-2 top-2.5 text-gray-500 dark:text-gray-400">{icon}</div>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-11 rounded-md border pl-8 pr-3
            bg-white text-gray-900 placeholder-gray-400 border-gray-300
            dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300
            dark:focus:ring-blue-400/40 dark:focus:border-blue-600"
        />
      </div>
    </div>
  );
}

function ParamBox({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-4 py-3 border ${
        isDark ? 'bg-gray-900/40 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
        {value}
      </div>
    </div>
  );
}


