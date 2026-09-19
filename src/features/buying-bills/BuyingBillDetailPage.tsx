import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useBuyingBill } from '@/hooks/useQueries';
import { useAddBuyingPayment, useDeleteBuyingBill } from '@/hooks/useMutations';
import { useAuth } from '@/features/auth/AuthContext';
import { formatCurrency, formatDate } from '@/lib/format';

function AddPaymentDialog({ uuid }: { uuid: string }) {
  const add = useAddBuyingPayment();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');

  const submit = async () => {
    await add.mutateAsync({ uuid, payment: Number(amount) });
    setOpen(false);
    setAmount('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="h-4 w-4" /> Pagamento</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registra pagamento</DialogTitle>
          <DialogDescription>Versamento verso il fornitore.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="bp-amt">Importo (€)</Label>
          <Input
            id="bp-amt"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
          <Button onClick={submit} disabled={!(Number(amount) > 0) || add.isPending}>Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BuyingBillDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { data: bill, isLoading, error, refetch } = useBuyingBill(uuid);
  const del = useDeleteBuyingBill();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/acquisti"><ArrowLeft className="h-4 w-4" /> Torna agli acquisti</Link>
        </Button>
        <Card>
          {error ? <ErrorState error={error} onRetry={() => refetch()} /> : <EmptyState title="Fattura non trovata" />}
        </Card>
      </div>
    );
  }

  const items = bill.items ?? [];
  const itemsTotal = items.reduce((s, i) => s + (i.price ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild aria-label="Indietro" className="rounded-full bg-white">
          <Link to="/acquisti"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <PageHeader
          title={bill.make || 'Fattura di acquisto'}
          description={`Documento del ${formatDate(bill.date)}`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={bill.status === 'Aperta' ? 'warning' : bill.status === 'Chiusa' ? 'success' : 'outline'}>
                {bill.status}
              </Badge>
              <AddPaymentDialog uuid={bill.uuid} />
              {user?.isAdmin && (
                <ConfirmDialog
                  trigger={
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-4 w-4" /> Elimina
                    </Button>
                  }
                  title="Eliminare la fattura di acquisto?"
                  description="L'operazione non è reversibile."
                  confirmLabel="Elimina"
                  destructive
                  onConfirm={async () => {
                    await del.mutateAsync(bill.uuid);
                    navigate('/acquisti');
                  }}
                />
              )}
            </div>
          }
          className="flex-1"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
            <CardTitle className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#fff0f1] text-primary">
                <Package className="h-4 w-4" />
              </span>
              Articoli ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {items.length === 0 ? (
              <EmptyState title="Nessun articolo" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Articolo</TableHead>
                    <TableHead className="text-right">Prezzo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((i) => (
                    <TableRow key={i.uuid}>
                      <TableCell className="font-semibold">{i.name}</TableCell>
                      <TableCell className="tnum text-right font-bold">
                        {i.price != null ? formatCurrency(i.price) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit overflow-hidden border-[#e7ddd3]">
          <CardHeader className="border-b border-[#eee6de] bg-[#fbf7f2]">
            <CardTitle>Riepilogo acquisto</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Totale articoli
            </p>
            <p className="tnum mt-2 text-2xl font-extrabold tracking-[-0.03em] text-foreground">
              {formatCurrency(itemsTotal)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? 'articolo registrato' : 'articoli registrati'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
