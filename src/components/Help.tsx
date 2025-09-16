import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  BookOpen,
  LifeBuoy,
  Mail,
  Download,
  Settings,
  Info,
  ShieldCheck
} from 'lucide-react';

interface HelpProps {
  t: (key: string) => string;
  isDark: boolean;
}

export const Help: React.FC<HelpProps> = ({ t, isDark }) => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    'getting-started': true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Helpers de estilo premium
  const ringIndigo =
    'hover:ring-2 hover:ring-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/50';
  const textMain = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSub = isDark ? 'text-gray-300' : 'text-gray-600';

  const faqItems = [
    {
      id: 'getting-started',
      question: 'Como começar a usar o otimizador?',
      answer:
        'Vá ao Dashboard, ajuste os parâmetros do processo e clique em Calcular. Depois compare cenários e, por fim, use a aba Otimização para encontrar automaticamente as melhores combinações.'
    },
    {
      id: 'parameters',
      question: 'O que significam os parâmetros do processo?',
      answer:
        'Temperatura afeta cinética; Tempo controla a duração; Pressão influencia densidade/estrutura; Velocidade atua na mistura e homogeneidade.'
    },
    {
      id: 'quality',
      question: 'Como interpretar a qualidade prevista?',
      answer:
        'A escala vai até 400. <355 = “ruim”; 355–365 = “boa”; ≥365 = “excelente”. As badges coloridas nos cards ajudam a interpretar rapidamente.'
    },
    {
      id: 'optimization',
      question: 'Como funciona a otimização automática?',
      answer:
        'O sistema explora as faixas definidas e, conforme o método (grid, genético, bayesiano), aprende a propor testes mais promissores, maximizando qualidade e/ou eficiência energética.'
    },
    {
      id: 'comparison',
      question: 'Para que serve a comparação de cenários?',
      answer:
        'Permite observar deltas de qualidade e de parâmetros lado a lado, facilitando decisões e registro de melhores práticas.'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Premium */}
      <div
        className={[
          'rounded-2xl p-6 md:p-7 border bg-gradient-to-br transition-all duration-300',
          'hover:-translate-y-0.5 hover:shadow-2xl',
          isDark
            ? 'from-indigo-950/70 via-gray-900/60 to-gray-900/50 border-indigo-900/50 ring-1 ring-indigo-500/20'
            : 'from-indigo-50 via-white to-white border-indigo-200 ring-1 ring-indigo-300/20'
        ].join(' ')}
      >
        <div className="flex items-start gap-4">
          <div
            className={[
              'shrink-0 rounded-xl p-2.5 border',
              isDark
                ? 'bg-indigo-900/30 border-indigo-800 text-indigo-300'
                : 'bg-indigo-100 border-indigo-200 text-indigo-700'
            ].join(' ')}
          >
            <HelpCircle className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <h2 className={['text-2xl font-bold tracking-tight', isDark ? 'text-indigo-200' : 'text-indigo-900'].join(' ')}>
              {t('help')} & FAQ
            </h2>
            <p className={['mt-1 text-sm', textSub].join(' ')}>
              Guia rápido, perguntas frequentes, atalhos e contatos — tudo que você precisa para tirar máximo proveito da
              plataforma.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start + Ações rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Start */}
        <div
          className={[
            'rounded-2xl p-5 border bg-gradient-to-br transition-all',
            ringIndigo,
            isDark
              ? 'from-blue-950/60 to-gray-900/60 border-blue-900/50'
              : 'from-blue-50 to-white border-blue-200'
          ].join(' ')}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className={isDark ? 'h-5 w-5 text-blue-300' : 'h-5 w-5 text-blue-600'} />
            <h3 className={['font-semibold', textMain].join(' ')}>🚀 Guia Rápido</h3>
          </div>
          <ol className={['list-decimal list-inside space-y-2 text-sm', isDark ? 'text-blue-200' : 'text-blue-700'].join(' ')}>
            <li>Ajuste os parâmetros no <b>Dashboard</b> e clique em <b>Calcular</b>.</li>
            <li>Use <b>Comparação</b> para testar cenários e definir uma <b>Referência</b>.</li>
            <li>Na <b>Otimização</b>, selecione um método e execute.</li>
            <li>Revise o <b>Melhor Resultado</b> e salve o histórico.</li>
            <li>Baixe os dados em <b>CSV</b> para análises externas.</li>
          </ol>
        </div>

        {/* Ações rápidas */}
        <div
          className={[
            'rounded-2xl p-5 border bg-gradient-to-br transition-all',
            ringIndigo,
            isDark
              ? 'from-emerald-950/60 to-gray-900/60 border-emerald-900/50'
              : 'from-emerald-50 to-white border-emerald-200'
          ].join(' ')}
        >
          <div className="flex items-center gap-2 mb-3">
            <Settings className={isDark ? 'h-5 w-5 text-emerald-300' : 'h-5 w-5 text-emerald-700'} />
            <h3 className={['font-semibold', textMain].join(' ')}>⚡ Ações Rápidas</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <button
              className={[
                'w-full px-3 py-2 rounded-lg border text-left',
                ringIndigo,
                isDark
                  ? 'bg-gray-800/70 border-gray-700 text-gray-200 hover:bg-gray-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              ].join(' ')}
              title="Baixar últimos resultados"
            >
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Baixar CSV
              </div>
            </button>

            <button
              className={[
                'w-full px-3 py-2 rounded-lg border text-left',
                ringIndigo,
                isDark
                  ? 'bg-gray-800/70 border-gray-700 text-gray-200 hover:bg-gray-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              ].join(' ')}
              title="Abrir documentação interna"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Documentação
              </div>
            </button>

            <button
              className={[
                'w-full px-3 py-2 rounded-lg border text-left',
                ringIndigo,
                isDark
                  ? 'bg-gray-800/70 border-gray-700 text-gray-200 hover:bg-gray-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              ].join(' ')}
              title="Enviar feedback"
            >
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Enviar feedback
              </div>
            </button>

            <button
              className={[
                'w-full px-3 py-2 rounded-lg border text-left',
                ringIndigo,
                isDark
                  ? 'bg-gray-800/70 border-gray-700 text-gray-200 hover:bg-gray-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              ].join(' ')}
              title="Abrir suporte"
            >
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4" /> Suporte
              </div>
            </button>
          </div>
        </div>

        {/* Status & Segurança */}
        <div
          className={[
            'rounded-2xl p-5 border bg-gradient-to-br transition-all',
            ringIndigo,
            isDark
              ? 'from-violet-950/60 to-gray-900/60 border-violet-900/50'
              : 'from-violet-50 to-white border-violet-200'
          ].join(' ')}
        >
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className={isDark ? 'h-5 w-5 text-violet-300' : 'h-5 w-5 text-violet-700'} />
            <h3 className={['font-semibold', textMain].join(' ')}>🔒 Status & Boas Práticas</h3>
          </div>
          <ul className={['space-y-2 text-sm', textSub].join(' ')}>
            <li>• Seus dados locais de histórico podem ser exportados e limpos a qualquer momento.</li>
            <li>• Defina faixas industriais realistas para evitar recomendações inviáveis.</li>
            <li>• Registre a referência antes de comparar cenários para ver deltas corretos.</li>
          </ul>
        </div>
      </div>

      {/* FAQ Premium */}
      <div
        className={[
          'rounded-2xl p-5 border bg-gradient-to-br',
          isDark ? 'from-gray-900 to-gray-900/40 border-gray-700' : 'from-white to-white border-gray-200'
        ].join(' ')}
      >
        <div className="flex items-center gap-2 mb-4">
          <Info className={isDark ? 'h-5 w-5 text-indigo-300' : 'h-5 w-5 text-indigo-600'} />
          <h3 className={['text-lg font-semibold', textMain].join(' ')}>Perguntas Frequentes</h3>
        </div>

        <div className="space-y-3">
          {faqItems.map(item => (
            <div
              key={item.id}
              className={[
                'rounded-xl border transition-all',
                ringIndigo,
                isDark
                  ? 'bg-gray-800/60 border-gray-700 hover:bg-gray-800'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              ].join(' ')}
            >
              <button
                onClick={() => toggleSection(item.id)}
                className="w-full text-left px-4 py-3 flex items-center justify-between"
              >
                <span className={['font-medium', textMain].join(' ')}>{item.question}</span>
                {openSections[item.id] ? (
                  <ChevronDown className={isDark ? 'h-5 w-5 text-gray-400' : 'h-5 w-5 text-gray-500'} />
                ) : (
                  <ChevronRight className={isDark ? 'h-5 w-5 text-gray-400' : 'h-5 w-5 text-gray-500'} />
                )}
              </button>
              {openSections[item.id] && <div className={['px-4 pb-4 text-sm', textSub].join(' ')}>{item.answer}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Dicas + Atalhos + Glossário */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dicas */}
        <div
          className={[
            'rounded-2xl p-5 border bg-gradient-to-br',
            isDark ? 'from-emerald-950/60 to-gray-900/60 border-emerald-900/50' : 'from-emerald-50 to-white border-emerald-200'
          ].join(' ')}
        >
          <h3 className={['font-semibold mb-3', textMain].join(' ')}>💡 Dicas Importantes</h3>
          <ul className={['space-y-2 text-sm', textSub].join(' ')}>
            <li>• Faça pequenos ajustes e acompanhe impacto nos deltas.</li>
            <li>• Temperatura costuma ter maior sensibilidade — priorize validação.</li>
            <li>• Use presets por objetivo para começar com boas faixas.</li>
            <li>• Revise o histórico e exporte CSV para auditoria.</li>
          </ul>
        </div>

        {/* Atalhos */}
        <div
          className={[
            'rounded-2xl p-5 border bg-gradient-to-br',
            isDark ? 'from-blue-950/60 to-gray-900/60 border-blue-900/50' : 'from-blue-50 to-white border-blue-200'
          ].join(' ')}
        >
          <h3 className={['font-semibold mb-3', textMain].join(' ')}>⌨️ Atalhos úteis</h3>
          <ul className={['space-y-2 text-sm', textSub].join(' ')}>
            <li><b>Ctrl / Cmd + K</b> — Abrir busca/ações.</li>
            <li><b>Ctrl / Cmd + S</b> — Exportar CSV rápido.</li>
            <li><b>Shift + /</b> — Ver ajuda.</li>
          </ul>
        </div>

        {/* Glossário */}
        <div
          className={[
            'rounded-2xl p-5 border bg-gradient-to-br',
            isDark ? 'from-violet-950/60 to-gray-900/60 border-violet-900/50' : 'from-violet-50 to-white border-violet-200'
          ].join(' ')}
        >
          <h3 className={['font-semibold mb-3', textMain].join(' ')}>📚 Mini-Glossário</h3>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className={['font-semibold', textMain].join(' ')}>Qualidade</dt>
              <dd className={textSub}>Métrica prevista (0–400) do modelo, maior é melhor.</dd>
            </div>
            <div>
              <dt className={['font-semibold', textMain].join(' ')}>λ (lambda)</dt>
              <dd className={textSub}>Controle do trade-off qualidade ↔ energia no score.</dd>
            </div>
            <div>
              <dt className={['font-semibold', textMain].join(' ')}>Referência</dt>
              <dd className={textSub}>Cenário base usado para calcular deltas nos comparativos.</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};
