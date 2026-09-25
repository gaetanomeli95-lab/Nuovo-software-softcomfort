import type { MeasureSource, YesNo } from './commissionMetadata';

export const NEW_SALE_DRAFT_KEY = 'softcomfort:new-sale-draft:v1';

export interface SaleDraftItem {
  id: string;
  code: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

export interface NewSaleDraft {
  version: 1;
  savedAt: string;
  date: string;
  seller: string;
  client: string;
  phone: string;
  address: string;
  city: string;
  floor: string;
  staircase: string;
  elevator: YesNo;
  measureSource: MeasureSource;
  hoist: YesNo;
  attachments: YesNo;
  attachmentPages: string;
  scheduledDate: string;
  scheduledTime: string;
  notes: string;
  transport: string;
  settlement: string;
  method: string;
  items: SaleDraftItem[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function parseNewSaleDraft(raw: string | null): NewSaleDraft | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== 1 || !Array.isArray(parsed.items)) return null;

    const items = parsed.items.filter(isRecord).map((item, index) => ({
      id: typeof item.id === 'string' ? item.id : 'restored-' + index,
      code: typeof item.code === 'string' ? item.code : '',
      description: typeof item.description === 'string' ? item.description : '',
      quantity: typeof item.quantity === 'string' ? item.quantity : '1',
      unitPrice: typeof item.unitPrice === 'string' ? item.unitPrice : '',
    }));

    const stringValue = (key: string, fallback = '') =>
      typeof parsed[key] === 'string' ? parsed[key] as string : fallback;

    const yesNoValue = (key: string): YesNo => {
      const value = parsed[key];
      return value === 'yes' || value === 'no' ? value : '';
    };

    const measureValue = (): MeasureSource => {
      const value = parsed.measureSource;
      return value === 'seller' || value === 'buyer' ? value : '';
    };

    return {
      version: 1,
      savedAt: stringValue('savedAt'),
      date: stringValue('date'),
      seller: stringValue('seller'),
      client: stringValue('client'),
      phone: stringValue('phone'),
      address: stringValue('address'),
      city: stringValue('city'),
      floor: stringValue('floor'),
      staircase: stringValue('staircase'),
      elevator: yesNoValue('elevator'),
      measureSource: measureValue(),
      hoist: yesNoValue('hoist'),
      attachments: yesNoValue('attachments'),
      attachmentPages: stringValue('attachmentPages'),
      scheduledDate: stringValue('scheduledDate'),
      scheduledTime: stringValue('scheduledTime'),
      notes: stringValue('notes'),
      transport: stringValue('transport', '0'),
      settlement: stringValue('settlement', '0'),
      method: stringValue('method', 'Contanti'),
      items: items.length > 0 ? items : [{
        id: 'restored-0',
        code: '',
        description: '',
        quantity: '1',
        unitPrice: '',
      }],
    };
  } catch {
    return null;
  }
}

export function isMeaningfulNewSaleDraft(draft: NewSaleDraft): boolean {
  return Boolean(
    draft.client.trim() ||
    draft.phone.trim() ||
    draft.address.trim() ||
    draft.city.trim() ||
    draft.notes.trim() ||
    draft.scheduledDate ||
    draft.items.some((item) =>
      item.code.trim() ||
      item.description.trim() ||
      item.unitPrice.trim(),
    ),
  );
}

export function loadNewSaleDraft(): NewSaleDraft | null {
  if (typeof window === 'undefined') return null;
  return parseNewSaleDraft(window.localStorage.getItem(NEW_SALE_DRAFT_KEY));
}

export function saveNewSaleDraft(draft: NewSaleDraft) {
  if (typeof window === 'undefined') return;
  if (!isMeaningfulNewSaleDraft(draft)) {
    window.localStorage.removeItem(NEW_SALE_DRAFT_KEY);
    return;
  }
  window.localStorage.setItem(NEW_SALE_DRAFT_KEY, JSON.stringify(draft));
}

export function clearNewSaleDraft() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(NEW_SALE_DRAFT_KEY);
}
