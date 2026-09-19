/** Chiavi TanStack Query centralizzate. */
export const queryKeys = {
  sellingBills: ['sellingBills'] as const,
  sellingBill: (uuid: string) => ['sellingBills', uuid] as const,
  buyingBills: ['buyingBills'] as const,
  buyingBill: (uuid: string) => ['buyingBills', uuid] as const,
  inventoryAvailable: ['inventory', 'available'] as const,
  inventoryDelivered: ['inventory', 'delivered'] as const,
  checks: ['checks'] as const,
  depositsCollected: ['deposits', 'collected'] as const,
  depositsToCollect: ['deposits', 'toCollect'] as const,
  provisionsPayed: ['provisions', 'payed'] as const,
  provisionsToPay: ['provisions', 'toPay'] as const,
  pending: ['pending'] as const,
};
