import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Download, MapPin, Package, Pencil, Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SummaryPill } from '@/components/common/SummaryPill';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useInventoryAvailable, useInventoryDelivered } from '@/hooks/useQueries';
import {
  useAddInventoryItems,
  useSetInventoryDelivered,
  useSetInventoryName,
  useSetInventoryRef,
  useSetItemLocation,
} from '@/hooks/useMutations';
import { formatCurrency } from '@/lib/format';
import { downloadTextFile, toCsv } from '@/lib/export';
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

function AddInventoryDialog() {
  const add = useAddInventoryItems();
  const [open, setOpen] = useState(false);
  const [make, setMake] = useState('');
  const [ref, setRef] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');

  const valid = Boolean(name.trim()) && Math.max(1, Math.floor(Number(quantity || 1))) > 0 && !add.isPending;

  const reset = () => {
    setMake('');
    setRef('');
    setName('');
    setQuantity('1');
  };

  const submit = async () => {
    if (!valid) return;
    await add.mutateAsync([{
      make: make.trim(),
      ref: ref.trim(),
      item: name.trim(),
      quantity: Math.max(1, Math.floor(Number(quantity || 1))),
    }]);
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next && !add.isPending) reset(); }}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Carica merce</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Carica articoli in magazzino</DialogTitle>
          <DialogDescription>
            Inserisci il prodotto e la quantità. La posizione può essere assegnata dopo il carico.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="stock-make">Marca / ditta</Label>
            <Input id="stock-make" value={make} onChange={(e) => setMake(e.target.value)} placeholder="Es. AD Sofa" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stock-ref">Riferimento</Label>
            <Input id="stock-ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Codice articolo" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="stock-name">Articolo</Label>
            <Input id="stock-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Descrizione prodotto" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stock-quantity">Quantità</Label>
            <Input
              id="stock-quantity"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={add.isPending}>Annulla</Button>
          <Button onClick={submit} disabled={!valid}>{add.isPending ? 'Caricamento…' : 'Carica in magazzino'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditInventoryDialog({ item }: { item: InventoryItem }) {
  const rename = useSetInventoryName();
  const setRef = useSetInventoryRef();
  const setLocation = useSetItemLocation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item.name ?? '');
  const [ref, setRefValue] = useState(item.ref ?? '');
  const [location, setLocationValue] = useState(item.location ?? '');

  const busy = rename.isPending || setRef.isPending || setLocation.isPending;

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setName(item.name ?? '');
      setRefValue(item.ref ?? '');
      setLocationValue(item.location ?? '');
    }
  };

  const submit = async () => {
    const operations: Promise<unknown>[] = [];
    if (name.trim() !== (item.name ?? '')) {
      operations.push(rename.mutateAsync({ uuid: item.uuid, name: name.trim() }));
    }
    if (ref.trim() !== (item.ref ?? '')) {
      operations.push(setRef.mutateAsync({ uuid: item.uuid, ref: ref.trim() }));
    }
    if (location.trim() !== (item.location ?? '')) {
      operations.push(setLocation.mutateAsync({ uuid: item.uuid, location: location.trim() }));
    }
    await Promise.all(operations);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Modifica articolo">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica articolo</DialogTitle>
          <DialogDescription>
            Aggiorna descrizione, riferimento e posizione di magazzino.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`stock-edit-name-${item.uuid}`}>Articolo</Label>
            <Input
              id={`stock-edit-name-${item.uuid}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`stock-edit-ref-${item.uuid}`}>Riferimento</Label>
              <Input
                id={`stock-edit-ref-${item.uuid}`}
                value={ref}
                onChange={(e) => setRefValue(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`stock-edit-location-${item.uuid}`}>Posizione</Label>
              <Input
                id={`stock-edit-location-${item.uuid}`}
                value={location}
                onChange={(e) => setLocationValue(e.target.value)}
                placeholder="Es. Bagheria · Zona A"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Annulla</Button>
          <Button onClick={submit} disabled={!name.trim() || busy}>
            {busy ? 'Salvataggio…' : 'Salva modifiche'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InventoryTable({
  rows,
  actionable,
}: {
  rows: InventoryItem[];
  actionable?: boolean;
}) {
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
          <TableHead className="hidden text-center xl:table-cell">Colli</TableHead>
          <TableHead className="text-right">Prezzo</TableHead>
          <TableHead className="w-[110px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((i) => (
          <TableRow key={i.uuid}>
            <TableCell className="font-semibold">{i.name}</TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{i.make || '—'}</TableCell>
            <TableCell className="hidden text-muted-foreground lg:table-cell">{i.ref || '—'}</TableCell>
            <TableCell className="hidden sm:table-cell">
              {i.location ? (
                <Badge variant="outline"><MapPin className="h-3 w-3" /> {i.location}</Badge>
              ) : (
                <span className="text-muted-foreground">Da assegnare</span>
              )}
            </TableCell>
            <TableCell className="hidden text-center text-muted-foreground xl:table-cell">{i.necks || '—'}</TableCell>
            <TableCell className="tnum text-right font-bold">{formatCurrency(i.bPrice)}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <EditInventoryDialog item={i} />
                {actionable && (
                  <ConfirmDialog
                    trigger={
                      <Button
                        size="icon"
                        variant="outline"
                        disabled={deliver.isPending}
                        aria-label="Segna articolo consegnato"
                        title="Segna consegnato"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    }
                    title="Segnare l'articolo come consegnato?"
                    description={`${i.name}${i.location ? ` · ${i.location}` : ''}. Questa azione sposta l'articolo nello storico consegnati.`}
                    confirmLabel="Conferma consegna"
                    onConfirm={() => deliver.mutateAsync(i.uuid)}
                  />
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function InventoryPage() {
  const available = useInventoryAvailable();
  const delivered = useInventoryDelivered();
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(() => searchParams.get('q') ?? '');

  const updateSearch = (value: string) => {
    setQ(value);
    const params = new URLSearchParams(searchParams);
    if (value.trim()) params.set('q', value);
    else params.delete('q');
    setSearchParams(params, { replace: true });
  };

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
  const unlocated = availableRows.filter((item) => !item.location).length;

  const exportCsv = () => {
    const csv = toCsv([
      ['Stato', 'Marca / ditta', 'Riferimento', 'Articolo', 'Quantità', 'Posizione', 'Prezzo acquisto'],
      ...availableRows.map((item) => [
        'Disponibile',
        item.make,
        item.ref,
        item.name,
        item.quantity ?? '',
        item.location ?? '',
        item.bPrice ?? '',
      ]),
      ...deliveredRows.map((item) => [
        'Consegnato',
        item.make,
        item.ref,
        item.name,
        item.quantity ?? '',
        item.location ?? '',
        item.bPrice ?? '',
      ]),
    ]);

    downloadTextFile(
      `softcomfort-magazzino-${new Date().toISOString().slice(0, 10)}.csv`,
      '\uFEFF' + csv,
      'text/csv;charset=utf-8',
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Giacenze di magazzino"
        description="Articoli disponibili, ubicazioni e storico consegnato"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={exportCsv}
              disabled={availableRows.length + deliveredRows.length === 0}
            >
              <Download className="h-4 w-4" /> Esporta CSV
            </Button>
            <AddInventoryDialog />
          </div>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-3.5">
          <div className="relative w-full max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cerca articolo, marca, rif., posizione…"
              className="pl-9"
              value={q}
              onChange={(e) => updateSearch(e.target.value)}
            />
          </div>
          <SummaryPill label="Disponibili" value={String(availableRows.length)} tone="green" />
          <SummaryPill label="Senza posizione" value={String(unlocated)} tone={unlocated > 0 ? 'gold' : 'neutral'} />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : error ? (
            <ErrorState error={error} onRetry={() => { available.refetch(); delivered.refetch(); }} />
          ) : (
            <Tabs defaultValue="available">
              <div className="border-b border-[#eee6de] bg-[#fffefd] px-4 py-3">
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
