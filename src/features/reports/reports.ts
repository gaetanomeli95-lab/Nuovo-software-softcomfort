import type { SellingBill } from '@/types/domain';
import { getPaymentSummary } from '@/features/selling-bills/paymentStatus';
import { getSellingItemView } from '@/features/selling-bills/sellingItemView';

export interface SalesReportFilters {
  dateFrom: string;
  dateTo: string;
  seller: string;
}

export interface SellerReportRow {
  seller: string;
  salesCount: number;
  revenue: number;
  collected: number;
  outstanding: number;
  averageTicket: number;
}

export interface ProductReportRow {
  key: string;
  label: string;
  quantity: number;
  revenue: number;
  salesCount: number;
}

export interface SalesReport {
  bills: SellingBill[];
  salesCount: number;
  revenue: number;
  collected: number;
  outstanding: number;
  averageTicket: number;
  sellers: SellerReportRow[];
  products: ProductReportRow[];
}

function inRange(date: string, from: string, to: string) {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function buildSalesReport(
  bills: SellingBill[],
  filters: SalesReportFilters,
): SalesReport {
  const active = bills.filter((bill) =>
    bill.status !== 'Annullata' &&
    inRange(bill.date ?? '', filters.dateFrom, filters.dateTo) &&
    (!filters.seller || bill.seller === filters.seller));

  let revenue = 0;
  let collected = 0;
  let outstanding = 0;

  const sellerMap = new Map<string, {
    salesCount: number;
    revenue: number;
    collected: number;
    outstanding: number;
  }>();

  const productMap = new Map<string, {
    label: string;
    quantity: number;
    revenue: number;
    billIds: Set<string>;
  }>();

  for (const bill of active) {
    const total = Math.max(0, Number(bill.totalPrice ?? 0));
    const payment = getPaymentSummary(bill);
    revenue += total;
    collected += payment.paidTotal;
    outstanding += payment.balance;

    const seller = bill.seller?.trim() || 'N/D';
    const sellerRow = sellerMap.get(seller) ?? {
      salesCount: 0,
      revenue: 0,
      collected: 0,
      outstanding: 0,
    };
    sellerRow.salesCount += 1;
    sellerRow.revenue += total;
    sellerRow.collected += payment.paidTotal;
    sellerRow.outstanding += payment.balance;
    sellerMap.set(seller, sellerRow);

    for (const item of bill.items ?? []) {
      const view = getSellingItemView(item);
      const label = [view.code, view.description].filter(Boolean).join(' · ') || item.name || 'Articolo';
      const key = label.trim().toLocaleUpperCase('it');
      const row = productMap.get(key) ?? {
        label,
        quantity: 0,
        revenue: 0,
        billIds: new Set<string>(),
      };
      row.quantity += view.quantity;
      row.revenue += view.lineTotal;
      row.billIds.add(bill.uuid);
      productMap.set(key, row);
    }
  }

  const sellers = [...sellerMap.entries()]
    .map(([seller, row]) => ({
      seller,
      ...row,
      averageTicket: row.salesCount > 0 ? row.revenue / row.salesCount : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const products = [...productMap.entries()]
    .map(([key, row]) => ({
      key,
      label: row.label,
      quantity: row.quantity,
      revenue: row.revenue,
      salesCount: row.billIds.size,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    bills: active,
    salesCount: active.length,
    revenue,
    collected,
    outstanding,
    averageTicket: active.length > 0 ? revenue / active.length : 0,
    sellers,
    products,
  };
}

export function uniqueReportSellers(bills: SellingBill[]) {
  return [...new Set(
    bills
      .filter((bill) => bill.status !== 'Annullata')
      .map((bill) => bill.seller?.trim())
      .filter((seller): seller is string => Boolean(seller)),
  )].sort((a, b) => a.localeCompare(b, 'it'));
}
