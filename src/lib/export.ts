export function csvEscape(value: unknown): string {
  const text = value == null ? '' : String(value);
  if (/[;"\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(rows: Array<Array<unknown>>): string {
  return rows.map((row) => row.map(csvEscape).join(';')).join('\r\n');
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function sanitizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('39')) return digits;
  if (digits.startsWith('0')) return '';
  return `39${digits}`;
}

export function whatsappUrl(phone: string): string | null {
  const normalized = sanitizePhoneForWhatsApp(phone);
  return normalized ? `https://wa.me/${normalized}` : null;
}

function icsEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

function compactDate(value: string): string {
  return value.replace(/-/g, '');
}

function compactTime(value: string): string {
  return value.replace(':', '').padEnd(6, '0');
}

export interface IcsEvent {
  uid: string;
  date: string;
  time?: string;
  summary: string;
  description?: string;
  location?: string;
}

export function buildIcsCalendar(events: IcsEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Soft Comfort//Gestionale//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const event of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${icsEscape(event.uid)}`);
    lines.push(`DTSTAMP:${compactDate(new Date().toISOString().slice(0, 10))}T000000Z`);
    if (event.time) {
      lines.push(`DTSTART:${compactDate(event.date)}T${compactTime(event.time)}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${compactDate(event.date)}`);
    }
    lines.push(`SUMMARY:${icsEscape(event.summary)}`);
    if (event.description) lines.push(`DESCRIPTION:${icsEscape(event.description)}`);
    if (event.location) lines.push(`LOCATION:${icsEscape(event.location)}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
