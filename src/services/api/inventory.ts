import { http } from './http';
import type { InventoryItem } from '@/types/domain';

export const inventoryApi = {
  getAllAvailable: (signal?: AbortSignal) =>
    http.get<InventoryItem[]>('/item/getAllAvailable', signal),

  getDelivered: (signal?: AbortSignal) =>
    http.get<InventoryItem[]>('/item/getDelivered', signal),

  add: (items: Partial<InventoryItem>[]) =>
    http.post<void>('/item/add', { items }),

  updateDelivered: (uuid: string) =>
    http.put<void>('/item/updateDelivered', { uuid }),

  updateLocation: (uuid: string, location: string) =>
    http.put<void>('/item/updateLocation', { uuid, location }),

  updateName: (uuid: string, name: string) =>
    http.put<void>('/item/updateName', { uuid, name }),

  updateRef: (uuid: string, ref: string) =>
    http.put<void>('/item/updateRef', { uuid, ref }),
};
