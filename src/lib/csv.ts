export type CsvCell = string | number | boolean | null | undefined;

function escapeCell(value: CsvCell): string {
  const text = value == null ? '' : String(value);
  if (/[;"\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(
  headers: string[],
  rows: CsvCell[][],
): string {
  const lines = [
    headers.map(escapeCell).join(';'),
    ...rows.map((row) => row.map(escapeCell).join(';')),
  ];
  return '\uFEFF' + lines.join('\r\n');
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: CsvCell[][],
) {
  const blob = new Blob([toCsv(headers, rows)], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
