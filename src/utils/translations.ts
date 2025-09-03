import { Translations } from '../types';

export const translations: Translations = {
  pt: {
    // Header
    title: 'Metalyics',
    authors: 'Autores do Projeto',
    howToUse: 'Como usar esta ferramenta?',
    hideHelp: 'Ocultar Ajuda',
    
    // Navigation
    dashboard: 'Painel Principal',
    presentation: 'Apresentação',
    technicalDocs: 'Documentação Técnica',
    simulation: 'Simulação',
    comparison: 'Comparação',
    optimization: 'Otimização',
    results: 'Resultados',
    help: 'Ajuda',
    glossary: 'Glossário',
    
    // Parameters
    processParameters: 'Parâmetros do Processo',
    temperature: 'Temperatura',
    time: 'Tempo',
    pressure: 'Pressão',
    speed: 'Velocidade',
    calculate: 'Calcular Qualidade',
    currentParameters: 'Parâmetros Atuais',
    
    // Quality
    predictedQuality: 'Qualidade Prevista',
    poorQuality: 'Qualidade Ruim',
    goodQuality: 'Qualidade Boa',
    excellentQuality: 'Qualidade Excelente',
    qualityPredicted: 'Qualidade Prevista',
    
    // Charts and Analysis
    realVsPredicted: 'Comparação: Real vs Previsto',
    improvementTips: 'Dicas para Melhorar',
    sensitivityAnalysis: 'Análise de Sensibilidade',
    parameterImpact: 'Impacto dos Parâmetros',
    qualityTrend: 'Tendência de Qualidade',
    qualityDistribution: 'Distribuição de Qualidade',
    statisticalSummary: 'Resumo Estatístico',
    
    // Simulation Types
    singleSimulation: 'Simulação Única',
    batchSimulation: 'Simulação em Lote',
    runSimulation: 'Executar Simulação',
    runBatch: 'Executar Lote (10x)',
    runSensitivityAnalysis: 'Executar Análise de Sensibilidade',
    simulating: 'Simulando...',
    executingBatch: 'Executando Lote...',
    analyzing: 'Analisando...',
    
    // Results and Metrics
    simulationResult: 'Resultado da Simulação',
    batchResults: 'Resultados do Lote',
    averageQuality: 'Qualidade Média',
    bestQuality: 'Melhor Qualidade',
    worstQuality: 'Pior Qualidade',
    totalSimulations: 'Total de Simulações',
    bestSimulation: 'Melhor Simulação',
    classification: 'Classificação',
    timestamp: 'Timestamp',
    
    // Optimization
    optimizationTitle: 'Configurar Otimização',
    optimizationMethod: 'Método de Otimização',
    gridSearch: 'Busca em Grade',
    geneticAlgorithm: 'Algoritmo Genético',
    bayesianOptimization: 'Otimização Bayesiana',
    optimizationRanges: 'Faixas de Otimização',
    setRanges: 'Definir Faixas',
    runOptimization: 'Executar Otimização',
    optimizing: 'Otimizando...',
    newOptimization: 'Nova Otimização',
    optimizationProgress: 'Progresso da Otimização',
    optimizationResults: 'Resultados da Otimização',
    optimizedQuality: 'Qualidade Otimizada',
    optimizationDetails: 'Detalhes da Otimização',
    optimizedParameters: 'Parâmetros Otimizados',
    improvementSummary: 'Resumo das Melhorias',
    qualityImprovement: 'Melhoria na Qualidade',
    mostAlteredParameter: 'Parâmetro Mais Alterado',
    finalClassification: 'Classificação Final',
    
    // Comparison
    compareScenarios: 'Comparar Cenários',
    addScenario: 'Adicionar Cenário',
    manualScenario: 'Cenário Manual',
    optimizedScenario: 'Cenário Otimizado',
    scenarioName: 'Nome do Cenário',
    qualityComparison: 'Comparação de Qualidade',
    actions: 'Ações',
    add: 'Adicionar',
    
    // Features
    darkMode: 'Modo Escuro',
    lightMode: 'Modo Claro',
    language: 'Idioma',
    downloadResults: 'Baixar Resultados',
    downloadCSV: 'Baixar CSV',
    generateReport: 'Gerar Relatório',
    
    // Help content
    helpStep1: 'Ajuste os parâmetros do processo (temperatura, tempo, pressão e velocidade)',
    helpStep2: 'Clique em "Calcular" para ver a qualidade prevista',
    helpStep3: 'Analise os gráficos para entender melhor os resultados',
    helpStep4: 'Use a classificação simples para entender se a qualidade é boa ou ruim',
    quickGuide: 'Guia Rápido',
    frequentQuestions: 'Perguntas Frequentes',
    importantTips: 'Dicas Importantes',
    
    // Glossary
    glossaryTitle: 'Glossário de Termos',
    r2Definition: 'R² (Coeficiente de Determinação): Mede a precisão do modelo. Valores próximos a 1 indicam alta precisão.',
    maeDefinition: 'MAE (Erro Médio Absoluto): Média das diferenças entre valores reais e previstos.',
    mseDefinition: 'MSE (Erro Quadrático Médio): Penaliza mais os erros grandes que os pequenos.',
    temperatureDefinition: 'Temperatura: Parâmetro que mais influencia a qualidade do processo.',
    quickReference: 'Referência Rápida',
    recommendedRanges: 'Faixas Recomendadas',
    
    // Results and Reports
    resultsAndReports: 'Resultados e Relatórios',
    overview: 'Visão Geral',
    detailedAnalysis: 'Análise Detalhada',
    comparison: 'Comparação',
    currentQuality: 'Qualidade Atual',
    optimizedQuality: 'Qualidade Otimizada',
    quickInsights: 'Insights Rápidos',
    performanceAnalysis: 'Análise de Performance',
    recommendations: 'Recomendações',
    noSimulationExecuted: 'Nenhuma simulação executada ainda',
    noOptimizationExecuted: 'Nenhuma otimização executada ainda',
    executeSimulations: 'Execute simulações na aba correspondente para ver análises detalhadas',
    executeOptimization: 'Execute a otimização na aba correspondente para ver comparações',
    
    // Statistical terms
    mean: 'Média',
    median: 'Mediana',
    standardDeviation: 'Desvio Padrão',
    range: 'Amplitude',
    
    // Units
    celsius: '°C',
    minutes: 'min',
    kpa: 'kPa',
    rpm: 'rpm',
    units: 'unidades',
    
    // Common actions
    minimum: 'Mínimo',
    maximum: 'Máximo',
    step: 'Passo',
    value: 'Valor',
    parameter: 'Parâmetro',
    quality: 'Qualidade',
    
    // Status and feedback
    excellent: 'Excelente',
    good: 'Boa',
    poor: 'Ruim',
    loading: 'Carregando...',
    completed: 'Concluído',
    processing: 'Processando...',
    
    // Presentation specific
    systemOverview: 'Visão Geral do Sistema',
    teamDevelopment: 'Equipe de Desenvolvimento',
    principalDeveloper: 'Desenvolvedor Principal',
    dataAnalyst: 'Analista de Dados',
    aiResearcher: 'Pesquisador de IA',
    aboutProject: 'Sobre o Projeto',
    innovationTechnology: 'Inovação e Tecnologia',
    intelligentAlgorithms: 'Algoritmos Inteligentes',
    realData: 'Dados Reais',
    continuousOptimization: 'Otimização Contínua',
    industryApplications: 'Aplicações na Indústria Metalúrgica',
    qualityControl: 'Controle de Qualidade',
    energyEfficiency: 'Eficiência Energética',
    productivity: 'Produtividade',
    technicalSpecifications: 'Especificações Técnicas',
    optimizedParameters: 'Parâmetros Otimizados',
    implementedAlgorithms: 'Algoritmos Implementados',
    systematicExploration: 'Exploração sistemática',
    solutionEvolution: 'Evolução de soluções',
    intelligentSearch: 'Busca inteligente',
    parameterImpactAnalysis: 'Análise de impacto de parâmetros',
    prototypeIndustry: 'Protótipo para a Indústria Metalúrgica',
    modelPrecision: 'Precisão do Modelo',
    improvementUnits: 'Unidades de Melhoria',
    realDataPercent: 'Dados Reais',
    collaborationOpportunities: 'Oportunidades de Colaboração',
    industrialImplementation: 'Implementação Industrial',
    researchDevelopment: 'Pesquisa & Desenvolvimento',
    technicalConsulting: 'Consultoria Técnica',
    
    // Additional presentation terms
    intelligentSystem: 'Sistema Inteligente para Otimização do Processo de Fusão de Aço Carbono',
    artificialIntelligence: 'Inteligência Artificial',
    industry40: 'Indústria 4.0',
    processOptimization: 'Otimização de Processos',
    vitorLorenzo: 'Vitor Lorenzo Cerutti',
    bernardoKrauspenhar: 'Bernardo Krauspenhar Paganin',
    lorenzoZatta: 'Lorenzo Zatta Santini'
  },
  
  en: {
    // Header
    title: 'MetaLytics',
    authors: 'Project Authors',
    howToUse: 'How to use this tool?',
    hideHelp: 'Hide Help',
    
    // Navigation
    dashboard: 'Dashboard',
    presentation: 'Presentation',
    technicalDocs: 'Technical Documentation',
    simulation: 'Simulation',
    comparison: 'Comparison',
    optimization: 'Optimization',
    results: 'Results',
    help: 'Help',
    glossary: 'Glossary',
    
    // Parameters
    processParameters: 'Process Parameters',
    temperature: 'Temperature',
    time: 'Time',
    pressure: 'Pressure',
    speed: 'Speed',
    calculate: 'Calculate Quality',
    currentParameters: 'Current Parameters',
    
    // Quality
    predictedQuality: 'Predicted Quality',
    poorQuality: 'Poor Quality',
    goodQuality: 'Good Quality',
    excellentQuality: 'Excellent Quality',
    qualityPredicted: 'Predicted Quality',
    
    // Charts and Analysis
    realVsPredicted: 'Comparison: Real vs Predicted',
    improvementTips: 'Improvement Tips',
    sensitivityAnalysis: 'Sensitivity Analysis',
    parameterImpact: 'Parameter Impact',
    qualityTrend: 'Quality Trend',
    qualityDistribution: 'Quality Distribution',
    statisticalSummary: 'Statistical Summary',
    
    // Simulation Types
    singleSimulation: 'Single Simulation',
    batchSimulation: 'Batch Simulation',
    runSimulation: 'Run Simulation',
    runBatch: 'Run Batch (10x)',
    runSensitivityAnalysis: 'Run Sensitivity Analysis',
    simulating: 'Simulating...',
    executingBatch: 'Executing Batch...',
    analyzing: 'Analyzing...',
    
    // Results and Metrics
    simulationResult: 'Simulation Result',
    batchResults: 'Batch Results',
    averageQuality: 'Average Quality',
    bestQuality: 'Best Quality',
    worstQuality: 'Worst Quality',
    totalSimulations: 'Total Simulations',
    bestSimulation: 'Best Simulation',
    classification: 'Classification',
    timestamp: 'Timestamp',
    
    // Optimization
    optimizationTitle: 'Configure Optimization',
    optimizationMethod: 'Optimization Method',
    gridSearch: 'Grid Search',
    geneticAlgorithm: 'Genetic Algorithm',
    bayesianOptimization: 'Bayesian Optimization',
    optimizationRanges: 'Optimization Ranges',
    setRanges: 'Set Ranges',
    runOptimization: 'Run Optimization',
    optimizing: 'Optimizing...',
    newOptimization: 'New Optimization',
    optimizationProgress: 'Optimization Progress',
    optimizationResults: 'Optimization Results',
    optimizedQuality: 'Optimized Quality',
    optimizationDetails: 'Optimization Details',
    optimizedParameters: 'Optimized Parameters',
    improvementSummary: 'Improvement Summary',
    qualityImprovement: 'Quality Improvement',
    mostAlteredParameter: 'Most Altered Parameter',
    finalClassification: 'Final Classification',
    
    // Comparison
    compareScenarios: 'Compare Scenarios',
    addScenario: 'Add Scenario',
    manualScenario: 'Manual Scenario',
    optimizedScenario: 'Optimized Scenario',
    scenarioName: 'Scenario Name',
    qualityComparison: 'Quality Comparison',
    actions: 'Actions',
    add: 'Add',
    
    // Features
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    downloadResults: 'Download Results',
    downloadCSV: 'Download CSV',
    generateReport: 'Generate Report',
    
    // Help content
    helpStep1: 'Adjust process parameters (temperature, time, pressure and speed)',
    helpStep2: 'Click "Calculate" to see predicted quality',
    helpStep3: 'Analyze charts to better understand results',
    helpStep4: 'Use simple classification to understand if quality is good or bad',
    quickGuide: 'Quick Guide',
    frequentQuestions: 'Frequent Questions',
    importantTips: 'Important Tips',
    
    // Glossary
    glossaryTitle: 'Terms Glossary',
    r2Definition: 'R² (Coefficient of Determination): Measures model accuracy. Values close to 1 indicate high precision.',
    maeDefinition: 'MAE (Mean Absolute Error): Average of differences between real and predicted values.',
    mseDefinition: 'MSE (Mean Squared Error): Penalizes large errors more than small ones.',
    temperatureDefinition: 'Temperature: Parameter that most influences process quality.',
    quickReference: 'Quick Reference',
    recommendedRanges: 'Recommended Ranges',
    
    // Results and Reports
    resultsAndReports: 'Results and Reports',
    overview: 'Overview',
    detailedAnalysis: 'Detailed Analysis',
    comparison: 'Comparison',
    currentQuality: 'Current Quality',
    optimizedQuality: 'Optimized Quality',
    quickInsights: 'Quick Insights',
    performanceAnalysis: 'Performance Analysis',
    recommendations: 'Recommendations',
    noSimulationExecuted: 'No simulation executed yet',
    noOptimizationExecuted: 'No optimization executed yet',
    executeSimulations: 'Execute simulations in the corresponding tab to see detailed analysis',
    executeOptimization: 'Execute optimization in the corresponding tab to see comparisons',
    
    // Statistical terms
    mean: 'Mean',
    median: 'Median',
    standardDeviation: 'Standard Deviation',
    range: 'Range',
    
    // Units
    celsius: '°C',
    minutes: 'min',
    kpa: 'kPa',
    rpm: 'rpm',
    units: 'units',
    
    // Common actions
    minimum: 'Minimum',
    maximum: 'Maximum',
    step: 'Step',
    value: 'Value',
    parameter: 'Parameter',
    quality: 'Quality',
    
    // Status and feedback
    excellent: 'Excellent',
    good: 'Good',
    poor: 'Poor',
    loading: 'Loading...',
    completed: 'Completed',
    processing: 'Processing...',
    
    // Presentation specific
    systemOverview: 'System Overview',
    teamDevelopment: 'Development Team',
    principalDeveloper: 'Principal Developer',
    dataAnalyst: 'Data Analyst',
    aiResearcher: 'AI Researcher',
    aboutProject: 'About the Project',
    innovationTechnology: 'Innovation and Technology',
    intelligentAlgorithms: 'Intelligent Algorithms',
    realData: 'Real Data',
    continuousOptimization: 'Continuous Optimization',
    industryApplications: 'Metallurgical Industry Applications',
    qualityControl: 'Quality Control',
    energyEfficiency: 'Energy Efficiency',
    productivity: 'Productivity',
    technicalSpecifications: 'Technical Specifications',
    optimizedParameters: 'Optimized Parameters',
    implementedAlgorithms: 'Implemented Algorithms',
    systematicExploration: 'Systematic exploration',
    solutionEvolution: 'Solution evolution',
    intelligentSearch: 'Intelligent search',
    parameterImpactAnalysis: 'Parameter impact analysis',
    prototypeIndustry: 'Prototype for Metallurgical Industry',
    modelPrecision: 'Model Precision',
    improvementUnits: 'Improvement Units',
    realDataPercent: 'Real Data',
    collaborationOpportunities: 'Collaboration Opportunities',
    industrialImplementation: 'Industrial Implementation',
    researchDevelopment: 'Research & Development',
    technicalConsulting: 'Technical Consulting',
    
    // Additional presentation terms
    intelligentSystem: 'Intelligent System for Carbon Steel Melting Process Optimization',
    artificialIntelligence: 'Artificial Intelligence',
    industry40: 'Industry 4.0',
    processOptimization: 'Process Optimization',
    vitorLorenzo: 'Vitor Lorenzo Cerutti',
    bernardoKrauspenhar: 'Bernardo Krauspenhar Paganin',
    lorenzoZatta: 'Lorenzo Zatta Santini'
  },
  
  es: {
    // Header
    title: 'MetaLytics',
    authors: 'Autores del Proyecto',
    howToUse: '¿Cómo usar esta herramienta?',
    hideHelp: 'Ocultar Ayuda',
    
    // Navigation
    dashboard: 'Panel Principal',
    presentation: 'Presentación',
    technicalDocs: 'Documentación Técnica',
    simulation: 'Simulación',
    comparison: 'Comparación',
    optimization: 'Optimización',
    results: 'Resultados',
    help: 'Ayuda',
    glossary: 'Glosario',
    
    // Parameters
    processParameters: 'Parámetros del Proceso',
    temperature: 'Temperatura',
    time: 'Tiempo',
    pressure: 'Presión',
    speed: 'Velocidad',
    calculate: 'Calcular Calidad',
    currentParameters: 'Parámetros Actuales',
    
    // Quality
    predictedQuality: 'Calidad Prevista',
    predictedEnergy: 'Energía Prevista',
    poorQuality: 'Calidad Mala',
    goodQuality: 'Calidad Buena',
    excellentQuality: 'Calidad Excelente',
    qualityPredicted: 'Calidad Prevista',
    
    // Charts and Analysis
    realVsPredicted: 'Comparación: Real vs Previsto',
    improvementTips: 'Consejos para Mejorar',
    sensitivityAnalysis: 'Análisis de Sensibilidad',
    parameterImpact: 'Impacto de Parámetros',
    qualityTrend: 'Tendencia de Calidad',
    qualityDistribution: 'Distribución de Calidad',
    statisticalSummary: 'Resumen Estadístico',
    
    // Simulation Types
    singleSimulation: 'Simulación Única',
    batchSimulation: 'Simulación por Lotes',
    runSimulation: 'Ejecutar Simulación',
    runBatch: 'Ejecutar Lote (10x)',
    runSensitivityAnalysis: 'Ejecutar Análisis de Sensibilidad',
    simulating: 'Simulando...',
    executingBatch: 'Ejecutando Lote...',
    analyzing: 'Analizando...',
    
    // Results and Metrics
    simulationResult: 'Resultado de Simulación',
    batchResults: 'Resultados del Lote',
    averageQuality: 'Calidad Promedio',
    bestQuality: 'Mejor Calidad',
    worstQuality: 'Peor Calidad',
    totalSimulations: 'Total de Simulaciones',
    bestSimulation: 'Mejor Simulación',
    classification: 'Clasificación',
    timestamp: 'Marca de Tiempo',
    
    // Optimization
    optimizationTitle: 'Configurar Optimización',
    optimizationMethod: 'Método de Optimización',
    gridSearch: 'Búsqueda en Cuadrícula',
    geneticAlgorithm: 'Algoritmo Genético',
    bayesianOptimization: 'Optimización Bayesiana',
    optimizationRanges: 'Rangos de Optimización',
    setRanges: 'Definir Rangos',
    runOptimization: 'Ejecutar Optimización',
    optimizing: 'Optimizando...',
    newOptimization: 'Nueva Optimización',
    optimizationProgress: 'Progreso de Optimización',
    optimizationResults: 'Resultados de Optimización',
    optimizedQuality: 'Calidad Optimizada',
    optimizationDetails: 'Detalles de Optimización',
    optimizedParameters: 'Parámetros Optimizados',
    improvementSummary: 'Resumen de Mejoras',
    qualityImprovement: 'Mejora en Calidad',
    mostAlteredParameter: 'Parámetro Más Alterado',
    finalClassification: 'Clasificación Final',
    
    // Comparison
    compareScenarios: 'Comparar Escenarios',
    addScenario: 'Agregar Escenario',
    manualScenario: 'Escenario Manual',
    optimizedScenario: 'Escenario Optimizado',
    scenarioName: 'Nombre del Escenario',
    qualityComparison: 'Comparación de Calidad',
    actions: 'Acciones',
    add: 'Agregar',
    
    // Features
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
    language: 'Idioma',
    downloadResults: 'Descargar Resultados',
    downloadCSV: 'Descargar CSV',
    generateReport: 'Generar Reporte',
    
    // Help content
    helpStep1: 'Ajuste los parámetros del proceso (temperatura, tiempo, presión y velocidad)',
    helpStep2: 'Haga clic en "Calcular" para ver la calidad prevista',
    helpStep3: 'Analice los gráficos para entender mejor los resultados',
    helpStep4: 'Use la clasificación simple para entender si la calidad es buena o mala',
    quickGuide: 'Guía Rápida',
    frequentQuestions: 'Preguntas Frecuentes',
    importantTips: 'Consejos Importantes',
    
    // Glossary
    glossaryTitle: 'Glosario de Términos',
    r2Definition: 'R² (Coeficiente de Determinación): Mide la precisión del modelo. Valores cercanos a 1 indican alta precisión.',
    maeDefinition: 'MAE (Error Medio Absoluto): Promedio de las diferencias entre valores reales y previstos.',
    mseDefinition: 'MSE (Error Cuadrático Medio): Penaliza más los errores grandes que los pequeños.',
    temperatureDefinition: 'Temperatura: Parámetro que más influye en la calidad del proceso.',
    quickReference: 'Referencia Rápida',
    recommendedRanges: 'Rangos Recomendados',
    
    // Results and Reports
    resultsAndReports: 'Resultados e Informes',
    overview: 'Resumen',
    detailedAnalysis: 'Análisis Detallado',
    comparison: 'Comparación',
    currentQuality: 'Calidad Actual',
    optimizedQuality: 'Calidad Optimizada',
    quickInsights: 'Perspectivas Rápidas',
    performanceAnalysis: 'Análisis de Rendimiento',
    recommendations: 'Recomendaciones',
    noSimulationExecuted: 'Ninguna simulación ejecutada aún',
    noOptimizationExecuted: 'Ninguna optimización ejecutada aún',
    executeSimulations: 'Ejecute simulaciones en la pestaña correspondiente para ver análisis detallado',
    executeOptimization: 'Ejecute optimización en la pestaña correspondiente para ver comparaciones',
    
    // Statistical terms
    mean: 'Media',
    median: 'Mediana',
    standardDeviation: 'Desviación Estándar',
    range: 'Rango',
    
    // Units
    celsius: '°C',
    minutes: 'min',
    kpa: 'kPa',
    rpm: 'rpm',
    units: 'unidades',
    
    // Common actions
    minimum: 'Mínimo',
    maximum: 'Máximo',
    step: 'Paso',
    value: 'Valor',
    parameter: 'Parámetro',
    quality: 'Calidad',
    
    // Status and feedback
    excellent: 'Excelente',
    good: 'Buena',
    poor: 'Mala',
    loading: 'Cargando...',
    completed: 'Completado',
    processing: 'Procesando...',
    
    // Presentation specific
    systemOverview: 'Resumen del Sistema',
    teamDevelopment: 'Equipo de Desarrollo',
    principalDeveloper: 'Desarrollador Principal',
    dataAnalyst: 'Analista de Datos',
    aiResearcher: 'Investigador de IA',
    aboutProject: 'Sobre el Proyecto',
    innovationTechnology: 'Innovación y Tecnología',
    intelligentAlgorithms: 'Algoritmos Inteligentes',
    realData: 'Datos Reales',
    continuousOptimization: 'Optimización Continua',
    industryApplications: 'Aplicaciones en la Industria Metalúrgica',
    qualityControl: 'Control de Calidad',
    energyEfficiency: 'Eficiencia Energética',
    productivity: 'Productividad',
    technicalSpecifications: 'Especificaciones Técnicas',
    optimizedParameters: 'Parámetros Optimizados',
    implementedAlgorithms: 'Algoritmos Implementados',
    systematicExploration: 'Exploración sistemática',
    solutionEvolution: 'Evolución de soluciones',
    intelligentSearch: 'Búsqueda inteligente',
    parameterImpactAnalysis: 'Análisis de impacto de parámetros',
    prototypeIndustry: 'Prototipo para la Industria Metalúrgica',
    modelPrecision: 'Precisión del Modelo',
    improvementUnits: 'Unidades de Mejora',
    realDataPercent: 'Datos Reales',
    collaborationOpportunities: 'Oportunidades de Colaboración',
    industrialImplementation: 'Implementación Industrial',
    researchDevelopment: 'Investigación y Desarrollo',
    technicalConsulting: 'Consultoría Técnica',
    
    // Additional presentation terms
    intelligentSystem: 'Sistema Inteligente para Optimización del Proceso de Fusión de Acero al Carbono',
    artificialIntelligence: 'Inteligencia Artificial',
    industry40: 'Industria 4.0',
    processOptimization: 'Optimización de Procesos',
    vitorLorenzo: 'Vitor Lorenzo Cerutti',
    bernardoKrauspenhar: 'Bernardo Krauspenhar Paganin',
    lorenzoZatta: 'Lorenzo Zatta Santini'
  }
};

export const languages = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];