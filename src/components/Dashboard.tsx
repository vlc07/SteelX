import React from 'react';
import { Calculator, Users, Info, HelpCircle, Download, AlertTriangle } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { ParameterInput } from './ParameterInput';
import { validateAllParameters, validateParameterCombination } from '../utils/parameterValidation';

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

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings: string[];
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
  isDark,
}) => {
  const [validationState, setValidationState] = React.useState<ValidationState>({
    isValid: true,
    errors: [],
    warnings: []
  });

  // Validate parameters whenever they change
  React.useEffect(() => {
    const paramValidation = validateAllParameters({
      temperatura,
      tempo,
      pressao,
      velocidade
    });
    
    const combinationValidation = validateParameterCombination({
      temperatura,
      tempo,
      pressao,
      velocidade
    });
    
    setValidationState({
      isValid: paramValidation.isValid && combinationValidation.isValid,
      errors: paramValidation.errors,
      warnings: combinationValidation.warnings
    });
  }, [temperatura, tempo, pressao, velocidade]);

  const obterClassificacaoQualidade = (qualidade: number) => {
    if (qualidade < 355) {
      return { texto: t('poorQuality'), cor: 'text-red-600', fundo: isDark ? 'bg-red-900' : 'bg-red-100' };
    } else if (qualidade < 365) {
      return { texto: t('goodQuality'), cor: 'text-yellow-600', fundo: isDark ? 'bg-yellow-900' : 'bg-yellow-100' };
    } else {
      return { texto: t('excellentQuality'), cor: 'text-green-600', fundo: isDark ? 'bg-green-900' : 'bg-green-100' };
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
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`} data-tour="header">
        <div className="flex items-center justify-center mb-4">
          <img 
             src="/Metalyicscerta.png" 
             alt="MetaLytics" 
             className="mx-auto"
             style={{ height: "30px", width: "auto" }}
             />
        </div>
        
        {/* Subtitle */}
        <div className="text-center mb-4">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Sistema Inteligente para Otimização de Processos Metalúrgicos
          </p>
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
              <li>Ajuste os parâmetros do processo (temperatura, tempo, pressão e velocidade)</li>
              <li>Clique em "Calcular" para ver a qualidade prevista</li>
              <li>Analise os gráficos para entender melhor os resultados</li>
              <li>Use a classificação simples para entender se a qualidade é boa ou ruim</li>
            </ol>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de Controle */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`} data-tour="parameters">
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('processParameters')}
          </h2>
          
          <div className="space-y-4">
            <ParameterInput
              label={t('temperature')}
              parameterName="temperatura"
              value={temperatura}
              onChange={setTemperatura}
              isDark={isDark}
            />

            <ParameterInput
              label={t('time')}
              parameterName="tempo"
              value={tempo}
              onChange={setTempo}
              isDark={isDark}
            />

            <ParameterInput
              label={t('pressure')}
              parameterName="pressao"
              value={pressao}
              onChange={setPressao}
              isDark={isDark}
            />

            <ParameterInput
              label={t('speed')}
              parameterName="velocidade"
              value={velocidade}
              onChange={setVelocidade}
              isDark={isDark}
            />

            {/* Validation Messages */}
            {(!validationState.isValid || validationState.warnings.length > 0) && (
              <div className="space-y-2">
                {validationState.errors.map((error, index) => (
                  <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700'} border ${isDark ? 'border-red-700' : 'border-red-200'}`}>
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                ))}
                
                {validationState.warnings.map((warning, index) => (
                  <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-50 text-yellow-700'} border ${isDark ? 'border-yellow-700' : 'border-yellow-200'}`}>
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{warning}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={calcular}
              disabled={!validationState.isValid}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                validationState.isValid
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
              data-tour="calculate-button"
            >
              {t('calculate')}
            </button>
            
            {!validationState.isValid && (
              <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Corrija os parâmetros acima para habilitar o cálculo
              </p>
            )}
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
                    Métricas do Modelo ML
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>R² Score (Precisão):</span>
                      <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {(metricas.r2 * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${metricas.r2 * 100}%` }}></div>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {metricas.r2 > 0.9 ? "Modelo ML muito preciso" : metricas.r2 > 0.8 ? "Modelo ML preciso" : metricas.r2 > 0.7 ? "Modelo ML razoável" : "Modelo ML impreciso"}
                    </p>
                    
                    <div className="flex justify-between mt-3">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>MAE (Erro Médio):</span>
                      <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {metricas.mae.toFixed(1)} {t('units')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>MSE (Erro Quadrático):</span>
                      <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {metricas.mse.toFixed(1)}
                      </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Modelo treinado com {valoresReais.length} amostras. Erro médio: ±{metricas.mae.toFixed(1)} unidades
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
                {t('realVsPredicted')} (ML)
              </h3>
              <p className={`text-xs mb-3 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Este gráfico mostra como o modelo ML prevê comparado com dados reais de treinamento
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