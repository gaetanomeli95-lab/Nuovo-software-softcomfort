import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Phone,
  Plus,
  ReceiptText,
  WalletCards,
} from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/common/PageHeader';
import { PaymentStatusBadge } from '@/components/common/PaymentStatusBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SummaryPill } from '@/components/common/SummaryPill';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSellingBills } from '@/hooks/useQueries';
import { formatCurrency, formatDate } from '@/lib/format';
import { getPaymentSummary } from '@/features/selling-bills/paymentStatus';
import { buildCustomerDirectory, customerDirectoryKey } from './directories';

export function CustomerDetailPage() {
  const { customerName = '' } = useParams();
  const sales = useSellingBills();
  const key = customerDirectoryKey(customerName);

  const customerSales = useMemo(
    () =>
      (sales.data ?? [])
        .filter(
          (bill) =>
            bill.status !== 'Annullata' &&
            customerDirectoryKey(bill.client) === key,
        )
        .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')),
    [sales.data, key],
  );

  const customer = useMemo(
    () => buildCustomerDirectory(customerSales)[0] ?? null,
    [customerSales],
  );

  const totals = useMemo(() => {
    return customerSales.reduce(
      (acc, bill) => {
        const payment = getPaymentSummary(bill);
        acc.paid += payment.paidTotal;
        acc.balance += payment.balance;
        if (bill.status !== 'Chiusa') acc.openSales += 1;
        return acc;
      },
      { paid: 0, balance: 0, openSales: 0 },
    );
  }, [customerSales]);

  if (sales.isLoading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Cliente" description="Caricamento anagrafica…" />
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Caricamento storico cliente…
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sales.error) {
    return (
      <div className="space-y-5">
        <PageHeader title="Cliente" description="Anagrafica cliente" />
        <Card>
          <ErrorState error={sales.error} onRetry={() => sales.refetch()} />
        </Card>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild aria-label="Indietro" className="rounded-full bg-white">
            <Link to="/anagrafiche">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <PageHeader title="Cliente non trovato" description="Anagrafica cliente" className="flex-1" />
        </div>
        <Card>
          <EmptyState
            icon={ReceiptText}
            title="Nessuna vendita associata"
            description="Il cliente non risulta nelle vendite non annullate disponibili alla sessione corrente."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button variant="outline" size="icon" asChild aria-label="Indietro" className="shrink-0 rounded-full bg-white">
            <Link to="/anagrafiche">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <PageHeader
            title={customer.name}
            description="Storico e situazione commerciale ricostruiti dalle vendite Soft Comfort."
            className="min-w-0 flex-1"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {customer.phone && (
            <Button variant="outline" asChild>
              <a href={"tel:" + customer.phone.replace(/\s+/g, '')}>
                <Phone className="h-4 w-4" />
                Chiama
              </a>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to={"/vendite?q=" + encodeURIComponent(customer.name)}>
              <ReceiptText className="h-4 w-4" />
              Filtra vendite
            </Link>
          </Button>
          <Button asChild>
            <Link to={"/vendite/nuova?cliente=" + encodeURIComponent(customer.name)}>
              <Plus className="h-4 w-4" />
              Nuova vendita
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryPill label="Vendite" value={String(customer.salesCount)} tone="neutral" />
        <SummaryPill label="Totale storico" value={formatCurrency(customer.totalSpent)} tone="gold" />
        <SummaryPill label="Incassato registrato" value={formatCurrency(totals.paid)} tone="green" />
        <SummaryPill
          label="Residuo aperto"
          value={formatCurrency(totals.balance)}
          tone={totals.balance > 0.01 ? 'red' : 'green'}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
              <CardTitle>Recapiti</CardTitle>
              <CardDescription>Dati più recenti presenti nelle vendite.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-5 text-sm">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#e4dcd4] bg-[#faf7f3]">
                  <Phone className="h-4 w-4 text-[#6d625c]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                    Telefono
                  </p>
                  <p className="mt-1 break-words font-bold text-[#302925]">
                    {customer.phone || 'Non disponibile'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#e4dcd4] bg-[#faf7f3]">
                  <MapPin className="h-4 w-4 text-[#6d625c]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                    Ultimo indirizzo
                  </p>
                  <p className="mt-1 break-words font-bold text-[#302925]">
                    {customer.address || 'Non disponibile'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#e4dcd4] bg-[#faf7f3]">
                  <CalendarDays className="h-4 w-4 text-[#6d625c]" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                    Ultima vendita
                  </p>
                  <p className="mt-1 font-bold text-[#302925]">
                    {customer.lastSaleDate ? formatDate(customer.lastSaleDate) : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
              <CardTitle className="flex items-center gap-2">
                <WalletCards className="h-4 w-4 text-[#9a6b24]" />
                Situazione
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Vendite non chiuse</span>
                <strong>{totals.openSales}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Residuo complessivo</span>
                <strong className="tnum">{formatCurrency(totals.balance)}</strong>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
            <CardTitle>Storico vendite</CardTitle>
            <CardDescription>{customerSales.length} vendite non annullate associate al cliente.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Venditore</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Totale</TableHead>
                  <TableHead className="text-right">Residuo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerSales.map((bill) => {
                  const payment = getPaymentSummary(bill);
                  return (
                    <TableRow key={bill.uuid}>
                      <TableCell className="whitespace-nowrap">
                        <Link to={"/vendite/" + bill.uuid} className="data-link">
                          {formatDate(bill.date)}
                        </Link>
                      </TableCell>
                      <TableCell>{bill.seller || '—'}</TableCell>
                      <TableCell><StatusBadge status={bill.status} /></TableCell>
                      <TableCell><PaymentStatusBadge status={payment.status} /></TableCell>
                      <TableCell className="tnum text-right font-bold">{formatCurrency(bill.totalPrice)}</TableCell>
                      <TableCell className="tnum text-right">{formatCurrency(payment.balance)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
