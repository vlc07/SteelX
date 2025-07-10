import React from 'react';
import { Calculator, Users, Info, HelpCircle, Download } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  temperatura: number;
  setTemperatura: (value: number) => void;
  tempo: number;
  setTempo: (value: number) => void;
  pressao: number;
  setPressao: (value: number) => void;
  velocidade: number;
  setVelocidade: (value: number) => void;
  resultado: string;
  metricas: {r2: number, mae: number, mse: number} | null;
  graficos: boolean;
  valoresReais: number[];
  valoresPrevistos: number[];
  qualidadePrevista: number;
  mostrarAjuda: boolean;
  setMostrarAjuda: (value: boolean) => void;
  calcular: () => void;
  onDownloadResults: () => void;
  t: (key: string) => string;
  isDark: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  temperatura,
  setTemperatura,
  tempo,
  setTempo,
  pressao,
  setPressao,
  velocidade,
  setVelocidade,
  resultado,
  metricas,
  graficos,
  valoresReais,
  valoresPrevistos,
  qualidadePrevista,
  mostrarAjuda,
  setMostrarAjuda,
  calcular,
  onDownloadResults,
  t,
  isDark
}) => {
  const obterClassificacaoQualidade = (qualidade: number) => {
    if (qualidade < 355) {
      return { texto: t('poorQuality'), cor: 'text-red-600', fundo: 'bg-red-100' };
    } else if (qualidade < 365) {
      return { texto: t('goodQuality'), cor: 'text-yellow-600', fundo: 'bg-yellow-100' };
    } else {
      return { texto: t('excellentQuality'), cor: 'text-green-600', fundo: 'bg-green-100' };
    }
  };

  const dadosComparacao = {
    labels: valoresReais.map((_, i) => `Amostra ${i + 1}`),
    datasets: [
      {
        label: 'Valores Reais',
        data: valoresReais,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Valores Previstos',
        data: valoresPrevistos,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const dadosParametros = {
    labels: [t('temperature'), t('time'), t('pressure'), t('speed')],
    datasets: [
      {
        label: 'Valores Atuais',
        data: [temperatura, tempo, pressao, velocidade],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const classificacao = obterClassificacaoQualidade(qualidadePrevista);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center justify-center mb-4">
          <Calculator className="h-8 w-8 text-blue-500 mr-2" />
          <h1 className={`text-2xl font-bold text-blue-700 ${isDark ? 'text-blue-400' : ''}`}>
            SteelX - {t('title')}
          </h1>
        </div>
        
        {/* Subtitle */}
        <div className="text-center mb-4">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Sistema Inteligente para Otimização de Processos Metalúrgicos
          </p>
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('title')}
          </h2>
        </div>
        
        {/* Seção dos Autores */}
        <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-4`}>
          <div className="flex items-center justify-center mb-2">
            <Users className={`h-5 w-5 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('authors')}
            </h2>
          </div>
          <div className="text-center space-y-1">
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Vitor Lorenzo Cerutti</p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Bernardo Krauspenhar Paganin</p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Lorenzo Zatta Santini</p>
          </div>
        </div>

        {/* Botão de Ajuda */}
        <div className="flex justify-center">
          <button
            onClick={() => setMostrarAjuda(!mostrarAjuda)}
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            {mostrarAjuda ? t('hideHelp') : t('howToUse')}
          </button>
        </div>

        {mostrarAjuda && (
          <div className={`mt-4 ${isDark ? 'bg-blue-900' : 'bg-blue-50'} rounded-lg p-4 border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>Como usar:</h3>
            <ol className={`list-decimal list-inside space-y-1 text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
              <li>{t('helpStep1')}</li>
              <li>{t('helpStep2')}</li>
              <li>{t('helpStep3')}</li>
              <li>{t('helpStep4')}</li>
            </ol>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de Controle */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('processParameters')}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('temperature')} ({t('celsius')}):
              </label>
              <input
                type="number"
                value={temperatura}
                onChange={(e) => setTemperatura(Number(e.target.value))}
                className={`w-full border rounded p-2 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Faixa recomendada: 1450-1520°C
              </p>
            </div>

            <div>
              <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('time')} ({t('minutes')}):
              </label>
              <input
                type="number"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className={`w-full border rounded p-2 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Faixa recomendada: 30-90 minutos
              </p>
            </div>

            <div>
              <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('pressure')} ({t('kpa')}):
              </label>
              <input
                type="number"
                value={pressao}
                onChange={(e) => setPressao(Number(e.target.value))}
                className={`w-full border rounded p-2 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Faixa recomendada: 100-102 kPa
              </p>
            </div>

            <div>
              <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('speed')} ({t('rpm')}):
              </label>
              <input
                type="number"
                value={velocidade}
                onChange={(e) => setVelocidade(Number(e.target.value))}
                className={`w-full border rounded p-2 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Faixa recomendada: 290-310 rpm
              </p>
            </div>

            <button
              onClick={calcular}
              className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition-colors font-semibold"
            >
              {t('calculate')}
            </button>
          </div>

          {/* Resultado com Classificação */}
          {resultado && (
            <div className="mt-6 space-y-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-center font-bold text-lg ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {resultado}
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${classificacao.fundo} border`}>
                <div className="text-center">
                  <p className={`font-bold text-xl ${classificacao.cor}`}>
                    {classificacao.texto}
                  </p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {qualidadePrevista < 355 && "Considere ajustar os parâmetros para melhorar a qualidade"}
                    {qualidadePrevista >= 355 && qualidadePrevista < 365 && "Qualidade aceitável, mas pode ser melhorada"}
                    {qualidadePrevista >= 365 && "Excelente! Estes parâmetros produzem alta qualidade"}
                  </p>
                </div>
              </div>

              {metricas && (
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <h3 className={`font-semibold mb-3 flex items-center ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    <Info className="h-4 w-4 mr-2 text-blue-500" />
                    Métricas do Modelo
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>R² (Precisão do modelo):</span>
                      <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {(metricas.r2 * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${metricas.r2 * 100}%` }}></div>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {metricas.r2 > 0.9 ? "Modelo muito preciso" : metricas.r2 > 0.7 ? "Modelo razoavelmente preciso" : "Modelo pouco preciso"}
                    </p>
                    
                    <div className="flex justify-between mt-3">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Erro Médio:</span>
                      <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {metricas.mae.toFixed(1)} {t('units')}
                      </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Em média, as previsões podem variar ±{metricas.mae.toFixed(1)} unidades
                    </p>
                  </div>
                </div>
              )}

              {/* Botão de Download */}
              <button
                onClick={onDownloadResults}
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                {t('downloadResults')}
              </button>
            </div>
          )}
        </div>

        {/* Gráficos */}
        {graficos && (
          <div className="space-y-6">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-3 text-center ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('realVsPredicted')}
              </h3>
              <p className={`text-xs mb-3 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Este gráfico mostra como o modelo prevê comparado com dados reais
              </p>
              <Line
                data={dadosComparacao}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                      labels: {
                        color: isDark ? '#e5e7eb' : '#374151'
                      }
                    },
                  },
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'Qualidade',
                        color: isDark ? '#e5e7eb' : '#374151'
                      },
                      ticks: {
                        color: isDark ? '#e5e7eb' : '#374151'
                      },
                      grid: {
                        color: isDark ? '#374151' : '#e5e7eb'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Amostras',
                        color: isDark ? '#e5e7eb' : '#374151'
                      },
                      ticks: {
                        color: isDark ? '#e5e7eb' : '#374151'
                      },
                      grid: {
                        color: isDark ? '#374151' : '#e5e7eb'
                      }
                    }
                  }
                }}
              />
            </div>

            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-3 text-center ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('currentParameters')}
              </h3>
              <p className={`text-xs mb-3 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Visualização dos valores que você definiu
              </p>
              <Bar
                data={dadosParametros}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                      labels: {
                        color: isDark ? '#e5e7eb' : '#374151'
                      }
                    },
                  },
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'Valor',
                        color: isDark ? '#e5e7eb' : '#374151'
                      },
                      ticks: {
                        color: isDark ? '#e5e7eb' : '#374151'
                      },
                      grid: {
                        color: isDark ? '#374151' : '#e5e7eb'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Parâmetros',
                        color: isDark ? '#e5e7eb' : '#374151'
                      },
                      ticks: {
                        color: isDark ? '#e5e7eb' : '#374151'
                      },
                      grid: {
                        color: isDark ? '#374151' : '#e5e7eb'
                      }
                    }
                  }
                }}
              />
            </div>

            {/* Dicas para Melhoria */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                💡 {t('improvementTips')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className={`p-2 rounded ${isDark ? 'bg-blue-900' : 'bg-blue-50'}`}>
                  <strong className={isDark ? 'text-blue-300' : 'text-blue-800'}>
                    {t('temperature')}:
                  </strong>
                  <span className={isDark ? 'text-blue-200' : 'text-blue-700'}>
                    {' '}Valores mais altos geralmente melhoram a qualidade
                  </span>
                </div>
                <div className={`p-2 rounded ${isDark ? 'bg-green-900' : 'bg-green-50'}`}>
                  <strong className={isDark ? 'text-green-300' : 'text-green-800'}>
                    {t('time')}:
                  </strong>
                  <span className={isDark ? 'text-green-200' : 'text-green-700'}>
                    {' '}Tempos moderados (50-70 min) costumam dar bons resultados
                  </span>
                </div>
                <div className={`p-2 rounded ${isDark ? 'bg-yellow-900' : 'bg-yellow-50'}`}>
                  <strong className={isDark ? 'text-yellow-300' : 'text-yellow-800'}>
                    {t('pressure')}:
                  </strong>
                  <span className={isDark ? 'text-yellow-200' : 'text-yellow-700'}>
                    {' '}Mantenha estável entre 100-102 kPa
                  </span>
                </div>
                <div className={`p-2 rounded ${isDark ? 'bg-purple-900' : 'bg-purple-50'}`}>
                  <strong className={isDark ? 'text-purple-300' : 'text-purple-800'}>
                    {t('speed')}:
                  </strong>
                  <span className={isDark ? 'text-purple-200' : 'text-purple-700'}>
                    {' '}Velocidades médias (300-310 rpm) são ideais
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};