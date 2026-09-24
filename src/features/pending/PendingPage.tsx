import { useMemo, useState } from 'react';
import { Clock, Pencil, Plus, Search, Trash2 } from 'lucide-react';
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
          <DialogDescription>
            Inserisci la descrizione; ditta e importo possono essere completati subito dopo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="pd-name">Descrizione articolo</Label>
          <Input
            id="pd-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="es. Divano 3 posti tessuto grigio"
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && submit()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
          <Button onClick={submit} disabled={!name.trim() || add.isPending}>
            {add.isPending ? 'Aggiunta…' : 'Aggiungi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditPendingDialog({ order }: { order: PendingOrder }) {
  const update = useUpdatePending();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(order.name ?? '');
  const [company, setCompany] = useState(order.company ?? '');
  const [price, setPrice] = useState(order.price != null ? String(order.price) : '');

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setName(order.name ?? '');
      setCompany(order.company ?? '');
      setPrice(order.price != null ? String(order.price) : '');
    }
  };

  const submit = async () => {
    await update.mutateAsync({
      uuid: order.uuid,
      name: name.trim(),
      company: company.trim(),
      price: price === '' ? undefined : Math.max(0, Number(price)),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Modifica ordine">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica ordine in sospeso</DialogTitle>
          <DialogDescription>Completa i dati utili all'ordine e al controllo fornitori.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`pending-name-${order.uuid}`}>Articolo</Label>
            <Input
              id={`pending-name-${order.uuid}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`pending-company-${order.uuid}`}>Ditta</Label>
              <Input
                id={`pending-company-${order.uuid}`}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Fornitore"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`pending-price-${order.uuid}`}>Importo (€)</Label>
              <Input
                id={`pending-price-${order.uuid}`}
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={update.isPending}>Annulla</Button>
          <Button onClick={submit} disabled={!name.trim() || update.isPending}>
            {update.isPending ? 'Salvataggio…' : 'Salva'}
          </Button>
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
    const filtered = s
      ? list.filter((o) =>
          o.name.toLowerCase().includes(s) ||
          (o.company ?? '').toLowerCase().includes(s))
      : list;

    return [...filtered].sort((a, b) => {
      const score = (order: PendingOrder) =>
        order.delivered ? 3 : order.arrived ? 2 : order.ordered ? 1 : 0;
      return score(a) - score(b) || a.name.localeCompare(b.name);
    });
  }, [data, q]);

  const toOrder = rows.filter((order) => !order.ordered).length;
  const waitingArrival = rows.filter((order) => order.ordered && !order.arrived).length;
  const ready = rows.filter((order) => order.arrived && !order.delivered).length;

  const toggle = (order: PendingOrder, field: 'ordered' | 'arrived' | 'delivered') => {
    const patch: Partial<PendingOrder> & { uuid: string } = {
      uuid: order.uuid,
      [field]: !order[field],
    };

    if (field === 'arrived' && !order.arrived) patch.ordered = true;
    if (field === 'delivered' && !order.delivered) {
      patch.ordered = true;
      patch.arrived = true;
    }
    if (field === 'ordered' && order.ordered) {
      patch.arrived = false;
      patch.delivered = false;
    }
    if (field === 'arrived' && order.arrived) patch.delivered = false;

    update.mutate(patch);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ordini in sospeso"
        description="Articoli da ordinare, arrivi e consegne fuori dalle vendite"
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
          <SummaryPill label="Da ordinare" value={String(toOrder)} tone="gold" />
          <SummaryPill label="In arrivo" value={String(waitingArrival)} tone="neutral" />
          <SummaryPill label="Pronti" value={String(ready)} tone="green" />
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
              action={<AddPendingDialog />}
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
                  <TableHead className="w-[96px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((o) => (
                  <TableRow key={o.uuid} className={o.delivered ? 'opacity-60' : undefined}>
                    <TableCell className="font-semibold">
                      <div className="flex items-center gap-2">
                        {o.name}
                        {o.delivered && <Badge variant="success">Completato</Badge>}
                      </div>
                    </TableCell>
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
                      <div className="flex justify-end gap-1">
                        <EditPendingDialog order={o} />
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
                      </div>
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
