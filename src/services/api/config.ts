/**
 * Configurazione API centralizzata.
 *
 * - Sviluppo locale: VITE_API_BASE_URL può restare vuoto e Vite usa il proxy legacy.
 * - Produzione reale: impostare VITE_API_BASE_URL con l'URL HTTPS del backend pubblico.
 * - Anteprima Vercel senza backend pubblico: il gestionale entra automaticamente
 *   in modalità demo e non esegue chiamate verso dati reali.
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '';

export const AUTOMATIC_DEMO_MODE =
  import.meta.env.PROD && API_BASE_URL.trim().length === 0;
