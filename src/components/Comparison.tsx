// src/components/Comparison.tsx
import React, { useMemo, useState } from 'react';
import {
  GitCompare,
  Plus,
  Trash2,
  Thermometer,
  Timer,
  Gauge,
  Wind,
  Star,
  Crown,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface Scenario {
  name: string;
  parameters: { temperatura: number; tempo: number; pressao: number; velocidade: number };
  quality: number;
  isOptimized?: boolean;
}

type Props = { t: (k: string) => string; isDark: boolean };

export const Comparison: React.FC<Props> = ({ t, isDark }) => {
  // --------- styles premium ----------
  const ringBlue =
    'hover:ring-2 hover:ring-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50';
  const cardBase = `rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
    isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'
  }`;
  const gradBlue = `${
    isDark ? 'from-blue-950/60 to-gray-900/60 border-blue-900/40' : 'from-blue-50 to-white border-blue-200'
  }`;
  const gradEmerald = `${
    isDark ? 'from-emerald-950/60 to-gray-900/60 border-emerald-900/40' : 'from-emerald-50 to-white border-emerald-200'
  }`;
  const gradViolet = `${
    isDark ? 'from-violet-950/60 to-gray-900/60 border-violet-900/40' : 'from-violet-50 to-white border-violet-200'
  }`;

  // --------- state ----------
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

  const [newScenario, setNewScenario] = useState({
    name: '',
    temperatura: 1450,
    tempo: 30,
    pressao: 101,
    velocidade: 300,
  });

  const [refIndex, setRefIndex] = useState<number>(1); // por padrão o otimizado
  const bestIndex = useMemo(
    () => (scenarios.length ? scenarios.reduce((b, _, i) => (scenarios[i].quality > scenarios[b].quality ? i : b), 0) : -1),
    [scenarios]
  );

  // --------- helpers ----------
  const addScenario = () => {
    if (!newScenario.name.trim()) return;
    const q = 350 + (newScenario.temperatura - 1450) * 0.1 + (newScenario.tempo - 30) * 0.2;
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
        quality: q,
        isOptimized: false,
      },
    ]);
    setNewScenario({ name: '', temperatura: 1450, tempo: 30, pressao: 101, velocidade: 300 });
  };

  const removeScenario = (i: number) => {
    setScenarios((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      // ajustar referência se necessário
      if (i === refIndex) setRefIndex(Math.max(0, Math.min(next.length - 1, 0)));
      else if (i < refIndex) setRefIndex((r) => Math.max(0, r - 1));
      return next;
    });
  };

  const classifyQuality = (q: number) => (q >= 365 ? 'Excelente' : q >= 355 ? 'Boa' : 'Regular');

  const refScenario = scenarios[refIndex];
  const amp =
    scenarios.length > 0
      ? Math.max(...scenarios.map((s) => s.quality)) - Math.min(...scenarios.map((s) => s.quality))
      : 0;

  // --------- UI components ----------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl border p-6 bg-gradient-to-br ${gradBlue} ${ringBlue}`}>
        <div className="flex items-center gap-2 mb-1">
          <GitCompare className="h-5 w-5 text-blue-500" />
          <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {t('Comparar Cenários')}
          </h2>
        </div>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
          Adicione cenários, escolha uma <b>Referência</b> e veja deltas e destaques automaticamente.
        </p>
      </div>

      {/* Formulário: Adicionar cenário */}
      <div className={`rounded-2xl border p-6 bg-gradient-to-br ${gradBlue} ${ringBlue}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Adicionar Cenário</h3>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr] gap-4">
          {/* Nome */}
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Nome do Cenário</label>
            <input
              type="text"
              value={newScenario.name}
              onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
              placeholder="Ex.: Cenário C"
              className={`w-full h-11 rounded-md border px-3
                ${isDark
                  ? 'bg-gray-900 text-gray-100 placeholder-gray-500 border-gray-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-400/40'
                  : 'bg-white text-gray-900 placeholder-gray-400 border-gray-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-400/50'}`}
            />
          </div>

          <Field
            label={t('temperature')}
            icon={<Thermometer className="h-4 w-4" />}
            value={newScenario.temperatura}
            onChange={(v) => setNewScenario({ ...newScenario, temperatura: v })}
            isDark={isDark}
          />
          <Field
            label={t('time')}
            icon={<Timer className="h-4 w-4" />}
            value={newScenario.tempo}
            onChange={(v) => setNewScenario({ ...newScenario, tempo: v })}
            isDark={isDark}
          />
          <Field
            label={t('pressure')}
            icon={<Gauge className="h-4 w-4" />}
            value={newScenario.pressao}
            onChange={(v) => setNewScenario({ ...newScenario, pressao: v })}
            isDark={isDark}
          />
          <Field
            label={t('speed')}
            icon={<Wind className="h-4 w-4" />}
            value={newScenario.velocidade}
            onChange={(v) => setNewScenario({ ...newScenario, velocidade: v })}
            isDark={isDark}
          />

          <div className="lg:col-span-5 flex justify-end">
            <button
              onClick={addScenario}
              className={`h-11 px-5 rounded-lg font-semibold flex items-center justify-center gap-2 text-white 
                bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-700
                shadow-sm transition-all ${ringBlue} border border-white/0`}
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* ==== Cards dos cenários (acima dos insights) ==== */}
      {scenarios.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {scenarios.map((s, i) => {
            const isRef = i === refIndex;
            const isBest = i === bestIndex;
            const barPct = Math.min(100, (s.quality / 380) * 100);

            // cores dinâmicas
            const qualityTone =
              s.quality >= 365
                ? isDark
                  ? 'bg-emerald-900/40 text-emerald-200 border-emerald-800'
                  : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : s.quality >= 355
                ? isDark
                  ? 'bg-amber-900/40 text-amber-200 border-amber-800'
                  : 'bg-amber-100 text-amber-700 border-amber-200'
                : isDark
                ? 'bg-rose-900/40 text-rose-200 border-rose-800'
                : 'bg-rose-100 text-rose-700 border-rose-200';

            return (
              <div
                key={i}
                className={`rounded-2xl border p-5 transition-all ${ringBlue} hover:-translate-y-0.5 hover:shadow-xl ${
                  isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                {/* título + badges */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} break-words`}>
                      {s.name}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {s.isOptimized && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                            isDark ? 'bg-emerald-900/40 text-emerald-200 border-emerald-800' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Otimizado
                        </span>
                      )}
                      {isRef && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                            isDark ? 'bg-blue-900/40 text-blue-200 border-blue-800' : 'bg-blue-100 text-blue-700 border-blue-200'
                          }`}
                        >
                          <Star className="h-3.5 w-3.5" /> Referência
                        </span>
                      )}
                      {isBest && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                            isDark ? 'bg-emerald-900/40 text-emerald-200 border-emerald-800' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <Crown className="h-3.5 w-3.5" /> Melhor
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => setRefIndex(i)}
                      className={`text-xs px-3 py-1 rounded-md border ${ringBlue}
                        ${isRef
                          ? isDark
                            ? 'bg-blue-900/40 text-blue-200 border-blue-800'
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                          : isDark
                          ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      Definir Referência
                    </button>
                    {!s.isOptimized && (
                      <button
                        onClick={() => removeScenario(i)}
                        className={`text-xs px-2.5 py-1 rounded-md border inline-flex items-center gap-1 ${
                          isDark ? 'border-rose-800 text-rose-300 hover:bg-rose-900/20' : 'border-rose-300 text-rose-700 hover:bg-rose-50'
                        }`}
                        title="Remover cenário"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remover
                      </button>
                    )}
                  </div>
                </div>

                {/* qualidade + classe */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${qualityTone}`}>
                    {classifyQuality(s.quality)}
                  </span>
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                    Qualidade: <b className={`${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{s.quality.toFixed(1)}</b>
                  </span>
                </div>

                {/* barra */}
                <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-200'} h-2 rounded-full mb-3`}>
                  <div
                    className={`h-2 rounded-full ${
                      s.quality >= 365 ? (isDark ? 'bg-emerald-600' : 'bg-emerald-500') : s.quality >= 355 ? (isDark ? 'bg-amber-500' : 'bg-amber-500') : isDark ? 'bg-rose-500' : 'bg-rose-600'
                    }`}
                    style={{ width: `${barPct}%` }}
                  />
                </div>

                {/* parâmetros */}
                <div className="grid grid-cols-2 gap-3">
                  <ParamBlock
                    title="Temperatura"
                    value={`${s.parameters.temperatura}`}
                    unit="ºC"
                    isDark={isDark}
                  />
                  <ParamBlock title="Tempo" value={`${s.parameters.tempo}`} unit="min" isDark={isDark} />
                  <ParamBlock title="Pressão" value={`${s.parameters.pressao}`} unit="kPa" isDark={isDark} />
                  <ParamBlock title="Velocidade" value={`${s.parameters.velocidade}`} unit="rpm" isDark={isDark} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Badge de aviso de deltas */}
      {refScenario && (
        <div className="flex items-center">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs ${
              isDark
                ? 'bg-gray-800 text-gray-200 border-gray-700'
                : 'bg-gray-100 text-gray-700 border-gray-300'
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            deltas calculados vs este cenário
          </span>
        </div>
      )}

      {/* ===== Insights ===== */}
      {scenarios.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Insight 1 */}
          <div className={`${cardBase} p-4 bg-gradient-to-br ${gradEmerald} ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
            <div className="font-semibold mb-1">Resumo</div>
            <p className="text-sm">
              {scenarios.every((s) => s.quality <= refScenario.quality) ? (
                <>
                  Nenhum cenário supera a referência <b>{refScenario.name}</b>.
                </>
              ) : (
                <>
                  Há cenários que superam a referência <b>{refScenario.name}</b>.
                </>
              )}
            </p>
          </div>

          {/* Insight 2 */}
          <div
            className={`${cardBase} p-4 ${
              isDark
                ? 'bg-gradient-to-br from-rose-950/60 via-gray-900/40 to-gray-900/60 border-rose-900/40 text-gray-100'
                : 'bg-gradient-to-br from-rose-50 via-white to-white border-rose-200 text-gray-800'
            }`}
          >
            <div className="font-semibold mb-1">Diferença para a referência</div>
            <p className="text-sm">
              {scenarios
                .map((s) => ({ n: s.name, d: +(s.quality - refScenario.quality).toFixed(1) }))
                .filter((x) => x.d !== 0)
                .map((x, idx) => (
                  <span key={idx} className="block">
                    O cenário <b>{x.n}</b> está{' '}
                    <b>{Math.abs(x.d).toFixed(1)}</b> {x.d > 0 ? 'acima' : 'abaixo'} da referência (
                    {((x.d / refScenario.quality) * 100).toFixed(1)}%).
                  </span>
                ))}
            </p>
          </div>

          {/* Insight 3 */}
          <div className={`${cardBase} p-4 bg-gradient-to-br ${gradViolet} ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
            <div className="font-semibold mb-1">Amplitude</div>
            <p className="text-sm">
              A amplitude entre o pior e o melhor cenário é <b>{amp.toFixed(1)}</b> ponto(s).{' '}
              {amp >= 15 ? (
                <>
                  Alta variabilidade — <b>vale investigar parâmetros</b>.
                </>
              ) : (
                <>Variabilidade sob controle.</>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- subcomponents ---------- */
function Field({
  label,
  icon,
  value,
  onChange,
  isDark,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  isDark: boolean;
}) {
  return (
    <div>
      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{label}</label>
      <div className="relative">
        <div className={`absolute left-2 top-2.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{icon}</div>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-11 rounded-md border pl-8 pr-3 focus:outline-none
            ${isDark
              ? 'bg-gray-900 text-gray-100 placeholder-gray-500 border-gray-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-400/40'
              : 'bg-white text-gray-900 placeholder-gray-400 border-gray-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-400/50'}`}
        />
      </div>
    </div>
  );
}

function ParamBlock({
  title,
  value,
  unit,
  isDark,
}: {
  title: string;
  value: string;
  unit: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 border ${
        isDark ? 'bg-gray-800/70 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</div>
      <div className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
        {value} <span className="text-xs text-gray-500">{unit}</span>
      </div>
    </div>
  );
}



