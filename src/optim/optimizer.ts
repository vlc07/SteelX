// src/optim/optimizer.ts
// Contrato comum para métodos de otimização e tipos utilitários.

// Representa um hiperparâmetro/variável de decisão com limites (e step opcional para grid)
export type Bounds = {
  name: string;    // ex.: "temperatura"
  min: number;     // limite inferior
  max: number;     // limite superior
  step?: number;   // opcional (usado em grid search); se ausente, o método decide
};

// Um ponto no espaço de busca (chave = nome da variável)
export type Point = Record<string, number>;

// Função-objetivo a ser MAXIMIZADA.
// Pode ser assíncrona (ex.: quando a avaliação depende de chamada remota ou é custosa).
export type ObjectiveFn = (x: Point) => number | Promise<number>;

// Registro de avaliação (útil para plotar evolução e depuração)
export type EvalRecord = {
  x: Point;  // ponto avaliado
  y: number; // valor da função-objetivo no ponto
};

// Resultado final de uma execução do otimizador
export type SearchResult = {
  best: EvalRecord;       // melhor ponto encontrado
  history: EvalRecord[];  // histórico (ordem de avaliação)
  evaluations: number;    // nº total de avaliações realizadas
  meta?: Record<string, unknown>; // informações adicionais (ex.: método, hiperparâmetros)
};

// Interface que todos os otimizadores devem seguir
export interface Optimizer {
  run(opts: {
    objective: ObjectiveFn; // função-objetivo (maior é melhor)
    bounds: Bounds[];       // limites de busca para cada variável
    budget: number;         // limite de avaliações da função-objetivo
    seed?: number;          // opcional: semente para reprodutibilidade (quando aplicável)
  }): Promise<SearchResult>;
}
