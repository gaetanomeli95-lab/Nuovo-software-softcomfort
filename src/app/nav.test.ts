import { describe, expect, it } from 'vitest';
import { NAV_SECTIONS, visibleNavSections } from './nav';

const ADMIN_ONLY = ['/dashboard', '/acquisti', '/acconti', '/assegni', '/provvigioni', '/amministrazione'];

function paths(isAdmin: boolean) {
  return visibleNavSections(isAdmin).flatMap((section) => section.items.map((item) => item.to));
}

describe('menu del gestionale', () => {
  it('ha tre gruppi e nessun gruppo vuoto', () => {
    expect(NAV_SECTIONS.map((section) => section.title)).toEqual([
      'Negozio',
      'Consegne e magazzino',
      'Amministratore',
    ]);
    expect(NAV_SECTIONS.every((section) => section.items.length > 0)).toBe(true);
  });

  it("l'admin vede tutte le voci", () => {
    expect(paths(true)).toEqual(expect.arrayContaining(ADMIN_ONLY));
    expect(paths(true)).toHaveLength(12);
  });

  it('il PC operativo non vede le aree contabili riservate', () => {
    const operator = paths(false);
    for (const path of ADMIN_ONLY) expect(operator).not.toContain(path);
    expect(operator).toEqual([
      '/attivita',
      '/vendite',
      '/anagrafiche',
      '/consegne',
      '/ordini',
      '/magazzino',
    ]);
    expect(visibleNavSections(false).map((section) => section.title)).not.toContain('Amministratore');
  });
});
