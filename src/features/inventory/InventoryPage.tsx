import { useMemo, useState } from 'react';
import { CheckCircle2, Package, Search } from 'lucide-react';
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
import { useInventoryAvailable, useInventoryDelivered } from '@/hooks/useQueries';
import { useSetInventoryDelivered } from '@/hooks/useMutations';
import { formatCurrency } from '@/lib/format';
import type { InventoryItem } from '@/types/domain';

function matches(i: InventoryItem, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return (
    i.name.toLowerCase().includes(s) ||
    (i.make ?? '').toLowerCase().includes(s) ||
    (i.ref ?? '').toLowerCase().includes(s) ||
    (i.location ?? '').toLowerCase().includes(s)
  );
}

function InventoryTable({ rows, actionable }: { rows: InventoryItem[]; actionable?: boolean }) {
  const deliver = useSetInventoryDelivered();
  if (rows.length === 0) {
    return <EmptyState icon={Package} title="Nessun articolo" description="Il magazzino è vuoto in questa categoria." />;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Articolo</TableHead>
          <TableHead className="hidden md:table-cell">Marca</TableHead>
          <TableHead className="hidden lg:table-cell">Rif.</TableHead>
          <TableHead className="hidden sm:table-cell">Posizione</TableHead>
          <TableHead className="text-right">Prezzo</TableHead>
          {actionable && <TableHead className="w-[120px]" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((i) => (
          <TableRow key={i.uuid}>
            <TableCell className="font-medium">{i.name}</TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{i.make || '—'}</TableCell>
            <TableCell className="hidden text-muted-foreground lg:table-cell">{i.ref || '—'}</TableCell>
            <TableCell className="hidden sm:table-cell">
              {i.location ? <Badge variant="outline">{i.location}</Badge> : '—'}
            </TableCell>
            <TableCell className="tnum text-right">{formatCurrency(i.bPrice)}</TableCell>
            {actionable && (
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={deliver.isPending}
                  onClick={() => deliver.mutate(i.uuid)}
                >
                  <CheckCircle2 className="h-4 w-4" /> Consegna
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function InventoryPage() {
  const available = useInventoryAvailable();
  const delivered = useInventoryDelivered();
  const [q, setQ] = useState('');

  const availableRows = useMemo(
    () => (available.data ?? []).filter((i) => matches(i, q)),
    [available.data, q],
  );
  const deliveredRows = useMemo(
    () => (delivered.data ?? []).filter((i) => matches(i, q)),
    [delivered.data, q],
  );

  const isLoading = available.isLoading || delivered.isLoading;
  const error = available.error ?? delivered.error;

  return (
    <div className="space-y-4">
      <PageHeader title="Giacenze di magazzino" description="Articoli disponibili e consegnati" />

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca articolo, marca, rif., posizione…"
          className="pl-8"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : error ? (
            <ErrorState error={error} onRetry={() => { available.refetch(); delivered.refetch(); }} />
          ) : (
            <Tabs defaultValue="available">
              <div className="border-b px-4 pt-3">
                <TabsList>
                  <TabsTrigger value="available">Disponibili ({availableRows.length})</TabsTrigger>
                  <TabsTrigger value="delivered">Consegnati ({deliveredRows.length})</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="available" className="mt-0">
                <InventoryTable rows={availableRows} actionable />
              </TabsContent>
              <TabsContent value="delivered" className="mt-0">
                <InventoryTable rows={deliveredRows} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
