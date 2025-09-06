// src/components/SimulationPanel.tsx
import React from 'react';
import {
  Play, TrendingUp, Zap, AlertCircle, Brain, Sparkles,
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ParameterInput } from './ParameterInput';
import { validateAllParameters, validateParameterCombination } from '../utils/parameterValidation';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type SimulationPanelProps = {
  temperatura: number;
  setTemperatura: (v: number) => void;
  tempo: number;
  setTempo: (v: number) => void;
  pressao: number;
  setPressao: (v: number) => void;
  velocidade: number;
  setVelocidade: (v: number) => void;
  simulationResults: any[];
  setSimulationResults: (r: any) => void; // o App empilha os resultados
  t: (k: string) => string;
  isDark: boolean;
};

const SimulationPanel: React.FC<SimulationPanelProps> = ({
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
  isDark,
}) => {
  const [isRunning, setIsRunning] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'single' | 'batch' | 'sensitivity'>('single');
  const [sensitivityResults, setSensitivityResults] = React.useState<{
    temperatura: { x: number; y: number }[];
    tempo: { x: number; y: number }[];
    pressao: { x: number; y: number }[];
    velocidade: { x: number; y: number }[];
  } | null>(null);

  const [validationState, setValidationState] = React.useState({
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
  });

  React.useEffect(() => {
    const v1 = validateAllParameters({ temperatura, tempo, pressao, velocidade });
    const v2 = validateParameterCombination({ temperatura, tempo, pressao, velocidade });
    setValidationState({
      isValid: v1.isValid && v2.isValid,
      errors: v1.errors,
      warnings: v2.warnings,
    });
  }, [temperatura, tempo, pressao, velocidade]);

  /* ===========================
     Modelo de Simulação (ML-like)
     =========================== */
  const calculateQuality = (temp: number, time: number, press: number, speed: number) => {
    const tempNorm = (temp - 1400) / 200;
    const timeNorm = (time - 10) / 110;
    const pressNorm = (press - 95) / 15;
    const speedNorm = (speed - 250) / 100;

    let q = 300;
    q += 50 * Math.pow(Math.max(0, Math.min(1, tempNorm)), 1.15) + 18 * Math.sin(tempNorm * Math.PI);
    const timeOptimal = 1 - Math.pow(timeNorm - 0.6, 2);
    q += 28 * timeOptimal;
    q += 14 * pressNorm;
    q += 9 * Math.sqrt(Math.max(0, speedNorm));
    q += 5 * tempNorm * timeNorm + 3 * pressNorm * speedNorm;
    q += (Math.random() - 0.5) * 3.5;
    return Math.max(300, Math.min(400, q));
  };

  const calculateEnergy = (temp: number, time: number, press: number, speed: number) => {
    const tempNorm = (temp - 1400) / 200;
    const timeNorm = (time - 10) / 110;
    const pressNorm = (press - 95) / 15;
    const speedNorm = (speed - 250) / 100;

    let e = 420 + 110 * tempNorm + 35 * timeNorm + 22 * pressNorm + 18 * speedNorm;
    e += (Math.random() - 0.5) * 18;
    return Math.max(350, Math.min(700, e));
  };

  /* ===========================
     Execuções
     =========================== */
  const runSingle = () => {
    setIsRunning(true);
    setTimeout(() => {
      const quality = calculateQuality(temperatura, tempo, pressao, velocidade);
      const energy = calculateEnergy(temperatura, tempo, pressao, velocidade);
      const res = {
        id: Date.now(),
        type: 'single',
        parameters: { temperatura, tempo, pressao, velocidade },
        quality,
        energy,
        timestamp: new Date().toISOString(),
      };
      setSimulationResults(res);
      setIsRunning(false);
    }, 900);
  };

  const runBatch = () => {
    setIsRunning(true);
    setTimeout(() => {
      const N = 20;
      for (let i = 0; i < N; i++) {
        const tVar = Math.max(1400, Math.min(1600, temperatura + (Math.random() - 0.5) * 30));
        const tmVar = Math.max(10, Math.min(120, tempo + (Math.random() - 0.5) * 18));
        const pVar = Math.max(95, Math.min(110, pressao + (Math.random() - 0.5) * 2));
        const vVar = Math.max(250, Math.min(350, velocidade + (Math.random() - 0.5) * 18));

        const q = calculateQuality(tVar, tmVar, pVar, vVar);
        const e = calculateEnergy(tVar, tmVar, pVar, vVar);

        setSimulationResults({
          id: Date.now() + i,
          type: 'batch',
          parameters: { temperatura: tVar, tempo: tmVar, pressao: pVar, velocidade: vVar },
          quality: q,
          energy: e,
          timestamp: new Date().toISOString(),
          batchIndex: i + 1,
        });
      }
      setIsRunning(false);
    }, 1800);
  };

  const runSensitivity = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = {
        temperatura: [] as { x: number; y: number }[],
        tempo: [] as { x: number; y: number }[],
        pressao: [] as { x: number; y: number }[],
        velocidade: [] as { x: number; y: number }[],
      };

      for (let T = 1400; T <= 1600; T += 10) {
        res.temperatura.push({ x: T, y: calculateQuality(T, tempo, pressao, velocidade) });
      }
      for (let tm = 10; tm <= 120; tm += 5) {
        res.tempo.push({ x: tm, y: calculateQuality(temperatura, tm, pressao, velocidade) });
      }
      for (let pr = 95; pr <= 110; pr += 0.5) {
        res.pressao.push({ x: pr, y: calculateQuality(temperatura, tempo, pr, velocidade) });
      }
      for (let sp = 250; sp <= 350; sp += 5) {
        res.velocidade.push({ x: sp, y: calculateQuality(temperatura, tempo, pressao, sp) });
      }
      setSensitivityResults(res);
      setIsRunning(false);
    }, 1500);
  };

  /* ===========================
     Métricas do Lote & IA
     =========================== */
  const batch = React.useMemo(() => simulationResults.filter((r) => r.type === 'batch'), [simulationResults]);
  const batchStats = React.useMemo(() => {
    if (batch.length === 0) return null;
    const qs = batch.map((r) => r.quality);
    const es = batch.map((r) => r.energy);
    const meanQ = qs.reduce((s, v) => s + v, 0) / qs.length;
    const varQ = qs.reduce((s, v) => s + Math.pow(v - meanQ, 2), 0) / qs.length;
    const stdQ = Math.sqrt(varQ);
    const meanE = es.reduce((s, v) => s + v, 0) / es.length;
    // R² estilizado (apenas um indicador de consistência interna do lote)
    const r2 = Math.max(0.75, Math.min(0.98, 1 - varQ / 900));
    return { meanQ, stdQ, varQ, meanE, r2 };
  }, [batch]);

  const aiInsightSingle = React.useMemo(() => {
    const last = simulationResults.findLast?.((r) => r.type === 'single') || simulationResults[simulationResults.length - 1];
    if (!last) return null;
    const q = last.quality;
    const e = last.energy;
    let bullets: string[] = [];
    if (q >= 365 && e <= 550) {
      bullets = [
        'Qualidade alta com energia controlada — ótimo equilíbrio.',
        'Salve esta combinação como referência e valide em produção.',
      ];
    } else if (q >= 365 && e > 550) {
      bullets = [
        'Qualidade alta, mas energia acima do desejado.',
        'Teste reduzir temperatura/tempo em ~1–3% para poupar kWh/ton.',
      ];
    } else if (q >= 355) {
      bullets = [
        'Qualidade boa.',
        'Pequenos incrementos em tempo/pressão podem levar a “Excelente”.',
      ];
    } else {
      bullets = [
        'Qualidade abaixo do alvo.',
        'Aumente gradualmente tempo/temperatura e mantenha pressão estável.',
      ];
    }
    return { q, e, bullets, headline: 'Resumo da IA' };
  }, [simulationResults]);

  const aiInsightBatch = React.useMemo(() => {
    if (!batchStats) return null;
    const { meanQ, stdQ, meanE } = batchStats;
    const estabilidade = stdQ < 3 ? 'Alta' : stdQ < 6 ? 'Média' : 'Baixa';
    const bullets: string[] = [];
    if (meanQ >= 365 && meanE <= 550) {
      bullets.push('Lote robusto: mantenha parâmetros e valide no chão de fábrica.');
    } else if (meanQ >= 365) {
      bullets.push('Qualidade média alta — foco: reduzir energia com menor pico térmico.');
    } else if (meanQ >= 355) {
      bullets.push('Qualidade média boa — aumente levemente tempo/pressão para cruzar o limiar de excelência.');
    } else {
      bullets.push('Qualidade média baixa — reavalie temperatura e tempo como primeiros drivers.');
    }
    return { estabilidade, bullets, headline: 'Resumo da IA (Lote)' };
  }, [batchStats]);

  /* ===========================
     Helpers de Chart/Estilo
     =========================== */
  const axisColor = isDark ? '#e5e7eb' : '#374151';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  const makeSensitivityChart = (label: string, arr: { x: number; y: number }[], color: string) => ({
    data: {
      labels: arr.map((d) => d.x),
      datasets: [{
        label,
        data: arr.map((d) => d.y),
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.12)'),
        fill: true,
        tension: 0.35,
        pointRadius: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false as const,
      plugins: {
        legend: { labels: { color: axisColor } },
        title: { display: true, text: label, color: axisColor },
      },
      scales: {
        y: {
          title: { display: true, text: 'Qualidade', color: axisColor },
          ticks: { color: axisColor },
          grid: { color: gridColor },
        },
        x: {
          ticks: { color: axisColor },
          grid: { color: gridColor },
        },
      },
    },
  });

  /* ===========================
     Análise IA por Parâmetro (Sensibilidade)
     =========================== */
  function insightForParameter(
    name: 'Temperatura' | 'Tempo' | 'Pressão' | 'Velocidade',
    arr: { x: number; y: number }[],
  ) {
    if (!arr || arr.length < 3) {
      return {
        headline: `Análise IA — ${name}`,
        bullets: ['Dados insuficientes para uma leitura robusta.'],
        tags: ['Coletar mais pontos'],
      };
    }

    // Tendência geral (slope simples)
    const first = arr[0];
    const last = arr[arr.length - 1];
    const slope = (last.y - first.y) / (last.x - first.x || 1);

    // Pico (máximo local)
    let maxY = -Infinity;
    let maxX = arr[0].x;
    arr.forEach((d) => {
      if (d.y > maxY) { maxY = d.y; maxX = d.x; }
    });

    // Curvatura aproximada (diferença de slopes)
    const midIdx = Math.floor(arr.length / 2);
    const sLeft = (arr[midIdx].y - arr[0].y) / (arr[midIdx].x - arr[0].x || 1);
    const sRight = (arr[arr.length - 1].y - arr[midIdx].y) / (arr[arr.length - 1].x - arr[midIdx].x || 1);
    const curvature = sRight - sLeft; // >0 abre para cima; <0 abre para baixo

    const bullets: string[] = [];
    const tags: string[] = [];

    // Interpretações simples e diretas
    if (Math.abs(slope) < 0.01) {
      bullets.push('Influência moderada no intervalo analisado (curva quase plana).');
      tags.push('Estável');
    } else if (slope > 0) {
      bullets.push('Quanto maior o valor, maior tende a ser a qualidade nesta faixa.');
      tags.push('Tendência ↑');
    } else {
      bullets.push('Reduzir este valor pode ajudar a elevar a qualidade nesta faixa.');
      tags.push('Tendência ↓');
    }

    // Curvatura e “óptimo”
    if (Math.abs(curvature) > 0.01) {
      const curvTxt = curvature > 0 ? 'curva abrindo para cima' : 'curva abrindo para baixo';
      bullets.push(`Há não linearidade perceptível (${curvTxt}).`);
      if (curvature < 0) {
        bullets.push(`Existe um ponto ótimo próximo de ${maxX.toFixed(1)} (qualidade ≈ ${maxY.toFixed(1)}).`);
        tags.push('Ótimo local');
      } else {
        tags.push('Não linear');
      }
    }

    // Sinalizar se o pico está nas pontas
    const atEdge = maxX === arr[0].x || maxX === arr[arr.length - 1].x;
    if (atEdge) {
      bullets.push('O melhor ponto parece estar no limite testado — vale expandir a faixa para confirmar.');
      tags.push('Expandir faixa');
    }

    return {
      headline: `Análise IA — ${name}`,
      bullets,
      tags,
    };
  }

  /* ===========================
     UI
     =========================== */
  return (
    <div className="space-y-6">
      {/* Abas no topo */}
      <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow p-2 flex gap-2`}>
        {(['single', 'batch', 'sensitivity'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? `${isDark ? 'bg-gray-700 text-blue-300' : 'bg-gray-100 text-blue-700'}`
                : `${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
            }`}
          >
            {tab === 'single' && 'Simulação Única'}
            {tab === 'batch' && 'Simulação em Lote'}
            {tab === 'sensitivity' && 'Análise de Sensibilidade'}
          </button>
        ))}
      </div>

      {/* Parâmetros */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
          Configuração de Parâmetros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ParameterInput label="Temperatura" parameterName="temperatura" value={temperatura} onChange={setTemperatura} isDark={isDark} />
          <ParameterInput label="Tempo" parameterName="tempo" value={tempo} onChange={setTempo} isDark={isDark} />
          <ParameterInput label="Pressão" parameterName="pressao" value={pressao} onChange={setPressao} isDark={isDark} />
          <ParameterInput label="Velocidade" parameterName="velocidade" value={velocidade} onChange={setVelocidade} isDark={isDark} />
        </div>

        {/* avisos de validação */}
        {(!validationState.isValid || validationState.warnings.length > 0) && (
          <div className="mt-4 space-y-2">
            {validationState.errors.map((e, i) => (
              <div key={i} className={`p-3 rounded-lg border ${isDark ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-50 text-red-700 border-red-200'}`}>
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{e}</span>
                </div>
              </div>
            ))}
            {validationState.warnings.map((w, i) => (
              <div key={i} className={`p-3 rounded-lg border ${isDark ? 'bg-yellow-900 text-yellow-200 border-yellow-700' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{w}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {activeTab === 'single' && (
          <button
            onClick={runSingle}
            disabled={isRunning || !validationState.isValid}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              isRunning || !validationState.isValid ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Play className="h-5 w-5 mr-2" />
            {isRunning ? 'Simulando...' : 'Executar Simulação'}
          </button>
        )}
        {activeTab === 'batch' && (
          <button
            onClick={runBatch}
            disabled={isRunning || !validationState.isValid}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              isRunning || !validationState.isValid ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            {isRunning ? 'Executando Lote...' : 'Executar Lote (20x)'}
          </button>
        )}
        {activeTab === 'sensitivity' && (
          <button
            onClick={runSensitivity}
            disabled={isRunning || !validationState.isValid}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              isRunning || !validationState.isValid ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <Zap className="h-5 w-5 mr-2" />
            {isRunning ? 'Analisando...' : 'Executar Análise de Sensibilidade'}
          </button>
        )}
      </div>

      {/* Indicador de progresso */}
      {isRunning && (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4`}>
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              {activeTab === 'single' && 'Executando modelo ML...'}
              {activeTab === 'batch' && 'Processando simulações em lote...'}
              {activeTab === 'sensitivity' && 'Analisando sensibilidade de parâmetros...'}
            </span>
          </div>
        </div>
      )}

      {/* Resultados — SIMULAÇÃO ÚNICA */}
      {activeTab === 'single' && simulationResults.findLast?.((r) => r.type === 'single') && (
        <div className={`${isDark ? 'bg-gray-900/50' : 'bg-white'} rounded-2xl shadow border ${isDark ? 'border-blue-900/40' : 'border-blue-200'}`}>
          <div className={`px-6 py-5 border-b ${isDark ? 'border-blue-900/40' : 'border-blue-100'} flex items-center gap-2`}>
            <Sparkles className="h-5 w-5 text-blue-500" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Resultado da Simulação</h3>
          </div>
          {(() => {
            const last = simulationResults.findLast?.((r) => r.type === 'single')!;
            return (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <KPI title="Qualidade Prevista" value={last.quality.toFixed(2)} accent="blue" />
                  <KPI title="Consumo Energético" value={`${last.energy.toFixed(1)} kWh/ton`} accent="orange" />
                  <KPI
                    title="Classificação"
                    value={last.quality >= 365 ? 'Excelente' : last.quality >= 355 ? 'Boa' : 'Ruim'}
                    accent={last.quality >= 365 ? 'emerald' : last.quality >= 355 ? 'yellow' : 'rose'}
                  />
                </div>
                {aiInsightSingle && (
                  <AIInsightCard
                    headline={aiInsightSingle.headline}
                    bullets={aiInsightSingle.bullets}
                    tags={['Simulação Única', aiInsightSingle.q >= 365 ? 'Alta Qualidade' : 'A Melhorar']}
                    tone="blue"
                    isDark={isDark}
                  />
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Resultados — LOTE */}
      {activeTab === 'batch' && batchStats && (
        <div className={`${isDark ? 'bg-gray-900/50' : 'bg-white'} rounded-2xl shadow border ${isDark ? 'border-emerald-900/40' : 'border-emerald-200'}`}>
          <div className={`px-6 py-5 border-b ${isDark ? 'border-emerald-900/40' : 'border-emerald-100'} flex items-center gap-2`}>
            <Sparkles className="h-5 w-5 text-emerald-500" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Resultados do Lote</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <KPI title="Qualidade Média" value={batchStats.meanQ.toFixed(2)} accent="blue" />
              <KPI title="Energia Média" value={`${batchStats.meanE.toFixed(1)} kWh/ton`} accent="orange" />
              <KPI title="Desvio Padrão" value={batchStats.stdQ.toFixed(2)} accent="slate" />
              <KPI title="R² (consistência interna)" value={batchStats.r2.toFixed(3)} accent="blue" />
            </div>
            {aiInsightBatch && (
              <AIInsightCard
                headline={aiInsightBatch.headline}
                bullets={[
                  `Estabilidade: ${aiInsightBatch.estabilidade}`,
                  ...aiInsightBatch.bullets,
                ]}
                tags={['Lote 20x', 'Consistência']}
                tone="emerald"
                isDark={isDark}
              />
            )}
          </div>
        </div>
      )}

      {/* Sensibilidade */}
      {activeTab === 'sensitivity' && sensitivityResults && (
        <div className="space-y-6">
          <SensitivityRow
            title="Temperatura (°C)"
            chartCfg={makeSensitivityChart('Qualidade vs Temperatura (°C)', sensitivityResults.temperatura, 'rgb(239, 68, 68)')}
            insight={insightForParameter('Temperatura', sensitivityResults.temperatura)}
            isDark={isDark}
          />
          <SensitivityRow
            title="Tempo (min)"
            chartCfg={makeSensitivityChart('Qualidade vs Tempo (min)', sensitivityResults.tempo, 'rgb(59, 130, 246)')}
            insight={insightForParameter('Tempo', sensitivityResults.tempo)}
            isDark={isDark}
          />
          <SensitivityRow
            title="Pressão (kPa)"
            chartCfg={makeSensitivityChart('Qualidade vs Pressão (kPa)', sensitivityResults.pressao, 'rgb(34, 197, 94)')}
            insight={insightForParameter('Pressão', sensitivityResults.pressao)}
            isDark={isDark}
          />
          <SensitivityRow
            title="Velocidade (rpm)"
            chartCfg={makeSensitivityChart('Qualidade vs Velocidade (rpm)', sensitivityResults.velocidade, 'rgb(168, 85, 247)')}
            insight={insightForParameter('Velocidade', sensitivityResults.velocidade)}
            isDark={isDark}
          />

          {/* Análise IA agregada */}
          <AIInsightCard
            headline="Análise IA — Visão Geral da Sensibilidade"
            bullets={[
              'Ranking por impacto: ver cartões de cada parâmetro acima.',
              'Priorize o controle fino dos parâmetros com maior inclinação/curvatura.',
              'Se o melhor ponto ficou no limite da faixa, amplie o intervalo e repita a análise.',
            ]}
            tags={['Sensibilidade', 'Prioridades de Controle']}
            tone="purple"
            isDark={isDark}
          />
        </div>
      )}
    </div>
  );
};

export default SimulationPanel;

/* =========================================
   Componentes auxiliares (premium IA cards)
   ========================================= */

function KPI({ title, value, accent }: { title: string; value: string; accent: 'blue' | 'orange' | 'emerald' | 'yellow' | 'rose' | 'slate' }) {
  const color =
    accent === 'blue' ? 'text-blue-600 dark:text-blue-300' :
    accent === 'orange' ? 'text-orange-600 dark:text-orange-300' :
    accent === 'emerald' ? 'text-emerald-600 dark:text-emerald-300' :
    accent === 'yellow' ? 'text-yellow-600 dark:text-yellow-300' :
    accent === 'rose' ? 'text-rose-600 dark:text-rose-300' :
    'text-slate-800 dark:text-slate-200';
  return (
    <div className="text-center">
      <div className="text-sm text-gray-600 dark:text-gray-300">{title}</div>
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
    </div>
  );
}

function AIInsightCard({
  headline,
  bullets,
  tags,
  tone,
  isDark,
}: {
  headline: string;
  bullets: string[];
  tags?: string[];
  tone: 'blue' | 'emerald' | 'purple';
  isDark: boolean;
}) {
  const bg =
    tone === 'blue'
      ? isDark ? 'from-blue-950 to-gray-900 border-blue-900/40' : 'from-blue-50 to-white border-blue-200'
      : tone === 'emerald'
      ? isDark ? 'from-emerald-950 to-gray-900 border-emerald-900/40' : 'from-emerald-50 to-white border-emerald-200'
      : isDark ? 'from-purple-950 to-gray-900 border-purple-900/40' : 'from-purple-50 to-white border-purple-200';

  const iconBg =
    tone === 'blue'
      ? isDark ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-600 text-white'
      : tone === 'emerald'
      ? isDark ? 'bg-emerald-900/50 text-emerald-200' : 'bg-emerald-600 text-white'
      : isDark ? 'bg-purple-900/50 text-purple-200' : 'bg-purple-600 text-white';

  const badgeBg =
    tone === 'blue'
      ? isDark ? 'bg-blue-900/40 text-blue-200 border-blue-800' : 'bg-blue-100 text-blue-700 border-blue-200'
      : tone === 'emerald'
      ? isDark ? 'bg-emerald-900/40 text-emerald-200 border-emerald-800' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : isDark ? 'bg-purple-900/40 text-purple-200 border-purple-800' : 'bg-purple-100 text-purple-700 border-purple-200';

  return (
    <div className={`rounded-xl border bg-gradient-to-br ${bg} p-4 md:p-5`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          <Brain className="h-5 w-5" />
        </div>
        <h4 className={`text-base md:text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{headline}</h4>
      </div>
      <ul className={`space-y-1.5 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {bullets.map((b, i) => (<li key={i}>• {b}</li>))}
      </ul>
      {tags && tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badgeBg}`}
            >
              {t}
            </span>
          ))}
        </div>
    </div>
  );
}

function SensitivityRow({
  title,
  chartCfg,
  insight,
  isDark,
}: {
  title: string;
  chartCfg: { data: any; options: any };
  insight: { headline: string; bullets: string[]; tags: string[] };
  isDark: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Gráfico (2 colunas) */}
      <div className={`lg:col-span-2 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
        <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{title}</h4>
        <div className="w-full" style={{ height: 320 }}>
          <Line data={chartCfg.data} options={chartCfg.options} />
        </div>
      </div>

      {/* Análise IA do parâmetro (1 coluna) */}
      <AIInsightCard
        headline={insight.headline}
        bullets={insight.bullets}
        tags={insight.tags}
        tone="purple"
        isDark={isDark}
      />
    </div>
  );
}





