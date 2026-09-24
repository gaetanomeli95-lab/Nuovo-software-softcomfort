/**
 * Configurazione API centralizzata.
 *
 * - Sviluppo locale: VITE_API_BASE_URL può restare vuoto e Vite usa il proxy legacy.
 * - Produzione con backend HTTPS dedicato: impostare VITE_API_BASE_URL.
 * - Produzione same-origin: lasciare VITE_API_BASE_URL vuoto e impostare VITE_DEMO_MODE=false.
 * - Preview/Vercel senza backend: il fallback automatico mantiene la demo disponibile.
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '';

const demoOverride = String(import.meta.env.VITE_DEMO_MODE ?? '').trim().toLowerCase();

export const AUTOMATIC_DEMO_MODE =
  demoOverride === 'true' ||
  (
    demoOverride !== 'false' &&
    import.meta.env.PROD &&
    API_BASE_URL.trim().length === 0
  );

export const API_CONNECTION_MODE: 'demo' | 'remote' | 'same-origin' =
  AUTOMATIC_DEMO_MODE
    ? 'demo'
    : API_BASE_URL.trim().length > 0
      ? 'remote'
      : 'same-origin';
