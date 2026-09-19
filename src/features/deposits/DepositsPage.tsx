import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, PiggyBank, Search } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useDepositsCollected, useDepositsToCollect } from '@/hooks/useQueries';
import { useSetDepositCollected } from '@/hooks/useMutations';
import { formatCurrency, formatDate } from '@/lib/format';
import type { DepositResponse } from '@/types/domain';

function matches(d: DepositResponse, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return (
    d.client.toLowerCase().includes(s) ||
    d.deposit.seller.toLowerCase().includes(s) ||
    d.deposit.method.toLowerCase().includes(s)
  );
}

function DepositsTable({
  rows, actionable,
}: {
  rows: DepositResponse[];
  actionable?: boolean;
}) {
  const collect = useSetDepositCollected();
  if (rows.length === 0) {
    return <EmptyState icon={PiggyBank} title="Nessun acconto" description="Non ci sono acconti in questa categoria." />;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead className="hidden md:table-cell">Venditore</TableHead>
          <TableHead className="hidden sm:table-cell">Metodo</TableHead>
          <TableHead className="text-right">Importo</TableHead>
          {actionable && <TableHead className="w-[110px]" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.deposit.uuid}>
            <TableCell className="whitespace-nowrap">{formatDate(r.deposit.date)}</TableCell>
            <TableCell>
              <Link
                to={`/vendite/${r.uuid}`}
                className="font-medium text-primary hover:underline"
              >
                {r.client}
              </Link>
            </TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{r.deposit.seller}</TableCell>
            <TableCell className="hidden sm:table-cell">
              <Badge variant="outline">{r.deposit.method}</Badge>
            </TableCell>
            <TableCell className="tnum text-right font-medium">{formatCurrency(r.deposit.amount)}</TableCell>
            {actionable && (
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={collect.isPending}
                  onClick={() => collect.mutate(r.deposit.uuid)}
                >
                  <CheckCircle2 className="h-4 w-4" /> Incassa
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function DepositsPage() {
  const toCollect = useDepositsToCollect();
  const collected = useDepositsCollected();
  const [q, setQ] = useState('');

  const toCollectRows = useMemo(
    () => (toCollect.data?.depositResponses ?? []).filter((d) => matches(d, q)),
    [toCollect.data, q],
  );
  const collectedRows = useMemo(
    () => (collected.data?.depositResponses ?? []).filter((d) => matches(d, q)),
    [collected.data, q],
  );

  const totalToCollect = toCollectRows.reduce((s, r) => s + r.deposit.amount, 0);
  const isLoading = toCollect.isLoading || collected.isLoading;
  const error = toCollect.error ?? collected.error;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Acconti"
        description="Versamenti dei clienti sulle vendite"
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca cliente, venditore, metodo…"
            className="pl-8"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Badge variant="warning" className="ml-auto">
          Da incassare: {formatCurrency(totalToCollect)}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : error ? (
            <ErrorState error={error} onRetry={() => { toCollect.refetch(); collected.refetch(); }} />
          ) : (
            <Tabs defaultValue="toCollect">
              <div className="border-b px-4 pt-3">
                <TabsList>
                  <TabsTrigger value="toCollect">
                    Da incassare ({toCollectRows.length})
                  </TabsTrigger>
                  <TabsTrigger value="collected">
                    Incassati ({collectedRows.length})
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="toCollect" className="mt-0">
                <DepositsTable rows={toCollectRows} actionable />
              </TabsContent>
              <TabsContent value="collected" className="mt-0">
                <DepositsTable rows={collectedRows} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
