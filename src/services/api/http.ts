import { API_BASE_URL, AUTOMATIC_DEMO_MODE } from './config';
import { loadSession, clearSession, isDemoSession } from './tokenStore';
import { handleDemoRequest } from '@/services/demoRuntime';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Sessione scaduta o non autorizzata') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
}

const REQUEST_TIMEOUT_MS = 20_000;

let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(cb: (() => void) | null) {
  onUnauthorized = cb;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options;

  // Anteprima Vercel o sessione demo esplicita:
  // nessuna chiamata al backend reale.
  if (AUTOMATIC_DEMO_MODE || isDemoSession()) {
    return handleDemoRequest<T>(path, method, body);
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new ApiError(
      0,
      'Connessione assente. Riprova quando il dispositivo è di nuovo online.',
    );
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const session = loadSession();
  if (session?.token) headers['Authorization'] = `Bearer ${session.token}`;

  const timeoutController = new AbortController();
  const timeoutId = window.setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
  const requestSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: requestSignal,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    if (timeoutController.signal.aborted) {
      throw new ApiError(0, 'Il server non risponde. Riprova tra qualche secondo.');
    }
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError(0, 'Impossibile raggiungere il server');
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (res.status === 401 || res.status === 403) {
    clearSession();
    onUnauthorized?.();
    throw new UnauthorizedError();
  }

  if (!res.ok) {
    let parsed: unknown;
    try {
      parsed = await res.json();
    } catch {
      parsed = undefined;
    }
    const message =
      (parsed as { message?: string } | undefined)?.message ??
      `Errore ${res.status}`;
    throw new ApiError(res.status, message, parsed);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export const http = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
