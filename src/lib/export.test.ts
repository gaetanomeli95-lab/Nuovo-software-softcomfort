import { describe, expect, it } from 'vitest';
import { buildIcsCalendar, csvEscape, sanitizePhoneForWhatsApp, toCsv } from './export';

describe('export utilities', () => {
  it('escapes csv safely with semicolon delimiter', () => {
    expect(csvEscape('A;B')).toBe('"A;B"');
    expect(csvEscape('A"B')).toBe('"A""B"');
    expect(toCsv([['Cliente', 'Totale'], ['Mario Rossi', 1200]])).toContain('Mario Rossi;1200');
  });

  it('normalizes Italian mobile numbers for WhatsApp', () => {
    expect(sanitizePhoneForWhatsApp('392 995 2453')).toBe('393929952453');
    expect(sanitizePhoneForWhatsApp('+39 392 995 2453')).toBe('393929952453');
    expect(sanitizePhoneForWhatsApp('091 123 4567')).toBe('');
  });

  it('builds a minimal calendar export', () => {
    const ics = buildIcsCalendar([{
      uid: 'sale-1@softcomfort',
      date: '2026-09-25',
      time: '10:30',
      summary: 'Consegna Rossi',
      location: 'Palermo',
    }]);

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('DTSTART:20260925T103000');
    expect(ics).toContain('SUMMARY:Consegna Rossi');
    expect(ics).toContain('LOCATION:Palermo');
  });
});
