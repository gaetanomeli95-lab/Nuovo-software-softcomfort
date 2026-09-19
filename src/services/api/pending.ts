import { http } from './http';
import type { PendingOrder } from '@/types/domain';

export const pendingApi = {
  getAll: (signal?: AbortSignal) =>
    http.get<PendingOrder[]>('/pending/all', signal),

  getById: (uuid: string, signal?: AbortSignal) =>
    http.get<PendingOrder>(`/pending/${uuid}`, signal),

  add: (name: string) =>
    http.post<void>('/pending/add', { name }),

  update: (order: Partial<PendingOrder> & { uuid: string }) =>
    http.post<void>('/pending/update', order),

  delete: (uuid: string) =>
    http.delete<void>(`/pending/delete/${uuid}`),
};
