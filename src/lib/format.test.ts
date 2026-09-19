import { describe, expect, it } from 'vitest';
import { daysUntil, formatCurrency, formatDate, monthKey, monthLabel } from './format';

describe('formatCurrency', () => {
  it('formatta in EUR italiano', () => {
    // jsdom ha ICU ridotto: il separatore migliaia può mancare in test.
    const out = formatCurrency(1234.5);
    expect(out).toContain('234,50');
    expect(out).toContain('€');
    expect(formatCurrency(0)).toContain('0,00');
  });
  it('gestisce null/undefined', () => {
    expect(formatCurrency(null)).toBe('—');
    expect(formatCurrency(undefined)).toBe('—');
  });
});

describe('formatDate', () => {
  it('converte ISO in dd/MM/yyyy', () => {
    expect(formatDate('2026-06-13')).toBe('13/06/2026');
  });
  it('gestisce valori vuoti', () => {
    expect(formatDate('')).toBe('—');
    expect(formatDate(null)).toBe('—');
  });
});

describe('monthKey / monthLabel', () => {
  it('estrae yyyy-MM', () => {
    expect(monthKey('2026-06-13')).toBe('2026-06');
  });
  it('produce etichetta italiana', () => {
    expect(monthLabel('2026-06')).toBe('giu 26');
  });
});

describe('daysUntil', () => {
  it('positivo per date future, negativo per passate', () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const iso = future.toISOString().slice(0, 10);
    expect(daysUntil(iso)).toBe(10);
    expect(daysUntil('2000-01-01')).toBeLessThan(0);
  });
});
