import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, HandCoins, Search } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SummaryPill } from '@/components/common/SummaryPill';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useProvisionsPayed, useProvisionsToPay } from '@/hooks/useQueries';
import { useSetProvisionPayed } from '@/hooks/useMutations';
import { formatCurrency } from '@/lib/format';
import type { ProvisionResponse } from '@/types/domain';

function matches(r: ProvisionResponse, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return r.client.toLowerCase().includes(s) || r.provision.seller.toLowerCase().includes(s);
}

function ProvisionsTable({ rows, actionable }: { rows: ProvisionResponse[]; actionable?: boolean }) {
  const pay = useSetProvisionPayed();

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={HandCoins}
        title="Nessuna provvigione"
        description="Non ci sono provvigioni in questa categoria."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Venditore</TableHead>
          <TableHead className="text-right">Importo</TableHead>
          {actionable && <TableHead className="w-[120px]" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.provision.uuid}>
            <TableCell>
              <Link to={`/vendite/${r.uuid}`} className="data-link">
                {r.client}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{r.provision.seller}</TableCell>
            <TableCell className="tnum text-right font-bold">{formatCurrency(r.provision.amount)}</TableCell>
            {actionable && (
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pay.isPending}
                  onClick={() => pay.mutate(r.provision.uuid)}
                >
                  <CheckCircle2 className="h-4 w-4" /> Paga
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ProvisionsPage() {
  const toPay = useProvisionsToPay();
  const payed = useProvisionsPayed();
  const [q, setQ] = useState('');

  const toPayRows = useMemo(
    () => (toPay.data?.provisionResponses ?? []).filter((r) => matches(r, q)),
    [toPay.data, q],
  );
  const payedRows = useMemo(
    () => (payed.data?.provisionResponses ?? []).filter((r) => matches(r, q)),
    [payed.data, q],
  );

  const totalToPay = toPayRows.reduce((s, r) => s + r.provision.amount, 0);
  const isLoading = toPay.isLoading || payed.isLoading;
  const error = toPay.error ?? payed.error;

  return (
    <div className="space-y-5">
      <PageHeader title="Provvigioni" description="Compensi venditori sulle vendite" />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-3.5">
          <div className="relative w-full max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cerca cliente o venditore…"
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <SummaryPill label="Da pagare" value={formatCurrency(totalToPay)} tone="gold" />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : error ? (
            <ErrorState error={error} onRetry={() => { toPay.refetch(); payed.refetch(); }} />
          ) : (
            <Tabs defaultValue="toPay">
              <div className="border-b border-[#eee6de] bg-[#fffefd] px-4 py-3">
                <TabsList>
                  <TabsTrigger value="toPay">Da pagare ({toPayRows.length})</TabsTrigger>
                  <TabsTrigger value="payed">Pagate ({payedRows.length})</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="toPay" className="mt-0">
                <ProvisionsTable rows={toPayRows} actionable />
              </TabsContent>
              <TabsContent value="payed" className="mt-0">
                <ProvisionsTable rows={payedRows} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
