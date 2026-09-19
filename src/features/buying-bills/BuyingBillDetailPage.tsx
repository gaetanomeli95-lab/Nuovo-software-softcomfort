import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
import { useNavigate } from 'react-router-dom';

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
            id="bp-amt" type="number" min="0" step="0.01"
            value={amount} onChange={(e) => setAmount(e.target.value)}
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
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Indietro">
          <Link to="/acquisti"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <PageHeader
          title={bill.make || 'Fattura di acquisto'}
          description={`Del ${formatDate(bill.date)}`}
          actions={
            <div className="flex items-center gap-2">
              <Badge variant={bill.status === 'Aperta' ? 'warning' : 'outline'}>{bill.status}</Badge>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4" /> Articoli ({items.length})
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
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell className="tnum text-right">
                      {i.price != null ? formatCurrency(i.price) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-semibold">Totale articoli</TableCell>
                  <TableCell className="tnum text-right font-semibold">
                    {formatCurrency(itemsTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
