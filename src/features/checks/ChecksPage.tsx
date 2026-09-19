import { useMemo, useState } from 'react';
import { Landmark, Plus, Search, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useChecks } from '@/hooks/useQueries';
import { useAddCheck, useDeleteCheck } from '@/hooks/useMutations';
import { daysUntil, formatCurrency, formatDate } from '@/lib/format';
import type { Check } from '@/types/domain';

function AddCheckDialog() {
  const add = useAddCheck();
  const [open, setOpen] = useState(false);
  const [make, setMake] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [amount, setAmount] = useState('');
  const [billNumbers, setBillNumbers] = useState('');

  const valid = make.trim() && expireDate && Number(amount) > 0;

  const submit = async () => {
    await add.mutateAsync({
      make: make.trim(),
      expireDate,
      amount: Number(amount),
      billNumbers: billNumbers.trim() || undefined,
    });
    setOpen(false);
    setMake(''); setExpireDate(''); setAmount(''); setBillNumbers('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Nuovo assegno</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registra assegno</DialogTitle>
          <DialogDescription>Inserisci i dati dell'assegno ricevuto.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ck-make">Emittente</Label>
            <Input id="ck-make" value={make} onChange={(e) => setMake(e.target.value)} placeholder="Banca / emittente" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ck-exp">Scadenza</Label>
              <Input id="ck-exp" type="date" value={expireDate} onChange={(e) => setExpireDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ck-amt">Importo (€)</Label>
              <Input id="ck-amt" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ck-bills">N. fatture (opzionale)</Label>
            <Input id="ck-bills" value={billNumbers} onChange={(e) => setBillNumbers(e.target.value)} placeholder="es. 12, 15, 18" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
          <Button onClick={submit} disabled={!valid || add.isPending}>Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ChecksPage() {
  const { data, isLoading, error, refetch } = useChecks();
  const del = useDeleteCheck();
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const list = data ?? [];
    const s = q.trim().toLowerCase();
    const filtered = s
      ? list.filter((c) =>
          c.make.toLowerCase().includes(s) ||
          (c.billNumbers ?? '').toLowerCase().includes(s))
      : list;
    return [...filtered].sort((a, b) => a.expireDate.localeCompare(b.expireDate));
  }, [data, q]);

  const total = rows.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Assegni"
        description="Assegni ricevuti e relative scadenze"
        actions={<AddCheckDialog />}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca emittente o n. fattura…"
            className="pl-8"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="ml-auto">
          Totale: {formatCurrency(total)}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : error ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : rows.length === 0 ? (
            <EmptyState icon={Landmark} title="Nessun assegno" description="Non ci sono assegni registrati." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scadenza</TableHead>
                  <TableHead>Emittente</TableHead>
                  <TableHead className="hidden md:table-cell">N. fatture</TableHead>
                  <TableHead className="text-right">Importo</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c: Check) => {
                  const days = daysUntil(c.expireDate);
                  const urgent = days !== null && days <= 7;
                  const expired = days !== null && days < 0;
                  return (
                    <TableRow key={c.uuid}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {formatDate(c.expireDate)}
                          {expired ? (
                            <Badge variant="destructive">Scaduto</Badge>
                          ) : urgent ? (
                            <Badge variant="warning">{days}g</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{c.make}</TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {c.billNumbers || '—'}
                      </TableCell>
                      <TableCell className="tnum text-right font-medium">{formatCurrency(c.amount)}</TableCell>
                      <TableCell>
                        <ConfirmDialog
                          trigger={
                            <Button variant="ghost" size="icon" aria-label="Elimina assegno">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          }
                          title="Eliminare l'assegno?"
                          description={`${c.make} · ${formatCurrency(c.amount)} — l'operazione non è reversibile.`}
                          confirmLabel="Elimina"
                          destructive
                          onConfirm={() => del.mutateAsync(c.uuid)}
                        />
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
