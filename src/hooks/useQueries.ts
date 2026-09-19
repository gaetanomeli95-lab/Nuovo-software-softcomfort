import { useQuery } from '@tanstack/react-query';
import { sellingBillsApi } from '@/services/api/sellingBills';
import { buyingBillsApi } from '@/services/api/buyingBills';
import { inventoryApi } from '@/services/api/inventory';
import { checksApi } from '@/services/api/checks';
import { depositsApi } from '@/services/api/deposits';
import { provisionsApi } from '@/services/api/provisions';
import { pendingApi } from '@/services/api/pending';
import { queryKeys } from '@/services/api/queryKeys';

export function useSellingBills() {
  return useQuery({
    queryKey: queryKeys.sellingBills,
    queryFn: ({ signal }) => sellingBillsApi.getAll(signal),
  });
}

export function useSellingBill(uuid: string | undefined) {
  return useQuery({
    queryKey: queryKeys.sellingBill(uuid ?? ''),
    queryFn: ({ signal }) => sellingBillsApi.getById(uuid!, signal),
    enabled: Boolean(uuid),
  });
}

export function useBuyingBills() {
  return useQuery({
    queryKey: queryKeys.buyingBills,
    queryFn: ({ signal }) => buyingBillsApi.getAll(signal),
  });
}

export function useInventoryAvailable() {
  return useQuery({
    queryKey: queryKeys.inventoryAvailable,
    queryFn: ({ signal }) => inventoryApi.getAllAvailable(signal),
  });
}

export function useChecks() {
  return useQuery({
    queryKey: queryKeys.checks,
    queryFn: ({ signal }) => checksApi.getAll(signal),
  });
}

export function useDepositsToCollect() {
  return useQuery({
    queryKey: queryKeys.depositsToCollect,
    queryFn: ({ signal }) => depositsApi.getToCollect(signal),
  });
}

export function useDepositsCollected() {
  return useQuery({
    queryKey: queryKeys.depositsCollected,
    queryFn: ({ signal }) => depositsApi.getCollected(signal),
  });
}

export function useProvisionsToPay() {
  return useQuery({
    queryKey: queryKeys.provisionsToPay,
    queryFn: ({ signal }) => provisionsApi.getToPay(signal),
  });
}

export function useProvisionsPayed() {
  return useQuery({
    queryKey: queryKeys.provisionsPayed,
    queryFn: ({ signal }) => provisionsApi.getPayed(signal),
  });
}

export function useBuyingBill(uuid: string | undefined) {
  return useQuery({
    queryKey: queryKeys.buyingBill(uuid ?? ''),
    queryFn: ({ signal }) => buyingBillsApi.getById(uuid!, signal),
    enabled: Boolean(uuid),
  });
}

export function useInventoryDelivered() {
  return useQuery({
    queryKey: queryKeys.inventoryDelivered,
    queryFn: ({ signal }) => inventoryApi.getDelivered(signal),
  });
}

export function usePendingOrders() {
  return useQuery({
    queryKey: queryKeys.pending,
    queryFn: ({ signal }) => pendingApi.getAll(signal),
  });
}
