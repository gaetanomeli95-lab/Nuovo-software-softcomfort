import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download,
  Plus, Printer, ReceiptText, RotateCcw, Search, Truck,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { PaymentStatusBadge } from '@/components/common/PaymentStatusBadge';
import { SummaryPill } from '@/components/common/SummaryPill';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useSellingBills } from '@/hooks/useQueries';
import {
  DEFAULT_FILTERS, filterBills, paginate, sortBills, sumTotal,
  totalPages, uniqueSellers,
  type BillFilters, type SortDir, type SortKey,
} from './billFilters';
import { getPaymentSummary, type PaymentStatus } from './paymentStatus';
import { SELLING_BILL_STATUSES, type SellingBillStatus } from '@/types/domain';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { downloadTextFile, toCsv } from '@/lib/export';

const PAGE_SIZE = 25;
const PAYMENT_STATES: PaymentStatus[] = ['Da pagare', 'Parziale', 'Pagata'];

function SortableHead({
  label, sortKey, current, dir, onSort, className,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = current === sortKey;

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          'inline-flex items-center gap-1 uppercase tracking-[0.08em] transition-colors',
          active ? 'text-[#3d3532]' : 'text-[#766c66] hover:text-foreground',
        )}
      >
        {label}
        {active ? (
          dir === 'asc'
            ? <ArrowUp className="h-3 w-3 text-primary" />
            : <ArrowDown className="h-3 w-3 text-primary" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-35" />
        )}
      </button>
    </TableHead>
  );
}

export function SellingBillsPage() {
  const { data, isLoading, error, refetch } = useSellingBills();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<BillFilters>(() => ({
    ...DEFAULT_FILTERS,
    search: searchParams.get('q') ?? '',
    status: (searchParams.get('status') as SellingBillStatus) || 'all',
    payment: (searchParams.get('payment') as PaymentStatus) || 'all',
  }));
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);

  const sellers = useMemo(() => uniqueSellers(data ?? []), [data]);
  const filtered = useMemo(() => filterBills(data ?? [], filters), [data, filters]);
  const sorted = useMemo(() => sortBills(filtered, sortKey, sortDir), [filtered, sortKey, sortDir]);
  const pages = totalPages(sorted.length, PAGE_SIZE);
  const safePage = Math.min(page, pages - 1);
  const rows = paginate(sorted, safePage, PAGE_SIZE);
  const total = sumTotal(filtered);

  const updateFilters = (patch: Partial<BillFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(0);

    const next = { ...filters, ...patch };
    const params = new URLSearchParams();
    if (next.search) params.set('q', next.search);
    if (next.status !== 'all') params.set('status', next.status);
    if (next.payment !== 'all') params.set('payment', next.payment);
    setSearchParams(params, { replace: true });
  };

  const onSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'date' || key === 'totalPrice' ? 'desc' : 'asc');
    }
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(0);
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.payment !== 'all' ||
    filters.seller !== 'all' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '';

  const exportCsv = () => {
    const csv = toCsv([
      ['Data', 'Cliente', 'Venditore', 'Stato operativo', 'Stato pagamento', 'Totale', 'Versato', 'Residuo', 'Telefono', 'Indirizzo'],
      ...sorted.map((bill) => {
        const payment = getPaymentSummary(bill);
        return [
          bill.date,
          bill.client,
          bill.seller,
          bill.status,
          payment.status,
          bill.totalPrice,
          payment.paidTotal,
          payment.balance,
          bill.phone,
          bill.address,
        ];
      }),
    ]);
    downloadTextFile(
      `softcomfort-vendite-${new Date().toISOString().slice(0, 10)}.csv`,
      '\uFEFF' + csv,
      'text/csv;charset=utf-8',
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Vendite"
        description={
          data
            ? `${filtered.length} risultati su ${data.length} vendite · clicca una riga per aprirla`
            : 'Elenco delle vendite'
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportCsv} disabled={sorted.length === 0}>
              <Download className="h-4 w-4" />
              Esporta CSV
            </Button>
            <Button asChild className="shadow-[0_8px_22px_rgba(242,15,31,0.18)]">
              <Link to="/vendite/nuova">
                <Plus className="h-4 w-4" />
                Nuova vendita
              </Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2.5 p-3.5">
          <div className="relative min-w-[230px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              placeholder="Cerca cliente, articolo, note…"
              className="pl-9"
              aria-label="Cerca vendite"
            />
          </div>

          <Select
            value={filters.status}
            onValueChange={(v) => updateFilters({ status: v as BillFilters['status'] })}
          >
            <SelectTrigger className="w-[165px]" aria-label="Stato operativo">
              <SelectValue placeholder="Stato operativo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli stati</SelectItem>
              {SELLING_BILL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.payment}
            onValueChange={(v) => updateFilters({ payment: v as BillFilters['payment'] })}
          >
            <SelectTrigger className="w-[155px]" aria-label="Stato pagamento">
              <SelectValue placeholder="Pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i pagamenti</SelectItem>
              {PAYMENT_STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.seller} onValueChange={(v) => updateFilters({ seller: v })}>
            <SelectTrigger className="w-[155px]" aria-label="Venditore">
              <SelectValue placeholder="Venditore" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i venditori</SelectItem>
              {sellers.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilters({ dateFrom: e.target.value })}
            className="w-[145px]"
            aria-label="Da data"
          />
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilters({ dateTo: e.target.value })}
            className="w-[145px]"
            aria-label="A data"
          />

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          )}

          <SummaryPill
            className="ml-auto"
            label="Totale filtrato"
            value={formatCurrency(total)}
            tone="neutral"
          />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title={hasActiveFilters ? 'Nessun risultato' : 'Nessuna fattura'}
            description={
              hasActiveFilters
                ? 'Prova a modificare i filtri di ricerca.'
                : 'Non ci sono ancora fatture di vendita.'
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={resetFilters}>Azzera filtri</Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead label="Data" sortKey="date" current={sortKey} dir={sortDir} onSort={onSort} />
                  <SortableHead label="Cliente" sortKey="client" current={sortKey} dir={sortDir} onSort={onSort} />
                  <SortableHead label="Venditore" sortKey="seller" current={sortKey} dir={sortDir} onSort={onSort} />
                  <TableHead className="hidden lg:table-cell">Articoli</TableHead>
                  <SortableHead label="Stato" sortKey="status" current={sortKey} dir={sortDir} onSort={onSort} />
                  <TableHead>Pagamento</TableHead>
                  <SortableHead
                    label="Totale"
                    sortKey="totalPrice"
                    current={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    className="text-right"
                  />
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((b) => {
                  const payment = getPaymentSummary(b);

                  return (
                    <TableRow
                      key={b.uuid}
                      role="link"
                      tabIndex={0}
                      onClick={() => navigate(`/vendite/${b.uuid}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') navigate(`/vendite/${b.uuid}`);
                      }}
                      className="group cursor-pointer"
                      title="Apri vendita"
                    >
                      <TableCell className="tnum whitespace-nowrap">{formatDate(b.date)}</TableCell>
                      <TableCell className="max-w-[240px] truncate font-bold text-foreground group-hover:text-primary">
                        {b.client || '—'}
                      </TableCell>
                      <TableCell className="font-medium">{b.seller}</TableCell>
                      <TableCell className="hidden max-w-[260px] truncate text-muted-foreground lg:table-cell">
                        {(b.items ?? []).map((i) => i.name).join(', ') || '—'}
                      </TableCell>
                      <TableCell><StatusBadge status={b.status} /></TableCell>
                      <TableCell>
                        {b.status === 'Annullata' ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <PaymentStatusBadge status={payment.status} />
                        )}
                      </TableCell>
                      <TableCell className="tnum text-right font-bold">
                        {formatCurrency(b.totalPrice)}
                      </TableCell>
                      <TableCell
                        className="whitespace-nowrap text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              to={`/vendite/${b.uuid}/stampa?tipo=documento`}
                              aria-label={`Stampa vendita ${b.client}`}
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span className="hidden xl:inline">Stampa</span>
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              to={`/vendite/${b.uuid}/stampa?tipo=bolla`}
                              aria-label={`Bolla ${b.client}`}
                            >
                              <Truck className="h-3.5 w-3.5" />
                              <span className="hidden xl:inline">Bolla</span>
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between border-t border-[#ebe4dc] bg-[#fcfaf7] px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Pagina {safePage + 1} di {pages} · {sorted.length} risultati
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage === 0}
                  onClick={() => setPage(safePage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" /> Prec.
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= pages - 1}
                  onClick={() => setPage(safePage + 1)}
                >
                  Succ. <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
