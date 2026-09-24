import type { SellingBillItem } from '@/types/domain';

export interface SellingItemView {
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  structured: boolean;
}

const QTY_RE = /^Q\.t[aà]\s+(\d+)$/i;
const CODE_RE = /^Art\.\s+(.+)$/i;

/**
 * Decodifica il formato compatibile usato dal frontend moderno:
 * "Art. CODICE · Descrizione · Q.tà 2".
 *
 * Le righe legacy senza metadata restano perfettamente leggibili
 * con quantità 1 e prezzo unitario uguale al totale riga.
 */
export function getSellingItemView(item: SellingBillItem): SellingItemView {
  const raw = item.name?.trim() ?? '';
  const parts = raw.split('·').map((part) => part.trim()).filter(Boolean);

  let code = '';
  let quantity = 1;
  const descriptionParts: string[] = [];
  let structured = false;

  for (const part of parts) {
    const codeMatch = part.match(CODE_RE);
    if (codeMatch) {
      code = codeMatch[1].trim();
      structured = true;
      continue;
    }

    const qtyMatch = part.match(QTY_RE);
    if (qtyMatch) {
      quantity = Math.max(1, Number(qtyMatch[1]));
      structured = true;
      continue;
    }

    descriptionParts.push(part);
  }

  const description = structured
    ? descriptionParts.join(' · ') || raw
    : raw;

  const lineTotal = Math.max(0, Number(item.price ?? 0));
  const unitPrice = quantity > 0 ? lineTotal / quantity : lineTotal;

  return {
    code,
    description,
    quantity,
    unitPrice,
    lineTotal,
    structured,
  };
}
