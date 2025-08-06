import React, { useState } from 'react';
import { FileText, Download, TrendingUp, Award, BarChart3, PieChart } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
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
  simulationResults: any[];
  currentParams: {
    temperatura: number;
    tempo: number;
    pressao: number;
    velocidade: number;
    qualidade: number;
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
  const [activeView, setActiveView] = useState<'overview' | 'detailed' | 'comparison'>('overview');

  const downloadAllResults = () => {
    const allData = {
      currentParameters: currentParams,
      optimizationResults: optimizationResults,
      simulationResults: simulationResults,
      summary: {
        totalSimulations: simulationResults.length,
        averageQuality: simulationResults.length > 0 
          ? simulationResults.reduce((sum, r) => sum + r.quality, 0) / simulationResults.length 
          : 0,
        bestQuality: simulationResults.length > 0 
          ? Math.max(...simulationResults.map(r => r.quality)) 
          : 0,
        timestamp: new Date().toISOString()
      }
    };

    const csvContent = [
      'Section,Parameter,Value',
      `Current,Temperature,${currentParams.temperatura}`,
      `Current,Time,${currentParams.tempo}`,
      `Current,Pressure,${currentParams.pressao}`,
      `Current,Speed,${currentParams.velocidade}`,
      `Current,Quality,${currentParams.qualidade}`,
      ...(optimizationResults ? [
        `Optimized,Temperature,${optimizationResults.temperatura}`,
        `Optimized,Time,${optimizationResults.tempo}`,
        `Optimized,Pressure,${optimizationResults.pressao}`,
        `Optimized,Speed,${optimizationResults.velocidade}`,
        `Optimized,Quality,${optimizationResults.quality}`
      ] : []),
      ...simulationResults.map((result, i) => 
        `Simulation ${i + 1},Quality,${result.quality.toFixed(2)}`
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
- Qualidade Prevista: ${currentParams.qualidade.toFixed(2)}

${optimizationResults ? `
PARÂMETROS OTIMIZADOS:
- Temperatura: ${optimizationResults.temperatura}°C
- Tempo: ${optimizationResults.tempo} min
- Pressão: ${optimizationResults.pressao} kPa
- Velocidade: ${optimizationResults.velocidade} rpm
- Qualidade Otimizada: ${optimizationResults.quality.toFixed(2)}
- Melhoria: +${optimizationResults.improvement} unidades
` : ''}

RESUMO DAS SIMULAÇÕES:
- Total de simulações: ${simulationResults.length}
- Qualidade média: ${simulationResults.length > 0 ? (simulationResults.reduce((sum, r) => sum + r.quality, 0) / simulationResults.length).toFixed(2) : 'N/A'}
- Melhor qualidade: ${simulationResults.length > 0 ? Math.max(...simulationResults.map(r => r.quality)).toFixed(2) : 'N/A'}
- Pior qualidade: ${simulationResults.length > 0 ? Math.min(...simulationResults.map(r => r.quality)).toFixed(2) : 'N/A'}

RECOMENDAÇÕES:
${optimizationResults ? 
  `1. Implementar os parâmetros otimizados para obter melhoria de ${optimizationResults.improvement} unidades
2. Monitorar especialmente a temperatura, que tem maior impacto na qualidade
3. Realizar testes piloto antes da implementação completa` :
  `1. Execute a otimização para encontrar os melhores parâmetros
2. Realize mais simulações para validar os resultados
3. Considere análise de sensibilidade para entender melhor os parâmetros`
}

Gerado por: Otimizador de Processos
Autores: Vitor Lorenzo Cerutti, Bernardo Krauspenhar Paganin, Lorenzo Zatta Santini
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
        data: simulationResults.map(r => r.quality),
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
          simulationResults.filter(r => r.quality < 355).length,
          simulationResults.filter(r => r.quality >= 355 && r.quality < 365).length,
          simulationResults.filter(r => r.quality >= 365).length
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
        data: [currentParams.temperatura, currentParams.tempo, currentParams.pressao, currentParams.velocidade],
        backgroundColor: 'rgba(59, 130, 246, 0.8)'
      },
      ...(optimizationResults ? [{
        label: 'Otimizado',
        data: [optimizationResults.temperatura, optimizationResults.tempo, optimizationResults.pressao, optimizationResults.velocidade],
        backgroundColor: 'rgba(34, 197, 94, 0.8)'
      }] : [])
    ]
  };

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
            <FileText className="h-6 w-6 mr-2 text-blue-500" />
            <span>Resultados e Relatórios - </span>
            <img 
              src="/src/Cópia de Cópia de Cópia de metalyics.svg" 
              alt="MetaLytics" 
              className="h-6 w-auto ml-2"
            />
          </h2>
          
          <div className="flex space-x-2">
            <button
              onClick={downloadAllResults}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar CSV
            </button>
            <button
              onClick={generateReport}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              Gerar Relatório
            </button>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveView('overview')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeView === 'overview'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveView('detailed')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeView === 'detailed'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Análise Detalhada
          </button>
          <button
            onClick={() => setActiveView('comparison')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeView === 'comparison'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Comparação
          </button>
        </div>

        {/* Overview */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'} border ${isDark ? 'border-gray-600' : 'border-blue-200'}`}>
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Qualidade Atual</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {currentParams.qualidade.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>

              {optimizationResults && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'} border ${isDark ? 'border-gray-600' : 'border-green-200'}`}>
                  <div className="flex items-center">
                    <Award className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Qualidade Otimizada</div>
                      <div className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {optimizationResults.quality.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-purple-50'} border ${isDark ? 'border-gray-600' : 'border-purple-200'}`}>
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total de Simulações</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {simulationResults.length}
                    </div>
                  </div>
                </div>
              </div>

              {simulationResults.length > 0 && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-yellow-50'} border ${isDark ? 'border-gray-600' : 'border-yellow-200'}`}>
                  <div className="flex items-center">
                    <PieChart className="h-8 w-8 text-yellow-500 mr-3" />
                    <div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Melhor Simulação</div>
                      <div className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {Math.max(...simulationResults.map(r => r.quality)).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Insights */}
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Insights Rápidos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    📊 Análise de Performance
                  </h4>
                  <ul className={`space-y-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <li>• {simulationResults.length > 0 ? 
                      `Qualidade média das simulações: ${(simulationResults.reduce((sum, r) => sum + r.quality, 0) / simulationResults.length).toFixed(1)}` :
                      'Nenhuma simulação executada ainda'
                    }</li>
                    <li>• {optimizationResults ? 
                      `Melhoria potencial: +${optimizationResults.improvement} unidades` :
                      'Execute a otimização para ver melhorias potenciais'
                    }</li>
                    <li>• {currentParams.qualidade >= 365 ? 
                      'Parâmetros atuais já produzem excelente qualidade' :
                      currentParams.qualidade >= 355 ?
                      'Parâmetros atuais produzem boa qualidade' :
                      'Parâmetros atuais precisam de otimização'
                    }</li>
                  </ul>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    🎯 Recomendações
                  </h4>
                  <ul className={`space-y-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <li>• {optimizationResults ? 
                      'Implemente os parâmetros otimizados gradualmente' :
                      'Execute a otimização para encontrar melhores parâmetros'
                    }</li>
                    <li>• {simulationResults.length < 10 ? 
                      'Execute mais simulações para validar resultados' :
                      'Dados suficientes coletados para análise confiável'
                    }</li>
                    <li>• Monitore a temperatura de perto - é o parâmetro mais crítico</li>
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
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <h3 className={`font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Tendência de Qualidade
                </h3>
                <Line
                  data={qualityTrendData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        labels: { color: isDark ? '#e5e7eb' : '#374151' }
                      }
                    },
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

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <h3 className={`font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Distribuição de Qualidade
                </h3>
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
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Resumo Estatístico
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Média</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {(simulationResults.reduce((sum, r) => sum + r.quality, 0) / simulationResults.length).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Mediana</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {simulationResults.sort((a, b) => a.quality - b.quality)[Math.floor(simulationResults.length / 2)]?.quality.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Desvio Padrão</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {Math.sqrt(
                      simulationResults.reduce((sum, r) => {
                        const mean = simulationResults.reduce((s, res) => s + res.quality, 0) / simulationResults.length;
                        return sum + Math.pow(r.quality - mean, 2);
                      }, 0) / (simulationResults.length - 1)
                    ).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Amplitude</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {(Math.max(...simulationResults.map(r => r.quality)) - Math.min(...simulationResults.map(r => r.quality))).toFixed(2)}
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
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <h3 className={`font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Comparação: Atual vs Otimizado
                </h3>
                <Bar
                  data={parameterComparisonData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        labels: { color: isDark ? '#e5e7eb' : '#374151' }
                      }
                    },
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
              <div className={`p-8 text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                <div className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  Nenhuma otimização executada ainda
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Execute a otimização na aba correspondente para ver comparações
                </div>
              </div>
            )}

            {/* Improvement Summary */}
            {optimizationResults && (
              <div className={`p-6 rounded-lg ${isDark ? 'bg-green-900' : 'bg-green-50'} border ${isDark ? 'border-green-700' : 'border-green-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                  Resumo das Melhorias
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>Melhoria na Qualidade</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                      +{optimizationResults.improvement} unidades
                    </div>
                    <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      ({((optimizationResults.improvement / currentParams.qualidade) * 100).toFixed(1)}% de melhoria)
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>Parâmetro Mais Alterado</div>
                    <div className={`text-xl font-bold ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                      Temperatura
                    </div>
                    <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {optimizationResults.temperatura - currentParams.temperatura > 0 ? '+' : ''}
                      {optimizationResults.temperatura - currentParams.temperatura}°C
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>Classificação Final</div>
                    <div className={`text-xl font-bold ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                      {optimizationResults.quality >= 365 ? 'Excelente' : 
                       optimizationResults.quality >= 355 ? 'Boa' : 'Regular'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {activeView === 'detailed' && simulationResults.length === 0 && (
          <div className={`p-8 text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <BarChart3 className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <div className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Nenhuma simulação executada ainda
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Execute simulações na aba correspondente para ver análises detalhadas
            </div>
          </div>
        )}
      </div>
    </div>
  );
};