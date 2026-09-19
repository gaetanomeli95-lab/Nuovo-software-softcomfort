import { formatCurrency, formatDate } from '@/lib/format';
import { SOFT_COMFORT_COMPANY } from '@/config/company';
import { getPaymentSummary } from './paymentStatus';
import { PrintBrandHeader } from './PrintBrandHeader';
import type { SellingBill } from '@/types/domain';

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-1 inline-flex items-center gap-2 border-2 border-[#4a4a4a] bg-[#e5e5e5] px-2.5 py-1 text-[10px] font-extrabold tracking-[0.04em] text-[#1f1f1f]">
      <span className="inline-block h-3.5 w-[4px] bg-[#9f1018]" />
      {children}
    </div>
  );
}

export function FamiliarSalesDocument({ bill }: { bill: SellingBill }) {
  const payment = getPaymentSummary(bill);
  const deposits = bill.deposits ?? [];
  const ref = bill.uuid.slice(0, 8).toUpperCase();

  return (
    <main className="print-sheet mx-auto my-6 min-h-[297mm] w-[210mm] bg-white px-[13mm] py-[10mm] text-[#202020] shadow-[0_24px_70px_rgba(50,37,31,0.14)]">
      <PrintBrandHeader />

      <section className="mt-3 grid grid-cols-[1fr_126px] items-center gap-5">
        <div className="flex justify-end">
          <div className="w-[112mm] border-2 border-[#404040] bg-white px-7 py-5 text-center text-[10px] leading-[1.55]">
            <div className="mb-2 inline-block border-b-[3px] border-[#9f1018] pb-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#1e1e1e]">
              Documento di vendita
            </div>

            <dl className="space-y-1">
              <div>
                <dt className="inline font-bold">Data: </dt>
                <dd className="inline">{formatDate(bill.date)}</dd>
              </div>
              <div>
                <dt className="inline font-bold">Cliente: </dt>
                <dd className="inline font-extrabold">{bill.client || '—'}</dd>
              </div>
              <div>
                <dt className="inline font-bold">Indirizzo: </dt>
                <dd className="inline">{bill.address || '—'}</dd>
              </div>
              <div>
                <dt className="inline font-bold">Recapito: </dt>
                <dd className="inline">{bill.phone || '—'}</dd>
              </div>
              <div>
                <dt className="inline font-bold">Venditore: </dt>
                <dd className="inline font-bold">{bill.seller || '—'}</dd>
              </div>

              <div className="h-1.5" />

              <div>
                <dt className="inline font-bold">Totale merce: </dt>
                <dd className="inline">{formatCurrency(bill.itemsPrice)}</dd>
              </div>
              <div>
                <dt className="inline font-bold">Trasporto e montaggio: </dt>
                <dd className="inline">{formatCurrency(bill.transport)}</dd>
              </div>
              <div>
                <dt className="inline font-bold">Totale fornitura: </dt>
                <dd className="inline font-extrabold">{formatCurrency(bill.totalPrice)}</dd>
              </div>
              <div>
                <dt className="inline font-bold">Totale acconti: </dt>
                <dd className="inline">{formatCurrency(payment.paidTotal)}</dd>
              </div>
              <div className="pt-1">
                <dt className="inline font-extrabold underline">A saldo: </dt>
                <dd className="inline text-[11px] font-black underline">{formatCurrency(payment.balance)}</dd>
              </div>
            </dl>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[7px] font-extrabold uppercase tracking-[0.06em]">
              <span className="border border-[#666] bg-[#ededed] px-1.5 py-0.5 text-[#222]">
                Rif. {ref}
              </span>
              <span className="border border-[#666] bg-[#ededed] px-1.5 py-0.5 text-[#222]">
                Pagamento: {payment.status}
              </span>
              <span className="border border-[#666] bg-[#ededed] px-1.5 py-0.5 text-[#222]">
                Vendita: {bill.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="bg-white p-1.5">
            <img
              src={SOFT_COMFORT_COMPANY.reviewQrPath}
              alt="QR recensione Soft Comfort"
              className="h-[96px] w-[96px] object-contain"
            />
          </div>
          <div className="mt-1 border-2 border-[#3f3f3f] bg-[#3f3f3f] px-2 py-1 text-center text-[8px] font-extrabold leading-tight text-white">
            LASCIACI UNA<br />RECENSIONE
          </div>
        </div>
      </section>

      <section className="mt-3 flex items-stretch border-2 border-[#555]">
        <div className="grid min-w-[58px] place-items-center border-r-2 border-[#555] bg-[#e5e5e5] px-2 py-2 text-[10px] font-extrabold">
          NOTE:
        </div>
        <div className="min-h-[32px] flex-1 bg-white px-3 py-2 text-[9px] font-medium uppercase tracking-[0.01em]">
          {bill.notes || '—'}
        </div>
      </section>

      <section className="mt-3">
        <SectionLabel>ARTICOLI</SectionLabel>

        <div className="border-[3px] border-[#3f3f3f]">
          <table className="w-full border-collapse text-[9.5px]">
            <thead>
              <tr className="border-b-2 border-[#555] bg-[#dfdfdf] text-left text-[#161616]">
                <th className="px-4 py-2 font-extrabold">Articolo</th>
                <th className="w-[25%] px-4 py-2 font-extrabold">Ditta</th>
                <th className="w-[22%] px-4 py-2 text-right font-extrabold">Prezzo</th>
              </tr>
            </thead>
            <tbody>
              {(bill.items ?? []).map((item) => (
                <tr key={item.uuid} className="border-b border-[#777] last:border-b-0">
                  <td className="px-4 py-2.5 font-medium uppercase">{item.name}</td>
                  <td className="px-4 py-2.5 font-medium text-[#343434]">{item.company || '—'}</td>
                  <td className="px-4 py-2.5 text-right font-bold">{formatCurrency(item.price)}</td>
                </tr>
              ))}
              {(bill.items?.length ?? 0) < 4 &&
                Array.from({ length: 4 - (bill.items?.length ?? 0) }).map((_, index) => (
                  <tr key={`empty-${index}`} className="border-b border-[#777] last:border-b-0">
                    <td className="h-[31px] px-4 py-2.5">&nbsp;</td>
                    <td className="px-4 py-2.5">&nbsp;</td>
                    <td className="px-4 py-2.5">&nbsp;</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-4">
        <SectionLabel>PAGAMENTI</SectionLabel>

        <div className="border-[3px] border-[#3f3f3f]">
          <table className="w-full border-collapse text-[9.5px]">
            <thead>
              <tr className="border-b-2 border-[#555] bg-[#dfdfdf] text-[#161616]">
                <th className="w-[28%] px-4 py-2 text-left font-extrabold">Data</th>
                <th className="w-[24%] px-4 py-2 text-left font-extrabold">Importo</th>
                <th className="w-[26%] px-4 py-2 text-left font-extrabold">Metodo</th>
                <th className="px-4 py-2 text-left font-extrabold">Stato</th>
              </tr>
            </thead>
            <tbody>
              {deposits.length > 0 ? (
                deposits.map((deposit) => (
                  <tr key={deposit.uuid} className="border-b border-[#777] last:border-b-0">
                    <td className="px-4 py-2.5">{formatDate(deposit.date)}</td>
                    <td className="px-4 py-2.5 font-bold">{formatCurrency(deposit.amount)}</td>
                    <td className="px-4 py-2.5 font-medium">{deposit.method}</td>
                    <td className="px-4 py-2.5 font-extrabold">
                      {deposit.collected ? 'INCASSATO' : 'DA INCASSARE'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="h-[32px] px-4 py-2.5">&nbsp;</td>
                  <td className="px-4 py-2.5">&nbsp;</td>
                  <td className="px-4 py-2.5">&nbsp;</td>
                  <td className="px-4 py-2.5">&nbsp;</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-3 grid grid-cols-[1fr_82mm] gap-4">
        <div className="border-2 border-[#555] bg-white px-3 py-2 text-[7px] font-medium leading-[1.45] text-[#252525]">
          <p className="font-bold">
            Saldo da effettuare secondo gli accordi di vendita e le condizioni sottoscritte.
          </p>
          <p className="mt-1">
            Il presente documento riepiloga articoli, importi e pagamenti registrati nel gestionale.
            L'eventuale documento fiscale/elettronico resta separato.
          </p>
        </div>

        <div className="border-[3px] border-[#3f3f3f] border-l-[6px] border-l-[#9f1018] bg-white px-3 py-2">
          <div className="flex justify-between gap-4 text-[9px]">
            <span className="font-medium">Totale fornitura</span>
            <strong>{formatCurrency(bill.totalPrice)}</strong>
          </div>
          <div className="mt-1 flex justify-between gap-4 text-[9px]">
            <span className="font-medium">Acconti incassati</span>
            <strong>{formatCurrency(payment.paidTotal)}</strong>
          </div>
          <div className="mt-2 border-t-2 border-[#777] pt-2">
            <div className="flex items-end justify-between gap-4">
              <span className="text-[9px] font-black uppercase">A saldo</span>
              <strong className="text-[17px] font-black leading-none text-[#9f1018]">
                {formatCurrency(payment.balance)}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7 flex items-end justify-between text-[10px]">
        <div className="flex items-end gap-2">
          <span className="font-bold">Firma cliente:</span>
          <span className="inline-block w-[180px] border-b-2 border-[#555]" />
        </div>
        <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-[#3f3f3f]">
          Soft Comfort · Palermo &amp; Bagheria
        </p>
      </section>
    </main>
  );
}
