// src/components/Results.tsx
import React, { useMemo, useState } from 'react';
import {
  FileText,
  Download,
  TrendingUp,
  Award,
  BarChart3,
  PieChart,
  Coins,
  Brain,
  Lightbulb,
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

  /* ===== Energia: fontes robustas + delta com sinal ===== */
  const model = useMemo(() => getModel('inference'), []);
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

  // energia atual (kWh/ton) – tenta várias fontes antes de desistir
  let energyNow =
    safeNumber(
      (currentParams as any)?.energia ?? (currentParams as any)?.energy,
      NaN
    );

  if (!Number.isFinite(energyNow) || energyNow <= 0) {
    energyNow = safeNumber(inferEnergyFromParams(currentParams), NaN);
  }
  if (!Number.isFinite(energyNow) || energyNow <= 0) {
    const simWithEnergy = simulationResults.find((s: any) =>
      Number.isFinite(Number((s as any)?.energy ?? (s as any)?.energia))
    ) as any;
    energyNow = safeNumber(simWithEnergy?.energy ?? simWithEnergy?.energia, NaN);
  }
  if (!Number.isFinite(energyNow) || energyNow <= 0) {
    energyNow = 600; // fallback conservador
  }

  // energia otimizada (kWh/ton)
  let energyOptim = safeNumber(
    optimizationResults?.energy ?? optimizationResults?.energia,
    NaN
  );
  if (!Number.isFinite(energyOptim)) {
    const sourceParams =
      optimizationResults?.bestParams ?? optimizationResults;
    energyOptim = safeNumber(inferEnergyFromParams(sourceParams), NaN);
  }
  if (!Number.isFinite(energyOptim)) {
    energyOptim = energyNow; // sem economia fictícia
  }

  // deltas e economia (sempre não-negativos para o card de “Economia”)
  const rawEnergyDeltaPerTon = energyNow - energyOptim; // kWh/ton (positivo = economia)
  const energyDeltaPerTon = Math.max(0, rawEnergyDeltaPerTon);

  const ENERGY_PRICE_BRL_PER_KWH = 0.75;
  const PRODUCTION_TONS_PERIOD   = 100;
  const SCRAP_COST_R_PER_TON     = 1500;
  const MAX_SCRAP_DROP_RATE      = 0.06;
  const DROP_PER_QUALITY_POINT   = 0.002;

  const qualityNow  = safeNumber(currentQuality, 0);
  const qualityOpt  = Number.isFinite(Number(optimizedQuality)) ? Number(optimizedQuality) : null;
  const qualityGain = Math.max(0, (qualityOpt ?? 0) - qualityNow);

  const scrapSavingRate = Math.min(MAX_SCRAP_DROP_RATE, qualityGain * DROP_PER_QUALITY_POINT);

  const energySavingBRL =
    energyDeltaPerTon * ENERGY_PRICE_BRL_PER_KWH * PRODUCTION_TONS_PERIOD;

  const scrapSavingBRL =
    scrapSavingRate * SCRAP_COST_R_PER_TON * PRODUCTION_TONS_PERIOD;

  const totalSavingBRL = energySavingBRL + scrapSavingBRL;

  const axisColor = isDark ? '#e5e7eb' : '#374151';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

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
    animation: false,
  };

  /* ======= Insights/IA helpers ======= */
  const aiCard = (title: string, lines: string[]) => (
    <div
      className={`mt-3 rounded-xl border p-3 flex gap-2 items-start ${
        isDark ? 'bg-gray-900/60 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div
        className={`p-2 rounded-md ${
          isDark ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-100 text-blue-700'
        }`}
        aria-hidden
      >
        <Brain className="h-4 w-4" />
      </div>
      <div>
        <div className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
          {title}
        </div>
        <ul className={`mt-1 text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'} list-disc pl-5`}>
          {lines.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </div>
    </div>
  );

  // IA – Tendência
  const firstQ = simulationResults.length > 0 ? safeNumber(simulationResults[0].quality) : 0;
  const lastQ  = simulationResults.length > 0 ? safeNumber(simulationResults[simulationResults.length - 1].quality) : 0;
  const trendDelta = lastQ - firstQ;

  const trendInsights = [
    `Variação do primeiro ao último teste: ${trendDelta >= 0 ? '+' : ''}${trendDelta.toFixed(1)} pontos.`,
    `Média: ${mean.toFixed(1)} · Desvio-padrão: ${std.toFixed(1)} · Amplitude: ${range}.`,
    trendDelta > 0
      ? 'Tendência levemente ascendente — há sinais de melhoria ao longo das execuções.'
      : trendDelta < 0
      ? 'Tendência descendente — revise parâmetros recentes (T/tempo costumam impactar).'
      : 'Tendência estável — variações dentro da oscilação esperada.',
  ];

  // IA – Distribuição
  const cPoor = simulationResults.filter((r) => safeNumber(r.quality) < 355).length;
  const cGood = simulationResults.filter((r) => safeNumber(r.quality) >= 355 && safeNumber(r.quality) < 365).length;
  const cExc  = simulationResults.filter((r) => safeNumber(r.quality) >= 365).length;
  const distInsights = [
    `Excelente: ${cExc} · Boa: ${cGood} · Ruim: ${cPoor}.`,
    cExc > cPoor
      ? 'Mais amostras em faixas “Boa/Excelente” — controle atual tende a ser adequado.'
      : 'Muitas amostras “Ruim” — recomenda-se otimizar e estreitar variação de T/tempo.',
    'Aumentar a densidade na faixa 365+ melhora também o proxy de sucata.',
  ];

  // IA – Economia
  const econInsights = [
    `Δ energia: ${energyDeltaPerTon.toFixed(1)} kWh/ton → R$ ${energySavingBRL.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}.`,
    `Ganho de qualidade: +${qualityGain.toFixed(1)} → queda estimada de sucata: ${(scrapSavingRate * 100).toFixed(1)}%.`,
    `Economia total estimada: R$ ${totalSavingBRL.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}.`,
  ];

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
                        className={`text-xs ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}
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
                          <>—<span className="text-lg text-gray-500">/400</span></>
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
                      {safeNumber(energyNow).toFixed(1)} kWh/ton (
                      {energyNow < 500
                        ? 'muito eficiente'
                        : energyNow < 600
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
                      {energyNow > 600
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
            {/* === 3 gráficos lado a lado (mesmo tamanho) === */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <div className="h-64">
                  <Line
                    data={qualityTrendData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
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
                      animation: false,
                    }}
                  />
                </div>

                {aiCard('Análise de IA — Tendência', trendInsights)}
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
                <div className="h-64">
                  <Doughnut
                    data={qualityDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { color: isDark ? '#e5e7eb' : '#374151' },
                        },
                      },
                      animation: false,
                    }}
                  />
                </div>

                {aiCard('Análise de IA — Distribuição', distInsights)}
              </div>

              {/* Economia Estimada (mesmo tamanho) */}
              <div
                className={`rounded-2xl border p-4 bg-gradient-to-br ${
                  isDark
                    ? 'from-emerald-950/60 to-gray-900/60 border-emerald-900/40'
                    : 'from-emerald-50 to-white border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className={`font-semibold ${
                      isDark ? 'text-gray-100' : 'text-gray-700'
                    }`}
                  >
                    Economia Estimada (R$)
                  </h3>
                  <div className={`text-[11px] ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Modelo interno (tarifa/produção/refugo)
                  </div>
                </div>

                <div className="h-64">
                  <Bar data={savingsBarData} options={savingsBarOptions as any} />
                </div>

                {aiCard('Análise de IA — Economia', econInsights)}
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
                    className={`text-xl font-bold ${
                      isDark ? 'text-gray-100' : 'text-gray-800'
                    }`}
                  >
                    {mean.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Mediana
                  </div>
                  <div
                    className={`text-xl font-bold ${
                      isDark ? 'text-gray-100' : 'text-gray-800'
                    }`}
                  >
                    {median}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Desvio Padrão
                  </div>
                  <div
                    className={`text-xl font-bold ${
                      isDark ? 'text-gray-100' : 'text-gray-800'
                    }`}
                  >
                    {std.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Amplitude
                  </div>
                  <div
                    className={`text-xl font-bold ${
                      isDark ? 'text-gray-100' : 'text-gray-800'
                    }`}
                  >
                    {range}
                  </div>
                </div>
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
                    animation: false,
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
