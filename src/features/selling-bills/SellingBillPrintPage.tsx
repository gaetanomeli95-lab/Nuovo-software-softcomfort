import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Info, Printer, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSellingBill } from '@/hooks/useQueries';
import { formatCurrency, formatDate } from '@/lib/format';
import { SOFT_COMFORT_COMPANY } from '@/config/company';
import { getPaymentSummary } from './paymentStatus';
import { LegacyDeliveryNote } from './LegacyDeliveryNote';

type PrintType = 'documento' | 'bolla';

function PrintToolbar({ type, uuid }: { type: PrintType; uuid: string }) {
  return (
    <div className="print-toolbar sticky top-0 z-20 border-b border-[#ded6cf] bg-[#f7f3ee]/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-[210mm] flex-wrap items-center gap-2">
        <Button variant="outline" asChild>
          <Link to={`/vendite/${uuid}`}>
            <ArrowLeft className="h-4 w-4" />
            Torna alla vendita
          </Link>
        </Button>

        <div className="flex items-center gap-2 rounded-xl border border-[#eadfcf] bg-[#fffaf1] px-3 py-2 text-[11px] text-[#735728]">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            Per un PDF pulito, nella finestra di stampa disattiva <strong>Intestazioni e piè di pagina</strong>.
          </span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant={type === 'documento' ? 'default' : 'outline'} asChild>
            <Link to={`/vendite/${uuid}/stampa?tipo=documento`}>
              <FileText className="h-4 w-4" />
              Documento vendita
            </Link>
          </Button>
          <Button variant={type === 'bolla' ? 'default' : 'outline'} asChild>
            <Link to={`/vendite/${uuid}/stampa?tipo=bolla`}>
              <Truck className="h-4 w-4" />
              Bolla
            </Link>
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Stampa / Salva PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

function MetaBox({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <dt className="text-[7.5px] font-bold uppercase tracking-[0.15em] text-[#8e837d]">
        {label}
      </dt>
      <dd className={`mt-1 text-[10.5px] font-bold ${accent ? 'text-[#a10f18]' : 'text-[#2a2421]'}`}>
        {value}
      </dd>
    </div>
  );
}

export function SellingBillPrintPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const [params] = useSearchParams();
  const type: PrintType = params.get('tipo') === 'bolla' ? 'bolla' : 'documento';
  const { data: bill, isLoading, error } = useSellingBill(uuid);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f3efe9] text-sm text-muted-foreground">
        Preparazione documento…
      </div>
    );
  }

  if (error || !bill || !uuid) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f3efe9] p-6 text-center">
        <div>
          <p className="font-display text-2xl font-bold">Documento non disponibile</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Non è stato possibile caricare la vendita.
          </p>
          <Button className="mt-5" asChild>
            <Link to="/vendite">Torna alle vendite</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (type === 'bolla') {
    return (
      <div className="min-h-screen bg-[#ece7e1] text-[#251f1d]">
        <style>{`\n          @page { size: A4; margin: 8mm; }\n          .print-sheet { -webkit-print-color-adjust: exact; print-color-adjust: exact; }\n          @media print {\n            html, body, #root { background: white !important; }\n            .print-toolbar { display: none !important; }\n            .print-sheet { width: auto !important; min-height: auto !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; }\n            tr { break-inside: avoid; }\n          }\n        `}</style>
        <PrintToolbar type={type} uuid={uuid} />
        <LegacyDeliveryNote bill={bill} />
      </div>
    );
  }

  const payment = getPaymentSummary(bill);
  const ref = bill.uuid.slice(0, 8).toUpperCase();
  const documentTitle = 'Documento di vendita';

  return (
    <div className="min-h-screen bg-[#ece7e1] text-[#251f1d]">
      <style>{`
        @page {
          size: A4;
          margin: 8mm;
        }

        .print-sheet {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @media print {
          html, body, #root {
            background: white !important;
          }

          .print-toolbar {
            display: none !important;
          }

          .print-sheet {
            width: auto !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
          }

          .avoid-break, tr {
            break-inside: avoid;
          }
        }
      `}</style>

      <PrintToolbar type={type} uuid={uuid} />

      <main className="print-sheet mx-auto my-6 min-h-[297mm] w-[210mm] bg-white px-[13mm] py-[11mm] shadow-[0_24px_70px_rgba(50,37,31,0.14)]">
        <header className="relative pb-5">
          <div className="absolute inset-x-0 top-0 h-[3px] rounded-full bg-[#e10d1a]" />

          <div className="flex items-start justify-between gap-8 pt-5">
            <div className="flex items-center gap-4">
              <img
                src="/softcomfort-logo.png"
                alt="Soft Comfort"
                className="h-[58px] w-[58px] shrink-0 rounded-[14px] object-cover"
              />
              <div>
                <h1 className="font-display text-[24px] font-bold leading-none tracking-[-0.025em]">
                  Soft Comfort
                </h1>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a10f18]">
                  Arredamenti
                </p>
                <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.17em] text-[#a47a39]">
                  {SOFT_COMFORT_COMPANY.tagline}
                </p>
              </div>
            </div>

            <div className="min-w-[205px] text-right">
              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#988c85]">
                Soft Comfort · Gestionale
              </p>
              <h2 className="mt-1.5 font-display text-[23px] font-bold tracking-[-0.025em]">
                {documentTitle}
              </h2>
              <div className="mt-3 inline-grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg border border-[#e1d8d0] bg-[#fbf9f6] px-3 py-2 text-left">
                <MetaBox label="Riferimento" value={ref} />
                <MetaBox label="Data" value={formatDate(bill.date)} />
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-7 gap-y-1 border-y border-[#e6ded7] py-3 text-[8.5px] leading-relaxed text-[#635a55]">
            <div>
              <strong className="text-[#2c2522]">Palermo</strong> · {SOFT_COMFORT_COMPANY.locations[0]}
            </div>
            <div>
              <strong className="text-[#2c2522]">Bagheria</strong> · {SOFT_COMFORT_COMPANY.locations[1]}
            </div>
            <div>Tel. {SOFT_COMFORT_COMPANY.phone}</div>
            <div>{SOFT_COMFORT_COMPANY.website}</div>
          </div>
        </header>

        <section className="grid grid-cols-[1.22fr_0.78fr] gap-4">
          <div className="rounded-[12px] border border-[#ddd5ce] bg-[#fbf9f6] p-4">
            <p className="text-[7.5px] font-bold uppercase tracking-[0.16em] text-[#988c85]">
              Cliente / destinatario
            </p>
            <p className="mt-2 text-[18px] font-extrabold tracking-[-0.02em]">
              {bill.client || '—'}
            </p>
            <div className="mt-2 space-y-0.5 text-[10px] leading-relaxed text-[#625a55]">
              <p>{bill.address || 'Indirizzo non indicato'}</p>
              <p>{bill.phone ? `Tel. ${bill.phone}` : 'Telefono non indicato'}</p>
            </div>
          </div>

          <div className="rounded-[12px] border border-[#ddd5ce] p-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <MetaBox label="Venditore" value={bill.seller || '—'} />
              <MetaBox label="Stato vendita" value={bill.status} />
              <MetaBox label="Pagamento" value={payment.status} accent={payment.status !== 'Pagata'} />
              <MetaBox label="Residuo" value={formatCurrency(payment.balance)} accent={payment.balance > 0} />
            </dl>
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-2 flex items-end justify-between">
            <div>
              <p className="text-[7.5px] font-bold uppercase tracking-[0.16em] text-[#988c85]">
                Dettaglio articoli
              </p>
              <h3 className="mt-0.5 font-display text-[17px] font-bold">
                Composizione vendita
              </h3>
            </div>
            <p className="text-[9px] text-[#81766f]">
              {bill.items?.length ?? 0} {bill.items?.length === 1 ? 'riga' : 'righe'}
            </p>
          </div>

          <div className="overflow-hidden rounded-[11px] border border-[#d9d0c8]">
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="bg-[#2a2320] text-left text-white">
                  <th className="w-[7%] px-3 py-2.5 text-center">N.</th>
                  <th className="px-3 py-2.5">Descrizione</th>
                  <th className="w-[24%] px-3 py-2.5">Ditta</th>
                  <th className="w-[18%] px-3 py-2.5 text-right">Importo</th>
                </tr>
              </thead>
              <tbody>
                {(bill.items ?? []).map((item, index) => (
                  <tr key={item.uuid} className="border-t border-[#e8e0da] even:bg-[#fcfaf8]">
                    <td className="px-3 py-3 text-center font-bold text-[#83776f]">{index + 1}</td>
                    <td className="px-3 py-3 font-semibold">{item.name}</td>
                    <td className="px-3 py-3 text-[#6c625d]">{item.company || '—'}</td>
                    <td className="px-3 py-3 text-right font-bold">
                      {formatCurrency(item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="avoid-break mt-5 grid grid-cols-[1fr_0.78fr] gap-4">
            <div className="space-y-4">
              <div className="rounded-[11px] border border-[#ddd5ce] p-4">
                <p className="text-[7.5px] font-bold uppercase tracking-[0.16em] text-[#988c85]">
                  Pagamenti registrati
                </p>

                {(bill.deposits ?? []).length ? (
                  <div className="mt-3 space-y-2">
                    {bill.deposits.map((deposit) => (
                      <div
                        key={deposit.uuid}
                        className="flex items-center justify-between gap-4 border-b border-[#eee7e1] pb-2 text-[9.5px] last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-bold">{deposit.method}</p>
                          <p className="mt-0.5 text-[8.5px] text-[#81766f]">
                            {formatDate(deposit.date)} · {deposit.seller} · {deposit.collected ? 'incassato' : 'da incassare'}
                          </p>
                        </div>
                        <span className="font-bold">{formatCurrency(deposit.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-[9.5px] text-[#81766f]">Nessun pagamento registrato.</p>
                )}
              </div>

              {bill.notes && (
                <div className="rounded-[11px] border border-[#ddd5ce] bg-[#fbf9f6] p-4">
                  <p className="text-[7.5px] font-bold uppercase tracking-[0.16em] text-[#988c85]">Note</p>
                  <p className="mt-2 whitespace-pre-wrap text-[9.5px] leading-relaxed text-[#5f5752]">
                    {bill.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-[11px] border border-[#d8cec6] bg-[#fffdfb] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[7.5px] font-bold uppercase tracking-[0.16em] text-[#988c85]">
                    Riepilogo
                  </p>
                  <p className="mt-1 text-[10px] font-bold">{payment.status}</p>
                </div>
                <div className={`rounded-full px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.1em] ${
                  payment.status === 'Pagata'
                    ? 'bg-[#edf7f1] text-[#216a45]'
                    : payment.status === 'Parziale'
                      ? 'bg-[#eef5fa] text-[#316a96]'
                      : 'bg-[#fbf3e4] text-[#7d561c]'
                }`}>
                  {payment.status}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-[9.5px]">
                <div className="flex justify-between gap-4">
                  <span className="text-[#746a64]">Articoli</span>
                  <span className="font-semibold">{formatCurrency(bill.itemsPrice)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#746a64]">Trasporto</span>
                  <span className="font-semibold">{formatCurrency(bill.transport)}</span>
                </div>
                {bill.settlement !== 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-[#746a64]">Saldo legacy</span>
                    <span className="font-semibold">{formatCurrency(bill.settlement)}</span>
                  </div>
                )}
                <div className="mt-3 border-t border-[#e8dfd8] pt-3">
                  <div className="flex items-end justify-between gap-4">
                    <span className="font-bold">Totale vendita</span>
                    <span className="text-[20px] font-extrabold tracking-[-0.03em] text-[#a20f18]">
                      {formatCurrency(bill.totalPrice)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#746a64]">Incassato</span>
                  <span className="font-bold text-[#216a45]">{formatCurrency(payment.paidTotal)}</span>
                </div>
                <div className="flex justify-between gap-4 rounded-lg bg-[#f5efe8] px-3 py-2.5">
                  <span className="font-extrabold">Da saldare</span>
                  <span className="font-extrabold">{formatCurrency(payment.balance)}</span>
                </div>
              </div>
            </div>
          </section>
        <section className="avoid-break mt-8 grid grid-cols-2 gap-10">
          <div>
            <p className="text-[7.5px] font-bold uppercase tracking-[0.14em] text-[#8f837b]">
              Firma Soft Comfort
            </p>
            <div className="mt-9 border-b border-[#8f837b]" />
          </div>
          <div>
            <p className="text-[7.5px] font-bold uppercase tracking-[0.14em] text-[#8f837b]">
              Firma cliente / ricevuta merce
            </p>
            <div className="mt-9 border-b border-[#8f837b]" />
          </div>
        </section>

        <footer className="mt-7 border-t border-[#ded6cf] pt-3 text-[7.5px] leading-relaxed text-[#81766f]">
          <div className="flex items-start justify-between gap-6">
            <p className="max-w-[62%]">
              Documento gestionale riepilogativo della vendita. L'eventuale documento
              fiscale/elettronico emesso secondo la normativa applicabile resta separato.
            </p>
            <p className="text-right">
              {SOFT_COMFORT_COMPANY.name}<br />
              Tel. {SOFT_COMFORT_COMPANY.phone} · {SOFT_COMFORT_COMPANY.website}
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
