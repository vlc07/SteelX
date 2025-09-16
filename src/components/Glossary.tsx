import React, { useMemo, useState } from 'react';
import { BookOpen, Search, Filter, X, Tag } from 'lucide-react';

interface GlossaryProps {
  t: (key: string) => string;
  isDark: boolean;
}

type Term = {
  term: string;
  definition: string;
  category: 'Métricas' | 'Parâmetros' | 'Conceitos' | string;
};

export const Glossary: React.FC<GlossaryProps> = ({ t, isDark }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCats, setActiveCats] = useState<string[]>([]); // chips selecionados

  const glossaryTerms: Term[] = [
    { term: 'R² (Coeficiente de Determinação)', definition: t('r2Definition'), category: 'Métricas' },
    { term: 'MAE (Erro Médio Absoluto)',        definition: t('maeDefinition'), category: 'Métricas' },
    { term: 'MSE (Erro Quadrático Médio)',      definition: t('mseDefinition'), category: 'Métricas' },
    { term: 'Temperatura',                       definition: t('temperatureDefinition'), category: 'Parâmetros' },
    { term: 'Tempo de Processo',                 definition: 'Duração total do processo de fabricação. Tempos muito curtos podem resultar em reação incompleta, enquanto tempos muito longos podem causar degradação.', category: 'Parâmetros' },
    { term: 'Pressão',                            definition: 'Força aplicada por unidade de área durante o processo. Afeta a densidade e compactação do produto final.', category: 'Parâmetros' },
    { term: 'Velocidade de Rotação',              definition: 'Velocidade de mistura ou agitação durante o processo. Influencia a homogeneidade e distribuição dos materiais.', category: 'Parâmetros' },
    { term: 'Otimização',                         definition: 'Processo de encontrar a melhor combinação de parâmetros para maximizar a qualidade do produto.', category: 'Conceitos' },
    { term: 'Cenário',                            definition: 'Conjunto específico de parâmetros de processo que pode ser testado e comparado com outros.', category: 'Conceitos' },
    { term: 'Qualidade Prevista',                 definition: 'Valor estimado da qualidade do produto baseado nos parâmetros de entrada e no modelo treinado.', category: 'Conceitos' },
    { term: 'Modelo Preditivo',                   definition: 'Algoritmo matemático que aprende padrões dos dados históricos para prever resultados futuros.', category: 'Conceitos' },
    { term: 'Faixa de Otimização',                definition: 'Intervalo de valores mínimos e máximos dentro dos quais cada parâmetro pode variar durante a otimização.', category: 'Conceitos' },
  ];

  const categories = useMemo(() => [...new Set(glossaryTerms.map(g => g.category))], [glossaryTerms]);

  const filteredTerms = useMemo(() => {
    const text = searchTerm.trim().toLowerCase();
    return glossaryTerms.filter((item) => {
      const matchesText =
        !text ||
        item.term.toLowerCase().includes(text) ||
        item.definition.toLowerCase().includes(text) ||
        item.category.toLowerCase().includes(text);
      const matchesCat = activeCats.length === 0 || activeCats.includes(item.category);
      return matchesText && matchesCat;
    });
  }, [glossaryTerms, searchTerm, activeCats]);

  // helpers de tema
  const shell = `rounded-2xl border bg-gradient-to-br ${
    isDark
      ? 'from-slate-900 to-slate-800 border-slate-700'
      : 'from-white to-slate-50 border-slate-200'
  } shadow-sm transition-all`;

  const headerGrad = `rounded-2xl border bg-gradient-to-br ${
    isDark
      ? 'from-blue-950/70 via-indigo-900/60 to-slate-900/70 border-indigo-900/40'
      : 'from-blue-50 via-indigo-50 to-white border-indigo-200'
  }`;

  const pillBase =
    'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all';

  const catPill = (cat: string, active: boolean) =>
    `${pillBase} ${
      active
        ? isDark
          ? 'bg-indigo-900/60 border-indigo-700 text-indigo-200 shadow-inner'
          : 'bg-indigo-100 border-indigo-300 text-indigo-800'
        : isDark
          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
    }`;

  const titleColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const subColor = isDark ? 'text-slate-300' : 'text-slate-600';
  const hairColor = isDark ? 'text-slate-400' : 'text-slate-500';

  const badgeByCategory = (cat: string) =>
    cat === 'Métricas'
      ? isDark
        ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-800'
        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : cat === 'Parâmetros'
        ? isDark
          ? 'bg-blue-900/50 text-blue-200 border border-blue-800'
          : 'bg-blue-50 text-blue-700 border border-blue-200'
        : isDark
          ? 'bg-violet-900/50 text-violet-200 border border-violet-800'
          : 'bg-violet-50 text-violet-700 border border-violet-200';

  return (
    <div className="space-y-6">
      {/* Cabeçalho Premium */}
      <div className={`${headerGrad} p-6`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isDark ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-700'
              }`}
            >
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${titleColor}`}>{t('glossaryTitle')}</h2>
              <p className={`text-sm ${subColor}`}>
                Termos-chave do projeto com explicações objetivas. Use a busca e os filtros para
                encontrar rapidamente o que precisa.
              </p>
            </div>
          </div>

          {/* Busca */}
          <div className="relative w-full sm:w-80">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            />
            <input
              type="text"
              placeholder="Buscar termos, categorias…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl border backdrop-blur transition focus:outline-none
                ${
                  isDark
                    ? 'bg-slate-900/70 border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/40'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300'
                }`}
            />
          </div>
        </div>

        {/* Filtros por categoria */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={`text-xs ${hairColor} inline-flex items-center gap-1`}>
            <Filter className="h-4 w-4" /> Filtrar por:
          </span>
          {categories.map((cat) => {
            const active = activeCats.includes(cat);
            return (
              <button
                key={cat}
                onClick={() =>
                  setActiveCats((prev) =>
                    prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
                  )
                }
                className={catPill(cat, active)}
                title={active ? 'Remover filtro' : 'Aplicar filtro'}
              >
                <Tag className="h-4 w-4" />
                {cat}
                {active && <X className="h-3.5 w-3.5 opacity-80" />}
              </button>
            );
          })}
          {activeCats.length > 0 && (
            <button
              onClick={() => setActiveCats([])}
              className={`${pillBase} ${
                isDark
                  ? 'bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'bg-transparent border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Limpar filtros
            </button>
          )}
          <span className={`ml-auto text-xs ${hairColor}`}>
            {filteredTerms.length} termo{filteredTerms.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Lista de termos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTerms.map((item, idx) => (
          <div
            key={`${item.term}-${idx}`}
            className={`${shell} p-5 hover:-translate-y-0.5 hover:shadow-xl`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className={`text-lg font-semibold ${titleColor}`}>{item.term}</h3>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${badgeByCategory(
                  item.category,
                )}`}
              >
                {item.category}
              </span>
            </div>
            <p className={`mt-2 text-sm leading-relaxed ${subColor}`}>{item.definition}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredTerms.length === 0 && (
        <div
          className={`${shell} p-8 text-center border-dashed ${
            isDark ? 'bg-slate-900/60' : 'bg-white'
          }`}
        >
          <p className={`text-sm ${subColor}`}>
            Nenhum resultado para <b>{searchTerm}</b>. Ajuste os filtros ou tente outro termo.
          </p>
        </div>
      )}

      {/* Referência rápida / bloco extra informativo */}
      <div
        className={`rounded-2xl border bg-gradient-to-br p-6 ${
          isDark
            ? 'from-indigo-950/50 via-slate-900/60 to-slate-900/80 border-indigo-900/40'
            : 'from-indigo-50 via-slate-50 to-white border-indigo-200'
        }`}
      >
        <h3 className={`text-lg font-semibold ${titleColor}`}>📚 Referência Rápida</h3>
        <p className={`text-sm mt-1 ${subColor}`}>
          Valores e faixas recomendadas para consulta rápida durante a configuração dos cenários.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className={`${shell} p-4`}>
            <h4 className={`font-medium ${titleColor}`}>Faixas Recomendadas</h4>
            <ul className={`mt-2 text-sm space-y-1.5 ${subColor}`}>
              <li>• Temperatura: 1450–1520 °C</li>
              <li>• Tempo: 30–90 min</li>
              <li>• Pressão: 100–102 kPa</li>
              <li>• Velocidade: 290–310 rpm</li>
            </ul>
          </div>

          <div className={`${shell} p-4`}>
            <h4 className={`font-medium ${titleColor}`}>Qualidade (escala 0–400)</h4>
            <ul className={`mt-2 text-sm space-y-1.5 ${subColor}`}>
              <li>• &lt; 355: <b>Ruim</b></li>
              <li>• 355–365: <b>Boa</b></li>
              <li>• &gt; 365: <b>Excelente</b></li>
            </ul>
          </div>
        </div>

        {/* Rodapé suave */}
        <div className={`mt-4 text-xs ${hairColor}`}>
          Dica: clique nas <i>chips</i> de categoria para filtrar rapidamente; a busca também
          encontra termos dentro das definições.
        </div>
      </div>
    </div>
  );
};
