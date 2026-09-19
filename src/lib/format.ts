/**
 * Formattazione valuta e date in locale italiano.
 */

const currencyFmt = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
});

const numberFmt = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return currencyFmt.format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return numberFmt.format(value);
}

/** "2026-06-13" -> "13/06/2026". Gestisce anche ISO datetime. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** "2026-06-13" -> "13 giu 2026" */
export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Chiave "yyyy-MM" per aggregazioni mensili. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

const MONTHS_IT = [
  'gen', 'feb', 'mar', 'apr', 'mag', 'giu',
  'lug', 'ago', 'set', 'ott', 'nov', 'dic',
];

export function monthLabel(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-');
  const idx = Number(m) - 1;
  return `${MONTHS_IT[idx] ?? m} ${y.slice(2)}`;
}

/** Giorni da oggi a una data ISO (negativo = passato). */
export function daysUntil(iso: string): number {
  const target = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}
