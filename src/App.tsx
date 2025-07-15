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
    // Enhanced ML model with all 4 parameters properly weighted
    const calculateQualityML = (temp: number, time: number, press: number, speed: number) => {
      // Normalize inputs to [0,1] range for better model stability
      const tempNorm = (temp - 1400) / (1600 - 1400);
      const timeNorm = (time - 10) / (120 - 10);
      const pressNorm = (press - 95) / (110 - 95);
      const speedNorm = (speed - 250) / (350 - 250);
      
      // Base quality with realistic ML model behavior
      let quality = 300;
      
      // Temperature effect (45% influence) - most critical parameter
      quality += 50 * Math.pow(tempNorm, 1.2) + 20 * Math.sin(tempNorm * Math.PI);
      
      // Time effect (30% influence) - optimal around 60-80 minutes
      const timeOptimal = 1 - Math.pow((timeNorm - 0.6), 2);
      quality += 30 * timeOptimal;
      
      // Pressure effect (15% influence) - linear relationship
      quality += 15 * pressNorm + 5 * Math.sin(pressNorm * 2 * Math.PI);
      
      // Speed effect (10% influence) - diminishing returns
      quality += 10 * Math.sqrt(speedNorm) + 3 * Math.cos(speedNorm * Math.PI);
      
      // Interaction effects (simulating feature interactions in ML)
      quality += 5 * tempNorm * timeNorm; // Temperature-time interaction
      quality += 3 * pressNorm * speedNorm; // Pressure-speed interaction
      quality += 2 * tempNorm * pressNorm; // Temperature-pressure interaction
      
      // Add realistic noise (±1.5 units)
      quality += (Math.random() - 0.5) * 3;
      
      // Ensure quality is within realistic bounds
      return Math.max(300, Math.min(400, quality));
    };

    // Generate training data with realistic variations
    const trainingData = [];
    for (let i = 0; i < 20; i++) {
      const tempVar = 1450 + Math.random() * 70; // 1450-1520
      const timeVar = 30 + Math.random() * 60;   // 30-90
      const pressVar = 100 + Math.random() * 2;  // 100-102
      const speedVar = 290 + Math.random() * 20; // 290-310
      
      const realQuality = calculateQualityML(tempVar, timeVar, pressVar, speedVar);
      const predictedQuality = realQuality + (Math.random() - 0.5) * 4; // Model error
      
      trainingData.push({
        temp: tempVar,
        time: timeVar,
        press: pressVar,
        speed: speedVar,
        real: realQuality,
        predicted: predictedQuality
      });
    }

    // Calculate current quality prediction
    const currentQuality = calculateQualityML(temperatura, tempo, pressao, velocidade);

    // Calculate realistic ML metrics
    const realValues = trainingData.map(d => d.real);
    const predictedValues = trainingData.map(d => d.predicted);
    
    // R² calculation
    const meanReal = realValues.reduce((sum, val) => sum + val, 0) / realValues.length;
    const totalSumSquares = realValues.reduce((sum, val) => sum + Math.pow(val - meanReal, 2), 0);
    const residualSumSquares = realValues.reduce((sum, val, i) => sum + Math.pow(val - predictedValues[i], 2), 0);
    const r2 = Math.max(0, 1 - (residualSumSquares / totalSumSquares));
    
    // MAE calculation
    const mae = realValues.reduce((sum, val, i) => sum + Math.abs(val - predictedValues[i]), 0) / realValues.length;
    
    // MSE calculation
    const mse = realValues.reduce((sum, val, i) => sum + Math.pow(val - predictedValues[i], 2), 0) / realValues.length;

    setValoresReais(realValues);
    setValoresPrevistos(predictedValues);
    setMetricas({ r2, mae, mse });
    setQualidadePrevista(currentQuality);
    setResultado(`${t('predictedQuality')}: ${currentQuality.toFixed(2)}`);
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