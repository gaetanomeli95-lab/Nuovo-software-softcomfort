import { useMemo, useState } from 'react';
import {
  Banknote,
  Download,
  FileSpreadsheet,
  Package,
  ReceiptText,
  Users,
  WalletCards,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  useBuyingBills,
  useChecks,
  useInventoryAvailable,
  useInventoryDelivered,
  useSellingBills,
} from '@/hooks/useQueries';
import { buildCustomerDirectory } from '@/features/directories/directories';
import { getPaymentSummary } from '@/features/selling-bills/paymentStatus';
import { getSellingItemView } from '@/features/selling-bills/sellingItemView';
import { downloadCsv } from '@/lib/csv';
import { formatCurrency, formatDate } from '@/lib/format';
import { buildSalesReport, uniqueReportSellers } from './reports';

function safeDate(value: string) {
  return value || 'tutto';
}

export function ReportsPage() {
  const sales = useSellingBills();
  const purchases = useBuyingBills();
  const available = useInventoryAvailable();
  const delivered = useInventoryDelivered();
  const checks = useChecks();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [seller, setSeller] = useState('');

  const report = useMemo(
    () => buildSalesReport(sales.data ?? [], { dateFrom, dateTo, seller }),
    [sales.data, dateFrom, dateTo, seller],
  );
  const sellers = useMemo(() => uniqueReportSellers(sales.data ?? []), [sales.data]);
  const customers = useMemo(() => buildCustomerDirectory(sales.data ?? []), [sales.data]);

  const isLoading =
    sales.isLoading ||
    purchases.isLoading ||
    available.isLoading ||
    delivered.isLoading ||
    checks.isLoading;
  const error =
    sales.error ??
    purchases.error ??
    available.error ??
    delivered.error ??
    checks.error;

  const retry = () => {
    sales.refetch();
    purchases.refetch();
    available.refetch();
    delivered.refetch();
    checks.refetch();
  };

  const exportSales = () => {
    downloadCsv(
      `softcomfort-vendite-${safeDate(dateFrom)}-${safeDate(dateTo)}.csv`,
      [
        'Data',
        'Cliente',
        'Telefono',
        'Indirizzo',
        'Venditore',
        'Stato',
        'Stato pagamento',
        'Totale',
        'Incassato registrato',
        'Residuo',
      ],
      report.bills.map((bill) => {
        const payment = getPaymentSummary(bill);
        return [
          bill.date,
          bill.client,
          bill.phone,
          bill.address,
          bill.seller,
          bill.status,
          payment.status,
          bill.totalPrice,
          payment.paidTotal,
          payment.balance,
        ];
      }),
    );
  };

  const exportCustomers = () => {
    downloadCsv(
      'softcomfort-clienti.csv',
      ['Cliente', 'Telefono', 'Indirizzo', 'Vendite', 'Totale storico', 'Ultima vendita'],
      customers.map((row) => [
        row.name,
        row.phone,
        row.address,
        row.salesCount,
        row.totalSpent,
        row.lastSaleDate,
      ]),
    );
  };

  const exportInventory = () => {
    const rows = [
      ...(available.data ?? []).map((item) => ({ item, state: 'Disponibile' })),
      ...(delivered.data ?? []).map((item) => ({ item, state: 'Consegnato' })),
    ];
    downloadCsv(
      'softcomfort-magazzino.csv',
      ['Stato', 'Articolo', 'Marca', 'Riferimento', 'Posizione', 'Colli', 'Prezzo'],
      rows.map(({ item, state }) => [
        state,
        item.name,
        item.make,
        item.ref,
        item.location,
        item.necks,
        item.bPrice,
      ]),
    );
  };

  const exportPurchases = () => {
    downloadCsv(
      'softcomfort-acquisti.csv',
      ['Data', 'Fornitore', 'Stato', 'Articoli', 'Totale articoli'],
      (purchases.data ?? []).map((bill) => [
        bill.date,
        bill.make,
        bill.status,
        (bill.items ?? []).length,
        (bill.items ?? []).reduce((sum, item) => sum + Number(item.price ?? 0), 0),
      ]),
    );
  };

  const exportChecks = () => {
    downloadCsv(
      'softcomfort-assegni.csv',
      ['Emittente', 'Scadenza', 'Importo', 'Riferimenti fattura'],
      (checks.data ?? []).map((check) => [
        check.make,
        check.expireDate,
        check.amount,
        check.billNumbers,
      ]),
    );
  };

  if (error && !sales.data) {
    return (
      <div className="space-y-5">
        <PageHeader title="Report e export" description="Analisi e scarico dati" />
        <Card><ErrorState error={error} onRetry={retry} /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report e export"
        description="Analizza le vendite e scarica i dati operativi in CSV compatibile con Excel."
      />

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="report-from">Dal</Label>
            <Input
              id="report-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="report-to">Al</Label>
            <Input
              id="report-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Venditore</Label>
            <Select value={seller || 'all'} onValueChange={(value) => setSeller(value === 'all' ? '' : value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i venditori</SelectItem>
                {sellers.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setDateFrom('');
              setDateTo('');
              setSeller('');
            }}
          >
            Azzera filtri
          </Button>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Vendite"
          value={report.salesCount}
          icon={ReceiptText}
          tone="info"
          loading={sales.isLoading}
        />
        <StatCard
          label="Fatturato"
          value={formatCurrency(report.revenue)}
          icon={Banknote}
          loading={sales.isLoading}
        />
        <StatCard
          label="Incassato registrato"
          value={formatCurrency(report.collected)}
          icon={WalletCards}
          tone="success"
          loading={sales.isLoading}
        />
        <StatCard
          label="Residuo registrato"
          value={formatCurrency(report.outstanding)}
          icon={WalletCards}
          tone={report.outstanding > 0 ? 'warning' : 'success'}
          loading={sales.isLoading}
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
            <CardTitle>Performance venditori</CardTitle>
            <CardDescription>
              Il valore incassato considera solo versamenti marcati come incassati nel backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {sales.isLoading ? (
              <div className="space-y-2 p-5">
                {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-10" />)}
              </div>
            ) : report.sellers.length === 0 ? (
              <EmptyState title="Nessun dato nel periodo" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Venditore</TableHead>
                    <TableHead className="text-center">Vendite</TableHead>
                    <TableHead className="hidden text-right md:table-cell">Ticket medio</TableHead>
                    <TableHead className="text-right">Fatturato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.sellers.map((row) => (
                    <TableRow key={row.seller}>
                      <TableCell className="font-semibold">{row.seller}</TableCell>
                      <TableCell className="tnum text-center">{row.salesCount}</TableCell>
                      <TableCell className="tnum hidden text-right text-muted-foreground md:table-cell">
                        {formatCurrency(row.averageTicket)}
                      </TableCell>
                      <TableCell className="tnum text-right font-bold">{formatCurrency(row.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
            <CardTitle>Articoli principali</CardTitle>
            <CardDescription>Classifica per valore delle righe vendita nel periodo filtrato.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {sales.isLoading ? (
              <div className="space-y-2 p-5">
                {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-10" />)}
              </div>
            ) : report.products.length === 0 ? (
              <EmptyState title="Nessun articolo nel periodo" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Articolo</TableHead>
                    <TableHead className="text-center">Q.tà</TableHead>
                    <TableHead className="hidden text-center md:table-cell">Vendite</TableHead>
                    <TableHead className="text-right">Valore</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.products.slice(0, 12).map((row) => (
                    <TableRow key={row.key}>
                      <TableCell className="max-w-[280px] truncate font-semibold">{row.label}</TableCell>
                      <TableCell className="tnum text-center">{row.quantity}</TableCell>
                      <TableCell className="tnum hidden text-center text-muted-foreground md:table-cell">
                        {row.salesCount}
                      </TableCell>
                      <TableCell className="tnum text-right font-bold">{formatCurrency(row.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-[#2f6f4e]" />
            Esporta dati
          </CardTitle>
          <CardDescription>
            File CSV con separatore compatibile con Excel in italiano. Nessun dato viene inviato a servizi esterni.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 pt-5 sm:grid-cols-2 lg:grid-cols-5">
          <Button variant="outline" onClick={exportSales} disabled={report.bills.length === 0}>
            <Download className="h-4 w-4" /> Vendite
          </Button>
          <Button variant="outline" onClick={exportCustomers} disabled={customers.length === 0}>
            <Users className="h-4 w-4" /> Clienti
          </Button>
          <Button
            variant="outline"
            onClick={exportInventory}
            disabled={(available.data?.length ?? 0) + (delivered.data?.length ?? 0) === 0}
          >
            <Package className="h-4 w-4" /> Magazzino
          </Button>
          <Button variant="outline" onClick={exportPurchases} disabled={(purchases.data?.length ?? 0) === 0}>
            <ReceiptText className="h-4 w-4" /> Acquisti
          </Button>
          <Button variant="outline" onClick={exportChecks} disabled={(checks.data?.length ?? 0) === 0}>
            <Download className="h-4 w-4" /> Assegni
          </Button>
        </CardContent>
      </Card>

      <Card className="border-[#eadfce] bg-[#fffaf3]">
        <CardContent className="p-4 text-xs leading-relaxed text-[#705f45]">
          <strong>Nota sui dati finanziari:</strong> gli incassi e i residui di questo report seguono la stessa
          regola prudente del gestionale: vengono conteggiati come versati solo gli acconti che il backend
          marca esplicitamente come incassati. Il campo legacy settlement non viene reinterpretato.
        </CardContent>
      </Card>
    </div>
  );
}
