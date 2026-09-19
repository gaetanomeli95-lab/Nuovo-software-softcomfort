/**
 * Tipi di dominio — derivati da API_SPEC.md e dalle risposte reali
 * del backend legacy. Rappresentano il contratto osservato, non la
 * struttura interna del backend (quella resta dietro l'adapter).
 */

/** Stati del workflow vendita osservati nel sistema legacy. */
export type SellingBillStatus =
  | 'Da Ordinare'
  | 'Ordinato'
  | 'Pronta'
  | 'Consegnata'
  | 'Chiusa'
  | 'Annullata';

export const SELLING_BILL_STATUSES: SellingBillStatus[] = [
  'Da Ordinare',
  'Ordinato',
  'Pronta',
  'Consegnata',
  'Chiusa',
  'Annullata',
];

/** Ordine canonico del workflow (Annullata è fuori flusso). */
export const SELLING_BILL_WORKFLOW: SellingBillStatus[] = [
  'Da Ordinare',
  'Ordinato',
  'Pronta',
  'Consegnata',
  'Chiusa',
];

export interface SellingBillItem {
  uuid: string;
  name: string;
  price: number;
  ordered: boolean;
  company: string;
  arrived: boolean;
  delivered: boolean;
}

export interface Deposit {
  uuid: string;
  /** ISO date yyyy-MM-dd */
  date: string;
  seller: string;
  /** es. "Contanti", "Pos" */
  method: string;
  amount: number;
  collected: boolean;
}

export interface Provision {
  uuid: string;
  seller: string;
  amount: number;
  payed: boolean;
}

export interface SellingBill {
  uuid: string;
  /** ISO date yyyy-MM-dd */
  date: string;
  seller: string;
  client: string;
  address: string;
  phone: string;
  status: SellingBillStatus;
  delivered: boolean;
  items: SellingBillItem[];
  transport: number;
  itemsPrice: number;
  totalPrice: number;
  settlement: number;
  assistance: boolean;
  notes: string;
  deposits: Deposit[];
  provision: Provision | null;
}

export interface BuyingBillItem {
  uuid: string;
  name: string;
  price?: number;
  [key: string]: unknown;
}

export type BuyingBillStatus = 'Aperta' | 'Chiusa' | 'Annullata' | string;

export interface BuyingBill {
  uuid: string;
  date: string;
  make: string | null;
  status: BuyingBillStatus;
  items: BuyingBillItem[];
}

export interface Check {
  uuid: string;
  make: string;
  /** ISO date */
  expireDate: string;
  amount: number;
  billNumbers: string | null;
}

/** Wrapper legacy: provvigione + riferimento al cliente/fattura. */
export interface ProvisionResponse {
  provision: Provision;
  client: string;
  /** uuid della fattura di vendita associata */
  uuid: string;
}

export interface ProvisionsResult {
  provisionResponses: ProvisionResponse[];
}

/** Wrapper legacy: acconto + riferimento al cliente/fattura. */
export interface DepositResponse {
  deposit: Deposit;
  client: string;
  /** uuid della fattura di vendita associata */
  uuid: string;
}

export interface DepositsResult {
  depositResponses: DepositResponse[];
}

/** Articolo di magazzino (giacenza). */
export interface InventoryItem {
  uuid: string;
  make: string;
  ref: string;
  name: string;
  bPrice: number;
  necks: string | null;
  location: string | null;
  delivered: boolean;
  quantity?: number;
}

/** Ordine in sospeso. */
export interface PendingOrder {
  uuid: string;
  name: string;
  price?: number;
  ordered?: boolean;
  company?: string;
  arrived?: boolean;
  delivered?: boolean;
  fAmount?: number;
  nfAmount?: number;
  [key: string]: unknown;
}

/* ---------- Auth ---------- */

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: 'Bearer';
  username: string;
  roles: string[];
}

export interface AuthUser {
  username: string;
  roles: string[];
  isAdmin: boolean;
}
