import type { SellingBill } from '@/types/domain';
import { formatCurrency, formatDate } from '@/lib/format';
import { PrintBrandHeader } from './PrintBrandHeader';
import { getPaymentSummary } from './paymentStatus';
import { getSellingItemView } from './sellingItemView';
import {
  measureSourceLabel,
  parseCommissionNotes,
  yesNoLabel,
} from './commissionMetadata';

function Cell({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`border border-[#555] px-2.5 py-2 ${className}`}>
      <p className="text-[7px] font-black uppercase tracking-[0.08em] text-[#555]">{label}</p>
      <p className="mt-0.5 min-h-[14px] text-[9.5px] font-bold text-[#171717]">{value || '—'}</p>
    </div>
  );
}

export function CommissionPrintDocument({ bill }: { bill: SellingBill }) {
  const parsed = parseCommissionNotes(bill.notes);
  const metadata = parsed.metadata;
  const payment = getPaymentSummary(bill);

  return (
    <main className="print-sheet mx-auto my-6 min-h-[297mm] w-[210mm] bg-white px-[12mm] py-[9mm] text-[#202020] shadow-[0_24px_70px_rgba(50,37,31,0.14)]">
      <PrintBrandHeader />

      <div className="mt-3 flex items-end justify-between border-b-[3px] border-[#333] pb-2">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[#555]">Modulo commerciale</p>
          <h1 className="mt-1 text-[18px] font-black uppercase tracking-[0.035em]">Proposta di commissione</h1>
        </div>
        <p className="text-right text-[8px] font-bold leading-relaxed text-[#444]">
          Rif. {bill.uuid.slice(0, 8).toUpperCase()}<br />
          Data {formatDate(bill.date)}
        </p>
      </div>

      <section className="mt-3 grid grid-cols-4">
        <Cell label="Cliente" value={bill.client} className="col-span-2" />
        <Cell label="Cellulare" value={bill.phone} />
        <Cell label="Venditore" value={bill.seller} />
        <Cell label="Indirizzo di consegna" value={bill.address} className="col-span-2" />
        <Cell label="Città" value={metadata?.city ?? ''} />
        <Cell
          label="Piano / Scala"
          value={[
            metadata?.floor ? `Piano ${metadata.floor}` : '',
            metadata?.staircase ? `Scala ${metadata.staircase}` : '',
          ].filter(Boolean).join(' · ')}
        />
        <Cell label="Ascensore" value={metadata ? yesNoLabel(metadata.elevator) : '—'} />
        <Cell label="Autoscala" value={metadata ? yesNoLabel(metadata.hoist) : '—'} />
        <Cell
          label="Misure"
          value={metadata ? measureSourceLabel(metadata.measureSource) : '—'}
          className="col-span-2"
        />
        <Cell
          label="Allegati / disegni"
          value={
            metadata
              ? `${yesNoLabel(metadata.attachments)}${metadata.attachments === 'yes' && metadata.attachmentPages !== null ? ` · ${metadata.attachmentPages} pag.` : ''}`
              : '—'
          }
          className="col-span-2"
        />
        <Cell
          label="Consegna programmata"
          value={[
            metadata?.scheduledDate ? formatDate(metadata.scheduledDate) : '',
            metadata?.scheduledTime ? `ore ${metadata.scheduledTime}` : '',
          ].filter(Boolean).join(' · ')}
          className="col-span-2"
        />
      </section>

      <section className="mt-4">
        <div className="border-2 border-[#333] bg-[#e7e7e7] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.09em]">
          Articoli
        </div>
        <table className="w-full border-collapse text-[9px]">
          <thead>
            <tr className="bg-[#ededed]">
              <th className="border border-[#555] px-2 py-2 text-left">Articolo</th>
              <th className="w-[12%] border border-[#555] px-2 py-2 text-center">Q.tà</th>
              <th className="w-[20%] border border-[#555] px-2 py-2 text-right">Prezzo unit.</th>
              <th className="w-[20%] border border-[#555] px-2 py-2 text-right">Totale</th>
            </tr>
          </thead>
          <tbody>
            {(bill.items ?? []).map((item) => {
              const view = getSellingItemView(item);
              return (
                <tr key={item.uuid}>
                  <td className="border border-[#666] px-2 py-2 font-semibold">
                    {view.code ? `${view.code} · ` : ''}{view.description}
                  </td>
                  <td className="border border-[#666] px-2 py-2 text-center font-bold">{view.quantity}</td>
                  <td className="border border-[#666] px-2 py-2 text-right">{formatCurrency(view.unitPrice)}</td>
                  <td className="border border-[#666] px-2 py-2 text-right font-bold">{formatCurrency(view.lineTotal)}</td>
                </tr>
              );
            })}
            {Array.from({ length: Math.max(0, 5 - (bill.items?.length ?? 0)) }).map((_, index) => (
              <tr key={`blank-${index}`}>
                <td className="h-[31px] border border-[#666] px-2 py-2">&nbsp;</td>
                <td className="border border-[#666] px-2 py-2">&nbsp;</td>
                <td className="border border-[#666] px-2 py-2">&nbsp;</td>
                <td className="border border-[#666] px-2 py-2">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-4 grid grid-cols-[1fr_68mm] gap-4">
        <div>
          <div className="border-2 border-[#333] bg-[#e7e7e7] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.09em]">
            Note
          </div>
          <div className="min-h-[44mm] border-x-2 border-b-2 border-[#333] px-3 py-2 text-[9px] leading-relaxed">
            {parsed.visibleNotes || '—'}
          </div>
        </div>

        <div className="border-2 border-[#333]">
          <div className="bg-[#e7e7e7] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.09em]">
            Riepilogo
          </div>
          <dl className="space-y-2 px-3 py-3 text-[9.5px]">
            <div className="flex justify-between gap-3">
              <dt>Totale merce</dt>
              <dd className="font-bold">{formatCurrency(bill.itemsPrice)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Trasporto e montaggio</dt>
              <dd className="font-bold">{formatCurrency(bill.transport)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-[#999] pt-2">
              <dt className="font-black">Totale fornitura</dt>
              <dd className="font-black">{formatCurrency(bill.totalPrice)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Acconto confirmatorio</dt>
              <dd className="font-bold">{formatCurrency(payment.paidTotal)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t-2 border-[#444] pt-2 text-[11px]">
              <dt className="font-black uppercase">Saldo alla consegna</dt>
              <dd className="font-black">{formatCurrency(payment.balance)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mt-5 border-2 border-[#444] px-3 py-2 text-[7px] leading-[1.45] text-[#2f2f2f]">
        <p className="font-bold">
          Il presente modulo riepiloga la proposta commerciale e le informazioni operative registrate nel gestionale.
        </p>
        <p className="mt-1">
          Condizioni contrattuali, trattamento dei dati personali ed eventuali allegati restano regolati dalla documentazione sottoscritta tra le parti.
        </p>
      </section>

      <section className="mt-8 grid grid-cols-2 gap-12 text-[9px]">
        <div>
          <p className="font-bold">Impresa venditrice</p>
          <div className="mt-7 border-b-2 border-[#555]" />
        </div>
        <div>
          <p className="font-bold">Acquirente</p>
          <div className="mt-7 border-b-2 border-[#555]" />
        </div>
      </section>
    </main>
  );
}
