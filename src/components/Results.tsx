// src/components/Results.tsx
import React, { useMemo, useState } from 'react';
import { FileText, Download, TrendingUp, Award, BarChart3, PieChart } from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement
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
  isDark
}) => {
  const [activeView, setActiveView] =
    useState<'overview' | 'detailed' | 'comparison'>('overview');

  const safeNumber = (v: any, fallback = 0) =>
    Number.isFinite(Number(v)) ? Number(v) : fallback;

  const model = useMemo(() => getModel('inference'), []);

  /** --------- Helpers visuais premium (apenas estilo) --------- */
  const text = isDark ? 'text-gray-100' : 'text-gray-900';
  const sub  = isDark ? 'text-gray-400' : 'text-gray-600';

  // container “vidro + gradiente” com glow sutil
  const cardGlass = `rounded-2xl border shadow-lg transition-all duration-300
    ${isDark
      ? 'bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-800/30 border-slate-700/70 backdrop-blur-md'
      : 'bg-gradient-to-br from-white/80 to-slate-50/70 border-slate-200/80 backdrop-blur'} 
    hover:shadow-xl hover:-translate-y-0.5`;

  // variação para caixas de gráfico (um pouco mais “larga”)
  const chartGlass = `${cardGlass} p-4 sm:p-6`;

  // barra de navegação das abas
  const tabsWrap = `flex space-x-1 mb-6 rounded-xl p-1 border
    ${isDark ? 'bg-slate-900/50 border-slate-700/70' : 'bg-slate-100/60 border-slate-200'}`;

  const tabBtn = (active: boolean) =>
    `flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all
     ${active
       ? `${isDark
          ? 'bg-slate-800/70 text-sky-300 shadow ring-1 ring-sky-500/30'
          : 'bg-white text-sky-700 shadow ring-1 ring-sky-500/20'}`
       : `${isDark
          ? 'text-gray-300 hover:text-white hover:bg-slate-800/40'
          : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'}`}`;

  // botões principais
  const primaryBtn = `flex items-center px-4 py-2 rounded-xl font-medium text-white transition-all
    bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-600
    shadow hover:shadow-lg active:scale-[0.99]`;
  const successBtn = `flex items-center px-4 py-2 rounded-xl font-medium text-white transition-all
    bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-600
    shadow hover:shadow-lg active:scale-[0.99]`;

  // cards-resumo com sutis cores tema
  const summaryTone = (tone: 'blue' | 'green' | 'purple' | 'yellow') =>
    `${cardGlass} p-5
     ${tone === 'blue'   ? (isDark ? 'border-sky-800/40'     : 'border-sky-200')
      : tone === 'green' ? (isDark ? 'border-emerald-800/40' : 'border-emerald-200')
      : tone === 'purple'? (isDark ? 'border-violet-800/40'  : 'border-violet-200')
                         : (isDark ? 'border-amber-800/40'   : 'border-amber-200')}`;

  // ----------------- Lógica (inalterada) -----------------
  const opt = useMemo(() => {
    const src = optimizationResults;
    if (!src) return null;

    if (
      src.temperatura != null ||
      src.tempo != null ||
      src.pressao != null ||
      src.velocidade != null
    ) {
      return {
        temperatura: Number(src.temperatura),
        tempo: Number(src.tempo),
        pressao: Number(src.pressao),
        velocidade: Number(src.velocidade),
        quality: src.quality != null ? Number(src.quality) : undefined,
        improvement: src.improvement
      };
    }

    if (src.bestParams) {
      const p = src.bestParams;
      return {
        temperatura: Number(p.temperatura),
        tempo: Number(p.tempo),
        pressao: Number(p.pressao),
        velocidade: Number(p.velocidade),
        quality:
          src.quality != null
            ? Number(src.quality)
            : src.best?.quality != null
            ? Number(src.best.quality)
            : undefined,
        improvement: src.improvement
      };
    }

    if (src.best?.x) {
      const p = src.best.x;
      return {
        temperatura: Number(p.temperatura),
        tempo: Number(p.tempo),
        pressao: Number(p.pressao),
        velocidade: Number(p.velocidade),
        quality:
          src.best?.quality != null
            ? Number(src.best.quality)
            : src.quality != null
            ? Number(src.quality)
            : undefined,
        improvement: src.improvement
      };
    }

    return null;
  }, [optimizationResults]);

  const optimizedQuality: number | null = useMemo(() => {
    if (!opt) return null;

    if (opt.quality != null && Number.isFinite(opt.quality)) {
      return Number(opt.quality);
    }

    const imp = safeNumber(optimizationResults?.improvement, NaN);
    const base = safeNumber(currentParams.qualidade, NaN);
    if (Number.isFinite(imp) && Number.isFinite(base) && base > 0) {
      return base + imp;
    }

    if (
      Number.isFinite(opt.temperatura) &&
      Number.isFinite(opt.tempo) &&
      Number.isFinite(opt.pressao) &&
      Number.isFinite(opt.velocidade)
    ) {
      try {
        const pred = model.predict({
          temp: Number(opt.temperatura),
          time: Number(opt.tempo),
          press: Number(opt.pressao),
          speed: Number(opt.velocidade),
        });
        const q = safeNumber(pred?.quality, NaN);
        if (Number.isFinite(q)) return q;
      } catch {}
    }

    return null;
  }, [opt, optimizationResults, currentParams, model]);

  const { currentQuality, currentEnergy } = useMemo(() => {
    let q = Number(currentParams.qualidade);
    let e = Number(currentParams.energia);

    const qInvalid = !Number.isFinite(q) || q <= 0;
    const eInvalid = !Number.isFinite(e) || e <= 0;

    if (qInvalid || eInvalid) {
      try {
        const pred = model.predict({
          temp: Number(currentParams.temperatura),
          time: Number(currentParams.tempo),
          press: Number(currentParams.pressao),
          speed: Number(currentParams.velocidade),
        });
        if (qInvalid) q = safeNumber(pred?.quality, NaN);
        if (eInvalid) e = safeNumber(pred?.energy, NaN);
      } catch {}
    }

    if ((!Number.isFinite(q) || q <= 0) && simulationResults.length > 0) {
      const last = simulationResults[simulationResults.length - 1];
      q = safeNumber(last?.quality, NaN);
    }

    return {
      currentQuality: Number.isFinite(q) && q > 0 ? q : 0,
      currentEnergy: Number.isFinite(e) && e > 0 ? e : 0,
    };
  }, [currentParams, simulationResults, model]);

  const downloadAllResults = () => {
    const avgQuality =
      simulationResults.length > 0
        ? simulationResults.reduce((sum, r) => sum + safeNumber(r.quality), 0) /
          simulationResults.length
        : 0;

    const csvContent = [
      'Section,Parameter,Value',
      `Current,Temperature,${currentParams.temperatura}`,
      `Current,Time,${currentParams.tempo}`,
      `Current,Pressure,${currentParams.pressao}`,
      `Current,Speed,${currentParams.velocidade}`,
      `Current,Quality,${currentQuality}`,
      `Current,Energy,${currentEnergy}`,
      ...(opt
        ? [
            `Optimized,Temperature,${opt.temperatura ?? ''}`,
            `Optimized,Time,${opt.tempo ?? ''}`,
            `Optimized,Pressure,${opt.pressao ?? ''}`,
            `Optimized,Speed,${opt.velocidade ?? ''}`,
            `Optimized,Quality,${optimizedQuality ?? ''}`
          ]
        : []),
      ...simulationResults.map((result, i) =>
        `Simulation ${i + 1},Quality,${safeNumber(result.quality).toFixed(2)}`
      ),
      `Summary,AverageQuality,${avgQuality.toFixed(2)}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complete_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    const avg =
      simulationResults.length > 0
        ? (
            simulationResults.reduce((sum, r) => sum + safeNumber(r.quality), 0) /
            simulationResults.length
          ).toFixed(2)
        : 'N/A';
    const best =
      simulationResults.length > 0
        ? Math.max(...simulationResults.map(r => safeNumber(r.quality))).toFixed(2)
        : 'N/A';
    const worst =
      simulationResults.length > 0
        ? Math.min(...simulationResults.map(r => safeNumber(r.quality))).toFixed(2)
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
- Energia Prevista: ${safeNumber(currentEnergy).toFixed(1)} kWh/ton

${
  opt
    ? `
PARÂMETROS OTIMIZADOS:
- Temperatura: ${opt.temperatura ?? '—'}°C
- Tempo: ${opt.tempo ?? '—'} min
- Pressão: ${opt.pressao ?? '—'} kPa
- Velocidade: ${opt.velocidade ?? '—'} rpm
- Qualidade Otimizada: ${optimizedQuality != null ? optimizedQuality.toFixed(2) : '—'}
- Melhoria: ${optimizationResults?.improvement ?? '—'} unidades
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
  opt
    ? `1. Implementar os parâmetros otimizados para obter melhoria de ${
        optimizationResults?.improvement ?? '—'
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
    a.download = `relatorio_otimizacao_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Chart data
  const qualityTrendData = {
    labels: simulationResults.map((_, i) => `Teste ${i + 1}`),
    datasets: [
      {
        label: 'Qualidade',
        data: simulationResults.map(r => safeNumber(r.quality)),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  const qualityDistributionData = {
    labels: ['Qualidade Ruim (<355)', 'Qualidade Boa (355-365)', 'Qualidade Excelente (>365)'],
    datasets: [
      {
        data: [
          simulationResults.filter(r => safeNumber(r.quality) < 355).length,
          simulationResults.filter(r => safeNumber(r.quality) >= 355 && safeNumber(r.quality) < 365).length,
          simulationResults.filter(r => safeNumber(r.quality) >= 365).length
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ]
      }
    ]
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
          currentParams.velocidade
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.8)'
      },
      ...(opt
        ? [
            {
              label: 'Otimizado',
              data: [
                opt.temperatura ?? 0,
                opt.tempo ?? 0,
                opt.pressao ?? 0,
                opt.velocidade ?? 0
              ],
              backgroundColor: 'rgba(34, 197, 94, 0.8)'
            }
          ]
        : [])
    ]
  };

  // Helpers para estatísticas
  const mean =
    simulationResults.length > 0
      ? simulationResults.reduce((s, r) => s + safeNumber(r.quality), 0) /
        simulationResults.length
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
  const sorted = [...simulationResults].sort((a, b) => safeNumber(a.quality) - safeNumber(b.quality));
  const median =
    simulationResults.length > 0
      ? safeNumber(sorted[Math.floor(simulationResults.length / 2)]?.quality).toFixed(2)
      : '0.00';
  const range =
    simulationResults.length > 0
      ? (
          Math.max(...simulationResults.map(r => safeNumber(r.quality))) -
          Math.min(...simulationResults.map(r => safeNumber(r.quality)))
        ).toFixed(2)
      : '0.00';

  return (
    <div className="space-y-6">
      {/* Header premium */}
      <div className={`${cardGlass} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold flex items-center ${text}`}>
            <FileText className="h-6 w-6 mr-2 text-sky-400" />
            <span>Resultados e Relatórios</span>
          </h2>

          <div className="flex gap-2">
            <button onClick={downloadAllResults} className={primaryBtn}>
              <Download className="h-4 w-4 mr-2" />
              Baixar CSV
            </button>
            <button onClick={generateReport} className={successBtn}>
              <FileText className="h-4 w-4 mr-2" />
              Gerar Relatório
            </button>
          </div>
        </div>

        {/* View Selector premium */}
        <div className={tabsWrap}>
          <button
            onClick={() => setActiveView('overview')}
            className={tabBtn(activeView === 'overview')}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveView('detailed')}
            className={tabBtn(activeView === 'detailed')}
          >
            Análise Detalhada
          </button>
          <button
            onClick={() => setActiveView('comparison')}
            className={tabBtn(activeView === 'comparison')}
          >
            Comparação
          </button>
        </div>

        {/* Overview */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={summaryTone('blue')}>
                <div className="flex items-center">
                  <div className="mr-3 p-2 rounded-xl bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/20">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <div className={`text-sm ${sub}`}>Qualidade Atual</div>
                    <div className={`text-2xl font-bold ${text}`}>
                      {safeNumber(currentQuality).toFixed(1)}
                      <span className="text-lg text-gray-500">/400</span>
                    </div>
                  </div>
                </div>
              </div>

              {!!opt && (
                <div className={summaryTone('green')}>
                  <div className="flex items-center">
                    <div className="mr-3 p-2 rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <div className={`text-sm ${sub}`}>Qualidade Otimizada</div>
                      <div className={`text-2xl font-bold ${text}`}>
                        {optimizedQuality != null ? optimizedQuality.toFixed(1) : '—'}
                        <span className="text-lg text-gray-500">/400</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className={summaryTone('purple')}>
                <div className="flex items-center">
                  <div className="mr-3 p-2 rounded-xl bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/20">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className={`text-sm ${sub}`}>Total de Simulações</div>
                    <div className={`text-2xl font-bold ${text}`}>{simulationResults.length}</div>
                  </div>
                </div>
              </div>

              {simulationResults.length > 0 && (
                <div className={summaryTone('yellow')}>
                  <div className="flex items-center">
                    <div className="mr-3 p-2 rounded-xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20">
                      <PieChart className="h-6 w-6" />
                    </div>
                    <div>
                      <div className={`text-sm ${sub}`}>Melhor Simulação</div>
                      <div className={`text-2xl font-bold ${text}`}>
                        {Math.max(...simulationResults.map(r => safeNumber(r.quality))).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Insights */}
            <div className={`${cardGlass} p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${text}`}>Insights Rápidos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className={`font-medium mb-2 ${text}`}>📊 Análise de Performance</h4>
                  <ul className={`space-y-1 text-sm ${sub}`}>
                    <li>• {simulationResults.length > 0
                      ? `Qualidade média das simulações: ${(
                          simulationResults.reduce((sum, r) => sum + safeNumber(r.quality), 0) /
                          simulationResults.length
                        ).toFixed(1)}`
                      : 'Nenhuma simulação executada ainda'}</li>
                    <li>• {opt
                      ? `Melhoria potencial: +${optimizationResults?.improvement ?? '—'} unidades`
                      : 'Execute a otimização para ver melhorias potenciais'}</li>
                    <li>• {currentQuality >= 365
                      ? 'Parâmetros atuais já produzem excelente qualidade'
                      : currentQuality >= 355
                      ? 'Parâmetros atuais produzem boa qualidade'
                      : 'Parâmetros atuais precisam de otimização'}</li>
                    <li>• Consumo energético atual: {safeNumber(currentEnergy).toFixed(1)} kWh/ton ({
                      currentEnergy < 500 ? 'muito eficiente'
                        : currentEnergy < 600 ? 'eficiente'
                        : 'ineficiente'
                    })</li>
                  </ul>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${text}`}>🎯 Recomendações</h4>
                  <ul className={`space-y-1 text-sm ${sub}`}>
                    <li>• {opt
                      ? 'Implemente os parâmetros otimizados gradualmente'
                      : 'Execute a otimização para encontrar melhores parâmetros'}</li>
                    <li>• {simulationResults.length < 10
                      ? 'Execute mais simulações para validar resultados'
                      : 'Dados suficientes coletados para análise confiável'}</li>
                    <li>• Monitore a temperatura de perto - é o parâmetro mais crítico</li>
                    <li>• {currentEnergy > 600
                      ? 'Considere reduzir temperatura ou tempo para economizar energia'
                      : 'Consumo energético está em nível aceitável'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Analysis */}
        {activeView === 'detailed' && simulationResults.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={chartGlass}>
                <h3 className={`font-semibold mb-4 ${text}`}>Tendência de Qualidade</h3>
                <Line
                  data={qualityTrendData}
                  options={{
                    responsive: true,
                    plugins: { legend: { labels: { color: isDark ? '#e5e7eb' : '#374151' } } },
                    scales: {
                      y: {
                        title: { display: true, text: 'Qualidade', color: isDark ? '#e5e7eb' : '#374151' },
                        ticks: { color: isDark ? '#e5e7eb' : '#374151' },
                        grid: { color: isDark ? '#374151' : '#e5e7eb' }
                      },
                      x: {
                        ticks: { color: isDark ? '#e5e7eb' : '#374151' },
                        grid: { color: isDark ? '#374151' : '#e5e7eb' }
                      }
                    }
                  }}
                />
              </div>

              <div className={chartGlass}>
                <h3 className={`font-semibold mb-4 ${text}`}>Distribuição de Qualidade</h3>
                <Doughnut
                  data={qualityDistributionData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: isDark ? '#e5e7eb' : '#374151' }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Statistical Summary */}
            <div className={`${cardGlass} p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${text}`}>Resumo Estatístico</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className={`text-sm ${sub}`}>Média</div>
                  <div className={`text-xl font-bold ${text}`}>{mean.toFixed(2)}</div>
                </div>
                <div>
                  <div className={`text-sm ${sub}`}>Mediana</div>
                  <div className={`text-xl font-bold ${text}`}>{median}</div>
                </div>
                <div>
                  <div className={`text-sm ${sub}`}>Desvio Padrão</div>
                  <div className={`text-xl font-bold ${text}`}>{std.toFixed(2)}</div>
                </div>
                <div>
                  <div className={`text-sm ${sub}`}>Amplitude</div>
                  <div className={`text-xl font-bold ${text}`}>{range}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison */}
        {activeView === 'comparison' && (
          <div className="space-y-6">
            {opt ? (
              <div className={chartGlass}>
                <h3 className={`font-semibold mb-4 ${text}`}>Comparação: Atual vs Otimizado</h3>
                <Bar
                  data={parameterComparisonData}
                  options={{
                    responsive: true,
                    plugins: { legend: { labels: { color: isDark ? '#e5e7eb' : '#374151' } } },
                    scales: {
                      y: {
                        title: { display: true, text: 'Valor', color: isDark ? '#e5e7eb' : '#374151' },
                        ticks: { color: isDark ? '#e5e7eb' : '#374151' },
                        grid: { color: isDark ? '#374151' : '#e5e7eb' }
                      },
                      x: {
                        ticks: { color: isDark ? '#e5e7eb' : '#374151' },
                        grid: { color: isDark ? '#374151' : '#e5e7eb' }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className={`${cardGlass} p-8 text-center`}>
                <div className={`text-lg ${text} mb-2`}>Nenhuma otimização executada ainda</div>
                <div className={`text-sm ${sub}`}>
                  Execute a otimização na aba correspondente para ver comparações
                </div>
              </div>
            )}

            {/* Improvement Summary */}
            {opt && (
              <div className={`${cardGlass} p-6 border-emerald-800/40`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  Resumo das Melhorias
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className={`text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>Melhoria na Qualidade</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
                      +{optimizationResults?.improvement ?? '—'} unidades
                    </div>
                    <div className={`text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                      {currentQuality
                        ? `(${((safeNumber(optimizationResults?.improvement) / Math.max(1, currentQuality)) * 100).toFixed(1)}% de melhoria)`
                        : '(—)'}
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>Parâmetro Mais Alterado</div>
                    <div className={`text-xl font-bold ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>Temperatura</div>
                    <div className={`text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                      {(safeNumber(opt.temperatura) - currentParams.temperatura) >= 0 ? '+' : ''}
                      {(safeNumber(opt.temperatura) - currentParams.temperatura).toFixed(1)}°C
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>Classificação Final</div>
                    <div className={`text-xl font-bold ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
                      {optimizedQuality != null
                        ? (optimizedQuality >= 365 ? 'Excelente' :
                           optimizedQuality >= 355 ? 'Boa' : 'Regular')
                        : '—'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State (detailed sem dados) */}
        {activeView === 'detailed' && simulationResults.length === 0 && (
          <div className={`${cardGlass} p-8 text-center`}>
            <BarChart3 className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <div className={`text-lg ${text} mb-2`}>Nenhuma simulação executada ainda</div>
            <div className={`text-sm ${sub}`}>Execute simulações na aba correspondente para ver análises detalhadas</div>
          </div>
        )}
      </div>
    </div>
  );
};







