import { http } from './http';
import type { ProvisionsResult } from '@/types/domain';

export const provisionsApi = {
  getPayed: (signal?: AbortSignal) =>
    http.get<ProvisionsResult>('/provisions/payed', signal),

  getToPay: (signal?: AbortSignal) =>
    http.get<ProvisionsResult>('/provisions/toPay', signal),

  setPayed: (uuid: string) =>
    http.patch<void>('/provisions/setPayed', { uuid }),
};
