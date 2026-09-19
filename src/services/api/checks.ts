import { http } from './http';
import type { Check } from '@/types/domain';

export const checksApi = {
  getAll: (signal?: AbortSignal) =>
    http.get<Check[]>('/checks/all', signal),

  add: (check: { make: string; expireDate: string; amount: number; billNumbers?: string }) =>
    http.post<void>('/checks/add', check),

  delete: (uuid: string) =>
    http.delete<void>(`/checks/delete/${uuid}`),
};
