import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Presentation } from './components/Presentation';
import { TechnicalDocs } from './components/TechnicalDocs';
import Simulation from './components/Simulation';
import { Comparison } from './components/Comparison';
import { Optimization } from './components/Optimization';
import { Results } from './components/Results';
import { Help } from './components/Help';
import { Glossary } from './components/Glossary';
import { translations } from './utils/translations';

function App() {
  // State management
  const [activeTab, setActiveTab] = useState<string>('presentation');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('pt');
  
  // Process parameters
  const [temperatura, setTemperatura] = useState<number>(1450);
  const [tempo, setTempo] = useState<number>(30);
  const [pressao, setPressao] = useState<number>(101);
  const [velocidade, setVelocidade] = useState<number>(300);
  
  // Results
  const [resultado, setResultado] = useState<string>('');
  const [metricas, setMetricas] = useState<{r2: number, mae: number, mse: number} | null>(null);
  const [graficos, setGraficos] = useState<boolean>(false);
  const [valoresReais, setValoresReais] = useState<number[]>([]);
  const [valoresPrevistos, setValoresPrevistos] = useState<number[]>([]);
  const [qualidadePrevista, setQualidadePrevista] = useState<number>(0);
  const [mostrarAjuda, setMostrarAjuda] = useState<boolean>(false);

  // Simulation and optimization results
  const [simulationResults, setSimulationResults] = useState<any[]>([]);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);

  // Translation function
  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  // Load preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const calcular = () => {
    // Dados de exemplo similares ao código Python
    const temperaturas = [1450, 1460, 1470, 1480, 1490, 1500, 1510, 1520, 1495, 1485];
    const tempos = [30, 40, 50, 60, 70, 80, 90, 35, 55, 75];
    const pressoes = [101, 102, 100, 101, 101, 100, 102, 101, 100, 101];
    const velocidades = [300, 310, 290, 305, 300, 295, 310, 300, 305, 295];
    const qualidades = [350, 355, 360, 358, 362, 365, 370, 352, 359, 367];

    // Simulando previsões
    const previsoes = qualidades.map((q, i) => q + (Math.random() - 0.5) * 5);

    // Simulando métricas
    const r2 = 0.98;
    const mae = 1.2;
    const mse = 2.5;

    // Simulando qualidade prevista para os parâmetros atuais
    const qualidadePrevista = 350 + (temperatura - 1450) * 0.1 + (tempo - 30) * 0.2;

    setValoresReais(qualidades);
    setValoresPrevistos(previsoes);
    setMetricas({ r2, mae, mse });
    setQualidadePrevista(qualidadePrevista);
    setResultado(`${t('predictedQuality')}: ${qualidadePrevista.toFixed(2)}`);
    setGraficos(true);
  };

  const downloadResults = () => {
    const data = {
      parameters: {
        temperatura,
        tempo,
        pressao,
        velocidade
      },
      results: {
        qualidadePrevista,
        metricas
      },
      timestamp: new Date().toISOString()
    };

    // Convert to CSV
    const csvContent = [
      'Parameter,Value',
      `Temperature,${temperatura}`,
      `Time,${tempo}`,
      `Pressure,${pressao}`,
      `Speed,${velocidade}`,
      `Predicted Quality,${qualidadePrevista}`,
      `R2,${metricas?.r2 || 0}`,
      `MAE,${metricas?.mae || 0}`,
      `MSE,${metricas?.mse || 0}`
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
            temperatura={temperatura}
            setTemperatura={setTemperatura}
            tempo={tempo}
            setTempo={setTempo}
            pressao={pressao}
            setPressao={setPressao}
            velocidade={velocidade}
            setVelocidade={setVelocidade}
            resultado={resultado}
            metricas={metricas}
            graficos={graficos}
            valoresReais={valoresReais}
            valoresPrevistos={valoresPrevistos}
            qualidadePrevista={qualidadePrevista}
            mostrarAjuda={mostrarAjuda}
            setMostrarAjuda={setMostrarAjuda}
            calcular={calcular}
            onDownloadResults={downloadResults}
            t={t}
            isDark={isDark}
            onTabChange={setActiveTab}
          />
        );
      case 'presentation':
        return <Presentation t={t} isDark={isDark} />;
      case 'technical-docs':
        return <TechnicalDocs t={t} isDark={isDark} />;
      case 'simulation':
        return (
          <Simulation
            temperatura={temperatura}
            setTemperatura={setTemperatura}
            tempo={tempo}
            setTempo={setTempo}
            pressao={pressao}
            setPressao={setPressao}
            velocidade={velocidade}
            setVelocidade={setVelocidade}
            simulationResults={simulationResults}
            setSimulationResults={(newResult: any) => setSimulationResults(prev => [...prev, newResult])}
            t={t}
            isDark={isDark}
          />
        );
      case 'comparison':
        return <Comparison t={t} isDark={isDark} />;
      case 'optimization':
        return (
          <Optimization 
            t={t} 
            isDark={isDark}
            onOptimizationComplete={setOptimizationResults}
          />
        );
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
              qualidade: qualidadePrevista
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
        return (
          <Dashboard
            temperatura={temperatura}
            setTemperatura={setTemperatura}
            tempo={tempo}
            setTempo={setTempo}
            pressao={pressao}
            setPressao={setPressao}
            velocidade={velocidade}
            setVelocidade={setVelocidade}
            resultado={resultado}
            metricas={metricas}
            graficos={graficos}
            valoresReais={valoresReais}
            valoresPrevistos={valoresPrevistos}
            qualidadePrevista={qualidadePrevista}
            mostrarAjuda={mostrarAjuda}
            setMostrarAjuda={setMostrarAjuda}
            calcular={calcular}
            onDownloadResults={downloadResults}
            t={t}
            isDark={isDark}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-blue-100'} transition-colors duration-200`}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          t={t}
          isDark={isDark}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            isDark={isDark}
            onThemeToggle={() => setIsDark(!isDark)}
            language={language}
            onLanguageChange={setLanguage}
            t={t}
          />

          {/* Content */}
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;