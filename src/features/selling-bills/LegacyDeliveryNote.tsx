import { formatCurrency, formatDate } from '@/lib/format';
import { SOFT_COMFORT_COMPANY } from '@/config/company';
import { getPaymentSummary } from './paymentStatus';
import type { SellingBill } from '@/types/domain';

export function LegacyDeliveryNote({ bill }: { bill: SellingBill }) {
  const payment = getPaymentSummary(bill);
  const deposits = bill.deposits ?? [];
  const ref = bill.uuid.slice(0, 8).toUpperCase();

  return (
    <main className="legacy-bolla print-sheet mx-auto my-6 min-h-[297mm] w-[210mm] bg-white px-[13mm] py-[10mm] text-[#313131] shadow-[0_24px_70px_rgba(50,37,31,0.14)]">
      <header className="text-center">
        <h1 className="font-display text-[49px] font-medium leading-none tracking-[-0.045em] text-[#4a4a4a]">
          SoftComfort
        </h1>

        <div className="mt-4 border-2 border-[#5b5b5b] px-3 py-2 text-[8.5px] font-semibold leading-[1.65]">
          <p>
            {SOFT_COMFORT_COMPANY.locations[0]} · Tel. {SOFT_COMFORT_COMPANY.phone} · {SOFT_COMFORT_COMPANY.website}
          </p>
          <p>
            {SOFT_COMFORT_COMPANY.locations[1]} · Tel. {SOFT_COMFORT_COMPANY.phone} · {SOFT_COMFORT_COMPANY.website}
          </p>
          <p className="mt-0.5 font-bold">
            {SOFT_COMFORT_COMPANY.legalName}
          </p>
        </div>
      </header>

      <section className="mt-3 grid grid-cols-[1fr_126px] items-center gap-5">
        <div className="flex justify-end">
          <div className="w-[112mm] border-2 border-[#555] px-7 py-5 text-center text-[10px] leading-[1.55]">
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
                <dd className="inline">{formatCurrency(bill.totalPrice)}</dd>
              </div>
              <div>
                <dt className="inline font-bold">Totale acconti: </dt>
                <dd className="inline">{formatCurrency(payment.paidTotal)}</dd>
              </div>
              <div className="pt-0.5">
                <dt className="inline font-bold underline">A saldo: </dt>
                <dd className="inline font-bold underline">{formatCurrency(payment.balance)}</dd>
              </div>
            </dl>

            <p className="mt-2 text-[7px] font-semibold text-[#666]">
              Rif. gestionale {ref}
            </p>
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

      <section className="mt-3 flex items-stretch border border-[#b9b9b9]">
        <div className="grid min-w-[56px] place-items-center border-r border-[#777] px-2 py-2 text-[10px] font-extrabold">
          NOTE:
        </div>
        <div className="min-h-[31px] flex-1 px-3 py-2 text-[9px] uppercase tracking-[0.01em]">
          {bill.notes || '—'}
        </div>
      </section>

      <section className="mt-3">
        <div className="mb-1 inline-block border border-[#555] bg-[#efefef] px-2 py-0.5 text-[10px] font-extrabold">
          ARTICOLI
        </div>

        <div className="border-[3px] border-[#4e4e4e]">
          <table className="w-full border-collapse text-[9.5px]">
            <thead>
              <tr className="border-b border-[#777] bg-[#efefef] text-left">
                <th className="px-4 py-2 font-extrabold">Articolo</th>
                <th className="w-[38%] px-4 py-2 font-extrabold">Prezzo</th>
              </tr>
            </thead>
            <tbody>
              {(bill.items ?? []).map((item) => (
                <tr key={item.uuid} className="border-b border-[#a4a4a4] last:border-b-0">
                  <td className="px-4 py-2.5 uppercase">{item.name}</td>
                  <td className="px-4 py-2.5">{formatCurrency(item.price)}</td>
                </tr>
              ))}
              {(bill.items?.length ?? 0) < 4 &&
                Array.from({ length: 4 - (bill.items?.length ?? 0) }).map((_, index) => (
                  <tr key={`empty-${index}`} className="border-b border-[#a4a4a4] last:border-b-0">
                    <td className="h-[31px] px-4 py-2.5">&nbsp;</td>
                    <td className="px-4 py-2.5">&nbsp;</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-4">
        <div className="mb-1 inline-block border border-[#555] bg-[#efefef] px-2 py-0.5 text-[10px] font-extrabold">
          PAGAMENTI
        </div>

        <div className="border-[3px] border-[#4e4e4e]">
          <table className="w-full border-collapse text-[9.5px]">
            <thead>
              <tr className="border-b border-[#777] bg-[#efefef]">
                <th className="w-[34%] px-4 py-2 text-left font-extrabold">Data</th>
                <th className="w-[33%] px-4 py-2 text-left font-extrabold">Importo</th>
                <th className="px-4 py-2 text-left font-extrabold">Metodo</th>
              </tr>
            </thead>
            <tbody>
              {deposits.length > 0 ? (
                deposits.map((deposit) => (
                  <tr key={deposit.uuid} className="border-b border-[#aaa] last:border-b-0">
                    <td className="px-4 py-2.5">{formatDate(deposit.date)}</td>
                    <td className="px-4 py-2.5">{formatCurrency(deposit.amount)}</td>
                    <td className="px-4 py-2.5">
                      {deposit.method}
                      {!deposit.collected ? ' · DA INCASSARE' : ''}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="h-[32px] px-4 py-2.5">&nbsp;</td>
                  <td className="px-4 py-2.5">&nbsp;</td>
                  <td className="px-4 py-2.5">&nbsp;</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-3 border-2 border-[#555] px-3 py-2 text-[6.8px] leading-[1.35] text-[#3f3f3f]">
        <p className="font-semibold">
          Saldo da effettuare secondo gli accordi di vendita e le condizioni sottoscritte.
          Il presente documento riepiloga ordine, articoli e pagamenti registrati nel gestionale.
        </p>
        <p className="mt-1">
          Le condizioni contrattuali e l'informativa sul trattamento dei dati personali restano quelle
          sottoscritte dal cliente nella documentazione commerciale Soft Comfort.
        </p>
      </section>

      <section className="mt-7 text-[10px]">
        <div className="flex items-end gap-2">
          <span className="font-semibold">Firma cliente:</span>
          <span className="inline-block w-[180px] border-b border-[#666]" />
        </div>
      </section>
    </main>
  );
}
