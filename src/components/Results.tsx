// src/components/Results.tsx
import React, { useState } from 'react';
import { FileText, Download, TrendingUp, Award, BarChart3, PieChart } from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement
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
  isDark
}) => {
  const [activeView, setActiveView] =
    useState<'overview' | 'detailed' | 'comparison'>('overview');

  const safeNumber = (v: any, fallback = 0) =>
    Number.isFinite(Number(v)) ? Number(v) : fallback;

  const downloadAllResults = () => {
    const avgQuality =
      simulationResults.length > 0
        ? simulationResults.reduce((sum, r) => sum + safeNumber(r.quality), 0) /
          simulationResults.length
        : 0;

    const bestQuality =
      simulationResults.length > 0
        ? Math.max(...simulationResults.map(r => safeNumber(r.quality)))
        : 0;

    const csvContent = [
      'Section,Parameter,Value',
      `Current,Temperature,${currentParams.temperatura}`,
      `Current,Time,${currentParams.tempo}`,
      `Current,Pressure,${currentParams.pressao}`,
      `Current,Speed,${currentParams.velocidade}`,
      `Current,Quality,${currentParams.qualidade}`,
      `Current,Energy,${currentParams.energia}`,
      ...(optimizationResults
        ? [
            `Optimized,Temperature,${optimizationResults.temperatura ?? ''}`,
            `Optimized,Time,${optimizationResults.tempo ?? ''}`,
            `Optimized,Pressure,${optimizationResults.pressao ?? ''}`,
            `Optimized,Speed,${optimizationResults.velocidade ?? ''}`,
            `Optimized,Quality,${optimizationResults.quality ?? ''}`
          ]
        : []),
      ...simulationResults.map((result, i) =>
        `Simulation ${i + 1},Quality,${safeNumber(result.quality).toFixed(2)}`
      )
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
- Qualidade Prevista: ${safeNumber(currentParams.qualidade).toFixed(2)}
- Energia Prevista: ${safeNumber(currentParams.energia).toFixed(1)} kWh/ton

${
  optimizationResults
    ? `
PARÂMETROS OTIMIZADOS:
- Temperatura: ${optimizationResults.temperatura ?? '—'}°C
- Tempo: ${optimizationResults.tempo ?? '—'} min
- Pressão: ${optimizationResults.pressao ?? '—'} kPa
- Velocidade: ${optimizationResults.velocidade ?? '—'} rpm
- Qualidade Otimizada: ${
        optimizationResults.quality != null
          ? safeNumber(optimizationResults.quality).toFixed(2)
          : '—'
      }
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
      ...(optimizationResults
        ? [
            {
              label: 'Otimizado',
              data: [
                optimizationResults.temperatura ?? 0,
                optimizationResults.tempo ?? 0,
                optimizationResults.pressao ?? 0,
                optimizationResults.velocidade ?? 0
              ],
              backgroundColor: 'rgba(34, 197, 94, 0.8)'
            }
          ]
        : [])
    ]
  };

  // Helpers estatísticos
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

  // ===== Estilos Premium (vidro + gradiente + glow) =====
  const cardOuter = `rounded-2xl border shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl`;
  const glass = isDark
    ? 'backdrop-blur bg-gray-900/40 border-gray-700'
    : 'backdrop-blur bg-white/70 border-gray-200';
  const gradHeader = isDark
    ? 'bg-gradient-to-br from-blue-950/50 via-gray-900/40 to-gray-900/60 border-blue-900/40'
    : 'bg-gradient-to-br from-blue-50 via-white to-white border-blue-200';
  const pillTabActive = isDark
    ? 'bg-gray-600 text-blue-300 shadow-sm'
    : 'bg-white text-blue-700 shadow-sm';
  const pillTab = isDark
    ? 'text-gray-300 hover:text-white'
    : 'text-gray-600 hover:text-gray-900';
  const pillsWrap = isDark ? 'bg-gray-800/70' : 'bg-gray-100/70';

  const premiumButton = (tone: 'blue' | 'green') =>
    `px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg
     ${tone === 'blue'
       ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-700'
       : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-700'
     }`;

  const sectionCard = `${cardOuter} ${glass} p-6`;

  return (
    <div className="space-y-6">
      {/* Header premium */}
      <div className={`${cardOuter} ${gradHeader} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl font-extrabold flex items-center ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
            <FileText className="h-6 w-6 mr-2 text-blue-500" />
            <span>Resultados e Relatórios</span>
          </h2>
          <div className="flex gap-2">
            <button onClick={downloadAllResults} className={premiumButton('blue')}>
              <span className="inline-flex items-center">
                <Download className="h-4 w-4 mr-2" /> Baixar CSV
              </span>
            </button>
            <button onClick={generateReport} className={premiumButton('green')}>
              <span className="inline-flex items-center">
                <FileText className="h-4 w-4 mr-2" /> Gerar Relatório
              </span>
            </button>
          </div>
        </div>

        {/* View Selector (pílulas) */}
        <div className={`flex space-x-1 ${pillsWrap} rounded-xl p-1`}>
          <button
            onClick={() => setActiveView('overview')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'overview' ? pillTabActive : pillTab
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveView('detailed')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'detailed' ? pillTabActive : pillTab
            }`}
          >
            Análise Detalhada
          </button>
          <button
            onClick={() => setActiveView('comparison')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'comparison' ? pillTabActive : pillTab
            }`}
          >
            Comparação
          </button>
        </div>
      </div>

      {/* Overview */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Cards de resumo com vidro/gradiente leve */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`${cardOuter} ${glass} p-4`}>
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Qualidade Atual</div>
                  <div className={`${isDark ? 'text-gray-100' : 'text-gray-800'} text-2xl font-extrabold`}>
                    {safeNumber(currentParams.qualidade).toFixed(1)}<span className="text-lg text-gray-500">/400</span>
                  </div>
                </div>
              </div>
            </div>

            {!!optimizationResults && (
              <div className={`${cardOuter} ${glass} p-4`}>
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-emerald-500 mr-3" />
                  <div>
                    <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Qualidade Otimizada</div>
                    <div className={`${isDark ? 'text-gray-100' : 'text-gray-800'} text-2xl font-extrabold`}>
                      {optimizationResults?.quality != null
                        ? safeNumber(optimizationResults.quality).toFixed(1)
                        : '—'}
                      <span className="text-lg text-gray-500">/400</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={`${cardOuter} ${glass} p-4`}>
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Total de Simulações</div>
                  <div className={`${isDark ? 'text-gray-100' : 'text-gray-800'} text-2xl font-extrabold`}>
                    {simulationResults.length}
                  </div>
                </div>
              </div>
            </div>

            {simulationResults.length > 0 && (
              <div className={`${cardOuter} ${glass} p-4`}>
                <div className="flex items-center">
                  <PieChart className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Melhor Simulação</div>
                    <div className={`${isDark ? 'text-gray-100' : 'text-gray-800'} text-2xl font-extrabold`}>
                      {Math.max(...simulationResults.map(r => safeNumber(r.quality))).toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Insights rápidos */}
          <div className={`${sectionCard}`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Insights Rápidos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-semibold mb-2`}>📊 Análise de Performance</h4>
                <ul className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm space-y-1`}>
                  <li>• {simulationResults.length > 0
                    ? `Qualidade média das simulações: ${(
                        simulationResults.reduce((sum, r) => sum + safeNumber(r.quality), 0) /
                        simulationResults.length
                      ).toFixed(1)}`
                    : 'Nenhuma simulação executada ainda'}
                  </li>
                  <li>• {optimizationResults
                    ? `Melhoria potencial: +${optimizationResults.improvement ?? '—'} unidades`
                    : 'Execute a otimização para ver melhorias potenciais'}
                  </li>
                  <li>• {currentParams.qualidade >= 365
                    ? 'Parâmetros atuais já produzem excelente qualidade'
                    : currentParams.qualidade >= 355
                    ? 'Parâmetros atuais produzem boa qualidade'
                    : 'Parâmetros atuais precisam de otimização'}
                  </li>
                  <li>• Consumo energético atual: {safeNumber(currentParams.energia).toFixed(1)} kWh/ton ({
                    currentParams.energia < 500 ? 'muito eficiente'
                      : currentParams.energia < 600 ? 'eficiente'
                      : 'ineficiente'
                  })</li>
                </ul>
              </div>
              <div>
                <h4 className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-semibold mb-2`}>🎯 Recomendações</h4>
                <ul className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm space-y-1`}>
                  <li>• {optimizationResults
                    ? 'Implemente os parâmetros otimizados gradualmente'
                    : 'Execute a otimização para encontrar melhores parâmetros'}
                  </li>
                  <li>• {simulationResults.length < 10
                    ? 'Execute mais simulações para validar resultados'
                    : 'Dados suficientes coletados para análise confiável'}
                  </li>
                  <li>• Monitore a temperatura de perto - é o parâmetro mais crítico</li>
                  <li>• {currentParams.energia > 600
                    ? 'Considere reduzir temperatura ou tempo para economizar energia'
                    : 'Consumo energético está em nível aceitável'}
                  </li>
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
            <div className={`${sectionCard}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Tendência de Qualidade</h3>
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

            <div className={`${sectionCard}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Distribuição de Qualidade</h3>
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

          {/* Resumo Estatístico */}
          <div className={`${sectionCard}`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Resumo Estatístico</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Média</div>
                <div className={`${isDark ? 'text-gray-100' : 'text-gray-800'} text-xl font-extrabold`}>
                  {mean.toFixed(2)}
                </div>
              </div>
              <div>
                <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Mediana</div>
                <div className={`${isDark ? 'text-gray-100' : 'text-gray-800'} text-xl font-extrabold`}>
                  {median}
                </div>
              </div>
              <div>
                <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Desvio Padrão</div>
                <div className={`${isDark ? 'text-gray-100' : 'text-gray-800'} text-xl font-extrabold`}>
                  {std.toFixed(2)}
                </div>
              </div>
              <div>
                <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Amplitude</div>
                <div className={`${isDark ? 'text-gray-100' : 'text-gray-800'} text-xl font-extrabold`}>
                  {range}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison */}
      {activeView === 'comparison' && (
        <div className="space-y-6">
          {optimizationResults ? (
            <div className={`${sectionCard}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Comparação: Atual vs Otimizado</h3>
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
            <div className={`${cardOuter} ${glass} p-8 text-center`}>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-lg mb-2`}>
                Nenhuma otimização executada ainda
              </div>
              <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                Execute a otimização na aba correspondente para ver comparações
              </div>
            </div>
          )}

          {/* Improvement Summary */}
          {optimizationResults && (
            <div className={`${cardOuter} ${isDark ? 'bg-gradient-to-br from-emerald-950/50 to-gray-900/40 border-emerald-900/40' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200'} p-6`}>
              <h3 className={`text-lg font-extrabold mb-4 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>Resumo das Melhorias</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`${glass} p-4 rounded-xl border ${isDark ? 'border-emerald-900/30' : 'border-emerald-200'}`}>
                  <div className={`${isDark ? 'text-emerald-400' : 'text-emerald-600'} text-sm`}>Melhoria na Qualidade</div>
                  <div className={`${isDark ? 'text-emerald-200' : 'text-emerald-800'} text-2xl font-extrabold`}>
                    +{optimizationResults.improvement ?? '—'} unidades
                  </div>
                  <div className={`${isDark ? 'text-emerald-400' : 'text-emerald-600'} text-sm`}>
                    {currentParams.qualidade
                      ? `(${((safeNumber(optimizationResults.improvement) / currentParams.qualidade) * 100).toFixed(1)}% de melhoria)`
                      : '(—)'}
                  </div>
                </div>
                <div className={`${glass} p-4 rounded-xl border ${isDark ? 'border-emerald-900/30' : 'border-emerald-200'}`}>
                  <div className={`${isDark ? 'text-emerald-400' : 'text-emerald-600'} text-sm`}>Parâmetro Mais Alterado</div>
                  <div className={`${isDark ? 'text-emerald-200' : 'text-emerald-800'} text-xl font-extrabold`}>Temperatura</div>
                  <div className={`${isDark ? 'text-emerald-400' : 'text-emerald-600'} text-sm`}>
                    {(safeNumber(optimizationResults.temperatura) - currentParams.temperatura) >= 0 ? '+' : ''}
                    {(safeNumber(optimizationResults.temperatura) - currentParams.temperatura).toFixed(1)}°C
                  </div>
                </div>
                <div className={`${glass} p-4 rounded-xl border ${isDark ? 'border-emerald-900/30' : 'border-emerald-200'}`}>
                  <div className={`${isDark ? 'text-emerald-400' : 'text-emerald-600'} text-sm`}>Classificação Final</div>
                  <div className={`${isDark ? 'text-emerald-200' : 'text-emerald-800'} text-xl font-extrabold`}>
                    {optimizationResults?.quality != null
                      ? (optimizationResults.quality >= 365 ? 'Excelente' :
                          optimizationResults.quality >= 355 ? 'Boa' : 'Regular')
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
        <div className={`${cardOuter} ${glass} p-8 text-center`}>
          <BarChart3 className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-lg mb-2`}>Nenhuma simulação executada ainda</div>
          <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Execute simulações na aba correspondente para ver análises detalhadas</div>
        </div>
      )}
    </div>
  );
};

