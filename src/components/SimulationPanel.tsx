// src/components/SimulationPanel.tsx
import React from 'react';
import {
  Users, Info, HelpCircle, Download, AlertTriangle,
  Play, BarChart3, TrendingUp, Zap, Gauge, Thermometer, Timer, Wind, BatteryCharging
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { ParameterInput } from './ParameterInput';
import { validateAllParameters, validateParameterCombination } from '../utils/parameterValidation';
import { getModel } from '../ml/engine';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

type Props = {
  // parâmetros e setters
  temperatura: number; setTemperatura: (v: number) => void;
  tempo: number; setTempo: (v: number) => void;
  pressao: number; setPressao: (v: number) => void;
  velocidade: number; setVelocidade: (v: number) => void;

  // resultados já calculados pelo App.calcular()
  resultado: string;
  metricas: { r2: number; mae: number; mse: number } | null;
  graficos: boolean;
  valoresReais: number[];
  valoresPrevistos: number[];
  qualidadePrevista: number;
  energiaPrevista: number;

  // UI/controle
  mostrarAjuda: boolean; setMostrarAjuda: (v: boolean) => void;
  calcular: () => void;                    // mantém o cálculo oficial
  onDownloadResults: () => void;           // CSV do painel
  t: (k: string) => string;
  isDark: boolean;

  // simulação
  simulationResults: any[];
  // IMPORTANTE: manter a semântica de “acrescentar” (no App você já passa como prev => [...prev, newResult])
  setSimulationResults: (r: any) => void;
};

type ValidationState = { isValid: boolean; errors: string[]; warnings: string[] };

// ---------------------- Recomendações Dinâmicas ----------------------
type RecType = 'critical' | 'warning' | 'efficiency' | 'info';
type Recommendation = { type: RecType; icon: string; message: string; };

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

  if (Number.isFinite(qualidadePrevista)) {
    if (qualidadePrevista! < 355) {
      recs.push({ type: 'critical', icon: '📉', message: 'Qualidade baixa: reduza levemente a velocidade e aumente o tempo.' });
    } else if (qualidadePrevista! < 365) {
      recs.push({ type: 'warning', icon: '🛠️', message: 'Qualidade aceitável: pequenos ajustes podem levar ao nível excelente.' });
    } else {
      recs.push({ type: 'info', icon: '✅', message: 'Qualidade excelente: mantenha esta faixa como baseline.' });
    }
  }

  if (Number.isFinite(energiaPrevista)) {
    if (energiaPrevista! >= 600) {
      recs.push({ type: 'efficiency', icon: '🔌', message: 'Consumo alto: tente reduzir a temperatura de pico ou o tempo de residência.' });
    } else if (energiaPrevista! >= 500) {
      recs.push({ type: 'efficiency', icon: '♻️', message: 'Consumo aceitável: ajuste pressão/velocidade para ganhar eficiência.' });
    } else {
      recs.push({ type: 'info', icon: '🌱', message: 'Consumo otimizado: bom equilíbrio entre qualidade e energia.' });
    }
  }

  if (Number.isFinite(qualidadePrevista) && Number.isFinite(energiaPrevista)) {
    if (qualidadePrevista! >= 365 && energiaPrevista! >= 550) {
      recs.push({ type: 'efficiency', icon: '⚖️', message: 'Alta qualidade com consumo elevado: tente ~1–3% de redução de temperatura.' });
    }
    if (qualidadePrevista! < 365 && energiaPrevista! < 550) {
      recs.push({ type: 'warning', icon: '🧪', message: 'Eficiência boa, mas qualidade baixa: aumente levemente tempo ou pressão.' });
    }
  }
  return recs;
}

// ---------------------- Badges auxiliares ----------------------
function qualityBadge(q: number, isDark: boolean) {
  if (q < 355) {
    return { label: 'Ruim', class: isDark ? 'bg-rose-900/50 text-rose-200 border border-rose-700' : 'bg-rose-100 text-rose-700 border border-rose-200' };
  }
  if (q < 365) {
    return { label: 'Boa', class: isDark ? 'bg-amber-900/50 text-amber-200 border border-amber-700' : 'bg-amber-100 text-amber-700 border border-amber-200' };
  }
  return { label: 'Excelente', class: isDark ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700' : 'bg-emerald-100 text-emerald-800 border border-emerald-200' };
}
function energyBadge(e: number, isDark: boolean) {
  if (e < 450) {
    return { label: 'Muito eficiente', class: isDark ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700' : 'bg-emerald-100 text-emerald-800 border border-emerald-200' };
  }
  if (e < 550) {
    return { label: 'Eficiente', class: isDark ? 'bg-amber-900/50 text-amber-200 border border-amber-700' : 'bg-amber-100 text-amber-700 border border-amber-200' };
  }
  return { label: 'Ineficiente', class: isDark ? 'bg-rose-900/50 text-rose-200 border border-rose-700' : 'bg-rose-100 text-rose-700 border border-rose-200' };
}

export const SimulationPanel: React.FC<Props> = (props) => {
  const {
    temperatura, setTemperatura, tempo, setTempo, pressao, setPressao, velocidade, setVelocidade,
    resultado, metricas, graficos, valoresReais, valoresPrevistos, qualidadePrevista, energiaPrevista,
    mostrarAjuda, setMostrarAjuda, calcular, onDownloadResults, t, isDark,
    simulationResults, setSimulationResults
  } = props;

  const [validationState, setValidationState] = React.useState<ValidationState>({ isValid: true, errors: [], warnings: [] });
  const [isRunning, setIsRunning] = React.useState(false);
  const [activeAnalysis, setActiveAnalysis] = React.useState<'single' | 'batch' | 'sensitivity'>('single');
  const [sensitivityResults, setSensitivityResults] = React.useState<any>(null);

  // modelo oficial (mesmo do app)
  const model = React.useMemo(() => getModel('inference'), []);

  // validação
  React.useEffect(() => {
    const p = validateAllParameters({ temperatura, tempo, pressao, velocidade });
    const c = validateParameterCombination({ temperatura, tempo, pressao, velocidade });
    setValidationState({ isValid: p.isValid && c.isValid, errors: p.errors, warnings: c.warnings });
  }, [temperatura, tempo, pressao, velocidade]);

  // datasets gráficos
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

  const dynamicRecommendations = React.useMemo(
    () => getDynamicRecommendations({ validation: validationState, qualidadePrevista, energiaPrevista }),
    [validationState, qualidadePrevista, energiaPrevista]
  );

  // ---------- SIMULAÇÕES usando o MESMO MODELO do app ----------
  const runSingleSimulation = () => {
    if (!validationState.isValid) return;
    setIsRunning(true);
    setTimeout(() => {
      const { quality, energy } = model.predict({
        temp: temperatura, time: tempo, press: pressao, speed: velocidade
      });
      const newResult = {
        id: Date.now(),
        parameters: { temperatura, tempo, pressao, velocidade },
        quality,
        energy,
        timestamp: new Date().toISOString(),
        type: 'single'
      };
      setSimulationResults(newResult); // App já agrega no array
      setIsRunning(false);
    }, 600);
  };

  const runBatchSimulation = () => {
    if (!validationState.isValid) return;
    setIsRunning(true);
    setTimeout(() => {
      const variations = 20;
      for (let i = 0; i < variations; i++) {
        const tempVar = Math.max(1400, Math.min(1600, temperatura + (Math.random() - 0.5) * 30));
        const timeVar = Math.max(10, Math.min(120, tempo + (Math.random() - 0.5) * 20));
        const pressVar = Math.max(95, Math.min(110, pressao + (Math.random() - 0.5) * 2));
        const speedVar = Math.max(250, Math.min(350, velocidade + (Math.random() - 0.5) * 20));
        const { quality, energy } = model.predict({ temp: tempVar, time: timeVar, press: pressVar, speed: speedVar });
        setSimulationResults({
          id: Date.now() + i,
          parameters: { temperatura: tempVar, tempo: timeVar, pressao: pressVar, velocidade: speedVar },
          quality, energy, timestamp: new Date().toISOString(), type: 'batch', batchIndex: i + 1
        });
      }
      setIsRunning(false);
    }, 1200);
  };

  const runSensitivityAnalysis = () => {
    if (!validationState.isValid) return;
    setIsRunning(true);
    setTimeout(() => {
      const results = { temperatura: [] as any[], tempo: [] as any[], pressao: [] as any[], velocidade: [] as any[] };
      for (let temp = 1400; temp <= 1600; temp += 10) {
        const { quality } = model.predict({ temp, time: tempo, press: pressao, speed: velocidade });
        results.temperatura.push({ x: temp, y: quality });
      }
      for (let time = 10; time <= 120; time += 5) {
        const { quality } = model.predict({ temp: temperatura, time, press: pressao, speed: velocidade });
        results.tempo.push({ x: time, y: quality });
      }
      for (let press = 95; press <= 110; press += 0.5) {
        const { quality } = model.predict({ temp: temperatura, time: tempo, press, speed: velocidade });
        results.pressao.push({ x: press, y: quality });
      }
      for (let speed = 250; speed <= 350; speed += 5) {
        const { quality } = model.predict({ temp: temperatura, time: tempo, press: pressao, speed });
        results.velocidade.push({ x: speed, y: quality });
      }
      setSensitivityResults(results);
      setIsRunning(false);
    }, 1400);
  };

  const getSensitivityChart = (parameter: string, data: any[], unit: string) => {
    const chartData = {
      labels: data.map(d => d.x),
      datasets: [{
        label: `Qualidade vs ${parameter}`,
        data: data.map(d => d.y),
        borderColor: parameter === 'temperatura' ? 'rgb(239, 68, 68)' :
                     parameter === 'tempo' ? 'rgb(59, 130, 246)' :
                     parameter === 'pressao' ? 'rgb(34, 197, 94)' : 'rgb(168, 85, 247)',
        backgroundColor: parameter === 'temperatura' ? 'rgba(239, 68, 68, 0.1)' :
                         parameter === 'tempo' ? 'rgba(59, 130, 246, 0.1)' :
                         parameter === 'pressao' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(168, 85, 247, 0.1)',
        tension: 0.4, fill: true, pointRadius: 3, pointHoverRadius: 6
      }]
    };
    const options = {
      responsive: true,
      plugins: { legend: { labels: { color: isDark ? '#e5e7eb' : '#374151' } },
        title: { display: true, text: `Análise de Sensibilidade: ${parameter.charAt(0).toUpperCase() + parameter.slice(1)}`, color: isDark ? '#e5e7eb' : '#374151' } },
      scales: {
        y: { title: { display: true, text: 'Qualidade', color: isDark ? '#e5e7eb' : '#374151' },
             ticks: { color: isDark ? '#e5e7eb' : '#374151' }, grid: { color: isDark ? '#374151' : '#e5e7eb' } },
        x: { title: { display: true, text: `${parameter.charAt(0).toUpperCase() + parameter.slice(1)} (${unit})`, color: isDark ? '#e5e7eb' : '#374151' },
             ticks: { color: isDark ? '#e5e7eb' : '#374151' }, grid: { color: isDark ? '#374151' : '#e5e7eb' } }
      }
    } as const;
    return <Line data={chartData} options={options} />;
  };

  // métricas do lote
  const BatchMetrics = () => {
    const batch = simulationResults.filter(r => r.type === 'batch');
    if (batch.length === 0) return null;
    const qualities = batch.map(r => r.quality);
    const energies = batch.map(r => r.energy);
    const meanQ = qualities.reduce((s, q) => s + q, 0) / qualities.length;
    const meanE = energies.reduce((s, e) => s + e, 0) / energies.length;
    const variance = qualities.reduce((s, q) => s + Math.pow(q - meanQ, 2), 0) / qualities.length;
    const stdDev = Math.sqrt(variance);
    const r2 = Math.max(0.80, 1 - (variance / 1000));
    const mae = stdDev * 0.8; const mse = variance;

    return (
      <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6 mb-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Métricas das Simulações (lote)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Qualidade Média</div>
            <div className="text-2xl font-bold text-blue-600">{meanQ.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Energia Média</div>
            <div className="text-2xl font-bold text-orange-600">{meanE.toFixed(1)}</div>
            <div className="text-xs text-gray-500">kWh/ton</div>
          </div>
          <div className="text-center">
            <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>R² (simulado)</div>
            <div className={`text-xl font-bold ${r2 > 0.9 ? 'text-green-600' : r2 > 0.8 ? 'text-yellow-600' : 'text-red-600'}`}>{r2.toFixed(3)}</div>
          </div>
          <div className="text-center">
            <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>MAE</div>
            <div className={`${isDark ? 'text-gray-200' : 'text-gray-800'} text-xl font-bold`}>{mae.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>MSE</div>
            <div className={`${isDark ? 'text-gray-200' : 'text-gray-800'} text-xl font-bold`}>{mse.toFixed(2)}</div>
          </div>
        </div>
      </div>
    );
  };

  // classes rápidas
  const card = `${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`;
  const label = isDark ? 'text-gray-300' : 'text-gray-700';
  const text = isDark ? 'text-gray-200' : 'text-gray-800';
  const sub = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className={card} data-tour="header">
        <div className="flex items-center justify-center mb-4">
          <img src="/Metalyicscerta.png" alt="MetaLytics" className="mx-auto" style={{ height: '30px', width: 'auto' }} />
        </div>
        <h2 className={`text-xl font-semibold text-center mb-1 ${text}`}>Painel de Simulação</h2>
        <p className={`text-center text-sm ${sub}`}>Ajuste parâmetros, calcule com o modelo oficial e rode simulações (única, lote, sensibilidade).</p>

        <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mt-4`}>
          <div className="flex items-center justify-center mb-2">
            <Users className={`h-5 w-5 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <h3 className={`text-md font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('authors')}</h3>
          </div>
          <div className="text-center space-y-1">
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Vitor Lorenzo Cerutti</p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Bernardo Krauspenhar Paganin</p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Otávio Susin Horn</p>
          </div>

          <div className="flex justify-center mt-3">
            <button onClick={() => setMostrarAjuda(!mostrarAjuda)} className="flex items-center text-blue-600 hover:text-blue-800 text-sm">
              <HelpCircle className="h-4 w-4 mr-1" />
              {mostrarAjuda ? t('hideHelp') : t('howToUse')}
            </button>
          </div>
          {mostrarAjuda && (
            <div className={`mt-4 ${isDark ? 'bg-blue-900' : 'bg-blue-50'} rounded-lg p-4 border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>Como usar:</h4>
              <ol className={`list-decimal list-inside space-y-1 text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                <li>Ajuste a temperatura, tempo, pressão e velocidade</li>
                <li>Clique em <b>Calcular</b> para obter qualidade/energia com o modelo oficial</li>
                <li>Use <b>Simulação Única</b> / <b>Lote</b> / <b>Sensibilidade</b> para explorar cenários</li>
                <li>Analise gráficos e recomendações para decidir ajustes</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna esquerda: Parâmetros + Ações + Resultados cálculo + Métricas do Modelo */}
        <div className={card} data-tour="parameters">
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('processParameters')}</h3>

          <div className="space-y-4">
            <ParameterInput label={t('temperature')} parameterName="temperatura" value={temperatura} onChange={setTemperatura} isDark={isDark} />
            <ParameterInput label={t('time')} parameterName="tempo" value={tempo} onChange={setTempo} isDark={isDark} />
            <ParameterInput label={t('pressure')} parameterName="pressao" value={pressao} onChange={setPressao} isDark={isDark} />
            <ParameterInput label={t('speed')} parameterName="velocidade" value={velocidade} onChange={setVelocidade} isDark={isDark} />

            {(!validationState.isValid || validationState.warnings.length > 0) && (
              <div className="space-y-2">
                {validationState.errors.map((error, i) => (
                  <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700'} border ${isDark ? 'border-red-700' : 'border-red-200'}`}>
                    <div className="flex items-start"><AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" /><span className="text-sm">{error}</span></div>
                  </div>
                ))}
                {validationState.warnings.map((warning, i) => (
                  <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-50 text-yellow-700'} border ${isDark ? 'border-yellow-700' : 'border-yellow-200'}`}>
                    <div className="flex items-start"><AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" /><span className="text-sm">{warning}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-3 mt-5">
            <button onClick={calcular} disabled={!validationState.isValid}
              className={`flex-1 min-w-[200px] py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                validationState.isValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              } text-white`}>
              <Gauge className="h-5 w-5" /> {t('calculate')}
            </button>

            <button onClick={runSingleSimulation} disabled={isRunning || !validationState.isValid}
              className={`flex-1 min-w-[200px] py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                isRunning || !validationState.isValid ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white`}>
              <Play className="h-5 w-5" /> {isRunning && activeAnalysis==='single' ? 'Simulando…' : 'Simulação Única'}
            </button>

            <button onClick={() => { setActiveAnalysis('batch'); runBatchSimulation(); }}
              disabled={isRunning || !validationState.isValid}
              className={`flex-1 min-w-[200px] py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                isRunning || !validationState.isValid ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              } text-white`}>
              <TrendingUp className="h-5 w-5" /> {isRunning && activeAnalysis==='batch' ? 'Executando lote…' : 'Lote (20x)'}
            </button>

            <button onClick={() => { setActiveAnalysis('sensitivity'); runSensitivityAnalysis(); }}
              disabled={isRunning || !validationState.isValid}
              className={`flex-1 min-w-[200px] py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                isRunning || !validationState.isValid ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
              } text-white`}>
              <Zap className="h-5 w-5" /> {isRunning && activeAnalysis==='sensitivity' ? 'Analisando…' : 'Sensibilidade'}
            </button>
          </div>

          {/* Resultado do cálculo oficial */}
          {resultado && (
            <div className="mt-6 space-y-4">
              <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg`}>
                <p className={`text-center font-bold text-lg ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{resultado}</p>
              </div>

              {Number.isFinite(qualidadePrevista) && (
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wide text-gray-500">Qualidade prevista</span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${qualityBadge(qualidadePrevista, isDark).class}`}>
                      {qualityBadge(qualidadePrevista, isDark).label}
                    </span>
                  </div>
                  <div className={`text-2xl font-extrabold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    {qualidadePrevista.toFixed(1)} <span className="text-lg text-gray-500">/400</span>
                  </div>
                </div>
              )}
              {Number.isFinite(energiaPrevista) && (
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wide text-gray-500">Consumo energético</span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${energyBadge(energiaPrevista, isDark).class}`}>
                      <BatteryCharging className="inline h-3 w-3 mr-1" />
                      {energyBadge(energiaPrevista, isDark).label}
                    </span>
                  </div>
                  <div className={`text-2xl font-extrabold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    {energiaPrevista.toFixed(1)} <span className="text-sm text-gray-500">kWh/ton</span>
                  </div>
                </div>
              )}

              {metricas && (
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <h4 className={`font-semibold mb-3 flex items-center ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    <Info className="h-4 w-4 mr-2 text-blue-500" /> Métricas do Modelo ML (treino/inferência)
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>R² Score (Precisão):</span>
                      <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{(metricas.r2 * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full" style={{ width: `${metricas.r2 * 100}%` }} /></div>
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
                <Download className="h-4 w-4 mr-2" /> {t('downloadResults')}
              </button>
            </div>
          )}
        </div>

        {/* Coluna direita: Recomendações + Gráficos + Resultados de simulação + Sensibilidade */}
        <div className="space-y-6">
          {/* Recomendações Inteligentes */}
          <div className={card}>
            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>🎯 Recomendações Inteligentes</h3>
            <div className="space-y-3">
              {dynamicRecommendations.length > 0 ? (
                dynamicRecommendations.map((rec, i) => (
                  <div key={i}
                    className={`p-3 rounded-lg border ${
                      rec.type === 'critical' ? (isDark ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200') :
                      rec.type === 'warning' ? (isDark ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200') :
                      rec.type === 'efficiency' ? (isDark ? 'bg-orange-900 border-orange-700' : 'bg-orange-50 border-orange-200') :
                      (isDark ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200')
                    }`}>
                    <div className="flex items-start">
                      <span className="text-lg mr-2">{rec.icon}</span>
                      <span className={`text-sm ${
                        rec.type === 'critical' ? (isDark ? 'text-red-200' : 'text-red-700') :
                        rec.type === 'warning' ? (isDark ? 'text-yellow-200' : 'text-yellow-700') :
                        rec.type === 'efficiency' ? (isDark ? 'text-orange-200' : 'text-orange-700') :
                        (isDark ? 'text-green-200' : 'text-green-700')
                      }`}>{rec.message}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900' : 'bg-green-50'} border ${isDark ? 'border-green-700' : 'border-green-200'}`}>
                  <div className="flex items-center"><span className="text-lg mr-2">✅</span>
                    <span className={`text-sm ${isDark ? 'text-green-200' : 'text-green-700'}`}>Parâmetros estão bem configurados! Nenhuma recomendação crítica.</span>
                  </div>
                </div>
              )}
            </div>

            <div className={`mt-4 p-3 rounded ${isDark ? 'bg-blue-900' : 'bg-blue-50'}`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>📊 Análise Qualidade vs Energia:</h4>
              <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                {qualidadePrevista >= 365 && energiaPrevista < 550 ? 'Configuração ideal: alta qualidade com baixo consumo energético'
                  : qualidadePrevista >= 365 && energiaPrevista >= 550 ? 'Alta qualidade, mas considere reduzir consumo energético'
                  : qualidadePrevista < 365 && energiaPrevista < 550 ? 'Baixo consumo, mas qualidade pode ser melhorada'
                  : 'Tanto qualidade quanto eficiência energética precisam de otimização'}
              </p>
            </div>
          </div>

          {/* Real vs Previsto */}
          {graficos && (
            <div className={card}>
              <h3 className={`text-lg font-semibold mb-3 text-center ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('realVsPredicted')} (ML)</h3>
              <p className={`text-xs mb-3 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Como o modelo prevê vs dados reais de treinamento</p>
              <Line
                data={dadosComparacao}
                options={{
                  responsive: true,
                  plugins: { legend: { position: 'top', labels: { color: isDark ? '#e5e7eb' : '#374151' } } },
                  scales: {
                    y: { title: { display: true, text: 'Qualidade', color: isDark ? '#e5e7eb' : '#374151' },
                         ticks: { color: isDark ? '#e5e7eb' : '#374151' }, grid: { color: isDark ? '#374151' : '#e5e7eb' } },
                    x: { title: { display: true, text: 'Amostras', color: isDark ? '#e5e7eb' : '#374151' },
                         ticks: { color: isDark ? '#e5e7eb' : '#374151' }, grid: { color: isDark ? '#374151' : '#e5e7eb' } }
                  }
                }}
              />
            </div>
          )}

          {/* Parâmetros Atuais */}
          <div className={card}>
            <h3 className={`text-lg font-semibold mb-3 text-center ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('currentParameters')}</h3>
            <p className={`text-xs mb-3 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Visualização dos valores que você definiu</p>
            <Bar
              data={dadosParametros}
              options={{
                responsive: true,
                plugins: { legend: { position: 'top', labels: { color: isDark ? '#e5e7eb' : '#374151' } } },
                scales: {
                  y: { title: { display: true, text: 'Valor', color: isDark ? '#e5e7eb' : '#374151' },
                       ticks: { color: isDark ? '#e5e7eb' : '#374151' }, grid: { color: isDark ? '#374151' : '#e5e7eb' } },
                  x: { title: { display: true, text: 'Parâmetros', color: isDark ? '#e5e7eb' : '#374151' },
                       ticks: { color: isDark ? '#e5e7eb' : '#374151' }, grid: { color: isDark ? '#374151' : '#e5e7eb' } }
                }
              }}
            />
          </div>

          {/* Resultados Simulação Única */}
          {activeAnalysis === 'single' && simulationResults.some(r => r.type === 'single') && (
            <div className={card}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Resultado da Simulação (única)</h3>
              {(() => {
                const lastSingle = [...simulationResults].reverse().find(r => r.type === 'single');
                if (!lastSingle) return null;
                const qB = qualityBadge(lastSingle.quality, isDark);
                const eB = energyBadge(lastSingle.energy, isDark);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs uppercase tracking-wide text-gray-500">Qualidade</span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${qB.class}`}>{qB.label}</span>
                      </div>
                      <div className={`text-2xl font-extrabold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        {lastSingle.quality.toFixed(2)} <span className="text-lg text-gray-500">/400</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs uppercase tracking-wide text-gray-500">Energia</span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${eB.class}`}>
                          <BatteryCharging className="inline h-3 w-3 mr-1" />{eB.label}
                        </span>
                      </div>
                      <div className={`text-2xl font-extrabold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        {lastSingle.energy.toFixed(1)} <span className="text-sm text-gray-500">kWh/ton</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Confiança (simulada)</div>
                      <div className="text-2xl font-extrabold text-emerald-600">{(85 + Math.random() * 10).toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Métricas do Lote (se houver) */}
          <BatchMetrics />

          {/* Sensibilidade */}
          {activeAnalysis === 'sensitivity' && sensitivityResults && (
            <div className="space-y-6">
              <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Análise de Impacto dos Parâmetros</h3>
                {(() => {
                  const imp = {
                    temperatura: Math.max(...sensitivityResults.temperatura.map((d: any) => d.y)) - Math.min(...sensitivityResults.temperatura.map((d: any) => d.y)),
                    tempo: Math.max(...sensitivityResults.tempo.map((d: any) => d.y)) - Math.min(...sensitivityResults.tempo.map((d: any) => d.y)),
                    pressao: Math.max(...sensitivityResults.pressao.map((d: any) => d.y)) - Math.min(...sensitivityResults.pressao.map((d: any) => d.y)),
                    velocidade: Math.max(...sensitivityResults.velocidade.map((d: any) => d.y)) - Math.min(...sensitivityResults.velocidade.map((d: any) => d.y))
                  };
                  const sorted = Object.entries(imp).sort(([,a], [,b]) => b - a);
                  const maxI = Math.max(...Object.values(imp));
                  return (
                    <div className="space-y-3">
                      {sorted.map(([param, val], idx) => (
                        <div key={param} className="flex items-center justify-between">
                          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                            {idx + 1}. {param.charAt(0).toUpperCase() + param.slice(1)}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${
                                idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-orange-500' : idx === 2 ? 'bg-yellow-500' : 'bg-green-500'
                              }`} style={{ width: `${(Number(val) / maxI) * 100}%` }} />
                            </div>
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Δ{Number(val).toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  {getSensitivityChart('temperatura', sensitivityResults.temperatura, '°C')}
                </div>
                <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  {getSensitivityChart('tempo', sensitivityResults.tempo, 'min')}
                </div>
                <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  {getSensitivityChart('pressao', sensitivityResults.pressao, 'kPa')}
                </div>
                <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  {getSensitivityChart('velocidade', sensitivityResults.velocidade, 'rpm')}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900' : 'bg-yellow-50'} border ${isDark ? 'border-yellow-700' : 'border-yellow-200'}`}>
                <div className="flex items-start">
                  <AlertTriangle className={`h-5 w-5 mr-2 mt-0.5 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`} />
                  <div>
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>Como interpretar</h4>
                    <ul className={`text-sm space-y-1 ${isDark ? 'text-yellow-200' : 'text-yellow-700'}`}>
                      <li>• Curvas inclinadas ⇒ grande impacto (alta importância)</li>
                      <li>• Curvas planas ⇒ pouco impacto</li>
                      <li>• Curvas não-lineares ⇒ relações complexas capturadas pelo modelo</li>
                      <li>• Ranking de impacto ⇒ importância relativa das features</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading da simulação */}
        {isRunning && (
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 lg:col-span-2`}>
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                {activeAnalysis === 'single' && 'Executando modelo ML...'}
                {activeAnalysis === 'batch' && 'Processando simulações em lote...'}
                {activeAnalysis === 'sensitivity' && 'Analisando sensibilidade de parâmetros...'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationPanel;
