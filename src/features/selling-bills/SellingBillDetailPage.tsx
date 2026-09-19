import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Ban, CheckCircle2, Circle, HandCoins, MoreHorizontal, Package,
  Pencil, Phone, MapPin, Plus, StickyNote, Trash2, Wrench,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useSellingBill } from '@/hooks/useQueries';
import {
  useAddBillItem, useAddDeposit, useCancelBill, useDeleteBill,
  useRemoveBillItem, useRemoveDeposit, useSetAssistance, useSetItemArrived,
  useSetItemCompany, useSetItemDelivered, useSetItemOrdered, useSetProvision,
  useUpdateNotes,
} from '@/hooks/useMutations';
import { useAuth } from '@/features/auth/AuthContext';
import { formatCurrency, formatDate } from '@/lib/format';
import { SELLING_BILL_WORKFLOW, type SellingBillItem, type SellingBillStatus } from '@/types/domain';
import { cn } from '@/lib/utils';

/** Stepper del workflow vendita. */
function WorkflowStepper({ status }: { status: SellingBillStatus }) {
  if (status === 'Annullata') {
    return <Badge variant="destructive">Fattura annullata</Badge>;
  }
  const currentIdx = SELLING_BILL_WORKFLOW.indexOf(status);
  return (
    <ol className="flex flex-wrap items-center gap-1">
      {SELLING_BILL_WORKFLOW.map((step, i) => {
        const done = i < currentIdx;
        const current = i === currentIdx;
        return (
          <li key={step} className="flex items-center gap-1">
            {i > 0 && <span className="mx-1 h-px w-4 bg-border" />}
            <span
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                current && 'bg-primary/10 text-primary',
                done && 'text-success',
                !done && !current && 'text-muted-foreground',
              )}
            >
              {done ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Circle className={cn('h-3.5 w-3.5', current && 'fill-primary/20')} />
              )}
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Avanzamento articolo interattivo: click per togglare lo stato. */
function ItemProgress({ billUuid, item }: { billUuid: string; item: SellingBillItem }) {
  const setOrdered = useSetItemOrdered(billUuid);
  const setArrived = useSetItemArrived(billUuid);
  const setDelivered = useSetItemDelivered(billUuid);
  const busy = setOrdered.isPending || setArrived.isPending || setDelivered.isPending;

  const steps = [
    { label: 'Ordinato', done: item.ordered, run: () => setOrdered.mutate({ itemUUID: item.uuid, state: !item.ordered }) },
    { label: 'Arrivato', done: item.arrived, run: () => setArrived.mutate({ itemUUID: item.uuid, arrived: !item.arrived }) },
    { label: 'Consegnato', done: item.delivered, run: () => setDelivered.mutate({ itemUUID: item.uuid, delivered: !item.delivered }) },
  ];
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <span key={s.label} className="flex items-center gap-1">
          {i > 0 && <span className="mx-0.5 h-px w-3 bg-border" />}
          <button
            type="button"
            disabled={busy}
            onClick={s.run}
            title={`Clicca per ${s.done ? 'rimuovere' : 'impostare'} "${s.label}"`}
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors',
              'hover:ring-1 hover:ring-ring disabled:opacity-50',
              s.done ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground',
            )}
          >
            {s.label}
          </button>
        </span>
      ))}
    </div>
  );
}

/* ---------- Dialoghi ---------- */

function AddItemDialog({ billUuid }: { billUuid: string }) {
  const add = useAddBillItem(billUuid);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const submit = async () => {
    await add.mutateAsync({ name: name.trim(), price: Number(price) });
    setOpen(false); setName(''); setPrice('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="h-4 w-4" /> Articolo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aggiungi articolo</DialogTitle>
          <DialogDescription>Nuova riga sulla fattura di vendita.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="it-name">Descrizione</Label>
            <Input id="it-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="it-price">Prezzo (€)</Label>
            <Input id="it-price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
          <Button onClick={submit} disabled={!name.trim() || !(Number(price) >= 0) || add.isPending}>Aggiungi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditCompanyDialog({ billUuid, item }: { billUuid: string; item: SellingBillItem }) {
  const setCompanyMut = useSetItemCompany(billUuid);
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState(item.company ?? '');

  const submit = async () => {
    await setCompanyMut.mutateAsync({ itemUUID: item.uuid, company: company.trim() });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="inline-flex items-center gap-1 text-left hover:text-primary" title="Modifica ditta">
          {item.company || '—'} <Pencil className="h-3 w-3 opacity-50" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ditta fornitrice</DialogTitle>
          <DialogDescription>{item.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="it-company">Ditta</Label>
          <Input id="it-company" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
          <Button onClick={submit} disabled={setCompanyMut.isPending}>Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const DEPOSIT_METHODS = ['Contanti', 'Pos', 'Assegno', 'Bonifico', 'Finanziamento'];

function AddDepositDialog({ billUuid, seller }: { billUuid: string; seller: string }) {
  const add = useAddDeposit(billUuid);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState('Contanti');
  const [amount, setAmount] = useState('');

  const submit = async () => {
    await add.mutateAsync({ date, seller, method, amount: Number(amount) });
    setOpen(false); setAmount('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="h-4 w-4" /> Acconto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registra acconto</DialogTitle>
          <DialogDescription>Versamento del cliente su questa vendita.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dp-date">Data</Label>
              <Input id="dp-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dp-amt">Importo (€)</Label>
              <Input id="dp-amt" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Metodo</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DEPOSIT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
          <Button onClick={submit} disabled={!(Number(amount) > 0) || add.isPending}>Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditNotesDialog({ billUuid, notes }: { billUuid: string; notes: string }) {
  const update = useUpdateNotes(billUuid);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(notes);

  const submit = async () => {
    await update.mutateAsync(text);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /> Modifica</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Note vendita</DialogTitle>
        </DialogHeader>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
          <Button onClick={submit} disabled={update.isPending}>Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SellingBillDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { data: bill, isLoading, error, refetch } = useSellingBill(uuid);
  const { user } = useAuth();
  const navigate = useNavigate();

  const cancelBill = useCancelBill(uuid ?? '');
  const deleteBill = useDeleteBill(uuid ?? '');
  const setAssistance = useSetAssistance(uuid ?? '');
  const setProvision = useSetProvision(uuid ?? '');
  const removeDeposit = useRemoveDeposit(uuid ?? '');
  const removeItem = useRemoveBillItem(uuid ?? '');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/vendite"><ArrowLeft className="h-4 w-4" /> Torna alle vendite</Link>
        </Button>
        <Card>
          {error ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : (
            <EmptyState title="Fattura non trovata" />
          )}
        </Card>
      </div>
    );
  }

  const paidDeposits = (bill.deposits ?? []).filter((d) => d.collected);
  const paidTotal = paidDeposits.reduce((s, d) => s + d.amount, 0);
  const balance = (bill.totalPrice ?? 0) - paidTotal;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Indietro">
          <Link to="/vendite"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <PageHeader
          title={bill.client || 'Fattura'}
          description={`Vendita del ${formatDate(bill.date)} · ${bill.seller}`}
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge status={bill.status} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Azioni fattura">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setAssistance.mutate(!bill.assistance)}>
                    <Wrench className="h-4 w-4" />
                    {bill.assistance ? 'Rimuovi assistenza' : 'Segna come assistenza'}
                  </DropdownMenuItem>
                  {!bill.provision && (
                    <DropdownMenuItem onClick={() => setProvision.mutate()}>
                      <HandCoins className="h-4 w-4" /> Registra provvigione
                    </DropdownMenuItem>
                  )}
                  {bill.status !== 'Annullata' && (
                    <>
                      <DropdownMenuSeparator />
                      <ConfirmDialog
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Ban className="h-4 w-4" /> Annulla fattura
                          </DropdownMenuItem>
                        }
                        title="Annullare la fattura?"
                        description="La fattura verrà marcata come annullata."
                        confirmLabel="Annulla fattura"
                        destructive
                        onConfirm={() => cancelBill.mutateAsync()}
                      />
                    </>
                  )}
                  {user?.isAdmin && (
                    <ConfirmDialog
                      trigger={
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" /> Elimina definitivamente
                        </DropdownMenuItem>
                      }
                      title="Eliminare la fattura?"
                      description="Rimozione definitiva dal sistema. Solo per amministratori."
                      confirmLabel="Elimina"
                      destructive
                      onConfirm={async () => {
                        await deleteBill.mutateAsync();
                        navigate('/vendite');
                      }}
                    />
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
          className="flex-1"
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <WorkflowStepper status={bill.status} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Colonna principale */}
        <div className="space-y-4 lg:col-span-2">
          {/* Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-base font-medium">{bill.client || '—'}</p>
              {bill.address && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" /> {bill.address}
                </p>
              )}
              {bill.phone && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" /> {bill.phone}
                </p>
              )}
              {bill.assistance && (
                <Badge variant="info" className="mt-1">
                  <Wrench className="h-3 w-3" /> Assistenza
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Articoli */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" /> Articoli ({bill.items?.length ?? 0})
              </CardTitle>
              <AddItemDialog billUuid={bill.uuid} />
            </CardHeader>
            <CardContent className="p-0">
              {(bill.items ?? []).length === 0 ? (
                <EmptyState title="Nessun articolo" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Articolo</TableHead>
                      <TableHead className="hidden md:table-cell">Ditta</TableHead>
                      <TableHead>Avanzamento</TableHead>
                      <TableHead className="text-right">Prezzo</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bill.items.map((item) => (
                      <TableRow key={item.uuid}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          <EditCompanyDialog billUuid={bill.uuid} item={item} />
                        </TableCell>
                        <TableCell><ItemProgress billUuid={bill.uuid} item={item} /></TableCell>
                        <TableCell className="tnum text-right">{formatCurrency(item.price)}</TableCell>
                        <TableCell>
                          <ConfirmDialog
                            trigger={
                              <Button variant="ghost" size="icon" aria-label="Rimuovi articolo">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            }
                            title="Rimuovere l'articolo?"
                            description={item.name}
                            confirmLabel="Rimuovi"
                            destructive
                            onConfirm={() => removeItem.mutateAsync(item.uuid)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Note */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" /> Note
              </CardTitle>
              <EditNotesDialog billUuid={bill.uuid} notes={bill.notes ?? ''} />
            </CardHeader>
            <CardContent>
              {bill.notes ? (
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{bill.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Nessuna nota.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonna laterale */}
        <div className="space-y-4">
          {/* Riepilogo economico */}
          <Card>
            <CardHeader>
              <CardTitle>Riepilogo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Articoli</span>
                <span className="tnum">{formatCurrency(bill.itemsPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trasporto</span>
                <span className="tnum">{formatCurrency(bill.transport)}</span>
              </div>
              {bill.settlement !== 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saldo/Conguaglio</span>
                  <span className="tnum">{formatCurrency(bill.settlement)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Totale</span>
                <span className="tnum">{formatCurrency(bill.totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Versato (acconti)</span>
                <span className="tnum text-success">{formatCurrency(paidTotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Residuo</span>
                <span className={cn('tnum', balance > 0 ? 'text-warning-foreground' : 'text-success')}>
                  {formatCurrency(balance)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Acconti */}
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Acconti ({bill.deposits?.length ?? 0})</CardTitle>
                <CardDescription>Versamenti registrati sulla vendita</CardDescription>
              </div>
              <AddDepositDialog billUuid={bill.uuid} seller={bill.seller} />
            </CardHeader>
            <CardContent className="space-y-2">
              {(bill.deposits ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Nessun acconto.</p>
              ) : (
                bill.deposits.map((d) => (
                  <div key={d.uuid} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                    <div>
                      <p className="tnum font-medium">{formatCurrency(d.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(d.date)} · {d.method} · {d.seller}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={d.collected ? 'success' : 'warning'}>
                        {d.collected ? 'Incassato' : 'Da incassare'}
                      </Badge>
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Rimuovi acconto">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        }
                        title="Rimuovere l'acconto?"
                        description={`${formatCurrency(d.amount)} del ${formatDate(d.date)}`}
                        confirmLabel="Rimuovi"
                        destructive
                        onConfirm={() => removeDeposit.mutateAsync(d.amount)}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Provvigione */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HandCoins className="h-4 w-4" /> Provvigione
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bill.provision ? (
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="tnum font-medium">{formatCurrency(bill.provision.amount)}</p>
                    <p className="text-xs text-muted-foreground">{bill.provision.seller}</p>
                  </div>
                  <Badge variant={bill.provision.payed ? 'success' : 'warning'}>
                    {bill.provision.payed ? 'Pagata' : 'Da pagare'}
                  </Badge>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Nessuna provvigione.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={setProvision.isPending}
                    onClick={() => setProvision.mutate()}
                  >
                    <HandCoins className="h-4 w-4" /> Registra provvigione
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
