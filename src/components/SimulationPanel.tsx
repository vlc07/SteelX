// src/components/SimulationPanel.tsx
import React, { useState, useEffect } from "react";
import { Play, TrendingUp, Zap, AlertCircle, BarChart3 } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import { ParameterInput } from "./ParameterInput";
import { validateAllParameters, validateParameterCombination } from "../utils/parameterValidation";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface SimulationPanelProps {
  temperatura: number;
  setTemperatura: (value: number) => void;
  tempo: number;
  setTempo: (value: number) => void;
  pressao: number;
  setPressao: (value: number) => void;
  velocidade: number;
  setVelocidade: (value: number) => void;
  simulationResults: any[];
  setSimulationResults: (results: any) => void;
  t: (key: string) => string;
  isDark: boolean;
}

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
  const [activeTab, setActiveTab] = useState<"single" | "batch" | "sensitivity">("single");
  const [isRunning, setIsRunning] = useState(false);
  const [validationState, setValidationState] = useState({ isValid: true, errors: [] as string[], warnings: [] as string[] });
  const [sensitivityResults, setSensitivityResults] = useState<any>(null);

  useEffect(() => {
    const paramValidation = validateAllParameters({ temperatura, tempo, pressao, velocidade });
    const combinationValidation = validateParameterCombination({ temperatura, tempo, pressao, velocidade });
    setValidationState({
      isValid: paramValidation.isValid && combinationValidation.isValid,
      errors: paramValidation.errors,
      warnings: combinationValidation.warnings,
    });
  }, [temperatura, tempo, pressao, velocidade]);

  // Função de cálculo (simulação simples baseada em ML fake)
  const calculateQuality = (temp: number, time: number, press: number, speed: number) => {
    const tempNorm = (temp - 1400) / 200;
    const timeNorm = (time - 10) / 110;
    const pressNorm = (press - 95) / 15;
    const speedNorm = (speed - 250) / 100;
    let quality = 320;
    quality += 45 * Math.pow(tempNorm, 1.1);
    quality += 25 * Math.exp(-Math.pow(timeNorm - 0.65, 2) / 0.3);
    quality += 20 * pressNorm;
    quality += 10 * Math.sqrt(speedNorm);
    quality += (Math.random() - 0.5) * 4;
    return Math.max(300, Math.min(400, quality));
  };

  // === Simulações ===
  const runSingle = () => {
    setIsRunning(true);
    setTimeout(() => {
      const quality = calculateQuality(temperatura, tempo, pressao, velocidade);
      setSimulationResults({
        id: Date.now(),
        parameters: { temperatura, tempo, pressao, velocidade },
        quality,
        type: "single",
      });
      setIsRunning(false);
    }, 800);
  };

  const runBatch = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = [];
      for (let i = 0; i < 20; i++) {
        const temp = temperatura + (Math.random() - 0.5) * 30;
        const time = tempo + (Math.random() - 0.5) * 20;
        const press = pressao + (Math.random() - 0.5) * 2;
        const speed = velocidade + (Math.random() - 0.5) * 20;
        const quality = calculateQuality(temp, time, press, speed);
        results.push({ id: Date.now() + i, parameters: { temp, time, press, speed }, quality, type: "batch" });
      }
      setSimulationResults(results);
      setIsRunning(false);
    }, 1500);
  };

  const runSensitivity = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = {
        temperatura: Array.from({ length: 21 }, (_, i) => ({ x: 1400 + i * 10, y: calculateQuality(1400 + i * 10, tempo, pressao, velocidade) })),
        tempo: Array.from({ length: 23 }, (_, i) => ({ x: 10 + i * 5, y: calculateQuality(temperatura, 10 + i * 5, pressao, velocidade) })),
        pressao: Array.from({ length: 31 }, (_, i) => ({ x: 95 + i * 0.5, y: calculateQuality(temperatura, tempo, 95 + i * 0.5, velocidade) })),
        velocidade: Array.from({ length: 21 }, (_, i) => ({ x: 250 + i * 5, y: calculateQuality(temperatura, tempo, pressao, 250 + i * 5) })),
      };
      setSensitivityResults(results);
      setIsRunning(false);
    }, 2000);
  };

  // === Gráficos ===
  const renderSensitivityChart = (label: string, data: any[], color: string) => {
    return (
      <Line
        data={{
          labels: data.map((d) => d.x),
          datasets: [
            {
              label: `Qualidade vs ${label}`,
              data: data.map((d) => d.y),
              borderColor: color,
              backgroundColor: `${color}33`,
              fill: true,
              tension: 0.3,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { labels: { color: isDark ? "#e5e7eb" : "#374151" } } },
          scales: {
            x: { ticks: { color: isDark ? "#e5e7eb" : "#374151" } },
            y: { ticks: { color: isDark ? "#e5e7eb" : "#374151" } },
          },
        }}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-lg p-6`}>
        <h2 className={`text-2xl font-bold flex items-center ${isDark ? "text-white" : "text-gray-800"}`}>
          <BarChart3 className="h-6 w-6 mr-2 text-blue-500" />
          Painel de Simulação
        </h2>
      </div>

      {/* Abas no topo */}
      <div className="flex space-x-2 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("single")}
          className={`flex-1 py-2 rounded-md text-sm font-medium ${
            activeTab === "single" ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm" : "text-gray-600 dark:text-gray-300"
          }`}
        >
          Simulação Única
        </button>
        <button
          onClick={() => setActiveTab("batch")}
          className={`flex-1 py-2 rounded-md text-sm font-medium ${
            activeTab === "batch" ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm" : "text-gray-600 dark:text-gray-300"
          }`}
        >
          Simulação em Lote
        </button>
        <button
          onClick={() => setActiveTab("sensitivity")}
          className={`flex-1 py-2 rounded-md text-sm font-medium ${
            activeTab === "sensitivity" ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm" : "text-gray-600 dark:text-gray-300"
          }`}
        >
          Análise de Sensibilidade
        </button>
      </div>

      {/* Conteúdo de cada aba */}
      <div>
        {activeTab === "single" && (
          <div>
            <button
              onClick={runSingle}
              disabled={isRunning || !validationState.isValid}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Play className="h-5 w-5" /> Executar Simulação
            </button>
            {simulationResults && simulationResults.type === "single" && (
              <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                <p className="font-bold">Qualidade Prevista: {simulationResults.quality.toFixed(2)}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "batch" && (
          <div>
            <button
              onClick={runBatch}
              disabled={isRunning || !validationState.isValid}
              className="px-6 py-3 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700"
            >
              <TrendingUp className="h-5 w-5" /> Executar Lote
            </button>
          </div>
        )}

        {activeTab === "sensitivity" && sensitivityResults && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderSensitivityChart("Temperatura", sensitivityResults.temperatura, "red")}
            {renderSensitivityChart("Tempo", sensitivityResults.tempo, "blue")}
            {renderSensitivityChart("Pressão", sensitivityResults.pressao, "green")}
            {renderSensitivityChart("Velocidade", sensitivityResults.velocidade, "purple")}
          </div>
        )}

        {activeTab === "sensitivity" && !sensitivityResults && (
          <button
            onClick={runSensitivity}
            disabled={isRunning}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <Zap className="h-5 w-5" /> Executar Análise de Sensibilidade
          </button>
        )}
      </div>
    </div>
  );
};

export default SimulationPanel;
