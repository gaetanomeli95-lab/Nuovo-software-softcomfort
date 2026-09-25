import { describe, expect, it } from 'vitest';
import { diagnosticMessage, summarizeDiagnostics, type DiagnosticResult } from './readinessDiagnostics';

describe('readiness diagnostics helpers', () => {
  it('summarizes a healthy diagnostic run', () => {
    const results: DiagnosticResult[] = [
      { id: 'a', label: 'A', status: 'ok', durationMs: 10, records: 2 },
      { id: 'b', label: 'B', status: 'ok', durationMs: 20, records: 4 },
    ];

    expect(summarizeDiagnostics(results)).toEqual({
      total: 2,
      ok: 2,
      failed: 0,
      healthy: true,
    });
  });

  it('flags partial failures without hiding successful modules', () => {
    const results: DiagnosticResult[] = [
      { id: 'a', label: 'A', status: 'ok', durationMs: 10 },
      { id: 'b', label: 'B', status: 'error', durationMs: 30, message: 'Server non raggiungibile' },
    ];

    expect(summarizeDiagnostics(results)).toEqual({
      total: 2,
      ok: 1,
      failed: 1,
      healthy: false,
    });
  });

  it('normalizes unknown diagnostic errors', () => {
    expect(diagnosticMessage(new Error('Timeout'))).toBe('Timeout');
    expect(diagnosticMessage(null)).toBe('Controllo non riuscito');
  });
});
