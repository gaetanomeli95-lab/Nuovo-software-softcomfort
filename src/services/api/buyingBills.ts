import { http } from './http';
import type { BuyingBill } from '@/types/domain';

export const buyingBillsApi = {
  getAll: (signal?: AbortSignal) =>
    http.get<BuyingBill[]>('/buyingBill/getAll', signal),

  getById: (uuid: string, signal?: AbortSignal) =>
    http.get<BuyingBill>(`/buyingBill/${uuid}`, signal),

  add: (bill: { make: string; totalPrice: number; payed: number; itemsRequest: unknown[] }) =>
    http.post<void>('/buyingBill/add', bill),

  addPayment: (uuid: string, payment: number) =>
    http.post<void>('/buyingBill/addPayment', { payment, uuid }),

  delete: (uuid: string) =>
    http.delete<void>(`/buyingBill/delete/${uuid}`),
};
