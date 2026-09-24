import type { SellingBill } from '@/types/domain';

export type PaymentStatus = 'Da pagare' | 'Parziale' | 'Pagata';

export interface PaymentSummary {
  paidTotal: number;
  balance: number;
  status: PaymentStatus;
}

/**
 * Lo stato pagamento è separato dallo stato operativo della vendita.
 * Consideriamo versato solo ciò che il backend marca come collected.
 * Il campo legacy "settlement" resta separato finché non viene validata
 * definitivamente la sua semantica sul backend reale.
 */
export function getPaymentSummary(bill: SellingBill): PaymentSummary {
  const total = Math.max(0, bill.totalPrice ?? 0);
  const paidTotal = (bill.deposits ?? [])
    .filter((deposit) => deposit.collected)
    .reduce((sum, deposit) => sum + (deposit.amount ?? 0), 0);

  const balance = Math.max(0, total - paidTotal);

  let status: PaymentStatus = 'Da pagare';
  if (total <= 0 || balance <= 0.01) status = 'Pagata';
  else if (paidTotal > 0) status = 'Parziale';

  return { paidTotal, balance, status };
}


export interface SaleClosureReadiness {
  ready: boolean;
  itemsDelivered: boolean;
  paymentComplete: boolean;
  reasons: string[];
}

/**
 * Readiness UI-only: non cambia lo stato legacy e non chiama /sellingBill/update.
 * Serve a mostrare all'operatore cosa manca prima della chiusura.
 */
export function getSaleClosureReadiness(bill: SellingBill): SaleClosureReadiness {
  const payment = getPaymentSummary(bill);
  const items = bill.items ?? [];
  const itemsDelivered = items.length > 0 && items.every((item) => item.delivered);
  const paymentComplete = payment.status === 'Pagata';

  const reasons: string[] = [];
  if (!itemsDelivered) reasons.push('Merce non ancora interamente consegnata');
  if (!paymentComplete) reasons.push('Pagamento non ancora completato');
  if (bill.status === 'Annullata') reasons.push('Vendita annullata');

  return {
    ready: itemsDelivered && paymentComplete && bill.status !== 'Annullata',
    itemsDelivered,
    paymentComplete,
    reasons,
  };
}
