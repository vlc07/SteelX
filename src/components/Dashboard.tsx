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
  metricas: { r2: number; mae: number; mse: number } | null;
  graficos: boolean;
  valoresReais: number[];
  valoresPrevistos: number[];
  qualidadePrevista: number;
  energiaPrevista: number;
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

/* ----------------------
   Recomendações Dinâmicas
-------------------------*/
type RecType = 'critical' | 'warning' | 'efficiency' | 'info';
interface Recommendation {
  type: RecType;
  icon: string;
  message: string;
}

function getDynamicRecommendations(params: {
  validation: ValidationState;
  qualidadePrevista?: number;
  energiaPrevista?: number;
}): Recommendation[] {
  const recs: Recommendation[] = [];
  const { validation, qualidadePrevista, energiaPrevista } = params;

  if (!validation.isValid && validation.errors.length > 0) {
    validation.errors.forEach((e) => recs.push({ type: 'critical', icon: '⛔', message: e }));
  }
  if (validation.warnings.length > 0) {
    validation.warnings.forEach((w) => recs.push({ type: 'warning', icon: '⚠️', message: w }));
  }

  if (typeof qualidadePrevista === 'number') {
    if (qualidadePrevista < 355) {
      recs.push({ type: 'critical', icon: '📉', message: 'Qualidade baixa: reduza levemente a velocidade e aumente o tempo.' });
    } else if (qualidadePrevista < 365) {
      recs.push({ type: 'warning', icon: '🛠️', message: 'Qualidade aceitável: pequenos ajustes podem levar ao nível excelente.' });
    } else {
      recs.push({ type: 'info', icon: '✅', message: 'Qualidade excelente: mantenha esta faixa como baseline.' });
    }
  }

  if (typeof energiaPrevista === 'number') {
    if (energiaPrevista >= 600) {
      recs.push({ type: 'efficiency', icon: '🔌', message: 'Consumo alto: tente reduzir a temperatura de pico ou o tempo de residência.' });
    } else if (energiaPrevista >= 500) {
      recs.push({ type: 'efficiency', icon: '♻️', message: 'Consumo aceitável: ajuste pressão/velocidade para ganhar eficiência.' });
    } else {
      recs.push({ type: 'info', icon: '🌱', message: 'Consumo otimizado: bom equilíbrio entre qualidade e energia.' });
    }
  }

  if (typeof qualidadePrevista === 'number' && typeof energiaPrevista === 'number') {
    if (qualidadePrevista >= 365 && energiaPrevista >= 550) {
      recs.push({ type: 'efficiency', icon: '⚖️', message: 'Alta qualidade com consumo elevado: tente ~1–3% de redução de temperatura.' });
    }
    if (qualidadePrevista < 365 && energiaPrevista < 550) {
      recs.push({ type: 'warning', icon: '🧪', message: 'Eficiência boa, mas qualidade baixa: aumente levemente tempo ou pressão.' });
    }
  }

  return recs;
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
  energiaPrevista,
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
    warnings: [],
  });

  React.useEffect(() => {
    const paramValidation = validateAllParameters({ temperatura, tempo, pressao, velocidade });
    const combinationValidation = validateParameterCombination({ temperatura, tempo, pressao, velocidade });

    setValidationState({
      isValid: paramValidation.isValid && combinationValidation.isValid,
      errors: paramValidation.errors,
      warnings: combinationValidation.warnings,
    });
  }, [temperatura, tempo, pressao, velocidade]);

  const obterClassificacaoQualidade = (qualidade: number) => {
    if (qualidade < 355) return { texto: t('poorQuality'), cor: 'text-red-600', fundo: isDark ? 'bg-red-900' : 'bg-red-100' };
    if (qualidade < 365) return { texto: t('goodQuality'), cor: 'text-yellow-600', fundo: isDark ? 'bg-yellow-900' : 'bg-yellow-100' };
    return { texto: t('excellentQuality'), cor: 'text-green-600', fundo: isDark ? 'bg-green-900' : 'bg-green-100' };
  };

  const obterClassificacaoEnergia = (energia: number) => {
    if (energia < 450) return { texto: 'Muito Eficiente', cor: 'text-green-600', fundo: isDark ? 'bg-green-900' : 'bg-green-100' };
    if (energia < 550) return { texto: 'Eficiente', cor: 'text-yellow-600', fundo: isDark ? 'bg-yellow-900' : 'bg-yellow-100' };
    return { texto: 'Ineficiente', cor: 'text-red-600', fundo: isDark ? 'bg-red-900' : 'bg-red-100' };
  };

  const dadosComparacao = {
    labels: valoresReais.map((_, i) => `Amostra ${i + 1}`),
    datasets: [
      { label: 'Valores Reais', data: valoresReais, borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.5)' },
      { label: 'Valores Previstos', data: valoresPrevistos, borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)' },
    ],
  };

  const dadosParametros = {
    labels: [t('temperature'), t('time'), t('pressure'), t('speed')],
    datasets: [{ label: 'Valores Atuais', data: [temperatura, tempo, pressao, velocidade], backgroundColor: 'rgba(53, 162, 235, 0.5)' }],
  };

  const classificacao = Number.isFinite(qualidadePrevista) ? obterClassificacaoQualidade(qualidadePrevista) : null;
  const energyClassification = Number.isFinite(energiaPrevista) ? obterClassificacaoEnergia(energiaPrevista) : null;

  const dynamicRecommendations = React.useMemo(
    () => getDynamicRecommendations({ validation: validationState, qualidadePrevista, energiaPrevista }),
    [validationState, qualidadePrevista, energiaPrevista]
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`} data-tour="header">
        <div className="flex items-center justify-center mb-4">
          <img src="/Metalyicscerta.png" alt="MetaLytics" className="mx-auto" style={{ height: '30px', width: 'auto' }} />
        </div>
        <div className="text-center mb-4">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Sistema Inteligente para Otimização de Processos Metalúrgicos</p>
        </div>
        <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-4`}>
          <div className="flex items-center justify-center mb-2">
            <Users className={`h-5 w-5 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('authors')}</h2>
          </div>
          <div className="text-center space-y-1">
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Vitor Lorenzo Cerutti</p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Bernardo Krauspenhar Paganin</p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Lorenzo Zatta Santini</p>
          </div>
        </div>
        <div className="flex justify-center">
          <button onClick={() => setMostrarAjuda(!mostrarAjuda)} className="flex items-center text-blue-600 hover:text-blue-800 text-sm">
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
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('processParameters')}</h2>

          <div className="space-y-4">
            <ParameterInput label={t('temperature')} parameterName="temperatura" value={temperatura} onChange={setTemperatura} isDark={isDark} />
            <ParameterInput label={t('time')} parameterName="tempo" value={tempo} onChange={setTempo} isDark={isDark} />
            <ParameterInput label={t('pressure')} parameterName="pressao" value={pressao} onChange={setPressao} isDark={isDark} />
            <ParameterInput label={t('speed')} parameterName="velocidade" value={velocidade} onChange={setVelocidade} isDark={isDark} />

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
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${validationState.isValid ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
              data-tour="calculate-button"
            >
              {t('calculate')}
            </button>

            {!validationState.isValid && <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Corrija os parâmetros acima para habilitar o cálculo</p>}
          </div>

          {/* Resultado com Classificação */}
          {resultado && (
            <div className="mt-6 space-y-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-center font-bold text-lg ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{resultado}</p>
              </div>

              {classificacao && (
                <div className={`p-4 rounded-lg ${classificacao.fundo} border`}>
                  <div className="text-center">
                    <p className={`font-bold text-xl ${classificacao.cor}`}>{classificacao.texto}</p>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {qualidadePrevista < 355 && 'Considere ajustar os parâmetros para melhorar a qualidade'}
                      {qualidadePrevista >= 355 && qualidadePrevista < 365 && 'Qualidade aceitável, mas pode ser melhorada'}
                      {qualidadePrevista >= 365 && 'Excelente! Estes parâmetros produzem alta qualidade'}
                    </p>
                  </div>
                </div>
              )}

              {energyClassification && (
                <div className={`p-4 rounded-lg ${energyClassification.fundo} border`}>
                  <div className="text-center">
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Consumo Energético Previsto</p>
                    <p className={`font-bold text-xl ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{Number.isFinite(energiaPrevista) ? energiaPrevista.toFixed(1) : 'N/A'} kWh/ton</p>
                    <p className={`font-medium text-lg ${energyClassification.cor}`}>{energyClassification.texto}</p>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {energiaPrevista < 500 && 'Consumo energético otimizado'}
                      {energiaPrevista >= 500 && energiaPrevista < 600 && 'Consumo energético aceitável'}
                      {energiaPrevista >= 600 && 'Alto consumo - considere otimizar parâmetros'}
                    </p>
                  </div>
                </div>
              )}

              {metricas && (
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <h3 className={`font-semibold mb-3 flex items-center ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    <Info className="h-4 w-4 mr-2 text-blue-500" />
                    Métricas do Modelo ML
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>R² Score (Precisão):</span>
                      <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{(metricas.r2 * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${metricas.r2 * 100}%` }} />
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {metricas.r2 > 0.9 ? 'Modelo ML muito preciso' : metricas.r2 > 0.8 ? 'Modelo ML preciso' : metricas.r2 > 0.7 ? 'Modelo ML razoável' : 'Modelo ML impreciso'}
                    </p>
                    <div className="flex justify-between mt-3">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>MAE (Erro Médio):</span>
                      <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{metricas.mae.toFixed(1)} {t('units')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>MSE (Erro Quadrático):</span>
                      <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{metricas.mse.toFixed(1)}</span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Modelo treinado com {valoresReais.length} amostras. Erro médio: ±{metricas.mae.toFixed(1)} unidades</p>
                  </div>
                </div>
              )}

              <button onClick={onDownloadResults} className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors flex items-center justify-center">
                <Download className="h-4 w-4 mr-2" />
                {t('downloadResults')}
              </button>
            </div>
          )}
        </div>

        {/* Gráficos */}
{graficos && (
  <div className="space-y-6">
    {/* >>> 1) Recomendações Inteligentes (agora em primeiro) <<< */}
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
      <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>🎯 Recomendações Inteligentes</h3>

      {/* Dynamic Recommendations */}
      <div className="space-y-3">
        {dynamicRecommendations.length > 0 ? (
          dynamicRecommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                rec.type === 'critical'
                  ? isDark ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'
                  : rec.type === 'warning'
                  ? isDark ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
                  : rec.type === 'efficiency'
                  ? isDark ? 'bg-orange-900 border-orange-700' : 'bg-orange-50 border-orange-200'
                  : isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'
              }`}
            >
              <div className="flex items-start">
                <span className="text-lg mr-2">{rec.icon}</span>
                <span
                  className={`text-sm ${
                    rec.type === 'critical'
                      ? isDark ? 'text-red-200' : 'text-red-700'
                      : rec.type === 'warning'
                      ? isDark ? 'text-yellow-200' : 'text-yellow-700'
                      : rec.type === 'efficiency'
                      ? isDark ? 'text-orange-200' : 'text-orange-700'
                      : isDark ? 'text-green-200' : 'text-green-700'
                  }`}
                >
                  {rec.message}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900' : 'bg-green-50'} border ${isDark ? 'border-green-700' : 'border-green-200'}`}>
            <div className="flex items-center">
              <span className="text-lg mr-2">✅</span>
              <span className={`text-sm ${isDark ? 'text-green-200' : 'text-green-700'}`}>
                Parâmetros estão bem configurados! Nenhuma recomendação crítica.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quality vs Energy Trade-off Analysis */}
      <div className={`mt-4 p-3 rounded ${isDark ? 'bg-blue-900' : 'bg-blue-50'}`}>
        <h4 className={`font-medium mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>📊 Análise Qualidade vs Energia:</h4>
        <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
          {qualidadePrevista >= 365 && energiaPrevista < 550
            ? 'Configuração ideal: alta qualidade com baixo consumo energético'
            : qualidadePrevista >= 365 && energiaPrevista >= 550
            ? 'Alta qualidade, mas considere reduzir consumo energético'
            : qualidadePrevista < 365 && energiaPrevista < 550
            ? 'Baixo consumo, mas qualidade pode ser melhorada'
            : 'Tanto qualidade quanto eficiência energética precisam de otimização'}
        </p>
      </div>
    </div>

    {/* >>> 2) Real vs Previsto (ML) <<< */}
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
            legend: { position: 'top' as const, labels: { color: isDark ? '#e5e7eb' : '#374151' } },
          },
          scales: {
            y: {
              title: { display: true, text: 'Qualidade', color: isDark ? '#e5e7eb' : '#374151' },
              ticks: { color: isDark ? '#e5e7eb' : '#374151' },
              grid: { color: isDark ? '#374151' : '#e5e7eb' },
            },
            x: {
              title: { display: true, text: 'Amostras', color: isDark ? '#e5e7eb' : '#374151' },
              ticks: { color: isDark ? '#e5e7eb' : '#374151' },
              grid: { color: isDark ? '#374151' : '#e5e7eb' },
            },
          },
        }}
      />
    </div>

    {/* >>> 3) Parâmetros Atuais <<< */}
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
            legend: { position: 'top' as const, labels: { color: isDark ? '#e5e7eb' : '#374151' } },
          },
          scales: {
            y: {
              title: { display: true, text: 'Valor', color: isDark ? '#e5e7eb' : '#374151' },
              ticks: { color: isDark ? '#e5e7eb' : '#374151' },
              grid: { color: isDark ? '#374151' : '#e5e7eb' },
            },
            x: {
              title: { display: true, text: 'Parâmetros', color: isDark ? '#e5e7eb' : '#374151' },
              ticks: { color: isDark ? '#e5e7eb' : '#374151' },
              grid: { color: isDark ? '#374151' : '#e5e7eb' },
            },
          },
        }}
      />
    </div>
  </div>
)}
</div>
);   
};   

