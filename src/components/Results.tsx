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

  /* ====================== FONTE CONFIÁVEL DE DADOS ====================== */
  // Qualidade Atual: tenta currentParams.qualidade -> quality -> último valor simulado
  const lastSimQ =
    simulationResults.length > 0
      ? safeNumber(simulationResults[simulationResults.length - 1].quality, 0)
      : 0;

  const currentQuality =
    [currentParams?.qualidade, (currentParams as any)?.quality]
      .map((v) => safeNumber(v, NaN))
      .find((v) => Number.isFinite(v) && v > 0) ?? lastSimQ;

  // Qualidade Otimizada: varredura de campos comuns + fallbacks
  const optimizedQualityCandidates: any[] = [
    optimizationResults?.quality,
    optimizationResults?.Quality,
    optimizationResults?.optimizedQuality,
    optimizationResults?.qualityOptimized,
    optimizationResults?.bestQuality,
    optimizationResults?.predictedQuality,
    optimizationResults?.summary?.quality,
    optimizationResults?.best?.quality,
    optimizationResults?.best?.metrics?.quality,
    optimizationResults?.best?.pred?.quality,
    optimizationResults?.best?.yQuality,
  ];
  let optimizedQuality: number | null = null;
  for (const c of optimizedQualityCandidates) {
    if (Number.isFinite(Number(c))) {
      optimizedQuality = Number(c);
      break;
    }
  }
  // fallback: melhor qualidade entre simulações
  if (optimizedQuality == null && simulationResults.length > 0) {
    optimizedQuality = Math.max(
      ...simulationResults.map((r) => safeNumber(r.quality))
    );
  }

  /* ============================ EXPORTADORES ============================ */
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
            `Optimized,Energy,${optimizationResults.energy ?? ''}`,
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
        optimizationResults.energy != null
          ? safeNumber(optimizationResults.energy).toFixed(1)
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

  /* ============================== GRÁFICOS ============================== */
  const axisColor = isDark ? '#e5e7eb' : '#374151';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

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
    labels: [
      'Qualidade Ruim (<355)',
      'Qualidade Boa (355-365)',
      'Qualidade Excelente (>365)',
    ],
    datasets: [
      {
        data: [
          simulationResults.filter((r) => safeNumber(r.quality) < 355).length,
          simulationResults.filter(
            (r) =>
              safeNumber(r.quality) >= 355 && safeNumber(r.quality) < 365
          ).length,
          simulationResults.filter((r) => safeNumber(r.quality) >= 365).length,
        ],
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
        backgroundColor: 'rgba(59, 130, 246, 0.85)',
        borderRadius: 10,
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
              backgroundColor: 'rgba(34, 197, 94, 0.85)',
              borderRadius: 10,
            },
          ]
        : []),
    ],
  };

  /* ==================== ECONOMIA ESTIMADA (R$) – SIMPLES ==================== */
  const ENERGY_PRICE_BRL_PER_KWH = 0.75; // valor referência
  const PRODUCTION_TONS_PERIOD = 100; // período de produção (ton)
  const SCRAP_COST_R_PER_TON = 1500; // custo estimado de sucata (R$/ton)
  const SCRAP_RATE_DROP_POINTS = 1.5; // % de queda por melhoria

  const energyNow = safeNumber(currentParams?.energia, 0);
  const energyOptim = safeNumber(optimizationResults?.energy, energyNow);
  const energySavingPerTon = Math.max(0, energyNow - energyOptim);
  const energySavingBRL =
    energySavingPerTon *
    ENERGY_PRICE_BRL_PER_KWH *
    PRODUCTION_TONS_PERIOD;

  const scrapSavingRate = Math.max(0, SCRAP_RATE_DROP_POINTS / 100);
  const scrapSavingBRL =
    scrapSavingRate * SCRAP_COST_R_PER_TON * PRODUCTION_TONS_PERIOD;

  const totalSavingBRL = energySavingBRL + scrapSavingBRL;

  const savingsBarData = {
    labels: ['Energia (R$)', 'Desperdício (R$)', 'Total (R$)'],
    datasets: [
      {
        label: 'Economia',
        data: [energySavingBRL, scrapSavingBRL, totalSavingBRL],
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

  /* ============================== ESTATÍSTICAS ============================== */
  const mean =
    simulationResults.length > 0
      ? simulationResults.reduce(
          (s, r) => s + safeNumber(r.quality),
          0
        ) / simulationResults.length
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
      ? safeNumber(
          sorted[Math.floor(simulationResults.length / 2)]?.quality
        ).toFixed(2)
      : '0.00';
  const range =
    simulationResults.length > 0
      ? (
          Math.max(...simulationResults.map((r) => safeNumber(r.quality))) -
          Math.min(...simulationResults.map((r) => safeNumber(r.quality)))
        ).toFixed(2)
      : '0.00';

  /* ================================ UI PREMIUM ================================ */
  const shell = isDark
    ? 'from-slate-900/80 to-slate-800/60 border-slate-700/70'
    : 'from-white to-slate-50 border-slate-200';
  const tabBg = isDark ? 'bg-slate-800/70' : 'bg-slate-100';
  const textMain = isDark ? 'text-slate-100' : 'text-slate-800';
  const textSub = isDark ? 'text-slate-300' : 'text-slate-600';

  return (
    <div className="space-y-6">
      {/* Contêiner principal com vidro/gradiente */}
      <div
        className={`rounded-2xl border bg-gradient-to-b ${shell} backdrop-blur-md shadow-xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2
            className={`text-2xl font-bold flex items-center gap-3 ${textMain}`}
          >
            <FileText className="h-7 w-7 text-blue-400" />
            <span>Resultados e Relatórios</span>
          </h2>

          <div className="flex gap-3">
            <button
              onClick={downloadAllResults}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-700 transition shadow-md"
            >
              <Download className="h-4 w-4" />
              Baixar CSV
            </button>
            <button
              onClick={generateReport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-700 transition shadow-md"
            >
              <FileText className="h-4 w-4" />
              Gerar Relatório
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div
            className={`flex items-center gap-2 p-1 rounded-xl ${tabBg} border border-white/10`}
          >
            <button
              onClick={() => setActiveView('overview')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                activeView === 'overview'
                  ? 'bg-white/10 text-blue-300 shadow-inner'
                  : `${textSub} hover:text-slate-200`
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveView('detailed')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                activeView === 'detailed'
                  ? 'bg-white/10 text-blue-300 shadow-inner'
                  : `${textSub} hover:text-slate-200`
              }`}
            >
              Análise Detalhada
            </button>
            <button
              onClick={() => setActiveView('comparison')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                activeView === 'comparison'
                  ? 'bg-white/10 text-blue-300 shadow-inner'
                  : `${textSub} hover:text-slate-200`
              }`}
            >
              Comparação
            </button>
          </div>
        </div>

        {/* ============================ OVERVIEW ============================ */}
        {activeView === 'overview' && (
          <div className="p-6 space-y-6">
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Qualidade Atual */}
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-5 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className={`text-sm ${textSub}`}>Qualidade Atual</div>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {safeNumber(currentQuality).toFixed(1)}
                  <span className="text-lg text-slate-400">/400</span>
                </div>
              </div>

              {/* Qualidade Otimizada */}
              <div className="rounded-xl border border-white/10 bg-emerald-500/5 backdrop-blur p-5 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className={`text-sm ${textSub}`}>Qualidade Otimizada</div>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {optimizedQuality != null
                    ? safeNumber(optimizedQuality).toFixed(1)
                    : '—'}
                  <span className="text-lg text-slate-400">/400</span>
                </div>
              </div>

              {/* Total de Simulações */}
              <div className="rounded-xl border border-white/10 bg-fuchsia-500/5 backdrop-blur p-5 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-fuchsia-500/15 text-fuchsia-400">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div className={`text-sm ${textSub}`}>Total de Simulações</div>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {simulationResults.length}
                </div>
              </div>

              {/* Melhor Simulação */}
              <div className="rounded-xl border border-white/10 bg-amber-500/5 backdrop-blur p-5 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
                    <PieChart className="h-6 w-6" />
                  </div>
                  <div className={`text-sm ${textSub}`}>Melhor Simulação</div>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {simulationResults.length > 0
                    ? Math.max(
                        ...simulationResults.map((r) => safeNumber(r.quality))
                      ).toFixed(1)
                    : '—'}
                </div>
              </div>
            </div>

            {/* Economia Estimada (R$) */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/15 text-violet-300">
                    <Coins className="h-6 w-6" />
                  </div>
                  <h3 className={`font-semibold ${textMain}`}>
                    Economia Estimada (período)
                  </h3>
                </div>
                <div className="text-sm text-slate-300">
                  Total: <b className="text-white">R$ {totalSavingBRL.toFixed(2)}</b>
                </div>
              </div>

              <Bar data={savingsBarData} options={savingsBarOptions as any} />
              <p className="text-xs text-slate-400 mt-3">
                *Estimativa simples usando preço de energia de R$ {ENERGY_PRICE_BRL_PER_KWH.toFixed(2)}/kWh,
                produção de {PRODUCTION_TONS_PERIOD} ton e queda de {SCRAP_RATE_DROP_POINTS}% em sucata.
              </p>
            </div>
          </div>
        )}

        {/* ======================== ANÁLISE DETALHADA ======================== */}
        {activeView === 'detailed' && (
          <div className="p-6 space-y-6">
            {simulationResults.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-md">
                    <h3 className={`font-semibold mb-4 ${textMain}`}>
                      Tendência de Qualidade
                    </h3>
                    <Line
                      data={qualityTrendData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            labels: { color: axisColor },
                          },
                        },
                        scales: {
                          y: {
                            title: {
                              display: true,
                              text: 'Qualidade',
                              color: axisColor,
                            },
                            ticks: { color: axisColor },
                            grid: { color: gridColor },
                          },
                          x: {
                            ticks: { color: axisColor },
                            grid: { color: gridColor },
                          },
                        },
                      }}
                    />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-md">
                    <h3 className={`font-semibold mb-4 ${textMain}`}>
                      Distribuição de Qualidade
                    </h3>
                    <Doughnut
                      data={qualityDistributionData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { color: axisColor },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-md">
                  <h3 className={`text-lg font-semibold mb-4 ${textMain}`}>
                    Resumo Estatístico
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className={`text-sm ${textSub}`}>Média</div>
                      <div className="text-2xl font-bold text-white">
                        {mean.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className={`text-sm ${textSub}`}>Mediana</div>
                      <div className="text-2xl font-bold text-white">
                        {median}
                      </div>
                    </div>
                    <div>
                      <div className={`text-sm ${textSub}`}>Desvio Padrão</div>
                      <div className="text-2xl font-bold text-white">
                        {std.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className={`text-sm ${textSub}`}>Amplitude</div>
                      <div className="text-2xl font-bold text-white">
                        {range}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-10 text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <div className={`text-lg mb-1 ${textMain}`}>
                  Nenhuma simulação executada ainda
                </div>
                <div className={`text-sm ${textSub}`}>
                  Execute simulações na aba correspondente para ver análises
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================= COMPARAÇÃO ============================= */}
        {activeView === 'comparison' && (
          <div className="p-6 space-y-6">
            {optimizationResults ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-md">
                <h3 className={`font-semibold mb-4 ${textMain}`}>
                  Comparação: Atual vs Otimizado
                </h3>
                <Bar
                  data={parameterComparisonData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { labels: { color: axisColor } },
                    },
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: 'Valor',
                          color: axisColor,
                        },
                        ticks: { color: axisColor },
                        grid: { color: gridColor },
                      },
                      x: {
                        ticks: { color: axisColor },
                        grid: { color: gridColor },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-10 text-center">
                <div className={`text-lg mb-1 ${textMain}`}>
                  Nenhuma otimização executada ainda
                </div>
                <div className={`text-sm ${textSub}`}>
                  Execute a otimização para ver comparações
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};










