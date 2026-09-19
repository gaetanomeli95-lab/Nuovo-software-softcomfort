import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Printer, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSellingBill } from '@/hooks/useQueries';
import { formatCurrency, formatDate } from '@/lib/format';
import { SOFT_COMFORT_COMPANY } from '@/config/company';
import { cn } from '@/lib/utils';

type PrintType = 'documento' | 'bolla';

function PrintToolbar({
  type,
  uuid,
}: {
  type: PrintType;
  uuid: string;
}) {
  return (
    <div className="print-toolbar sticky top-0 z-20 border-b border-[#ded6cf] bg-[#f7f3ee]/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-[210mm] flex-wrap items-center gap-2">
        <Button variant="outline" asChild>
          <Link to={`/vendite/${uuid}`}>
            <ArrowLeft className="h-4 w-4" />
            Torna alla vendita
          </Link>
        </Button>

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

  const paidDeposits = (bill.deposits ?? []).filter((d) => d.collected);
  const paidTotal = paidDeposits.reduce((sum, d) => sum + d.amount, 0);
  const balance = (bill.totalPrice ?? 0) - paidTotal;
  const ref = bill.uuid.slice(0, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-[#eee9e3] text-[#251f1d]">
      <style>{`
        @page {
          size: A4;
          margin: 10mm;
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
            box-shadow: none !important;
            border: 0 !important;
          }

          .avoid-break {
            break-inside: avoid;
          }
        }
      `}</style>

      <PrintToolbar type={type} uuid={uuid} />

      <main
        className="print-sheet mx-auto my-6 min-h-[297mm] w-[210mm] overflow-hidden border border-[#d7cec5] bg-white px-[14mm] py-[12mm] shadow-[0_20px_70px_rgba(56,43,35,0.12)]"
      >
        <header className="flex items-start justify-between gap-8 border-b-2 border-[#241e1c] pb-5">
          <div className="flex min-w-0 items-center gap-4">
            <img
              src="/softcomfort-logo.png"
              alt="Soft Comfort"
              className="h-16 w-16 shrink-0 rounded-xl object-cover"
            />
            <div>
              <h1 className="font-display text-[25px] font-bold tracking-[-0.03em]">
                {SOFT_COMFORT_COMPANY.name}
              </h1>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a6b24]">
                {SOFT_COMFORT_COMPANY.tagline}
              </p>
              <div className="mt-3 space-y-0.5 text-[10px] leading-relaxed text-[#675f5a]">
                {SOFT_COMFORT_COMPANY.locations.map((location) => (
                  <p key={location}>{location}</p>
                ))}
                <p>
                  Tel. {SOFT_COMFORT_COMPANY.phone} · {SOFT_COMFORT_COMPANY.website}
                </p>
              </div>
            </div>
          </div>

          <div className="min-w-[180px] text-right">
            <div className="inline-flex rounded-full border border-[#e2c8a1] bg-[#fff9ee] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#85591d]">
              {type === 'bolla' ? 'Documento di consegna' : 'Documento gestionale'}
            </div>
            <h2 className="mt-3 font-display text-[24px] font-bold uppercase tracking-[-0.025em]">
              {type === 'bolla' ? 'Bolla di consegna' : 'Fattura di vendita'}
            </h2>
            <p className="mt-2 text-[10px] text-[#746a64]">
              Rif. gestionale <span className="font-bold text-[#2b2421]">{ref}</span>
            </p>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-[1.35fr_0.65fr] gap-4">
          <div className="rounded-xl border border-[#ddd4cc] bg-[#fbf9f6] p-4">
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#9a8d84]">
              Cliente / destinatario
            </p>
            <p className="mt-2 text-[17px] font-extrabold tracking-[-0.02em]">
              {bill.client || '—'}
            </p>
            <div className="mt-2 space-y-1 text-[10px] text-[#625a55]">
              <p>{bill.address || 'Indirizzo non indicato'}</p>
              <p>{bill.phone ? `Tel. ${bill.phone}` : 'Telefono non indicato'}</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#ddd4cc] p-4">
            <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-[10px]">
              <div>
                <dt className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#9a8d84]">Data</dt>
                <dd className="mt-1 font-bold">{formatDate(bill.date)}</dd>
              </div>
              <div>
                <dt className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#9a8d84]">Venditore</dt>
                <dd className="mt-1 font-bold">{bill.seller || '—'}</dd>
              </div>
              <div>
                <dt className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#9a8d84]">Stato</dt>
                <dd className="mt-1 font-bold">{bill.status}</dd>
              </div>
              <div>
                <dt className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#9a8d84]">
                  {type === 'bolla' ? 'Causale' : 'Tipo'}
                </dt>
                <dd className="mt-1 font-bold">
                  {type === 'bolla' ? 'Consegna merce' : 'Vendita'}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-2 flex items-end justify-between gap-4">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#9a8d84]">
                Dettaglio
              </p>
              <h3 className="font-display text-[18px] font-bold">
                Articoli {type === 'bolla' ? 'in consegna' : 'della vendita'}
              </h3>
            </div>
            <p className="text-[9px] text-[#8a8079]">
              {bill.items?.length ?? 0} {bill.items?.length === 1 ? 'articolo' : 'articoli'}
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#d8cfc7]">
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="bg-[#28211f] text-left text-white">
                  <th className="w-[8%] px-3 py-2.5 text-center">Q.tà</th>
                  <th className="px-3 py-2.5">Descrizione</th>
                  <th className="w-[24%] px-3 py-2.5">Ditta</th>
                  {type === 'documento' && (
                    <th className="w-[19%] px-3 py-2.5 text-right">Importo</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {(bill.items ?? []).map((item, index) => (
                  <tr
                    key={item.uuid}
                    className={cn(
                      'border-t border-[#e7dfd8]',
                      index % 2 === 1 && 'bg-[#fcfaf8]',
                    )}
                  >
                    <td className="px-3 py-3 text-center font-semibold">1</td>
                    <td className="px-3 py-3 font-semibold">{item.name}</td>
                    <td className="px-3 py-3 text-[#6d645e]">{item.company || '—'}</td>
                    {type === 'documento' && (
                      <td className="px-3 py-3 text-right font-bold">
                        {formatCurrency(item.price)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {type === 'documento' ? (
          <section className="avoid-break mt-6 grid grid-cols-[1fr_0.82fr] gap-5">
            <div>
              <div className="rounded-xl border border-[#ddd4cc] p-4">
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#9a8d84]">
                  Pagamenti / acconti
                </p>

                {(bill.deposits ?? []).length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {bill.deposits.map((deposit) => (
                      <div
                        key={deposit.uuid}
                        className="flex items-center justify-between gap-4 border-b border-[#eee7e1] pb-2 text-[10px] last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-semibold">{deposit.method}</p>
                          <p className="text-[9px] text-[#82776f]">
                            {formatDate(deposit.date)} · {deposit.seller}
                            {!deposit.collected ? ' · da incassare' : ''}
                          </p>
                        </div>
                        <span className="font-bold">{formatCurrency(deposit.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-[10px] text-[#82776f]">Nessun acconto registrato.</p>
                )}
              </div>

              {bill.notes && (
                <div className="mt-4 rounded-xl border border-[#ddd4cc] bg-[#fbf9f6] p-4">
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#9a8d84]">
                    Note
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-[10px] leading-relaxed text-[#5f5752]">
                    {bill.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#d7cec6] bg-[#fffdfb] p-4">
              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#9a8d84]">
                Riepilogo economico
              </p>
              <div className="mt-4 space-y-2.5 text-[10px]">
                <div className="flex justify-between gap-4">
                  <span className="text-[#726861]">Articoli</span>
                  <span className="font-semibold">{formatCurrency(bill.itemsPrice)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#726861]">Trasporto</span>
                  <span className="font-semibold">{formatCurrency(bill.transport)}</span>
                </div>
                {bill.settlement !== 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-[#726861]">Conguaglio</span>
                    <span className="font-semibold">{formatCurrency(bill.settlement)}</span>
                  </div>
                )}
                <div className="border-t border-[#e8dfd8] pt-3">
                  <div className="flex items-end justify-between gap-4">
                    <span className="font-bold">Totale vendita</span>
                    <span className="text-[19px] font-extrabold text-[#a20f18]">
                      {formatCurrency(bill.totalPrice)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#726861]">Versato</span>
                  <span className="font-bold">{formatCurrency(paidTotal)}</span>
                </div>
                <div className="flex justify-between gap-4 rounded-lg bg-[#f6f0e8] px-3 py-2.5">
                  <span className="font-extrabold">Residuo</span>
                  <span className="font-extrabold">{formatCurrency(balance)}</span>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="avoid-break mt-6">
            {bill.notes && (
              <div className="rounded-xl border border-[#ddd4cc] bg-[#fbf9f6] p-4">
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#9a8d84]">
                  Note di consegna
                </p>
                <p className="mt-2 whitespace-pre-wrap text-[10px] leading-relaxed text-[#5f5752]">
                  {bill.notes}
                </p>
              </div>
            )}

            <div className="mt-5 grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-[#ddd4cc] p-4">
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#9a8d84]">
                  Colli
                </p>
                <div className="mt-7 border-b border-[#968981]" />
              </div>
              <div className="rounded-xl border border-[#ddd4cc] p-4">
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#9a8d84]">
                  Ora consegna
                </p>
                <div className="mt-7 border-b border-[#968981]" />
              </div>
              <div className="rounded-xl border border-[#ddd4cc] p-4">
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#9a8d84]">
                  Addetto consegna
                </p>
                <div className="mt-7 border-b border-[#968981]" />
              </div>
            </div>
          </section>
        )}

        <section className="avoid-break mt-9 grid grid-cols-2 gap-10">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#8f837b]">
              Firma Soft Comfort
            </p>
            <div className="mt-10 border-b border-[#8f837b]" />
          </div>
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#8f837b]">
              Firma cliente / ricevuta merce
            </p>
            <div className="mt-10 border-b border-[#8f837b]" />
          </div>
        </section>

        <footer className="mt-8 border-t border-[#ddd4cc] pt-3 text-[8px] leading-relaxed text-[#8a8079]">
          {type === 'documento' ? (
            <p>
              Stampa gestionale della vendita. Per gli adempimenti fiscali fa fede l'eventuale
              documento fiscale/elettronico emesso secondo la normativa applicabile.
            </p>
          ) : (
            <p>
              Documento di consegna merce collegato alla vendita Soft Comfort sopra indicata.
            </p>
          )}
          <p className="mt-1">
            {SOFT_COMFORT_COMPANY.name} · {SOFT_COMFORT_COMPANY.locations.join(' · ')} · Tel.{' '}
            {SOFT_COMFORT_COMPANY.phone} · {SOFT_COMFORT_COMPANY.website}
          </p>
        </footer>
      </main>
    </div>
  );
}
