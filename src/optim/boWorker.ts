// src/optim/boWorker.ts
// Executa a Otimização Bayesiana fora da main thread para evitar travar a UI.
import { runOptimization } from './runner';

type StartMsg = {
  type: 'start';
  payload: any;
};

type DoneMsg = { type: 'done'; res: any };
type ErrorMsg = { type: 'error'; message: string };

self.onmessage = async (e: MessageEvent<StartMsg>) => {
  const msg = e.data;
  if (msg.type !== 'start') return;

  try {
    const res = await runOptimization(msg.payload);
    (self as any).postMessage({ type: 'done', res } as DoneMsg);
  } catch (err: any) {
    (self as any).postMessage({ type: 'error', message: String(err?.message || err) } as ErrorMsg);
  }
};

