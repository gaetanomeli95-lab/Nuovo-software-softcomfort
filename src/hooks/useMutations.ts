import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sellingBillsApi, type CreateSellingBillInput } from '@/services/api/sellingBills';
import { buyingBillsApi } from '@/services/api/buyingBills';
import { checksApi } from '@/services/api/checks';
import { depositsApi } from '@/services/api/deposits';
import { provisionsApi } from '@/services/api/provisions';
import { pendingApi } from '@/services/api/pending';
import { inventoryApi } from '@/services/api/inventory';
import { queryKeys } from '@/services/api/queryKeys';
import { ApiError } from '@/services/api/http';
import type { PendingOrder } from '@/types/domain';

function errMsg(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Operazione non riuscita';
}

function ok(msg: string) {
  toast.success(msg);
}
function ko(e: unknown) {
  toast.error(errMsg(e));
}

/* ==================== SellingBill ==================== */

/** Invalida dettaglio + lista vendite dopo una mutazione. */
function useInvalidateBill(uuid: string) {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: queryKeys.sellingBill(uuid) });
    void qc.invalidateQueries({ queryKey: queryKeys.sellingBills });
  };
}

export function useCreateSellingBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bill: CreateSellingBillInput) => sellingBillsApi.create(bill),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.sellingBills });
      void qc.invalidateQueries({ queryKey: queryKeys.depositsToCollect });
      void qc.invalidateQueries({ queryKey: queryKeys.depositsCollected });
      ok('Vendita creata');
    },
    onError: ko,
  });
}

export function useSetItemOrdered(uuid: string) {
  const invalidate = useInvalidateBill(uuid);
  return useMutation({
    mutationFn: ({ itemUUID, state }: { itemUUID: string; state: boolean }) =>
      sellingBillsApi.setOrdered(uuid, itemUUID, state),
    onSuccess: () => { invalidate(); },
    onError: ko,
  });
}

export function useSetItemArrived(uuid: string) {
  const invalidate = useInvalidateBill(uuid);
  return useMutation({
    mutationFn: ({ itemUUID, arrived }: { itemUUID: string; arrived: boolean }) =>
      sellingBillsApi.setArrived(uuid, itemUUID, arrived),
    onSuccess: () => { invalidate(); },
    onError: ko,
  });
}

export function useSetItemDelivered(uuid: string) {
  const invalidate = useInvalidateBill(uuid);
  return useMutation({
    mutationFn: ({ itemUUID, delivered }: { itemUUID: string; delivered: boolean }) =>
      sellingBillsApi.setDelivered(uuid, itemUUID, delivered),
    onSuccess: () => { invalidate(); },
    onError: ko,
  });
}

export function useSetItemCompany(uuid: string) {
  const invalidate = useInvalidateBill(uuid);
  return useMutation({
    mutationFn: ({ itemUUID, company }: { itemUUID: string; company: string }) =>
      sellingBillsApi.setCompany(uuid, itemUUID, company),
    onSuccess: () => { invalidate(); ok('Ditta aggiornata'); },
    onError: ko,
  });
}

export function useAddBillItem(uuid: string) {
  const invalidate = useInvalidateBill(uuid);
  return useMutation({
    mutationFn: (item: { name: string; price: number }) =>
      sellingBillsApi.addItem(uuid, item),
    onSuccess: () => { invalidate(); ok('Articolo aggiunto'); },
    onError: ko,
  });
}

export function useRemoveBillItem(uuid: string) {
  const invalidate = useInvalidateBill(uuid);
  return useMutation({
    mutationFn: (itemUUID: string) => sellingBillsApi.removeItem(uuid, itemUUID),
    onSuccess: () => { invalidate(); ok('Articolo rimosso'); },
    onError: ko,
  });
}

export function useSetAssistance(uuid: string) {
  const invalidate = useInvalidateBill(uuid);
  return useMutation({
    mutationFn: (isAssistance: boolean) => sellingBillsApi.setAssistance(uuid, isAssistance),
    onSuccess: () => { invalidate(); },
    onError: ko,
  });
}

export function useSetProvision(uuid: string) {
  const invalidate = useInvalidateBill(uuid);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => sellingBillsApi.setProvision(uuid),
    onSuccess: () => {
      invalidate();
      void qc.invalidateQueries({ queryKey: queryKeys.provisionsToPay });
      void qc.invalidateQueries({ queryKey: queryKeys.provisionsPayed });
      ok('Provvigione registrata');
    },
    onError: ko,
  });
}

export function useUpdateNotes(uuid: string) {
  const invalidate = useInvalidateBill(uuid);
  return useMutation({
    mutationFn: (notes: string) => sellingBillsApi.updateNotes(uuid, notes),
    onSuccess: () => { invalidate(); ok('Note aggiornate'); },
    onError: ko,
  });
}

export function useAddDeposit(uuid: string) {
  const invalidate = useInvalidateBill(uuid);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deposit: { date: string; seller: string; method: string; amount: number }) =>
      sellingBillsApi.addDeposit(uuid, deposit),
    onSuccess: () => {
      invalidate();
      void qc.invalidateQueries({ queryKey: queryKeys.depositsToCollect });
      void qc.invalidateQueries({ queryKey: queryKeys.depositsCollected });
      ok('Acconto registrato');
    },
    onError: ko,
  });
}

export function useRemoveDeposit(uuid: string) {
  const invalidate = useInvalidateBill(uuid);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => sellingBillsApi.removeDeposit(uuid, amount),
    onSuccess: () => {
      invalidate();
      void qc.invalidateQueries({ queryKey: queryKeys.depositsToCollect });
      void qc.invalidateQueries({ queryKey: queryKeys.depositsCollected });
      ok('Acconto rimosso');
    },
    onError: ko,
  });
}

export function useCancelBill(uuid: string) {
  const invalidate = useInvalidateBill(uuid);
  return useMutation({
    mutationFn: () => sellingBillsApi.cancel(uuid),
    onSuccess: () => { invalidate(); ok('Vendita annullata'); },
    onError: ko,
  });
}

export function useDeleteBill(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => sellingBillsApi.delete(uuid),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.sellingBills });
      ok('Vendita eliminata');
    },
    onError: ko,
  });
}

/* ==================== Deposits ==================== */

export function useSetDepositCollected() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => depositsApi.setCollected(uuid),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.depositsToCollect });
      void qc.invalidateQueries({ queryKey: queryKeys.depositsCollected });
      void qc.invalidateQueries({ queryKey: queryKeys.sellingBills });
      ok('Acconto incassato');
    },
    onError: ko,
  });
}

/* ==================== Provisions ==================== */

export function useSetProvisionPayed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => provisionsApi.setPayed(uuid),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.provisionsToPay });
      void qc.invalidateQueries({ queryKey: queryKeys.provisionsPayed });
      void qc.invalidateQueries({ queryKey: queryKeys.sellingBills });
      ok('Provvigione pagata');
    },
    onError: ko,
  });
}

/* ==================== Checks ==================== */

export function useAddCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (check: { make: string; expireDate: string; amount: number; billNumbers?: string }) =>
      checksApi.add(check),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.checks });
      ok('Assegno registrato');
    },
    onError: ko,
  });
}

export function useDeleteCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => checksApi.delete(uuid),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.checks });
      ok('Assegno eliminato');
    },
    onError: ko,
  });
}

/* ==================== Pending ==================== */

export function useAddPending() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => pendingApi.add(name),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.pending });
      ok('Ordine aggiunto');
    },
    onError: ko,
  });
}

export function useUpdatePending() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (order: Partial<PendingOrder> & { uuid: string }) => pendingApi.update(order),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.pending });
      ok('Ordine aggiornato');
    },
    onError: ko,
  });
}

export function useDeletePending() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => pendingApi.delete(uuid),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.pending });
      ok('Ordine eliminato');
    },
    onError: ko,
  });
}

/* ==================== BuyingBills ==================== */

export function useAddBuyingBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bill: { make: string; totalPrice: number; payed: number; itemsRequest: unknown[] }) =>
      buyingBillsApi.add(bill),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.buyingBills });
      ok('Fattura di acquisto creata');
    },
    onError: ko,
  });
}

export function useAddBuyingPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, payment }: { uuid: string; payment: number }) =>
      buyingBillsApi.addPayment(uuid, payment),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.buyingBills });
      ok('Pagamento registrato');
    },
    onError: ko,
  });
}

export function useDeleteBuyingBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => buyingBillsApi.delete(uuid),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.buyingBills });
      ok('Vendita eliminata');
    },
    onError: ko,
  });
}

/* ==================== Inventory ==================== */

export function useAddInventoryItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: Record<string, unknown>[]) => inventoryApi.add(items),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.inventoryAvailable });
      ok('Articoli aggiunti a magazzino');
    },
    onError: ko,
  });
}

export function useSetItemLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, location }: { uuid: string; location: string }) =>
      inventoryApi.updateLocation(uuid, location),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.inventoryAvailable });
      void qc.invalidateQueries({ queryKey: queryKeys.inventoryDelivered });
      ok('Posizione aggiornata');
    },
    onError: ko,
  });
}

export function useSetInventoryName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, name }: { uuid: string; name: string }) =>
      inventoryApi.updateName(uuid, name),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.inventoryAvailable });
      void qc.invalidateQueries({ queryKey: queryKeys.inventoryDelivered });
      ok('Nome articolo aggiornato');
    },
    onError: ko,
  });
}

export function useSetInventoryRef() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, ref }: { uuid: string; ref: string }) =>
      inventoryApi.updateRef(uuid, ref),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.inventoryAvailable });
      void qc.invalidateQueries({ queryKey: queryKeys.inventoryDelivered });
      ok('Riferimento aggiornato');
    },
    onError: ko,
  });
}

export function useSetInventoryDelivered() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => inventoryApi.updateDelivered(uuid),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.inventoryAvailable });
      void qc.invalidateQueries({ queryKey: queryKeys.inventoryDelivered });
      ok('Articolo consegnato');
    },
    onError: ko,
  });
}
