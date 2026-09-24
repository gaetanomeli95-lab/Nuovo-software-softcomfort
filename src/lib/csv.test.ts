import { describe, expect, it } from 'vitest';
import { toCsv } from './csv';

describe('toCsv', () => {
  it('usa separatore punto e virgola e BOM per Excel', () => {
    const csv = toCsv(['Nome', 'Importo'], [['Mario', 10]]);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('Nome;Importo');
    expect(csv).toContain('Mario;10');
  });

  it('escapa virgolette, separatori e nuove righe', () => {
    const csv = toCsv(['Note'], [['test; "ciao"\nseconda']]);
    expect(csv).toContain('"test; ""ciao""\nseconda"');
  });
});
