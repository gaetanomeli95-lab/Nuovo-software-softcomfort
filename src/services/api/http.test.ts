import { afterEach, describe, expect, it, vi } from 'vitest';
import { http } from './http';

const originalOnline = navigator.onLine;

afterEach(() => {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value: originalOnline,
  });
  vi.restoreAllMocks();
});

describe('http connectivity safeguards', () => {
  it('fails immediately with a clear message when the device is offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await expect(http.get('/sellingBill/getAll')).rejects.toMatchObject({
      status: 0,
      message: 'Connessione assente. Riprova quando il dispositivo è di nuovo online.',
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
