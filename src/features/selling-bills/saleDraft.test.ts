import { describe, expect, it } from 'vitest';
import {
  isMeaningfulNewSaleDraft,
  parseNewSaleDraft,
  type NewSaleDraft,
} from './saleDraft';

function baseDraft(): NewSaleDraft {
  return {
    version: 1,
    savedAt: '2026-09-25T00:00:00.000Z',
    date: '2026-09-25',
    seller: 'Stefania',
    client: '',
    phone: '',
    address: '',
    city: '',
    floor: '',
    staircase: '',
    elevator: '',
    measureSource: '',
    hoist: '',
    attachments: '',
    attachmentPages: '',
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
    transport: '0',
    settlement: '0',
    method: 'Contanti',
    items: [{ id: '1', code: '', description: '', quantity: '1', unitPrice: '' }],
  };
}

describe('new sale draft persistence', () => {
  it('parses a valid draft and preserves item data', () => {
    const draft = baseDraft();
    draft.client = 'Mario Rossi';
    draft.items[0].description = 'Divano';

    const parsed = parseNewSaleDraft(JSON.stringify(draft));

    expect(parsed?.client).toBe('Mario Rossi');
    expect(parsed?.items[0].description).toBe('Divano');
  });

  it('rejects malformed or incompatible drafts', () => {
    expect(parseNewSaleDraft(null)).toBeNull();
    expect(parseNewSaleDraft('{broken')).toBeNull();
    expect(parseNewSaleDraft(JSON.stringify({ version: 2, items: [] }))).toBeNull();
  });

  it('does not keep an untouched empty form as a meaningful draft', () => {
    expect(isMeaningfulNewSaleDraft(baseDraft())).toBe(false);

    const draft = baseDraft();
    draft.phone = '3929952453';
    expect(isMeaningfulNewSaleDraft(draft)).toBe(true);
  });
});
