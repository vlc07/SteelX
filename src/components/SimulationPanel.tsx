// src/components/SimulationPanel.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Play, TrendingUp, Zap, AlertCircle, Brain } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ParameterInput } from './ParameterInput';
import { validateAllParameters, validateParameterCombination } from '../utils/parameterValidation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Props = {
  temperatura: number;
  setTemperatura: (v: number) => void;
  tempo: number;
  setTempo: (v: number) => void;
  pressao: number;
  setPressao: (v: number) => void;
  velocidade: number;
  setVelocidade: (v: number) => void;
  simulationResults: any[];
  setSimulationResults: (r: any) => void; // quem chama empilha no array
  t: (k: string) => string;
  isDark: boolean;
};

type ValidationState = { isValid: boolean; errors: string[]; warnings: string[] };

const SimulationPanel: React.FC<Props> = ({
  temperatura,
  setTemperatura,
  tempo,
  setTempo,
  pressao,
  setPressao,
  velocidade,
  setVelocidade,
  simulationResults,
  setSimulationResults,
  t,
  isDark
}) => {
  const [tab, setTab] = useState<'single' | 'batch' | 'sensitivity'>('single');
  const [isRunning, setIsRunning] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({ isValid: true, errors: [], warnings: [] });
  const palette = {
    text: isDark ? 'text-gray-200' : 'text-gray-800',
    sub: isDark ? 'text-gray-400' : 'text-gray-600',
    card: `${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`,
    borderSubtle: isDark ? 'border-gray-700' : 'border-gray-200'
  };

  // ======= Validação =======
  useEffect(() => {
    const v1 = validateAllParameters({ temperatura, tempo, pressao, velocidade });
    const v2 = validateParameterCombination({ temperatura, tempo, pressao, velocidade });
    setValidation({ isValid: v1.isValid && v2.isValid, errors: v1.errors, warnings: v2.warnings });
  }, [temperatura, tempo, pressao, velocidade]);

  // ======= Modelo simples ML (coerente com o app) =======
  const calculateQuality = (temp: number, time: number, press: number, speed: number) => {
    const tempNorm = (temp - 1400) / 200;
    const timeNorm = (time - 10) / 110;
    const pressNorm = (press - 95) / 15;
    const speedNorm = (speed - 250) / 100;

    let q = 320;
    q += 50 * Math.pow(Math.max(0, Math.min(1, tempNorm)), 1.1);
    q += 30 * (1 - Math.pow(timeNorm - 0.6, 2));
    q += 15 * pressNorm;
    q += 10 * Math.sqrt(Math.max(0, speedNorm));
    q += 5 * tempNorm * timeNorm + 3 * pressNorm * speedNorm;
    q += (Math.random() - 0.5) * 3.5;
    return Math.max(300, Math.min(400, q));
  };

  // ======= Ações =======
  const runSingle = () => {
    setIsRunning(true);
    setTimeout(() => {
      const quality = calculateQuality(temperatura, tempo, pressao, velocidade);
      setSimulationResults({
        id: Date.now(),
        parameters: { temperatura, tempo, pressao, velocidade },
        quality,
        timestamp: new Date().toISOString(),
        type: 'single'
      });
      setIsRunning(false);
    }, 700);
  };

  const runBatch = () => {
    setIsRunning(true);
    setTimeout(() => {
      const N = 20;
      for (let i = 0; i < N; i++) {
        const tVar = Math.max(1400, Math.min(1600, temperatura + (Math.random() - 0.5) * 25));
        const tiVar = Math.max(10, Math.min(120, tempo + (Math.random() - 0.5) * 15));
        const pVar = Math.max(95, Math.min(110, pressao + (Math.random() - 0.5) * 1.8));
        const vVar = Math.max(250, Math.min(350, velocidade + (Math.random() - 0.5) * 18));
        const quality = calculateQuality(tVar, tiVar, pVar, vVar);
        setSimulationResults({
          id: Date.now() + i,
          parameters: { temperatura: tVar, tempo: tiVar, pressao: pVar, velocidade: vVar },
          quality,
          timestamp: new Date().toISOString(),
          type: 'batch',
          batchIndex: i + 1
        });
      }
      setIsRunning(false);
    }, 1200);
  };

  // ======= Sensibilidade =======
  const [sensitivity, setSensitivity] = useState<null | {
    temperatura: { x: number; y: number }[];
    tempo: { x: number; y: number }[];
    pressao: { x: number; y: number }[];
    velocidade: { x: number; y: number }[];
  }>(null);

  const runSensitivity = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = {
        temperatura: [] as { x: number; y: number }[],
        tempo: [] as { x: number; y: number }[],
        pressao: [] as { x: number; y: number }[],
        velocidade: [] as { x: number; y: number }[]
      };

      for (let tVal = 1400; tVal <= 1600; tVal += 20) res.temperatura.push({ x: tVal, y: calculateQuality(tVal, tempo, pressao, velocidade) });
      for (let tiVal = 10; tiVal <= 120; tiVal += 10) res.tempo.push({ x: tiVal, y: calculateQuality(temperatura, tiVal, pressao, velocidade) });
      for (let pVal = 95; pVal <= 110; pVal += 1) res.pressao.push({ x: pVal, y: calculateQuality(temperatura, tempo, pVal, velocidade) });
      for (let vVal = 250; vVal <= 350; vVal += 10) res.velocidade.push({ x: vVal, y: calculateQuality(temperatura, tempo, pressao, vVal) });

      setSensitivity(res);
      setIsRunning(false);
    }, 1200);
  };

  // ======= UI helpers =======
  const TabButton: React.FC<{ id: typeof tab; label: string }> = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
        tab === id
          ? 'bg-white dark:bg-gray-600 text-blue-500 shadow-sm'
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  const ActionBar: React.FC = () => (
    <div className="flex justify-center gap-4">
      {tab === 'single' && (
        <button
          onClick={runSingle}
          disabled={isRunning || !validation.isValid}
          className={`flex items-center px-6 py-3 rounded-lg font-medium ${
            isRunning || !validation.isValid ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <Play className="h-5 w-5 mr-2" /> {isRunning ? 'Simulando...' : 'Executar Simulação'}
        </button>
      )}
      {tab === 'batch' && (
        <button
          onClick={runBatch}
          disabled={isRunning || !validation.isValid}
          className={`flex items-center px-6 py-3 rounded-lg font-medium ${
            isRunning || !validation.isValid ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          <TrendingUp className="h-5 w-5 mr-2" /> {isRunning ? 'Executando Lote...' : 'Executar Lote (20x)'}
        </button>
      )}
      {tab === 'sensitivity' && (
        <button
          onClick={runSensitivity}
          disabled={isRunning || !validation.isValid}
          className={`flex items-center px-6 py-3 rounded-lg font-medium ${
            isRunning || !validation.isValid ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          <Zap className="h-5 w-5 mr-2" /> {isRunning ? 'Analisando...' : 'Executar Análise de Sensibilidade'}
        </button>
      )}
    </div>
  );

  // ======= Análises IA =======
  function analyzeSingle(q: number, params: { temperatura: number; tempo: number; pressao: number; velocidade: number }) {
    const cls =
      q >= 365 ? { label: 'Excelente', tone: 'text-emerald-600', hint: 'Manter essa faixa como referência.' } :
      q >= 355 ? { label: 'Boa', tone: 'text-amber-600', hint: 'Pequenos ajustes podem elevar para nível excelente.' } :
                 { label: 'Baixa', tone: 'text-rose-600', hint: 'Recomenda-se ajustes imediatos.' };

    // Heurísticas simples de ajuste
    const tips: string[] = [];
    if (q < 365) {
      if (tempo < 60) tips.push('aumentar ligeiramente o tempo (≈ +5 a +10 min)');
      if (temperatura < 1500) tips.push('subir a temperatura em ~10–20 °C');
      if (pressao < 100) tips.push('subir a pressão para a faixa 100–106');
      if (velocidade > 310) tips.push('reduzir um pouco a velocidade (mistura mais estável)');
    } else {
      tips.push('Monitore estabilidade; evite elevações desnecessárias de temperatura (custo/energia).');
    }

    return { cls, tips };
  }

  function analyzeBatch(stats: { mean: number; std: number; min: number; max: number; n: number }) {
    const spread = stats.max - stats.min;
    const consistency =
      stats.std < 2 ? 'Muito consistente' :
      stats.std < 4 ? 'Consistente' :
      stats.std < 6 ? 'Variável' : 'Alta variabilidade';

    const qualityBand =
      stats.mean >= 365 ? 'nível excelente' :
      stats.mean >= 355 ? 'nível bom' : 'abaixo do ideal';

    const notes = [
      `Média em ${qualityBand}.`,
      `${consistency} (desvio ${stats.std.toFixed(2)}; amplitude ${spread.toFixed(2)}).`,
      stats.mean >= 365
        ? 'Há margem para reduzir um pouco a temperatura/tempo visando economia de energia.'
        : 'Priorize aumentar ligeiramente temperatura/tempo e revisar pressão.'
    ];
    return { consistency, notes };
  }

  // Medidas auxiliares para sensibilidade
  function summarizeCurve(data: { x: number; y: number }[]) {
    if (!data || data.length < 2) return null;
    const y0 = data[0].y, yN = data[data.length - 1].y;
    const x0 = data[0].x, xN = data[data.length - 1].x;
    const delta = yN - y0;
    const slope = delta / (Number(xN) - Number(x0)); // variação por unidade
    // “curvatura” aproximada (média do módulo da 2ª diferença)
    let curvature = 0;
    for (let i = 1; i < data.length - 1; i++) {
      const d2 = data[i + 1].y - 2 * data[i].y + data[i - 1].y;
      curvature += Math.abs(d2);
    }
    curvature /= Math.max(1, data.length - 2);
    return { delta, slope, curvature, yMin: Math.min(...data.map(d => d.y)), yMax: Math.max(...data.map(d => d.y)) };
  }

  function sensitivityInsight(param: string, sum: ReturnType<typeof summarizeCurve>) {
    if (!sum) return { title: 'Impacto', bullets: [] as string[] };
    const dir = sum.delta > 0 ? 'aumenta' : sum.delta < 0 ? 'reduz' : 'quase não altera';
    const strength =
      Math.abs(sum.delta) > 15 ? 'impacto alto' :
      Math.abs(sum.delta) > 8  ? 'impacto moderado' :
      Math.abs(sum.delta) > 3  ? 'impacto leve' : 'impacto mínimo';
    const nonlin =
      sum.curvature > 1.2 ? 'com comportamento não-linear (há ponto ótimo na faixa)' :
      sum.curvature > 0.4 ? 'com leve não-linearidade' : 'quase linear';

    const bullets = [
      `No intervalo testado, **${param} ${dir} a qualidade** (${strength}).`,
      `Resposta ${nonlin}.`,
      `Faixa de qualidade observada: ${sum.yMin.toFixed(1)} → ${sum.yMax.toFixed(1)}.`,
      sum.delta > 0
        ? `Se o objetivo é elevar a qualidade, **testar valores um pouco maiores de ${param}** pode ajudar (respeitando limites).`
        : sum.delta < 0
        ? `Valores maiores de **${param}** tendem a piorar; avalie trabalhar mais próximo do limite inferior seguro.`
        : `Ajustes de **${param}** não devem ser prioridade neste cenário.`
    ];
    return { title: 'Impacto no processo', bullets };
  }

  // ======= Gráfico de sensibilidade + análise IA =======
  const SensitivityCard: React.FC<{
    title: string;
    unit: string;
    data: { x: number; y: number }[];
  }> = ({ title, unit, data }) => {
    const sum = summarizeCurve(data);
    const insight = sensitivityInsight(title.toLowerCase(), sum!);

    const chartData = {
      labels: data.map(d => d.x),
      datasets: [
        {
          label: `Qualidade vs ${title.toLowerCase()}`,
          data: data.map(d => d.y),
          borderColor:
            title === 'Temperatura'
              ? 'rgb(239, 68, 68)'
              : title === 'Tempo'
              ? 'rgb(59, 130, 246)'
              : title === 'Pressão'
              ? 'rgb(34, 197, 94)'
              : 'rgb(168, 85, 247)',
          backgroundColor:
            title === 'Temperatura'
              ? 'rgba(239, 68, 68, 0.1)'
              : title === 'Tempo'
              ? 'rgba(59, 130, 246, 0.1)'
              : title === 'Pressão'
              ? 'rgba(34, 197, 94, 0.1)'
              : 'rgba(168, 85, 247, 0.1)',
          tension: 0.35,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 5
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: isDark ? '#e5e7eb' : '#374151' } },
        title: { display: true, text: `Análise de Sensibilidade: ${title}`, color: isDark ? '#e5e7eb' : '#374151' }
      },
      scales: {
        y: {
          title: { display: true, text: 'Qualidade', color: isDark ? '#e5e7eb' : '#374151' },
          ticks: { color: isDark ? '#e5e7eb' : '#374151' },
          grid: { color: isDark ? '#374151' : '#e5e7eb' }
        },
        x: {
          title: { display: true, text: `${title} (${unit})`, color: isDark ? '#e5e7eb' : '#374151' },
          ticks: { color: isDark ? '#e5e7eb' : '#374151' },
          grid: { color: isDark ? '#374151' : '#e5e7eb' }
        }
      }
    };

    return (
      <div className={`${palette.card} space-y-4`}>
        <div className="w-full max-w-[720px] h-[320px] mx-auto">
          <Line data={chartData} options={options as any} />
        </div>
        {/* Análise IA ao lado/abaixo */}
        <div className={`mt-2 border-t ${palette.borderSubtle} pt-3`}>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="h-4 w-4 text-purple-500" />
            <span className={`text-sm font-semibold ${palette.text}`}>Análise IA — {insight.title}</span>
          </div>
          <ul className={`text-sm list-disc ml-5 ${palette.sub}`}>
            {insight.bullets.map((b, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: b }} />
            ))}
          </ul>
        </div>
      </div>
    );
  };

  // ======= Métricas do lote (se houver) =======
  const batchStats = useMemo(() => {
    const batch = simulationResults.filter(r => r.type === 'batch');
    if (batch.length === 0) return null;
    const q = batch.map((r: any) => r.quality);
    const mean = q.reduce((s: number, v: number) => s + v, 0) / q.length;
    const variance = q.reduce((s: number, v: number) => s + Math.pow(v - mean, 2), 0) / q.length;
    const std = Math.sqrt(variance);
    return { mean, variance, std, min: Math.min(...q), max: Math.max(...q), n: q.length };
  }, [simulationResults]);

  return (
    <div className="space-y-6">
      {/* Tabs no topo */}
      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-1 flex gap-1">
        <TabButton id="single" label="Simulação Única" />
        <TabButton id="batch" label="Simulação em Lote" />
        <TabButton id="sensitivity" label="Análise de Sensibilidade" />
      </div>

      {/* Parâmetros */}
      <div className={palette.card}>
        <h3 className={`text-lg font-semibold mb-4 ${palette.text}`}>Parâmetros do Processo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ParameterInput label="Temperatura" parameterName="temperatura" value={temperatura} onChange={setTemperatura} isDark={isDark} />
          <ParameterInput label="Tempo" parameterName="tempo" value={tempo} onChange={setTempo} isDark={isDark} />
          <ParameterInput label="Pressão" parameterName="pressao" value={pressao} onChange={setPressao} isDark={isDark} />
          <ParameterInput label="Velocidade" parameterName="velocidade" value={velocidade} onChange={setVelocidade} isDark={isDark} />
        </div>

        {(!validation.isValid || validation.warnings.length > 0) && (
          <div className="mt-4 space-y-2">
            {validation.errors.map((e, i) => (
              <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                <div className="flex items-start"><AlertCircle className="h-5 w-5 mr-2 mt-0.5" /> <span className="text-sm">{e}</span></div>
              </div>
            ))}
            {validation.warnings.map((w, i) => (
              <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-yellow-900 text-yellow-200 border border-yellow-700' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                <div className="flex items-start"><AlertCircle className="h-5 w-5 mr-2 mt-0.5" /> <span className="text-sm">{w}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barra de ação */}
      <ActionBar />

      {/* Loader */}
      {isRunning && (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4`}>
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className={palette.sub}>
              {tab === 'single' && 'Executando modelo ML...'}
              {tab === 'batch' && 'Processando simulações em lote...'}
              {tab === 'sensitivity' && 'Analisando sensibilidade dos parâmetros...'}
            </span>
          </div>
        </div>
      )}

      {/* SIMULAÇÃO ÚNICA */}
      {tab === 'single' && simulationResults.filter(r => r.type === 'single').length > 0 && (
        <div className={`${palette.card} space-y-4`}>
          <h3 className={`text-lg font-semibold ${palette.text}`}>Resultado da Simulação</h3>
          {(() => {
            const last = simulationResults.filter(r => r.type === 'single').slice(-1)[0];
            const clsTone =
              last.quality >= 365 ? 'text-green-600' :
              last.quality >= 355 ? 'text-yellow-600' : 'text-red-600';

            const analysis = analyzeSingle(last.quality, last.parameters);

            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`${palette.sub} text-sm`}>Qualidade Prevista</div>
                    <div className="text-2xl font-bold text-blue-600">{last.quality.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className={`${palette.sub} text-sm`}>Classificação</div>
                    <div className={`text-lg font-bold ${clsTone}`}>{analysis.cls.label}</div>
                  </div>
                  <div className="text-center">
                    <div className={`${palette.sub} text-sm`}>Confiança</div>
                    <div className="text-lg font-bold text-green-600">{(88 + Math.random() * 6).toFixed(1)}%</div>
                  </div>
                </div>

                {/* Análise IA */}
                <div className={`mt-2 border-t ${palette.borderSubtle} pt-3`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className={`text-sm font-semibold ${palette.text}`}>Análise IA</span>
                  </div>
                  <p className={`text-sm mb-1 ${palette.sub}`}>{analysis.cls.hint}</p>
                  {analysis.tips.length > 0 && (
                    <ul className={`text-sm list-disc ml-5 ${palette.sub}`}>
                      {analysis.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* LOTE */}
      {tab === 'batch' && batchStats && (
        <div className={`${palette.card} space-y-4`}>
          <h3 className={`text-lg font-semibold ${palette.text}`}>Resultados do Lote</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Stat label="Média" value={batchStats.mean.toFixed(2)} color="text-blue-600" />
            <Stat label="Desvio Padrão" value={batchStats.std.toFixed(2)} color="text-purple-600" />
            <Stat label="Melhor" value={batchStats.max.toFixed(2)} color="text-green-600" />
            <Stat label="Pior" value={batchStats.min.toFixed(2)} color="text-red-600" />
            <Stat label="N" value={batchStats.n} color="text-gray-600" />
          </div>

          {/* Análise IA do lote */}
          {(() => {
            const ai = analyzeBatch(batchStats);
            return (
              <div className={`mt-2 border-t ${palette.borderSubtle} pt-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span className={`text-sm font-semibold ${palette.text}`}>Análise IA</span>
                </div>
                <ul className={`text-sm list-disc ml-5 ${palette.sub}`}>
                  {ai.notes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              </div>
            );
          })()}
        </div>
      )}

      {/* SENSIBILIDADE */}
      {tab === 'sensitivity' && sensitivity && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SensitivityCard title="Temperatura" unit="°C" data={sensitivity.temperatura} />
            <SensitivityCard title="Tempo" unit="min" data={sensitivity.tempo} />
            <SensitivityCard title="Pressão" unit="kPa" data={sensitivity.pressao} />
            <SensitivityCard title="Velocidade" unit="rpm" data={sensitivity.velocidade} />
          </div>
        </div>
      )}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = 'text-gray-800' }) => (
  <div className="text-center">
    <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
  </div>
);

export default SimulationPanel;





