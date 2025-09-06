// src/components/SimulationPanel.tsx
import React, { useState } from "react";
import { BarChart3 } from "lucide-react";
import { ParameterInput } from "./ParameterInput";
import {
  validateAllParameters,
  validateParameterCombination,
} from "../utils/parameterValidation";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"single" | "batch" | "sensitivity">(
    "single"
  );
  const [validationState, setValidationState] = useState({
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
  });

  React.useEffect(() => {
    const paramValidation = validateAllParameters({
      temperatura,
      tempo,
      pressao,
      velocidade,
    });
    const combinationValidation = validateParameterCombination({
      temperatura,
      tempo,
      pressao,
      velocidade,
    });
    setValidationState({
      isValid: paramValidation.isValid && combinationValidation.isValid,
      errors: paramValidation.errors,
      warnings: combinationValidation.warnings,
    });
  }, [temperatura, tempo, pressao, velocidade]);

  // --- Execução (mock de simulação para UI) ---
  const runSingleSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const quality = 350 + (Math.random() - 0.5) * 20; // exemplo simples
      const newResult = {
        id: Date.now(),
        type: "single",
        parameters: { temperatura, tempo, pressao, velocidade },
        quality,
      };
      setSimulationResults(newResult);
      setIsRunning(false);
    }, 1000);
  };

  const runBatchSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const batchResults = Array.from({ length: 20 }, (_, i) => {
        const quality = 350 + (Math.random() - 0.5) * 20;
        return {
          id: Date.now() + i,
          type: "batch",
          parameters: {
            temperatura,
            tempo,
            pressao,
            velocidade,
          },
          quality,
        };
      });
      batchResults.forEach((r) => setSimulationResults(r));
      setIsRunning(false);
    }, 2000);
  };

  // --- Métricas do “modelo” a partir do lote ---
  const getModelMetrics = () => {
    const batch = simulationResults.filter((r) => r.type === "batch");
    if (batch.length === 0) return null;

    const qualities = batch.map((r) => r.quality);
    const mean = qualities.reduce((a, b) => a + b, 0) / qualities.length;
    const variance =
      qualities.reduce((s, q) => s + Math.pow(q - mean, 2), 0) /
      qualities.length;
    const r2 = Math.max(0.8, 1 - variance / 1000); // faixa simulada estável

    return { r2 };
  };

  // --- Interpretação automática do R² (faixas + texto) ---
  const interpretR2 = (r2: number) => {
    if (r2 >= 0.9)
      return {
        label: "Modelo muito preciso",
        detail: `Explica aproximadamente ${(r2 * 100).toFixed(1)}% da variação observada — ótimo para tomada de decisão.`,
        cls:
          "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800",
      };
    if (r2 >= 0.8)
      return {
        label: "Modelo preciso",
        detail:
          "Resultados confiáveis na maioria dos cenários. Ainda há espaço para melhorar com mais dados.",
        cls:
          "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800",
      };
    if (r2 >= 0.7)
      return {
        label: "Modelo razoável",
        detail:
          "Útil para tendências gerais, mas não para decisões finas. Considere calibrar.",
        cls:
          "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-200 dark:border-yellow-800",
      };
    return {
      label: "Modelo fraco",
      detail:
        "Evite decisões com base nesses resultados. Recolha mais dados e re-treine.",
      cls:
        "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-800",
    };
  };

  return (
    <div className="space-y-6">
      <div
        className={`${
          isDark ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow-lg p-6`}
      >
        <h2
          className={`text-2xl font-bold mb-6 flex items-center ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        >
          <BarChart3 className="h-6 w-6 mr-2 text-blue-500" />
          <span>{t("simulation")} & Análise IA</span>
        </h2>

        {/* Tabs superiores */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {["single", "batch", "sensitivity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab === "single" && "Simulação Única"}
              {tab === "batch" && "Simulação em Lote"}
              {tab === "sensitivity" && "Análise de Sensibilidade"}
            </button>
          ))}
        </div>

        {/* Parâmetros (comuns às abas) */}
        <div
          className={`${
            isDark ? "bg-gray-700" : "bg-gray-50"
          } rounded-lg p-6 mb-6`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              isDark ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Configuração de Parâmetros para Simulação
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ParameterInput
              label="Temperatura"
              parameterName="temperatura"
              value={temperatura}
              onChange={setTemperatura}
              isDark={isDark}
            />
            <ParameterInput
              label="Tempo"
              parameterName="tempo"
              value={tempo}
              onChange={setTempo}
              isDark={isDark}
            />
            <ParameterInput
              label="Pressão"
              parameterName="pressao"
              value={pressao}
              onChange={setPressao}
              isDark={isDark}
            />
            <ParameterInput
              label="Velocidade"
              parameterName="velocidade"
              value={velocidade}
              onChange={setVelocidade}
              isDark={isDark}
            />
          </div>

          {(!validationState.isValid || validationState.warnings.length > 0) && (
            <div className="mt-4 space-y-2">
              {validationState.errors.map((e, i) => (
                <div
                  key={`e-${i}`}
                  className={`p-3 rounded-lg ${
                    isDark
                      ? "bg-red-900 text-red-200 border border-red-700"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {e}
                </div>
              ))}
              {validationState.warnings.map((w, i) => (
                <div
                  key={`w-${i}`}
                  className={`p-3 rounded-lg ${
                    isDark
                      ? "bg-yellow-900 text-yellow-200 border border-yellow-700"
                      : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                  }`}
                >
                  {w}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex justify-center space-x-4 mb-8">
          {activeTab === "single" && (
            <button
              onClick={runSingleSimulation}
              disabled={!validationState.isValid || isRunning}
              className={`px-6 py-3 rounded-lg font-medium ${
                !validationState.isValid || isRunning
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isRunning ? "Simulando..." : "Executar Simulação"}
            </button>
          )}
          {activeTab === "batch" && (
            <button
              onClick={runBatchSimulation}
              disabled={!validationState.isValid || isRunning}
              className={`px-6 py-3 rounded-lg font-medium ${
                !validationState.isValid || isRunning
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {isRunning ? "Executando Lote..." : "Executar Lote (20x)"}
            </button>
          )}
        </div>

        {/* Loading */}
        {isRunning && (
          <div
            className={`${
              isDark ? "bg-gray-700" : "bg-gray-50"
            } rounded-lg p-4 mb-6`}
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                {activeTab === "single" && "Executando modelo ML..."}
                {activeTab === "batch" && "Processando simulações em lote..."}
                {activeTab === "sensitivity" &&
                  "Analisando sensibilidade de parâmetros..."}
              </span>
            </div>
          </div>
        )}

        {/* Resultados — Simulação Única */}
        {activeTab === "single" &&
          simulationResults.filter((r) => r.type === "single").length > 0 && (
            <div
              className={`${
                isDark ? "bg-gray-700" : "bg-gray-50"
              } rounded-lg p-6`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Resultado da Simulação ML
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Qualidade Prevista
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {
                      simulationResults
                        .filter((r) => r.type === "single")
                        .slice(-1)[0].quality.toFixed(2)
                    }
                  </div>
                </div>

                {/* Análise IA (contexto simples para simulação única) */}
                <div
                  className={`rounded-lg p-3 ${
                    isDark
                      ? "bg-blue-900/40 border border-blue-800 text-blue-200"
                      : "bg-blue-50 border border-blue-200 text-blue-700"
                  }`}
                >
                  <div className="text-sm font-semibold mb-1">
                    Análise IA
                  </div>
                  <p className="text-sm leading-relaxed">
                    Este resultado é pontual. Para avaliar a confiabilidade do
                    modelo, rode a <strong>Simulação em Lote</strong> e observe a
                    precisão (R²). Use a <strong>Análise de Sensibilidade</strong> para ver quais
                    parâmetros mais impactam a qualidade.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Resultados — Lote (com interpretação de R²) */}
        {activeTab === "batch" &&
          simulationResults.filter((r) => r.type === "batch").length > 0 && (
            <div
              className={`${
                isDark ? "bg-gray-700" : "bg-gray-50"
              } rounded-lg p-6`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Resultados do Lote ML
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Qualidade Média
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {(
                      simulationResults
                        .filter((r) => r.type === "batch")
                        .reduce((s, r) => s + r.quality, 0) /
                      simulationResults.filter((r) => r.type === "batch").length
                    ).toFixed(2)}
                  </div>
                </div>

                {getModelMetrics() && (
                  <div className="text-center">
                    <div
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Precisão do Modelo (R²)
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {(getModelMetrics()!.r2 * 100).toFixed(1)}%
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Nº de Simulações
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {simulationResults.filter((r) => r.type === "batch").length}
                  </div>
                </div>
              </div>

              {/* Interpretação visível do R² */}
              {getModelMetrics() && (() => {
                const { r2 } = getModelMetrics()!;
                const tip = interpretR2(r2);
                return (
                  <div className={`mt-2 p-4 rounded-lg ${tip.cls}`}>
                    <div className="text-sm font-semibold">{tip.label}</div>
                    <p className="text-sm mt-1">{tip.detail}</p>
                  </div>
                );
              })()}
            </div>
          )}
      </div>
    </div>
  );
};

export default SimulationPanel;





