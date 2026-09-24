import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ShoppingCart, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SummaryPill } from '@/components/common/SummaryPill';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { useBuyingBills } from '@/hooks/useQueries';
import { useAddBuyingBill } from '@/hooks/useMutations';
import { formatCurrency, formatDate } from '@/lib/format';
import type { BuyingBillStatus } from '@/types/domain';

type DraftItem = { id: string; name: string; price: string };

function statusVariant(s: BuyingBillStatus) {
  if (s === 'Aperta') return 'warning' as const;
  if (s === 'Chiusa') return 'success' as const;
  if (s === 'Annullata') return 'destructive' as const;
  return 'outline' as const;
}

function NewBuyingBillDialog() {
  const add = useAddBuyingBill();
  const [open, setOpen] = useState(false);
  const [make, setMake] = useState('');
  const [payment, setPayment] = useState('0');
  const [items, setItems] = useState<DraftItem[]>([
    { id: 'buy-draft-1', name: '', price: '' },
  ]);

  const normalized = items
    .map((item) => ({ name: item.name.trim(), price: Math.max(0, Number(item.price || 0)) }))
    .filter((item) => item.name);
  const total = normalized.reduce((sum, item) => sum + item.price, 0);
  const payed = Math.max(0, Math.min(Number(payment || 0), total));
  const valid = Boolean(make.trim()) && normalized.length > 0 && !add.isPending;

  const reset = () => {
    setMake('');
    setPayment('0');
    setItems([{ id: `buy-draft-${Date.now()}`, name: '', price: '' }]);
  };

  const submit = async () => {
    if (!valid) return;
    await add.mutateAsync({
      make: make.trim(),
      totalPrice: total,
      payed,
      itemsRequest: normalized,
    });
    setOpen(false);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next && !add.isPending) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Nuovo acquisto</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nuova fattura di acquisto</DialogTitle>
          <DialogDescription>
            Registra fornitore, articoli e l'eventuale pagamento iniziale.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="buy-make">Fornitore</Label>
              <Input
                id="buy-make"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="Ragione sociale / fornitore"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="buy-payment">Pagamento iniziale (€)</Label>
              <Input
                id="buy-payment"
                type="number"
                min="0"
                max={total || undefined}
                step="0.01"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#e3d9d0] bg-[#faf7f3]">
            <div className="flex items-center justify-between border-b border-[#e5dcd4] px-4 py-3">
              <div>
                <p className="text-sm font-extrabold">Articoli</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Una riga per ogni voce acquistata.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItems((current) => [
                  ...current,
                  { id: `buy-draft-${Date.now()}-${current.length}`, name: '', price: '' },
                ])}
              >
                <Plus className="h-4 w-4" /> Riga
              </Button>
            </div>

            <div className="space-y-3 p-4">
              {items.map((item, index) => (
                <div key={item.id} className="grid gap-3 sm:grid-cols-[36px_1fr_150px_40px] sm:items-end">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#eee6df] text-xs font-extrabold text-[#6d625b]">
                    {index + 1}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`buy-item-${item.id}`}>Descrizione</Label>
                    <Input
                      id={`buy-item-${item.id}`}
                      value={item.name}
                      onChange={(e) => setItems((current) => current.map((row) =>
                        row.id === item.id ? { ...row, name: e.target.value } : row))}
                      placeholder="Es. Cucina Tilia 01"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`buy-price-${item.id}`}>Prezzo (€)</Label>
                    <Input
                      id={`buy-price-${item.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => setItems((current) => current.map((row) =>
                        row.id === item.id ? { ...row, price: e.target.value } : row))}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Rimuovi riga"
                    onClick={() => setItems((current) => {
                      const next = current.filter((row) => row.id !== item.id);
                      return next.length > 0
                        ? next
                        : [{ id: `buy-draft-${Date.now()}`, name: '', price: '' }];
                    })}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-[#ded4ca] bg-[#fffefd] p-4 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Righe</p>
              <p className="mt-1 text-lg font-black">{normalized.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Totale</p>
              <p className="tnum mt-1 text-lg font-black">{formatCurrency(total)}</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Residuo</p>
              <p className="tnum mt-1 text-lg font-black text-[#8a6123]">{formatCurrency(Math.max(0, total - payed))}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={add.isPending}>
            Annulla
          </Button>
          <Button onClick={submit} disabled={!valid}>
            {add.isPending ? 'Salvataggio…' : 'Registra acquisto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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

  const openCount = rows.filter((bill) => bill.status === 'Aperta').length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Fatture di acquisto"
        description="Ordini e acquisti dai fornitori"
        actions={<NewBuyingBillDialog />}
      />

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
          <SummaryPill label="Visibili" value={String(rows.length)} tone="neutral" />
          <SummaryPill label="Aperte" value={String(openCount)} tone="gold" />
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
              description="Registra il primo acquisto dal pulsante in alto."
              action={<NewBuyingBillDialog />}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Fornitore</TableHead>
                  <TableHead className="hidden md:table-cell">Articoli</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Totale articoli</TableHead>
                  <TableHead>Stato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((b) => {
                  const total = (b.items ?? []).reduce((sum, item) => sum + (item.price ?? 0), 0);
                  return (
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
                      <TableCell className="tnum hidden text-right font-bold sm:table-cell">
                        {formatCurrency(total)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
