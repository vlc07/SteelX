import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Presentation } from './components/Presentation';
import { TechnicalDocs } from './components/TechnicalDocs';
import SimulationPanel from './components/SimulationPanel'; // ✅ Corrigido
import { Comparison } from './components/Comparison';
import { Optimization } from './components/Optimization';
import { Results } from './components/Results';
import { Help } from './components/Help';
import { Glossary } from './components/Glossary';
import { translations } from './utils/translations';

function App() {
  const [activeTab, setActiveTab] = useState<string>('presentation');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('pt');

  // Parâmetros de processo
  const [temperatura, setTemperatura] = useState<number>(1450);
  const [tempo, setTempo] = useState<number>(30);
  const [pressao, setPressao] = useState<number>(101);
  const [velocidade, setVelocidade] = useState<number>(300);

  // Resultados
  const [resultado, setResultado] = useState<string>('');
  const [metricas, setMetricas] = useState<{ r2: number; mae: number; mse: number } | null>(null);
  const [graficos, setGraficos] = useState<boolean>(false);
  const [valoresReais, setValoresReais] = useState<number[]>([]);
  const [valoresPrevistos, setValoresPrevistos] = useState<number[]>([]);
  const [qualidadePrevista, setQualidadePrevista] = useState<number>(0);
  const [energiaPrevista, setEnergiaPrevista] = useState<number>(0);
  const [mostrarAjuda, setMostrarAjuda] = useState<boolean>(false);

  // Simulation & optimization
  const [simulationResults, setSimulationResults] = useState<any[]>([]);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);

  // i18n
  const t = (key: string): string => translations[language]?.[key] || key;

  // Preferências
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    if (savedTheme) setIsDark(savedTheme === 'dark');
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Função de cálculo (mantida)
  const calculateQualityAndEnergyML = (temp: number, time: number, press: number, speed: number) => {
    const clampedTemp = Math.max(1400, Math.min(1600, temp));
    const clampedTime = Math.max(10, Math.min(120, time));
    const clampedPress = Math.max(95, Math.min(110, press));
    const clampedSpeed = Math.max(250, Math.min(350, speed));

    const tempNorm = (clampedTemp - 1400) / 200;
    const timeNorm = (clampedTime - 10) / 110;
    const pressNorm = (clampedPress - 95) / 15;
    const speedNorm = (clampedSpeed - 250) / 100;

    let quality = 320;
    quality += 45 * (0.3 + 0.7 * Math.pow(tempNorm, 0.8));
    quality += 25 * Math.exp(-Math.pow(timeNorm - 0.65, 2) / 0.3);
    quality += 20 * (pressNorm + 0.3 * Math.sin(pressNorm * Math.PI * 2));
    quality += 15 * (Math.sqrt(speedNorm) + 0.2 * Math.cos(speedNorm * Math.PI));
    quality += 8 * tempNorm * timeNorm + 4 * pressNorm * speedNorm + 3 * tempNorm * pressNorm;
    quality += (Math.random() - 0.5) * 4;
    quality = Math.max(300, Math.min(400, Math.round(quality * 100) / 100));

    let energy =
      400 +
      120 * tempNorm +
      40 * timeNorm +
      30 * pressNorm +
      25 * speedNorm +
      (Math.random() - 0.5) * 20;
    energy = Math.max(350, Math.min(700, Math.round(energy * 100) / 100));

    return { quality, energy };
  };

  const calcular = () => {
    const currentResult = calculateQualityAndEnergyML(temperatura, tempo, pressao, velocidade);
    setQualidadePrevista(currentResult.quality);
    setEnergiaPrevista(currentResult.energy);
    setResultado(`${t('predictedQuality')}: ${currentResult.quality.toFixed(2)}`);
    setGraficos(true);
  };

  const downloadResults = () => {
    const csvContent = [
      'Parameter,Value',
      `Temperature,${temperatura}`,
      `Time,${tempo}`,
      `Pressure,${pressao}`,
      `Speed,${velocidade}`,
      `Predicted Quality,${qualidadePrevista}`,
      `Energy Consumption,${energiaPrevista}`,
      `R2,${metricas?.r2 || 0}`,
      `MAE,${metricas?.mae || 0}`,
      `MSE,${metricas?.mse || 0}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `process_optimization_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            temperatura={temperatura} setTemperatura={setTemperatura}
            tempo={tempo} setTempo={setTempo}
            pressao={pressao} setPressao={setPressao}
            velocidade={velocidade} setVelocidade={setVelocidade}
            resultado={resultado}
            metricas={metricas}
            graficos={graficos}
            valoresReais={valoresReais}
            valoresPrevistos={valoresPrevistos}
            qualidadePrevista={qualidadePrevista}
            energiaPrevista={energiaPrevista}
            mostrarAjuda={mostrarAjuda}
            setMostrarAjuda={setMostrarAjuda}
            calcular={calcular}
            onDownloadResults={downloadResults}
            t={t}
            isDark={isDark}
          />
        );
      case 'presentation':
        return <Presentation t={t} isDark={isDark} />;
      case 'technical-docs':
        return <TechnicalDocs t={t} isDark={isDark} />;
      case 'simulation':
        return (
          <SimulationPanel
            temperatura={temperatura} setTemperatura={setTemperatura}
            tempo={tempo} setTempo={setTempo}
            pressao={pressao} setPressao={setPressao}
            velocidade={velocidade} setVelocidade={setVelocidade}
            simulationResults={simulationResults}
            setSimulationResults={(newResult: any) => setSimulationResults((prev) => [...prev, newResult])}
            t={t}
            isDark={isDark}
          />
        );
      case 'comparison':
        return <Comparison t={t} isDark={isDark} />;
      case 'optimization':
        return <Optimization t={t} isDark={isDark} onOptimizationComplete={setOptimizationResults} />;
      case 'results':
        return (
          <Results
            optimizationResults={optimizationResults}
            simulationResults={simulationResults}
            currentParams={{
              temperatura,
              tempo,
              pressao,
              velocidade,
              qualidade: qualidadePrevista,
              energia: energiaPrevista
            }}
            t={t}
            isDark={isDark}
          />
        );
      case 'help':
        return <Help t={t} isDark={isDark} />;
      case 'glossary':
        return <Glossary t={t} isDark={isDark} />;
      default:
        return <Presentation t={t} isDark={isDark} />;
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-blue-100'} transition-colors duration-200`}>
      <div className="flex h-screen">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} t={t} isDark={isDark} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} isDark={isDark} onThemeToggle={() => setIsDark(!isDark)} language={language} onLanguageChange={setLanguage} t={t} />
          <main className="flex-1 overflow-auto p-4 lg:p-6">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}

export default App;
