import { http } from './http';
import type { SellingBill } from '@/types/domain';

export interface CreateSellingBillInput {
  date: string;
  seller: string;
  client: string;
  address: string;
  phone: string;
  items: Array<{ name: string; price: number }>;
  method: string;
  transport: number;
  itemsPrice: number;
  totalPrice: number;
  settlement: number;
  /** Note operative da salvare dopo la creazione senza alterare il contratto legacy di /sellingBill/add. */
  notes?: string;
}

/**
 * Adapter fatture di vendita. Mappa gli endpoint legacy
 * (/sellingBill/*) su un'interfaccia pulita per la UI.
 */
export const sellingBillsApi = {
  getAll: (signal?: AbortSignal) =>
    http.get<SellingBill[]>('/sellingBill/getAll', signal),

  getById: (uuid: string, signal?: AbortSignal) =>
    http.get<SellingBill>(`/sellingBill/${uuid}`, signal),

  create: async (bill: CreateSellingBillInput) => {
    const { notes, ...legacyPayload } = bill;
    const created = await http.post<SellingBill | undefined>('/sellingBill/add', legacyPayload);

    // Il backend legacy non espone i nuovi campi logistici come proprietà dedicate.
    // Li conserviamo nel campo note con un formato compatibile e reversibile,
    // senza inviare proprietà sconosciute al DTO di creazione.
    if (created?.uuid && notes) {
      await http.patch<void>('/sellingBill/updateNotes', {
        uuid: created.uuid,
        notes,
      });
      return { ...created, notes };
    }

    return created;
  },

  /* --- operazioni di scrittura (fasi successive) --- */

  addItem: (uuid: string, item: { name: string; price: number }) =>
    http.patch<void>(`/sellingBill/addItem`, { uuid, ...item }),

  removeItem: (uuid: string, itemUUID: string) =>
    http.patch<void>(`/sellingBill/removeItem`, { uuid, itemUUID }),

  setOrdered: (uuid: string, itemUUID: string, state: boolean) =>
    http.patch<void>(`/sellingBill/setOrdered`, { uuid, itemUUID, state }),

  setArrived: (uuid: string, itemUUID: string, arrived: boolean) =>
    http.patch<void>(`/sellingBill/setArrived`, { uuid, itemUUID, arrived }),

  setDelivered: (uuid: string, itemUUID: string, delivered: boolean) =>
    http.patch<void>(`/sellingBill/setDelivered`, { uuid, itemUUID, delivered }),

  setCompany: (uuid: string, itemUUID: string, company: string) =>
    http.patch<void>(`/sellingBill/setCompany`, { uuid, itemUUID, company }),

  setAssistance: (uuid: string, isAssistance: boolean) =>
    http.patch<void>(`/sellingBill/setAssistance`, { uuid, isAssistance }),

  setProvision: (uuid: string) =>
    http.patch<void>(`/sellingBill/setProvision`, { uuid }),

  updateNotes: (uuid: string, notes: string) =>
    http.patch<void>(`/sellingBill/updateNotes`, { uuid, notes }),

  addDeposit: (uuid: string, deposit: { date: string; seller: string; method: string; amount: number }) =>
    http.post<void>(`/sellingBill/addDeposit`, { uuid, ...deposit }),

  removeDeposit: (uuid: string, amount: number) =>
    http.patch<void>(`/sellingBill/removeDeposit`, { amount, uuid }),

  cancel: (uuid: string) =>
    http.put<void>(`/sellingBill/cancel`, { uuid }),

  delete: (uuid: string) =>
    http.delete<void>(`/sellingBill/delete/${uuid}`),
};
