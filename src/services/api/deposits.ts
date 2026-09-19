import { http } from './http';
import type { DepositsResult } from '@/types/domain';

export const depositsApi = {
  getCollected: (signal?: AbortSignal) =>
    http.get<DepositsResult>('/deposits/collected', signal),

  getToCollect: (signal?: AbortSignal) =>
    http.get<DepositsResult>('/deposits/toCollect', signal),

  setCollected: (uuid: string) =>
    http.patch<void>('/deposits/setCollected', { uuid }),
};
