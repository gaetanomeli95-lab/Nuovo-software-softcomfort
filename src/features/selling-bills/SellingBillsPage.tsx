import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight,
  ReceiptText, RotateCcw, Search,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { SELLING_BILL_STATUSES, type SellingBillStatus } from '@/types/domain';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 25;

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
          'inline-flex items-center gap-1 uppercase tracking-wide',
          active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {label}
        {active ? (
          dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </TableHead>
  );
}

export function SellingBillsPage() {
  const { data, isLoading, error, refetch } = useSellingBills();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filtri inizializzati dai query param (persistenza via URL)
  const [filters, setFilters] = useState<BillFilters>(() => ({
    ...DEFAULT_FILTERS,
    search: searchParams.get('q') ?? '',
    status: (searchParams.get('status') as SellingBillStatus) || 'all',
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
    // Persistenza filtri principali in URL
    const next = { ...filters, ...patch };
    const params = new URLSearchParams();
    if (next.search) params.set('q', next.search);
    if (next.status !== 'all') params.set('status', next.status);
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
    filters.search !== '' || filters.status !== 'all' ||
    filters.seller !== 'all' || filters.dateFrom !== '' || filters.dateTo !== '';

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fatture di vendita"
        description={
          data
            ? `${filtered.length} di ${data.length} fatture · totale ${formatCurrency(total)}`
            : 'Elenco delle vendite'
        }
      />

      {/* Barra filtri */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              placeholder="Cerca cliente, articolo, note…"
              className="pl-9"
              aria-label="Cerca fatture"
            />
          </div>

          <Select
            value={filters.status}
            onValueChange={(v) => updateFilters({ status: v as BillFilters['status'] })}
          >
            <SelectTrigger className="w-[160px]" aria-label="Stato">
              <SelectValue placeholder="Stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli stati</SelectItem>
              {SELLING_BILL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.seller}
            onValueChange={(v) => updateFilters({ seller: v })}
          >
            <SelectTrigger className="w-[160px]" aria-label="Venditore">
              <SelectValue placeholder="Venditore" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i venditori</SelectItem>
              {sellers.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilters({ dateFrom: e.target.value })}
              className="w-[140px]"
              aria-label="Da data"
            />
            <span className="text-xs text-muted-foreground">→</span>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilters({ dateTo: e.target.value })}
              className="w-[140px]"
              aria-label="A data"
            />
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          )}
        </div>
      </Card>

      {/* Tabella */}
      <Card>
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
            action={hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters}>Azzera filtri</Button>
            )}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead label="Data" sortKey="date" current={sortKey} dir={sortDir} onSort={onSort} />
                  <SortableHead label="Cliente" sortKey="client" current={sortKey} dir={sortDir} onSort={onSort} />
                  <SortableHead label="Venditore" sortKey="seller" current={sortKey} dir={sortDir} onSort={onSort} />
                  <TableHead className="hidden md:table-cell">Articoli</TableHead>
                  <SortableHead label="Stato" sortKey="status" current={sortKey} dir={sortDir} onSort={onSort} />
                  <SortableHead label="Totale" sortKey="totalPrice" current={sortKey} dir={sortDir} onSort={onSort} className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((b) => (
                  <TableRow key={b.uuid}>
                    <TableCell className="tnum whitespace-nowrap">{formatDate(b.date)}</TableCell>
                    <TableCell className="max-w-[240px] truncate font-medium">
                      <Link to={`/vendite/${b.uuid}`} className="hover:text-primary hover:underline">
                        {b.client || '—'}
                      </Link>
                    </TableCell>
                    <TableCell>{b.seller}</TableCell>
                    <TableCell className="hidden max-w-[260px] truncate text-muted-foreground md:table-cell">
                      {(b.items ?? []).map((i) => i.name).join(', ') || '—'}
                    </TableCell>
                    <TableCell><StatusBadge status={b.status} /></TableCell>
                    <TableCell className="tnum text-right font-medium">
                      {formatCurrency(b.totalPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Paginazione */}
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Pagina {safePage + 1} di {pages} · {sorted.length} risultati
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline" size="sm"
                  disabled={safePage === 0}
                  onClick={() => setPage(safePage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" /> Prec.
                </Button>
                <Button
                  variant="outline" size="sm"
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
