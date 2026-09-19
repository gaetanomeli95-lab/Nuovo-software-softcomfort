/**
 * Gestione centralizzata della sessione.
 * Il token JWT vive in sessionStorage (come il legacy: la sessione
 * termina alla chiusura del tab) ma l'accesso è incapsulato qui.
 */

const TOKEN_KEY = 'gestionale.token';
const USER_KEY = 'gestionale.user';

export const DEMO_SESSION_TOKEN = 'softcomfort-demo-session';

export interface StoredSession {
  token: string;
  username: string;
  roles: string[];
}

export function loadSession(): StoredSession | null {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const raw = sessionStorage.getItem(USER_KEY);
    if (!token || !raw) return null;
    const user = JSON.parse(raw) as { username: string; roles: string[] };
    return { token, username: user.username, roles: user.roles ?? [] };
  } catch {
    return null;
  }
}

export function saveSession(session: StoredSession): void {
  sessionStorage.setItem(TOKEN_KEY, session.token);
  sessionStorage.setItem(
    USER_KEY,
    JSON.stringify({ username: session.username, roles: session.roles }),
  );
}

export function clearSession(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function isDemoSession(): boolean {
  return sessionStorage.getItem(TOKEN_KEY) === DEMO_SESSION_TOKEN;
}
