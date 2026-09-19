import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SummaryPill } from '@/components/common/SummaryPill';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useBuyingBills } from '@/hooks/useQueries';
import { formatDate } from '@/lib/format';
import type { BuyingBillStatus } from '@/types/domain';

function statusVariant(s: BuyingBillStatus) {
  if (s === 'Aperta') return 'warning' as const;
  if (s === 'Chiusa') return 'success' as const;
  if (s === 'Annullata') return 'destructive' as const;
  return 'outline' as const;
}

export function BuyingBillsPage() {
  const { data, isLoading, error, refetch } = useBuyingBills();
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const list = data ?? [];
    const s = q.trim().toLowerCase();
    const filtered = s
      ? list.filter((b) =>
          (b.make ?? '').toLowerCase().includes(s) ||
          b.status.toLowerCase().includes(s) ||
          b.items.some((i) => i.name.toLowerCase().includes(s)))
      : list;
    return [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  }, [data, q]);

  return (
    <div className="space-y-5">
      <PageHeader title="Fatture di acquisto" description="Ordini e acquisti dai fornitori" />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-3.5">
          <div className="relative w-full max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cerca fornitore, stato, articolo…"
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <SummaryPill label="Fatture visibili" value={String(rows.length)} tone="neutral" />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : error ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="Nessuna fattura di acquisto"
              description="Le fatture di acquisto appariranno qui."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Fornitore</TableHead>
                  <TableHead className="hidden md:table-cell">Articoli</TableHead>
                  <TableHead>Stato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((b) => (
                  <TableRow key={b.uuid}>
                    <TableCell className="tnum whitespace-nowrap">{formatDate(b.date)}</TableCell>
                    <TableCell>
                      <Link to={`/acquisti/${b.uuid}`} className="data-link">
                        {b.make || '—'}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {b.items?.length ?? 0} articoli
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
