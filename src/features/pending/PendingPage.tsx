import { useMemo, useState } from 'react';
import { Clock, Plus, Search, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SummaryPill } from '@/components/common/SummaryPill';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { usePendingOrders } from '@/hooks/useQueries';
import { useAddPending, useDeletePending, useUpdatePending } from '@/hooks/useMutations';
import { formatCurrency } from '@/lib/format';
import type { PendingOrder } from '@/types/domain';

function AddPendingDialog() {
  const add = useAddPending();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const submit = async () => {
    await add.mutateAsync(name.trim());
    setOpen(false);
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Nuovo ordine</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuovo ordine in sospeso</DialogTitle>
          <DialogDescription>Articolo da ordinare non legato a una vendita.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="pd-name">Descrizione articolo</Label>
          <Input
            id="pd-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="es. Divano 3 posti tessuto grigio"
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && submit()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
          <Button onClick={submit} disabled={!name.trim() || add.isPending}>Aggiungi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PendingPage() {
  const { data, isLoading, error, refetch } = usePendingOrders();
  const update = useUpdatePending();
  const del = useDeletePending();
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const list = data ?? [];
    const s = q.trim().toLowerCase();
    return s
      ? list.filter((o) =>
          o.name.toLowerCase().includes(s) ||
          (o.company ?? '').toLowerCase().includes(s))
      : list;
  }, [data, q]);

  const toggle = (order: PendingOrder, field: 'ordered' | 'arrived' | 'delivered') => {
    update.mutate({ ...order, [field]: !order[field] });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ordini in sospeso"
        description="Articoli da ordinare non legati a una vendita"
        actions={<AddPendingDialog />}
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-3.5">
          <div className="relative w-full max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cerca articolo o ditta…"
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <SummaryPill label="In sospeso" value={String(rows.length)} tone="gold" />
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
              icon={Clock}
              title="Nessun ordine in sospeso"
              description="Gli articoli da ordinare appariranno qui."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Articolo</TableHead>
                  <TableHead className="hidden md:table-cell">Ditta</TableHead>
                  <TableHead className="text-center">Ordinato</TableHead>
                  <TableHead className="text-center">Arrivato</TableHead>
                  <TableHead className="text-center">Consegnato</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Importo</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((o) => (
                  <TableRow key={o.uuid}>
                    <TableCell className="font-semibold">{o.name}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {o.company || '—'}
                    </TableCell>
                    {(['ordered', 'arrived', 'delivered'] as const).map((field) => (
                      <TableCell key={field} className="text-center">
                        <Checkbox
                          checked={Boolean(o[field])}
                          disabled={update.isPending}
                          onCheckedChange={() => toggle(o, field)}
                          aria-label={field}
                        />
                      </TableCell>
                    ))}
                    <TableCell className="hidden text-right sm:table-cell">
                      {o.price != null ? (
                        <span className="tnum font-bold">{formatCurrency(o.price)}</span>
                      ) : (
                        <Badge variant="outline">—</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Elimina ordine">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        }
                        title="Eliminare l'ordine?"
                        description={o.name}
                        confirmLabel="Elimina"
                        destructive
                        onConfirm={() => del.mutateAsync(o.uuid)}
                      />
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
