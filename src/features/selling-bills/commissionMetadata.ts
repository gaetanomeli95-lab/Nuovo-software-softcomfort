export type YesNo = 'yes' | 'no' | '';

export type MeasureSource = 'seller' | 'buyer' | '';

export interface CommissionMetadata {
  city: string;
  floor: string;
  staircase: string;
  elevator: YesNo;
  measureSource: MeasureSource;
  hoist: YesNo;
  attachments: YesNo;
  attachmentPages: number | null;
  scheduledDate: string;
  scheduledTime: string;
}

const META_PREFIX = '[[SC_COMMISSION_V1:';
const META_SUFFIX = ']]';

export function composeCommissionNotes(
  metadata: CommissionMetadata,
  visibleNotes: string,
): string {
  const serialized = JSON.stringify(metadata);
  const notes = visibleNotes.trim();

  return `${META_PREFIX}${serialized}${META_SUFFIX}${notes ? `\n${notes}` : ''}`;
}

export function parseCommissionNotes(notes: string | null | undefined): {
  metadata: CommissionMetadata | null;
  visibleNotes: string;
} {
  const value = notes ?? '';
  const firstLineEnd = value.indexOf('\n');
  const firstLine = firstLineEnd >= 0 ? value.slice(0, firstLineEnd) : value;

  if (!firstLine.startsWith(META_PREFIX) || !firstLine.endsWith(META_SUFFIX)) {
    return { metadata: null, visibleNotes: value };
  }

  try {
    const raw = firstLine.slice(META_PREFIX.length, -META_SUFFIX.length);
    const parsed = JSON.parse(raw) as Partial<CommissionMetadata>;

    const metadata: CommissionMetadata = {
      city: String(parsed.city ?? ''),
      floor: String(parsed.floor ?? ''),
      staircase: String(parsed.staircase ?? ''),
      elevator: parsed.elevator === 'yes' || parsed.elevator === 'no' ? parsed.elevator : '',
      measureSource:
        parsed.measureSource === 'seller' || parsed.measureSource === 'buyer'
          ? parsed.measureSource
          : '',
      hoist: parsed.hoist === 'yes' || parsed.hoist === 'no' ? parsed.hoist : '',
      attachments:
        parsed.attachments === 'yes' || parsed.attachments === 'no' ? parsed.attachments : '',
      attachmentPages:
        typeof parsed.attachmentPages === 'number' && Number.isFinite(parsed.attachmentPages)
          ? parsed.attachmentPages
          : null,
      scheduledDate: String(parsed.scheduledDate ?? ''),
      scheduledTime: String(parsed.scheduledTime ?? ''),
    };

    return {
      metadata,
      visibleNotes: firstLineEnd >= 0 ? value.slice(firstLineEnd + 1).trim() : '',
    };
  } catch {
    return { metadata: null, visibleNotes: value };
  }
}

export function yesNoLabel(value: YesNo): string {
  if (value === 'yes') return 'Sì';
  if (value === 'no') return 'No';
  return '—';
}

export function measureSourceLabel(value: MeasureSource): string {
  if (value === 'seller') return 'A carico del venditore';
  if (value === 'buyer') return "Comunicate dall'acquirente";
  return '—';
}
