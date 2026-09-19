import type {
  Check,
  DepositResponse,
  ProvisionResponse,
  SellingBill,
} from '@/types/domain';
import { daysUntil, monthKey } from '@/lib/format';

/**
 * Derivazione delle metriche dashboard dai dati grezzi delle API.
 * Pura e testabile: nessuna dipendenza da React.
 */

export interface DashboardMetrics {
  totaleFatture: number;
  fatturatoTotale: number;
  fattureAperte: number;
  daOrdinare: number;
  ordinati: number;
  pronte: number;
  consegnate: number;
  accontiDaIncassare: { count: number; total: number };
  provvigioniDaPagare: { count: number; total: number };
  assegniInScadenza: Check[];
  venditePerMese: { month: string; total: number; count: number }[];
  venditePerVenditore: { seller: string; total: number; count: number }[];
  ultimeVendite: SellingBill[];
}

const OPEN_STATUSES = new Set(['Da Ordinare', 'Ordinato', 'Pronta', 'Consegnata']);

/** Finestra "prossimi alla scadenza" per gli assegni (giorni). */
export const CHECK_EXPIRY_WINDOW_DAYS = 60;

export function computeDashboardMetrics(
  bills: SellingBill[],
  depositsToCollect: DepositResponse[],
  provisionsToPay: ProvisionResponse[],
  checks: Check[],
): DashboardMetrics {
  const active = bills.filter((b) => b.status !== 'Annullata');

  const fatturatoTotale = active.reduce((s, b) => s + (b.totalPrice ?? 0), 0);

  const countBy = (status: string) => bills.filter((b) => b.status === status).length;

  const accontiTotal = depositsToCollect.reduce((s, d) => s + (d.deposit?.amount ?? 0), 0);
  const provTotal = provisionsToPay.reduce((s, p) => s + (p.provision?.amount ?? 0), 0);

  const assegniInScadenza = checks
    .filter((c) => {
      const d = daysUntil(c.expireDate);
      return d >= 0 && d <= CHECK_EXPIRY_WINDOW_DAYS;
    })
    .sort((a, b) => a.expireDate.localeCompare(b.expireDate));

  // Vendite per mese (ultimi 12 mesi con dati)
  const byMonth = new Map<string, { total: number; count: number }>();
  for (const b of active) {
    if (!b.date) continue;
    const k = monthKey(b.date);
    const cur = byMonth.get(k) ?? { total: 0, count: 0 };
    cur.total += b.totalPrice ?? 0;
    cur.count += 1;
    byMonth.set(k, cur);
  }
  const venditePerMese = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, v]) => ({ month, ...v }));

  // Per venditore
  const bySeller = new Map<string, { total: number; count: number }>();
  for (const b of active) {
    const seller = b.seller?.trim() || 'N/D';
    const cur = bySeller.get(seller) ?? { total: 0, count: 0 };
    cur.total += b.totalPrice ?? 0;
    cur.count += 1;
    bySeller.set(seller, cur);
  }
  const venditePerVenditore = [...bySeller.entries()]
    .map(([seller, v]) => ({ seller, ...v }))
    .sort((a, b) => b.total - a.total);

  const ultimeVendite = [...bills]
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .slice(0, 8);

  return {
    totaleFatture: bills.length,
    fatturatoTotale,
    fattureAperte: bills.filter((b) => OPEN_STATUSES.has(b.status)).length,
    daOrdinare: countBy('Da Ordinare'),
    ordinati: countBy('Ordinato'),
    pronte: countBy('Pronta'),
    consegnate: countBy('Consegnata'),
    accontiDaIncassare: { count: depositsToCollect.length, total: accontiTotal },
    provvigioniDaPagare: { count: provisionsToPay.length, total: provTotal },
    assegniInScadenza,
    venditePerMese,
    venditePerVenditore,
    ultimeVendite,
  };
}
