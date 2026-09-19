import { formatCurrency, formatDate } from '@/lib/format';
import { SOFT_COMFORT_COMPANY } from '@/config/company';
import { getPaymentSummary } from './paymentStatus';
import type { SellingBill } from '@/types/domain';

export function FamiliarSalesDocument({ bill }: { bill: SellingBill }) {
  const payment = getPaymentSummary(bill);
  const deposits = bill.deposits ?? [];
  const ref = bill.uuid.slice(0, 8).toUpperCase();

  return (
    <main className="print-sheet mx-auto my-6 min-h-[297mm] w-[210mm] bg-white px-[13mm] py-[10mm] text-[#2f2a28] shadow-[0_24px_70px_rgba(50,37,31,0.14)]">
      <header>
        <div className="flex items-center justify-center gap-5">
          <img
            src="/softcomfort-logo.png"
            alt="Soft Comfort"
            className="h-[72px] w-[72px] rounded-[16px] object-cover"
          />
          <div className="text-left">
            <h1 className="font-display text-[38px] font-semibold leading-none tracking-[-0.04em] text-[#403936]">
              Soft Comfort
            </h1>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.23em] text-[#b90f19]">
              Arredamenti
            </p>
            <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.18em] text-[#a77a36]">
              {SOFT_COMFORT_COMPANY.tagline}
            </p>
          </div>
        </div>

        <div className="mt-4 h-[2px] bg-[#b90f19]" />

        <div className="mt-2 border border-[#666] px-3 py-2 text-center text-[8.5px] font-semibold leading-[1.65]">
          <p>
            {SOFT_COMFORT_COMPANY.locations[0]} · Tel. {SOFT_COMFORT_COMPANY.phone} · {SOFT_COMFORT_COMPANY.website}
          </p>
          <p>
            {SOFT_COMFORT_COMPANY.locations[1]} · Tel. {SOFT_COMFORT_COMPANY.phone} · {SOFT_COMFORT_COMPANY.website}
          </p>
          <p className="mt-0.5 font-bold">{SOFT_COMFORT_COMPANY.legalName}</p>
        </div>
      </header>

      <section className="mt-3 grid grid-cols-[1fr_126px] items-center gap-5">
        <div className="flex justify-end">
          <div className="w-[112mm] border-2 border-[#555] px-7 py-5 text-center text-[10px] leading-[1.55]">
            <div className="mb-2 inline-block border-b-2 border-[#b90f19] pb-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em]">
              Documento di vendita
            </div>

            <dl className="space-y-1">
              <div>
                <dt className="inline font-bold">Data: </dt>
                <dd className="inline">{formatDate(bill.date)}</dd>
              </div>
              <div>
                <dt className="inline font-bold">Cliente: </dt>
                <dd className="inline font-bold">{bill.client || '—'}</dd>
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
                <dd className="inline">{bill.seller || '—'}</dd>
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
                <dd className="inline font-bold">{formatCurrency(bill.totalPrice)}</dd>
              </div>
              <div>
                <dt className="inline font-bold">Totale acconti: </dt>
                <dd className="inline">{formatCurrency(payment.paidTotal)}</dd>
              </div>
              <div className="pt-0.5">
                <dt className="inline font-bold underline">A saldo: </dt>
                <dd className="inline font-extrabold underline">{formatCurrency(payment.balance)}</dd>
              </div>
            </dl>

            <div className="mt-3 flex items-center justify-center gap-2 text-[7px] font-semibold uppercase tracking-[0.08em]">
              <span className="text-[#777]">Rif. {ref}</span>
              <span className="text-[#bbb]">•</span>
              <span className={payment.status === 'Pagata' ? 'text-[#216a45]' : 'text-[#9b651c]'}>
                {payment.status}
              </span>
              <span className="text-[#bbb]">•</span>
              <span className="text-[#777]">{bill.status}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <img
            src={SOFT_COMFORT_COMPANY.reviewQrPath}
            alt="QR recensione Soft Comfort"
            className="h-[96px] w-[96px] object-contain"
          />
          <div className="mt-1 border border-[#555] bg-[#4f4f4f] px-2 py-1 text-center text-[8px] font-bold leading-tight text-white">
            LASCIACI UNA<br />RECENSIONE
          </div>
        </div>
      </section>

      <section className="mt-3 flex items-stretch border border-[#aaa]">
        <div className="grid min-w-[56px] place-items-center border-r border-[#777] bg-[#f1efed] px-2 py-2 text-[10px] font-extrabold">
          NOTE:
        </div>
        <div className="min-h-[31px] flex-1 px-3 py-2 text-[9px] uppercase tracking-[0.01em]">
          {bill.notes || '—'}
        </div>
      </section>

      <section className="mt-3">
        <div className="mb-1 inline-flex items-center gap-2 border border-[#555] bg-[#efefef] px-2 py-0.5 text-[10px] font-extrabold">
          <span className="inline-block h-3 w-[3px] bg-[#b90f19]" />
          ARTICOLI
        </div>

        <div className="border-[3px] border-[#4e4e4e]">
          <table className="w-full border-collapse text-[9.5px]">
            <thead>
              <tr className="border-b border-[#777] bg-[#efefef] text-left">
                <th className="px-4 py-2 font-extrabold">Articolo</th>
                <th className="w-[25%] px-4 py-2 font-extrabold">Ditta</th>
                <th className="w-[22%] px-4 py-2 text-right font-extrabold">Prezzo</th>
              </tr>
            </thead>
            <tbody>
              {(bill.items ?? []).map((item) => (
                <tr key={item.uuid} className="border-b border-[#a4a4a4] last:border-b-0">
                  <td className="px-4 py-2.5 uppercase">{item.name}</td>
                  <td className="px-4 py-2.5 text-[#5f5753]">{item.company || '—'}</td>
                  <td className="px-4 py-2.5 text-right font-semibold">{formatCurrency(item.price)}</td>
                </tr>
              ))}
              {(bill.items?.length ?? 0) < 4 &&
                Array.from({ length: 4 - (bill.items?.length ?? 0) }).map((_, index) => (
                  <tr key={`empty-${index}`} className="border-b border-[#a4a4a4] last:border-b-0">
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
        <div className="mb-1 inline-flex items-center gap-2 border border-[#555] bg-[#efefef] px-2 py-0.5 text-[10px] font-extrabold">
          <span className="inline-block h-3 w-[3px] bg-[#d1a052]" />
          PAGAMENTI
        </div>

        <div className="border-[3px] border-[#4e4e4e]">
          <table className="w-full border-collapse text-[9.5px]">
            <thead>
              <tr className="border-b border-[#777] bg-[#efefef]">
                <th className="w-[28%] px-4 py-2 text-left font-extrabold">Data</th>
                <th className="w-[24%] px-4 py-2 text-left font-extrabold">Importo</th>
                <th className="w-[26%] px-4 py-2 text-left font-extrabold">Metodo</th>
                <th className="px-4 py-2 text-left font-extrabold">Stato</th>
              </tr>
            </thead>
            <tbody>
              {deposits.length > 0 ? (
                deposits.map((deposit) => (
                  <tr key={deposit.uuid} className="border-b border-[#aaa] last:border-b-0">
                    <td className="px-4 py-2.5">{formatDate(deposit.date)}</td>
                    <td className="px-4 py-2.5 font-semibold">{formatCurrency(deposit.amount)}</td>
                    <td className="px-4 py-2.5">{deposit.method}</td>
                    <td className="px-4 py-2.5">
                      {deposit.collected ? 'Incassato' : 'Da incassare'}
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
        <div className="border border-[#777] px-3 py-2 text-[7px] leading-[1.45] text-[#45403d]">
          <p className="font-semibold">
            Saldo da effettuare secondo gli accordi di vendita e le condizioni sottoscritte.
          </p>
          <p className="mt-1">
            Il presente documento riepiloga articoli, importi e pagamenti registrati nel gestionale.
            L'eventuale documento fiscale/elettronico resta separato.
          </p>
        </div>

        <div className="border-2 border-[#555] bg-[#faf8f5] px-3 py-2">
          <div className="flex justify-between gap-4 text-[9px]">
            <span>Totale fornitura</span>
            <strong>{formatCurrency(bill.totalPrice)}</strong>
          </div>
          <div className="mt-1 flex justify-between gap-4 text-[9px]">
            <span>Acconti incassati</span>
            <strong>{formatCurrency(payment.paidTotal)}</strong>
          </div>
          <div className="mt-2 border-t border-[#bbb] pt-2">
            <div className="flex items-end justify-between gap-4">
              <span className="text-[9px] font-extrabold uppercase">A saldo</span>
              <strong className="text-[16px] leading-none text-[#b90f19]">
                {formatCurrency(payment.balance)}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7 flex items-end justify-between text-[10px]">
        <div className="flex items-end gap-2">
          <span className="font-semibold">Firma cliente:</span>
          <span className="inline-block w-[180px] border-b border-[#666]" />
        </div>
        <p className="text-[7px] font-semibold uppercase tracking-[0.1em] text-[#8b817b]">
          Soft Comfort · Palermo &amp; Bagheria
        </p>
      </section>
    </main>
  );
}
