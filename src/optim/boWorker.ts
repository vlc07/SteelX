// src/optim/boWorker.ts
// Worker para rodar a Otimização Bayesiana fora da UI (main thread)
import { runOptimization } from './runner';

type WorkerMsg =
  | { type: 'start'; payload: any }
  | { type: 'cancel' };

type ProgressMsg = { type: 'progress'; i: number; best: any };
type DoneMsg = { type: 'done'; res: any };
type ErrorMsg = { type: 'error'; message: string };

let cancelled = false;

self.onmessage = async (e: MessageEvent<WorkerMsg>) => {
  const msg = e.data;
  if (msg.type === 'cancel') {
    cancelled = true;
    return;
  }

  if (msg.type === 'start') {
    cancelled = false;
    try {
      const payload = msg.payload;

      // Encaminha progresso para a UI e permite cancelamento cooperativo
      const res = await runOptimization({
        ...payload,
        // onProgress é opcional no runner; se não existir, tudo bem
        onProgress: (p: { i: number; best: any }) => {
          const m: ProgressMsg = { type: 'progress', i: p.i, best: p.best };
          (self as any).postMessage(m);
          if (cancelled) throw new Error('cancelled');
        },
      });

      const done: DoneMsg = { type: 'done', res };
      (self as any).postMessage(done);
    } catch (err: any) {
      const emsg: ErrorMsg = { type: 'error', message: String(err?.message || err) };
      (self as any).postMessage(emsg);
    }
  }
};
