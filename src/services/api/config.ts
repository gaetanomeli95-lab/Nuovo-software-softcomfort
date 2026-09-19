/**
 * Configurazione API centralizzata.
 * Nessun URL hardcoded nel resto dell'app: tutto passa da qui.
 *
 * - Produzione: VITE_API_BASE_URL vuoto → stessa origine (il backend
 *   Spring Boot serve i file statici, com'era per il frontend Angular).
 * - Sviluppo: il proxy Vite inoltra i path API al legacy, oppure si può
 *   impostare VITE_API_BASE_URL se CORS è abilitato.
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '';
