import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Info, Printer, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSellingBill } from '@/hooks/useQueries';
import { LegacyDeliveryNote } from './LegacyDeliveryNote';
import { FamiliarSalesDocument } from './FamiliarSalesDocument';

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

          tr {
            break-inside: avoid;
          }

          .print-sheet {
            color: #111 !important;
          }

          .print-brand-logo-wrap {
            min-height: 31mm;
            align-items: center;
          }

          .print-brand-logo {
            width: 158mm !important;
            max-width: 158mm !important;
            height: 34mm !important;
            filter: grayscale(1) contrast(2.25) !important;
            opacity: 1 !important;
          }

          .print-brand-rule {
            height: 2px !important;
            background: #111 !important;
          }

          .print-brand-company {
            border-color: #111 !important;
            color: #111 !important;
            font-size: 9.5px !important;
            font-weight: 700 !important;
          }

          .print-sheet table,
          .print-sheet section,
          .print-sheet header {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      <PrintToolbar type={type} uuid={uuid} />
      {type === 'bolla' ? (
        <LegacyDeliveryNote bill={bill} />
      ) : (
        <FamiliarSalesDocument bill={bill} />
      )}
    </div>
  );
}
