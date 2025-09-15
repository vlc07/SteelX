// src/components/Results.tsx
import React, { useState } from 'react';
import {
  FileText,
  Download,
  TrendingUp,
  Award,
  BarChart3,
  PieChart,
  Coins,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getModel } from '../ml/engine';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ResultsProps {
  optimizationResults: any;
  simulationResults: Array<{ quality: number } & Record<string, any>>;
  currentParams: {
    temperatura: number;
    tempo: number;
    pressao: number;
    velocidade: number;
    qualidade: number;
    energia: number;
  };
  t: (key: string) => string;
  isDark: boolean;
}

export const Results: React.FC<ResultsProps> = ({
  optimizationResults,
  simulationResults,
  currentParams,
  t,
  isDark,
}) => {
  const [activeView, setActiveView] =
    useState<'overview' | 'detailed' | 'comparison'>('overview');

  const safeNumber = (v: any, fallback = 0) =>
    Number.isFinite(Number(v)) ? Number(v) : fallback;

  /* ---------- QUALIDADE (robusto) ---------- */
  const lastSimQ =
    simulationResults.length > 0
      ? safeNumber(simulationResults[simulationResults.length - 1].quality, 0)
      : 0;

  const currentQuality =
    [currentParams?.qualidade, (currentParams as any)?.quality]
      .map((v) => safeNumber(v, NaN))
      .find((v) => Number.isFinite(v) && v > 0) ?? lastSimQ;

  const optimizedQualityRaw =
    optimizationResults?.quality ??
    optimizationResults?.predictedQuality ??
    optimizationResults?.bestQuality ??
    optimizationResults?.best?.quality ??
    optimizationResults?.qualidade;

  const optimizedQuality = Number.isFinite(Number(optimizedQualityRaw))
    ? Number(optimizedQualityRaw)
    : null;

  /* ===== Exportação ===== */
  const downloadAllResults = () => {
    const avgQuality =
      simulationResults.length > 0
        ? simulationResults.reduce((sum, r) => sum + safeNumber(r.quality), 0) /
          simulationResults.length
        : 0;

    const bestQuality =
      simulationResults.length > 0
        ? Math.max(...simulationResults.map((r) => safeNumber(r.quality)))
        : 0;

    const csvContent = [
      'Section,Parameter,Value',
      `Current,Temperature,${currentParams.temperatura}`,
      `Current,Time,${currentParams.tempo}`,
      `Current,Pressure,${currentParams.pressao}`,
      `Current,Speed,${currentParams.velocidade}`,
      `Current,Quality,${currentQuality}`,
      `Current,Energy,${currentParams.energia}`,
      ...(optimizationResults
        ? [
            `Optimized,Temperature,${optimizationResults.temperatura ?? ''}`,
            `Optimized,Time,${optimizationResults.tempo ?? ''}`,
            `Optimized,Pressure,${optimizationResults.pressao ?? ''}`,
            `Optimized,Speed,${optimizationResults.velocidade ?? ''}`,
            `Optimized,Quality,${optimizedQuality ?? ''}`,
            `Optimized,Energy,${optimizationResults.energy ?? optimizationResults.energia ?? ''}`,
          ]
        : []),
      ...simulationResults.map(
        (result, i) =>
          `Simulation ${i + 1},Quality,${safeNumber(result.quality).toFixed(2)}`
      ),
      `Summary,Average Quality,${avgQuality.toFixed(2)}`,
      `Summary,Best Quality,${bestQuality.toFixed(2)}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complete_results_${new Date()
      .toISOString()
      .split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    const avg =
      simulationResults.length > 0
        ? (
            simulationResults.reduce(
              (sum, r) => sum + safeNumber(r.quality),
              0
            ) / simulationResults.length
          ).toFixed(2)
        : 'N/A';
    const best =
      simulationResults.length > 0
        ? Math.max(
            ...simulationResults.map((r) => safeNumber(r.quality))
          ).toFixed(2)
        : 'N/A';
    const worst =
      simulationResults.length > 0
        ? Math.min(
            ...simulationResults.map((r) => safeNumber(r.quality))
          ).toFixed(2)
        : 'N/A';

    const reportContent = `
RELATÓRIO DE OTIMIZAÇÃO DE PROCESSOS
=====================================

Data: ${new Date().toLocaleDateString('pt-BR')}
Hora: ${new Date().toLocaleTimeString('pt-BR')}

PARÂMETROS ATUAIS:
- Temperatura: ${currentParams.temperatura}°C
- Tempo: ${currentParams.tempo} min
- Pressão: ${currentParams.pressao} kPa
- Velocidade: ${currentParams.velocidade} rpm
- Qualidade Prevista: ${safeNumber(currentQuality).toFixed(2)}
- Energia Prevista: ${safeNumber(currentParams.energia).toFixed(1)} kWh/ton
${
  optimizationResults
    ? `
PARÂMETROS OTIMIZADOS:
- Temperatura: ${optimizationResults.temperatura ?? '—'}°C
- Tempo: ${optimizationResults.tempo ?? '—'} min
- Pressão: ${optimizationResults.pressao ?? '—'} kPa
- Velocidade: ${optimizationResults.velocidade ?? '—'} rpm
- Qualidade Otimizada: ${optimizedQuality != null ? optimizedQuality.toFixed(2) : '—'}
- Energia Otimizada: ${
        (optimizationResults.energy ?? optimizationResults.energia) != null
          ? safeNumber(optimizationResults.energy ?? optimizationResults.energia).toFixed(1)
          : '—'
      } kWh/ton
- Melhoria: ${optimizationResults.improvement ?? '—'} unidades
`
    : ''
}

RESUMO DAS SIMULAÇÕES:
- Total de simulações: ${simulationResults.length}
- Qualidade média: ${avg}
- Melhor qualidade: ${best}
- Pior qualidade: ${worst}

RECOMENDAÇÕES:
${
  optimizationResults
    ? `1. Implementar os parâmetros otimizados para obter melhoria de ${
        optimizationResults.improvement ?? '—'
      } unidades
2. Monitorar especialmente a temperatura, que tem maior impacto na qualidade
3. Realizar testes piloto antes da implementação completa`
    : `1. Execute a otimização para encontrar os melhores parâmetros
2. Realize mais simulações para validar os resultados
3. Considere análise de sensibilidade para entender melhor os parâmetros`
}

Gerado por: Metalyics Software
Autores: Vitor Lorenzo Cerutti, Bernardo Krauspenhar Paganin, Otávio Susin Horn
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_otimizacao_${new Date()
      .toISOString()
      .split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  /* ===== Pequenos utilitários para análises ===== */
  const classifyQuality = (q: number) =>
    q >= 365 ? 'Excelente' : q >= 355 ? 'Boa' : 'Regular';

  const pct = (num: number, den: number) =>
    den > 0 && Number.isFinite(num) ? (num / den) * 100 : NaN;

  const fmtPct = (v: number) => (Number.isFinite(v) ? `${v.toFixed(1)}%` : '—');

  /* ===== Distribuição (reaproveitada em gráfico + resumo) ===== */
  const qRuimCount = simulationResults.filter((r) => safeNumber(r.quality) < 355).length;
  const qBoaCount = simulationResults.filter(
    (r) => safeNumber(r.quality) >= 355 && safeNumber(r.quality) < 365
  ).length;
  const qExcelenteCount = simulationResults.filter((r) => safeNumber(r.quality) >= 365).length;
  const totalCount = simulationResults.length;

  /* ===== Gráficos base ===== */
  const qualityTrendData = {
    labels: simulationResults.map((_, i) => `Teste ${i + 1}`),
    datasets: [
      {
        label: 'Qualidade',
        data: simulationResults.map((r) => safeNumber(r.quality)),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const qualityDistributionData = {
    labels: ['Qualidade Ruim (<355)', 'Qualidade Boa (355-365)', 'Qualidade Excelente (>365)'],
    datasets: [
      {
        data: [qRuimCount, qBoaCount, qExcelenteCount],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
      },
    ],
  };

  const parameterComparisonData = {
    labels: ['Temperatura', 'Tempo', 'Pressão', 'Velocidade'],
    datasets: [
      {
        label: 'Atual',
        data: [
          currentParams.temperatura,
          currentParams.tempo,
          currentParams.pressao,
          currentParams.velocidade,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      ...(optimizationResults
        ? [
            {
              label: 'Otimizado',
              data: [
                optimizationResults.temperatura ?? 0,
                optimizationResults.tempo ?? 0,
                optimizationResults.pressao ?? 0,
                optimizationResults.velocidade ?? 0,
              ],
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
            },
          ]
        : []),
    ],
  };

  /* ===== Estatística simples ===== */
  const mean =
    simulationResults.length > 0
      ? simulationResults.reduce((s, r) => s + safeNumber(r.quality), 0) / simulationResults.length
      : 0;

  const std =
    simulationResults.length > 1
      ? Math.sqrt(
          simulationResults.reduce((sum, r) => {
            const q = safeNumber(r.quality);
            return sum + Math.pow(q - mean, 2);
          }, 0) / (simulationResults.length - 1)
        )
      : 0;

  const sorted = [...simulationResults].sort(
    (a, b) => safeNumber(a.quality) - safeNumber(b.quality)
  );

  const median =
    simulationResults.length > 0
      ? safeNumber(sorted[Math.floor(simulationResults.length / 2)]?.quality).toFixed(2)
      : '0.00';

  const range =
    simulationResults.length > 0
      ? (
          Math.max(...simulationResults.map((r) => safeNumber(r.quality))) -
          Math.min(...simulationResults.map((r) => safeNumber(r.quality)))
        ).toFixed(2)
      : '0.00';

  /* ===== Energia + Economia Estimada (valores estáveis entre re-renders) ===== */
  const model = React.useMemo(() => getModel('inference'), []);

  // Constantes de negócio (ficam estáveis)
  const ENERGY_PRICE_BRL_PER_KWH = 0.75; // R$/kWh
  const PRODUCTION_TONS_PERIOD = 100; // ton no período
  const SCRAP_COST_R_PER_TON = 1500; // R$/ton sucata/retrabalho
  const MAX_SCRAP_DROP_RATE = 0.06; // teto 6% absolutos
  const DROP_PER_QUALITY_POINT = 0.002; // ~0,2% por ponto de qualidade
  const MIN_ENERGY_KWH_TON = 100; // piso de segurança
  const ENERGY_SAVING_PER_QUALITY_POINT = 1.5; // kWh/ton por ponto de qualidade

  type Econ = {
    energyNow: number;
    energyOptim: number;
    energyDeltaPerTon: number;
    scrapSavingRate: number;
    energySavingBRL: number;
    scrapSavingBRL: number;
    totalSavingBRL: number;
  };
  const [econ, setEcon] = React.useState<Econ>({
    energyNow: 0,
    energyOptim: 0,
    energyDeltaPerTon: 0,
    scrapSavingRate: 0,
    energySavingBRL: 0,
    scrapSavingBRL: 0,
    totalSavingBRL: 0,
  });

  const econKey = React.useMemo(() => {
    const lastSimEnergy =
      (simulationResults as any[]).find((s) =>
        Number.isFinite(Number(s?.energy ?? s?.energia))
      )?.energy ??
      (simulationResults as any[]).find((s) => Number.isFinite(Number(s?.energia)))?.energia ??
      null;

    return JSON.stringify({
      currentParams,
      opt: {
        temperatura: optimizationResults?.temperatura,
        tempo: optimizationResults?.tempo,
        pressao: optimizationResults?.pressao,
        velocidade: optimizationResults?.velocidade,
        energy: optimizationResults?.energy ?? optimizationResults?.energia,
        quality: optimizedQuality,
      },
      currentQuality,
      lastSimEnergy,
      simCount: simulationResults.length,
    });
  }, [currentParams, optimizationResults, optimizedQuality, currentQuality, simulationResults]);

  const inferEnergyFromParams = (p: any): number => {
    if (!p) return NaN;
    try {
      const pred = model.predict({
        temp: Number(p.temperatura ?? p.temp),
        time: Number(p.tempo ?? p.time),
        press: Number(p.pressao ?? p.press),
        speed: Number(p.velocidade ?? p.speed),
      });
      return Number(pred?.energy);
    } catch {
      return NaN;
    }
  };

  React.useEffect(() => {
    // energia atual
    let energyNowLocal = safeNumber(
      (currentParams as any)?.energia ?? (currentParams as any)?.energy,
      NaN
    );
    if (!Number.isFinite(energyNowLocal) || energyNowLocal <= 0) {
      energyNowLocal = safeNumber(inferEnergyFromParams(currentParams), NaN);
    }
    if (!Number.isFinite(energyNowLocal) || energyNowLocal <= 0) {
      const simWithEnergy = simulationResults.find((s: any) =>
        Number.isFinite(Number((s as any)?.energy ?? (s as any)?.energia))
      ) as any;
      energyNowLocal = safeNumber(simWithEnergy?.energy ?? simWithEnergy?.energia, NaN);
    }
    if (!Number.isFinite(energyNowLocal) || energyNowLocal <= 0) {
      energyNowLocal = 600; // fallback conservador
    }

    // qualidade (ganho)
    const qNow = safeNumber(currentQuality, 0);
    const qOpt = optimizedQuality != null && Number.isFinite(optimizedQuality)
      ? Number(optimizedQuality)
      : null;
    const qualityGain = Math.max(0, (qOpt ?? 0) - qNow);

    // energia otimizada
    let energyOptimLocal = safeNumber(
      optimizationResults?.energy ?? optimizationResults?.energia,
      NaN
    );
    if (!Number.isFinite(energyOptimLocal)) {
      const sourceParams = optimizationResults?.bestParams ?? optimizationResults;
      energyOptimLocal = safeNumber(inferEnergyFromParams(sourceParams), NaN);
    }
    if (!Number.isFinite(energyOptimLocal)) {
      energyOptimLocal = energyNowLocal; // sem dado → igual ao atual
    }
    // proxy pró-economia quando não há redução explícita
    if (energyOptimLocal >= energyNowLocal) {
      energyOptimLocal = Math.max(
        MIN_ENERGY_KWH_TON,
        energyNowLocal - qualityGain * ENERGY_SAVING_PER_QUALITY_POINT
      );
    }

    // deltas e economias
    const energyDeltaPerTonLocal = Math.max(0, energyNowLocal - energyOptimLocal);
    const scrapSavingRateLocal = Math.min(
      MAX_SCRAP_DROP_RATE,
      qualityGain * DROP_PER_QUALITY_POINT
    );

    const energySavingBRLLocal =
      energyDeltaPerTonLocal * ENERGY_PRICE_BRL_PER_KWH * PRODUCTION_TONS_PERIOD;

    const scrapSavingBRLLocal =
      scrapSavingRateLocal * SCRAP_COST_R_PER_TON * PRODUCTION_TONS_PERIOD;

    setEcon({
      energyNow: energyNowLocal,
      energyOptim: energyOptimLocal,
      energyDeltaPerTon: energyDeltaPerTonLocal,
      scrapSavingRate: scrapSavingRateLocal,
      energySavingBRL: energySavingBRLLocal,
      scrapSavingBRL: scrapSavingBRLLocal,
      totalSavingBRL: energySavingBRLLocal + scrapSavingBRLLocal,
    });
  }, [econKey]);

  // ===== Chart (usa valores estáveis do estado)
  const axisColor = isDark ? '#e5e7eb' : '#374151';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  const savingsBarData = {
    labels: ['Energia (R$)', 'Desperdício (R$)', 'Total (R$)'],
    datasets: [
      {
        label: 'Economia',
        data: [econ.energySavingBRL, econ.scrapSavingBRL, econ.totalSavingBRL],
        backgroundColor: [
          'rgba(59,130,246,0.85)',
          'rgba(16,185,129,0.85)',
          'rgba(147,51,234,0.85)',
        ],
        borderRadius: 10,
      },
    ],
  };

  const savingsBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        title: { display: true, text: 'R$', color: axisColor },
        ticks: { color: axisColor },
        grid: { color: gridColor },
      },
      x: {
        ticks: { color: axisColor },
        grid: { display: false },
      },
    },
  };

  /* ======================= UI ======================= */
  return (
    <div className="space-y-6">
      {/* Container premium */}
      <div
        className={`rounded-2xl border p-6 bg-gradient-to-br ${
          isDark
            ? 'from-blue-950/60 via-gray-900/50 to-gray-900/70 border-blue-900/40'
            : 'from-blue-50 via-white to-white border-blue-200'
        } shadow`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-2xl font-bold flex items-center ${
              isDark ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            <span
              className={`p-2 rounded-lg mr-2 ${
                isDark ? 'bg-blue-900/40 text-blue-200' : 'bg-blue-600 text-white'
              }`}
            >
              <FileText className="h-5 w-5" />
            </span>
            <span>Resultados e Relatórios</span>
          </h2>

          <div className="flex gap-2">
            <button
              onClick={downloadAllResults}
              className={`flex items-center px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-700 transition-all hover:shadow-lg`}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar CSV
            </button>
            <button
              onClick={generateReport}
              className={`flex items-center px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-700 transition-all hover:shadow-lg`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Gerar Relatório
            </button>
          </div>
        </div>

        {/* View Selector */}
        <div
          className={`flex space-x-1 mb-6 rounded-xl p-1 ${
            isDark ? 'bg-gray-800/60 border border-gray-700' : 'bg-white/60 backdrop-blur border border-gray-200'
          }`}
        >
          <button
            onClick={() => setActiveView('overview')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeView === 'overview'
                ? isDark
                  ? 'bg-gray-700 text-blue-300 shadow'
                  : 'bg-white text-blue-700 shadow'
                : isDark
                ? 'text-gray-300 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveView('detailed')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeView === 'detailed'
                ? isDark
                  ? 'bg-gray-700 text-blue-300 shadow'
                  : 'bg-white text-blue-700 shadow'
                : isDark
                ? 'text-gray-300 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Análise Detalhada
          </button>
          <button
            onClick={() => setActiveView('comparison')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeView === 'comparison'
                ? isDark
                  ? 'bg-gray-700 text-blue-300 shadow'
                  : 'bg-white text-blue-700 shadow'
                : isDark
                ? 'text-gray-300 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Comparação
          </button>
        </div>

        {/* ===== Overview ===== */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                className={`p-4 rounded-xl border bg-gradient-to-br ${
                  isDark
                    ? 'from-blue-950/50 to-gray-900/50 border-blue-900/40'
                    : 'from-blue-50 to-white border-blue-200'
                }`}
              >
                <div className="flex items-center">
                  <span
                    className={`p-2 rounded-lg mr-3 ${
                      isDark ? 'bg-blue-900/40 text-blue-200' : 'bg-blue-600 text-white'
                    }`}
                  >
                    <TrendingUp className="h-5 w-5" />
                  </span>
                  <div>
                    <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Qualidade Atual
                    </div>
                    <div
                      className={`text-2xl font-extrabold ${
                        isDark ? 'text-gray-100' : 'text-gray-800'
                      }`}
                    >
                      {safeNumber(currentQuality).toFixed(1)}
                      <span className="text-lg text-gray-500">/400</span>
                    </div>
                  </div>
                </div>
              </div>

              {!!optimizationResults && (
                <div
                  className={`p-4 rounded-xl border bg-gradient-to-br ${
                    isDark
                      ? 'from-emerald-950/50 to-gray-900/50 border-emerald-900/40'
                      : 'from-emerald-50 to-white border-emerald-200'
                  }`}
                >
                  <div className="flex items-center">
                    <span
                      className={`p-2 rounded-lg mr-3 ${
                        isDark
                          ? 'bg-emerald-900/40 text-emerald-200'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      <Award className="h-5 w-5" />
                    </span>
                    <div>
                      <div
                        className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        Qualidade Otimizada
                      </div>
                      <div
                        className={`text-2xl font-extrabold ${
                          isDark ? 'text-gray-100' : 'text-gray-800'
                        }`}
                      >
                        {optimizedQuality != null ? (
                          <>
                            {optimizedQuality.toFixed(1)}
                            <span className="text-lg text-gray-500">/400</span>
                          </>
                        ) : (
                          <>
                            —<span className="text-lg text-gray-500">/400</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`p-4 rounded-xl border bg-gradient-to-br ${
                  isDark
                    ? 'from-violet-950/50 to-gray-900/50 border-violet-900/40'
                    : 'from-violet-50 to-white border-violet-200'
                }`}
              >
                <div className="flex items-center">
                  <span
                    className={`p-2 rounded-lg mr-3 ${
                      isDark ? 'bg-violet-900/40 text-violet-200' : 'bg-violet-600 text-white'
                    }`}
                  >
                    <BarChart3 className="h-5 w-5" />
                  </span>
                  <div>
                    <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Total de Simulações
                    </div>
                    <div
                      className={`text-2xl font-extrabold ${
                        isDark ? 'text-gray-100' : 'text-gray-800'
                      }`}
                    >
                      {simulationResults.length}
                    </div>
                  </div>
                </div>
              </div>

              {simulationResults.length > 0 && (
                <div
                  className={`p-4 rounded-xl border bg-gradient-to-br ${
                    isDark
                      ? 'from-amber-950/50 to-gray-900/50 border-amber-900/40'
                      : 'from-amber-50 to-white border-amber-200'
                  }`}
                >
                  <div className="flex items-center">
                    <span
                      className={`p-2 rounded-lg mr-3 ${
                        isDark ? 'bg-amber-900/40 text-amber-200' : 'bg-amber-500 text-white'
                      }`}
                    >
                      <PieChart className="h-5 w-5" />
                    </span>
                    <div>
                      <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Melhor Simulação
                      </div>
                      <div
                        className={`text-2xl font-extrabold ${
                          isDark ? 'text-gray-100' : 'text-gray-800'
                        }`}
                      >
                        {Math.max(
                          ...simulationResults.map((r) => safeNumber(r.quality))
                        ).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Insights rápidos */}
            <div
              className={`rounded-2xl border p-6 bg-gradient-to-br ${
                isDark
                  ? 'from-gray-900/50 to-gray-900/70 border-gray-700'
                  : 'from-gray-50 to-white border-gray-200'
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-gray-100' : 'text-gray-800'
                }`}
              >
                Insights Rápidos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4
                    className={`font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    📊 Análise de Performance
                  </h4>
                  <ul
                    className={`space-y-1 text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <li>
                      •{' '}
                      {simulationResults.length > 0
                        ? `Qualidade média das simulações: ${(
                            simulationResults.reduce(
                              (sum, r) => sum + safeNumber(r.quality),
                              0
                            ) / simulationResults.length
                          ).toFixed(1)}`
                        : 'Nenhuma simulação executada ainda'}
                    </li>
                    <li>
                      •{' '}
                      {optimizationResults
                        ? `Melhoria potencial: +${
                            optimizationResults.improvement ?? '—'
                          } unidades`
                        : 'Execute a otimização para ver melhorias potenciais'}
                    </li>
                    <li>
                      •{' '}
                      {currentQuality >= 365
                        ? 'Parâmetros atuais já produzem excelente qualidade'
                        : currentQuality >= 355
                        ? 'Parâmetros atuais produzem boa qualidade'
                        : 'Parâmetros atuais precisam de otimização'}
                    </li>
                    <li>
                      • Consumo energético atual:{' '}
                      {safeNumber(econ.energyNow).toFixed(1)} kWh/ton (
                      {econ.energyNow < 500
                        ? 'muito eficiente'
                        : econ.energyNow < 600
                        ? 'eficiente'
                        : 'ineficiente'}
                      )
                    </li>
                  </ul>
                </div>
                <div>
                  <h4
                    className={`font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    🎯 Recomendações
                  </h4>
                  <ul
                    className={`space-y-1 text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <li>
                      •{' '}
                      {optimizationResults
                        ? 'Implemente os parâmetros otimizados gradualmente'
                        : 'Execute a otimização para encontrar melhores parâmetros'}
                    </li>
                    <li>
                      •{' '}
                      {simulationResults.length < 10
                        ? 'Execute mais simulações para validar resultados'
                        : 'Dados suficientes coletados para análise confiável'}
                    </li>
                    <li>• Monitore a temperatura de perto - é o parâmetro mais crítico</li>
                    <li>
                      •{' '}
                      {econ.energyNow > 600
                        ? 'Considere reduzir temperatura ou tempo para economizar energia'
                        : 'Consumo energético está em nível aceitável'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== Detailed ===== */}
        {activeView === 'detailed' && simulationResults.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tendência de Qualidade */}
              <div
                className={`rounded-2xl border p-4 bg-gradient-to-br ${
                  isDark
                    ? 'from-blue-950/40 to-gray-900/60 border-blue-900/40'
                    : 'from-white to-white border-gray-200'
                }`}
              >
                <h3
                  className={`font-semibold mb-4 ${
                    isDark ? 'text-gray-100' : 'text-gray-700'
                  }`}
                >
                  Tendência de Qualidade
                </h3>
                <Line
                  data={qualityTrendData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { labels: { color: isDark ? '#e5e7eb' : '#374151' } },
                    },
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: 'Qualidade',
                          color: isDark ? '#e5e7eb' : '#374151',
                        },
                        ticks: { color: isDark ? '#e5e7eb' : '#374151' },
                        grid: { color: isDark ? '#374151' : '#e5e7eb' },
                      },
                      x: {
                        ticks: { color: isDark ? '#e5e7eb' : '#374151' },
                        grid: { color: isDark ? '#374151' : '#e5e7eb' },
                      },
                    },
                  }}
                />

                {/* RESUMO AUTOMÁTICO – Tendência (Design Premium) */}
                {simulationResults.length > 0 && (
                  <div
                    className={`mt-3 rounded-xl p-3 border shadow-sm bg-gradient-to-br ${
                      isDark
                        ? 'from-blue-950/30 to-gray-900/30 border-blue-900/40'
                        : 'from-blue-50 to-white border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${
                          isDark ? 'bg-blue-900/40 text-blue-200' : 'bg-blue-600/10 text-blue-700'
                        }`}
                      >
                        <Info className="h-3.5 w-3.5" />
                        Análise automática
                      </span>
                    </div>

                    {(() => {
                      const first = safeNumber(simulationResults[0]?.quality, 0);
                      const last = safeNumber(simulationResults[simulationResults.length - 1]?.quality, 0);
                      const delta = last - first;
                      const trendTxt = delta > 0 ? 'alta' : delta < 0 ? 'queda' : 'estável';
                      const icon =
                        delta > 0 ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : delta < 0 ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <Info className="h-4 w-4" />
                        );

                      return (
                        <ul className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'} space-y-1`}>
                          <li className="flex items-center gap-2">
                            {icon}
                            Tendência: {trendTxt} ({delta >= 0 ? '+' : ''}
                            {delta.toFixed(1)} pontos)
                          </li>
                          <li className="flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Variabilidade (dp): {std.toFixed(2)} • Mediana: {median}
                          </li>
                          <li className="flex items-center gap-2">
                            {last >= 365 ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : last >= 355 ? (
                              <Info className="h-4 w-4" />
                            ) : (
                              <AlertTriangle className="h-4 w-4" />
                            )}
                            Nível atual: {classifyQuality(last)}
                          </li>
                        </ul>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Distribuição de Qualidade */}
              <div
                className={`rounded-2xl border p-4 bg-gradient-to-br ${
                  isDark
                    ? 'from-violet-950/40 to-gray-900/60 border-violet-900/40'
                    : 'from-white to-white border-gray-200'
                }`}
              >
                <h3
                  className={`font-semibold mb-4 ${
                    isDark ? 'text-gray-100' : 'text-gray-700'
                  }`}
                >
                  Distribuição de Qualidade
                </h3>
                <Doughnut
                  data={qualityDistributionData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: isDark ? '#e5e7eb' : '#374151' },
                      },
                    },
                  }}
                />

                {/* RESUMO AUTOMÁTICO – Distribuição (Design Premium) */}
                {totalCount > 0 && (
                  <div
                    className={`mt-3 rounded-xl p-3 border shadow-sm bg-gradient-to-br ${
                      isDark
                        ? 'from-violet-950/30 to-gray-900/30 border-violet-900/40'
                        : 'from-violet-50 to-white border-violet-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${
                          isDark ? 'bg-violet-900/40 text-violet-200' : 'bg-violet-600/10 text-violet-700'
                        }`}
                      >
                        <Info className="h-3.5 w-3.5" />
                        Análise automática
                      </span>
                    </div>

                    {(() => {
                      const pRuim = pct(qRuimCount, totalCount);
                      const pBoa = pct(qBoaCount, totalCount);
                      const pExc = pct(qExcelenteCount, totalCount);
                      const maior = Math.max(pRuim, pBoa, pExc);
                      const bucket =
                        maior === pExc ? 'Excelente' : maior === pBoa ? 'Boa' : 'Ruim';
                      const icon =
                        maior === pExc ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : maior === pBoa ? (
                          <Info className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        );

                      return (
                        <ul className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'} space-y-1`}>
                          <li className="flex items-center gap-2">
                            {icon}
                            Predominância: {bucket} ({fmtPct(maior)})
                          </li>
                          <li className="flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Ruim: {qRuimCount} ({fmtPct(pRuim)}) · Boa: {qBoaCount} ({fmtPct(pBoa)}) · Excelente: {qExcelenteCount} ({fmtPct(pExc)})
                          </li>
                        </ul>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Resumo estatístico */}
            <div
              className={`rounded-2xl border p-6 bg-gradient-to-br ${
                isDark
                  ? 'from-gray-900/50 to-gray-900/70 border-gray-700'
                  : 'from-white to-white border-gray-200'
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-gray-100' : 'text-gray-700'
                }`}
              >
                Resumo Estatístico
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Média
                  </div>
                  <div
                    className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}
                  >
                    {mean.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Mediana
                  </div>
                  <div
                    className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}
                  >
                    {median}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Desvio Padrão
                  </div>
                  <div
                    className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}
                  >
                    {std.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Amplitude
                  </div>
                  <div
                    className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}
                  >
                    {range}
                  </div>
                </div>
              </div>
            </div>

            {/* Economia Estimada (R$) */}
            <div
              className={`rounded-2xl border p-6 bg-gradient-to-br transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${
                isDark
                  ? 'from-emerald-950/60 to-gray-900/60 border-emerald-900/40'
                  : 'from-emerald-50 to-white border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2.5 rounded-lg ${
                      isDark
                        ? 'bg-emerald-900/40 text-emerald-200'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    <Coins className="h-5 w-5" />
                  </div>
                  <h3
                    className={`text-lg font-bold ${
                      isDark ? 'text-gray-100' : 'text-gray-800'
                    }`}
                  >
                    Economia Estimada (R$) — baseada na sua simulação/otimização
                  </h3>
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Sem entradas extras · valores padrão internos (tarifa/produção/refugo)
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div
                  className={`rounded-xl p-4 border bg-gradient-to-br ${
                    isDark
                      ? 'from-emerald-950/40 to-gray-900/40 border-emerald-900/30'
                      : 'from-emerald-50 to-white border-emerald-200'
                  }`}
                >
                  <div
                    className={`text-xs ${
                      isDark ? 'text-emerald-200' : 'text-emerald-700'
                    }`}
                  >
                    Economia de Energia
                  </div>
                  <div
                    className={`text-2xl font-extrabold ${
                      isDark ? 'text-gray-100' : 'text-emerald-900'
                    }`}
                  >
                    R{'$ '}
                    {econ.energySavingBRL.toLocaleString('pt-BR', {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {econ.energyDeltaPerTon.toFixed(1)} kWh/ton × R$ {ENERGY_PRICE_BRL_PER_KWH.toFixed(2)} × {PRODUCTION_TONS_PERIOD} ton
                  </div>
                </div>

                <div
                  className={`rounded-xl p-4 border bg-gradient-to-br ${
                    isDark
                      ? 'from-blue-950/40 to-gray-900/40 border-blue-900/30'
                      : 'from-blue-50 to-white border-blue-200'
                  }`}
                >
                  <div
                    className={`text-xs ${
                      isDark ? 'text-blue-200' : 'text-blue-700'
                    }`}
                  >
                    Economia por Desperdício
                  </div>
                  <div
                    className={`text-2xl font-extrabold ${
                      isDark ? 'text-gray-100' : 'text-blue-900'
                    }`}
                  >
                    R{'$ '}
                    {(econ.scrapSavingBRL).toLocaleString('pt-BR', {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    queda ~{(econ.scrapSavingRate * 100).toFixed(1)}% × R$ {SCRAP_COST_R_PER_TON.toLocaleString('pt-BR')} × {PRODUCTION_TONS_PERIOD} ton
                  </div>
                </div>

                <div
                  className={`rounded-xl p-4 border bg-gradient-to-br ${
                    isDark
                      ? 'from-violet-950/40 to-gray-900/40 border-violet-900/30'
                      : 'from-violet-50 to-white border-violet-200'
                  }`}
                >
                  <div
                    className={`text-xs ${
                      isDark ? 'text-violet-200' : 'text-violet-700'
                    }`}
                  >
                    Total Estimado
                  </div>
                  <div
                    className={`text-3xl font-black ${
                      isDark ? 'text-gray-100' : 'text-violet-900'
                    }`}
                  >
                    R{'$ '}
                    {(econ.totalSavingBRL).toLocaleString('pt-BR', {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Com base em “Atual vs Otimizado” que você já executou
                  </div>
                </div>
              </div>

              {/* COMPARAÇÃO RÁPIDA (percentuais) — Design Premium */}
              <div
                className={`rounded-xl p-4 mb-4 border shadow-sm bg-gradient-to-br ${
                  isDark
                    ? 'from-emerald-950/40 to-gray-900/40 border-emerald-900/40'
                    : 'from-emerald-50 to-white border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${
                      isDark ? 'bg-emerald-900/40 text-emerald-200' : 'bg-emerald-600/10 text-emerald-700'
                    }`}
                  >
                    <Info className="h-3.5 w-3.5" />
                    Comparação rápida
                  </span>
                </div>

                {(() => {
                  const energyRedPctNum = pct(econ.energyDeltaPerTon, econ.energyNow);
                  const energyRedPct = fmtPct(energyRedPctNum);
                  const hasEnergyGain = Number.isFinite(energyRedPctNum) && econ.energyDeltaPerTon > 0;

                  const hasQ =
                    optimizedQuality != null &&
                    Number.isFinite(Number(optimizedQuality)) &&
                    currentQuality > 0;
                  const qDelta = hasQ ? (Number(optimizedQuality) - currentQuality) : NaN;
                  const qPctNum = hasQ ? pct(qDelta, currentQuality) : NaN;
                  const qPct = fmtPct(qPctNum);

                  return (
                    <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'} grid grid-cols-1 md:grid-cols-2 gap-3`}>
                      <div className="flex items-center gap-2">
                        {hasEnergyGain ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        Redução de energia: <span className="font-semibold ml-1">{energyRedPct}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {qDelta > 0 ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : qDelta === 0 ? (
                          <Info className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        Aumento de qualidade:{' '}
                        <span className="font-semibold ml-1">{qPct}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div
                className={`rounded-xl p-4 ${
                  isDark
                    ? 'bg-gray-800/70 border border-gray-700'
                    : 'bg-white/60 backdrop-blur border border-gray-200'
                }`}
                style={{ height: 300 }}
              >
                <Bar data={savingsBarData} options={savingsBarOptions as any} />
              </div>
            </div>
          </div>
        )}

        {/* Estado vazio da análise detalhada */}
        {activeView === 'detailed' && simulationResults.length === 0 && (
          <div
            className={`p-8 text-center rounded-2xl border ${
              isDark
                ? 'bg-gray-900/50 border-gray-700'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <BarChart3
              className={`h-16 w-16 mx-auto mb-4 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}
            />
            <div
              className={`text-lg ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              } mb-2`}
            >
              Nenhuma simulação executada ainda
            </div>
            <div
              className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Execute simulações na aba correspondente para ver análises
              detalhadas
            </div>
          </div>
        )}

        {/* ===== Comparison ===== */}
        {activeView === 'comparison' && (
          <div className="space-y-6">
            {optimizationResults ? (
              <div
                className={`rounded-2xl border p-4 bg-gradient-to-br ${
                  isDark
                    ? 'from-gray-900/50 to-gray-900/70 border-gray-700'
                    : 'from-white to-white border-gray-200'
                }`}
              >
                <h3
                  className={`font-semibold mb-4 ${
                    isDark ? 'text-gray-100' : 'text-gray-700'
                  }`}
                >
                  Comparação: Atual vs Otimizado
                </h3>
                <Bar
                  data={parameterComparisonData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { labels: { color: isDark ? '#e5e7eb' : '#374151' } },
                    },
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: 'Valor',
                          color: isDark ? '#e5e7eb' : '#374151',
                        },
                        ticks: { color: isDark ? '#e5e7eb' : '#374151' },
                        grid: { color: isDark ? '#374151' : '#e5e7eb' },
                      },
                      x: {
                        ticks: { color: isDark ? '#e5e7eb' : '#374151' },
                        grid: { color: isDark ? '#374151' : '#e5e7eb' },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <div
                className={`p-8 text-center rounded-2xl border ${
                  isDark
                    ? 'bg-gray-900/50 border-gray-700'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div
                  className={`text-lg ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  } mb-2`}
                >
                  Nenhuma otimização executada ainda
                </div>
                <div
                  className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Execute a otimização na aba correspondente para ver comparações
                </div>
              </div>
            )}

            {optimizationResults && (
              <div
                className={`rounded-2xl border p-6 bg-gradient-to-br ${
                  isDark
                    ? 'from-emerald-950/50 to-gray-900/60 border-emerald-900/40'
                    : 'from-emerald-50 to-white border-emerald-200'
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${
                    isDark ? 'text-emerald-200' : 'text-emerald-800'
                  }`}
                >
                  Resumo das Melhorias
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div
                      className={`text-sm ${
                        isDark ? 'text-emerald-300' : 'text-emerald-600'
                      }`}
                    >
                      Melhoria na Qualidade
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        isDark ? 'text-emerald-100' : 'text-emerald-800'
                      }`}
                    >
                      +{optimizationResults.improvement ?? '—'} unidades
                    </div>
                    <div
                      className={`text-sm ${
                        isDark ? 'text-emerald-300' : 'text-emerald-600'
                      }`}
                    >
                      {currentQuality
                        ? `(${(
                            (safeNumber(optimizationResults.improvement) /
                              currentQuality) *
                            100
                          ).toFixed(1)}% de melhoria)`
                        : '(—)'}
                    </div>
                  </div>
                  <div>
                    <div
                      className={`text-sm ${
                        isDark ? 'text-emerald-300' : 'text-emerald-600'
                      }`}
                    >
                      Parâmetro Mais Alterado
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        isDark ? 'text-emerald-100' : 'text-emerald-800'
                      }`}
                    >
                      Temperatura
                    </div>
                    <div
                      className={`text-sm ${
                        isDark ? 'text-emerald-300' : 'text-emerald-600'
                      }`}
                    >
                      {(
                        safeNumber(optimizationResults.temperatura) -
                        currentParams.temperatura
                      ) >= 0
                        ? '+'
                        : ''}
                      {(
                        safeNumber(optimizationResults.temperatura) -
                        currentParams.temperatura
                      ).toFixed(1)}
                      °C
                    </div>
                  </div>
                  <div>
                    <div
                      className={`text-sm ${
                        isDark ? 'text-emerald-300' : 'text-emerald-600'
                      }`}
                    >
                      Classificação Final
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        isDark ? 'text-emerald-100' : 'text-emerald-800'
                      }`}
                    >
                      {optimizedQuality != null
                        ? optimizedQuality >= 365
                          ? 'Excelente'
                          : optimizedQuality >= 355
                          ? 'Boa'
                          : 'Regular'
                        : '—'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};



