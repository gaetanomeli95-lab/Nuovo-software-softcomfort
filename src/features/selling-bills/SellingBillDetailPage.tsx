import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Ban, CheckCircle2, Circle, HandCoins, MoreHorizontal, Package,
  Pencil, Phone, MapPin, Plus, Printer, StickyNote, Trash2, Truck, Wrench,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { PaymentStatusBadge } from '@/components/common/PaymentStatusBadge';
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
import { getPaymentSummary } from './paymentStatus';
import {
  composeCommissionNotes,
  measureSourceLabel,
  parseCommissionNotes,
  yesNoLabel,
  type CommissionMetadata,
} from './commissionMetadata';

function WorkflowStepper({ status }: { status: SellingBillStatus }) {
  if (status === 'Annullata') {
    return <Badge variant="destructive">Fattura annullata</Badge>;
  }

  const currentIdx = SELLING_BILL_WORKFLOW.indexOf(status);

  return (
    <ol className="flex flex-wrap items-center gap-1.5">
      {SELLING_BILL_WORKFLOW.map((step, i) => {
        const done = i < currentIdx;
        const current = i === currentIdx;

        return (
          <li key={step} className="flex items-center gap-1.5">
            {i > 0 && <span className="mx-0.5 h-px w-5 bg-[#ddd5cd]" />}
            <span
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors',
                current && 'border-[#f1c7ca] bg-[#fff0f1] text-[#a40d16]',
                done && 'border-[#c7e0d1] bg-[#eff7f2] text-success',
                !done && !current && 'border-[#e3dcd4] bg-[#f7f3ee] text-muted-foreground',
              )}
            >
              {done ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Circle className={cn('h-3.5 w-3.5', current && 'fill-primary/10')} />
              )}
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

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
    <div className="flex flex-wrap items-center gap-1">
      {steps.map((s, i) => (
        <span key={s.label} className="flex items-center gap-1">
          {i > 0 && <span className="mx-0.5 h-px w-3 bg-[#ddd5cd]" />}
          <button
            type="button"
            disabled={busy}
            onClick={s.run}
            title={`Clicca per ${s.done ? 'rimuovere' : 'impostare'} "${s.label}"`}
            className={cn(
              'rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all disabled:opacity-50',
              s.done
                ? 'border-[#c7e0d1] bg-[#eff7f2] text-success hover:border-[#a8d2b9]'
                : 'border-[#e2dad2] bg-[#f7f3ee] text-muted-foreground hover:border-[#d3c8bd] hover:bg-white',
            )}
          >
            {s.label}
          </button>
        </span>
      ))}
    </div>
  );
}

function AddItemDialog({ billUuid }: { billUuid: string }) {
  const add = useAddBillItem(billUuid);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const submit = async () => {
    await add.mutateAsync({ name: name.trim(), price: Number(price) });
    setOpen(false);
    setName('');
    setPrice('');
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
        <button
          type="button"
          className="inline-flex items-center gap-1 text-left font-medium text-[#625954] hover:text-primary"
          title="Modifica ditta"
        >
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
    setOpen(false);
    setAmount('');
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
  const parsed = parseCommissionNotes(notes);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(parsed.visibleNotes);

  const submit = async () => {
    const nextNotes = parsed.metadata
      ? composeCommissionNotes(parsed.metadata, text)
      : text;
    await update.mutateAsync(nextNotes);
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

function EditCommissionDialog({
  billUuid,
  notes,
}: {
  billUuid: string;
  notes: string;
}) {
  const update = useUpdateNotes(billUuid);
  const parsed = parseCommissionNotes(notes);
  const emptyMetadata: CommissionMetadata = {
    city: '',
    floor: '',
    staircase: '',
    elevator: '',
    measureSource: '',
    hoist: '',
    attachments: '',
    attachmentPages: null,
    scheduledDate: '',
    scheduledTime: '',
  };
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(parsed.metadata ?? emptyMetadata);

  const openChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) setDraft(parseCommissionNotes(notes).metadata ?? emptyMetadata);
  };

  const save = async () => {
    await update.mutateAsync(composeCommissionNotes(draft, parsed.visibleNotes));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="h-4 w-4" />
          {parsed.metadata ? 'Modifica' : 'Aggiungi dati'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Dati consegna e rilievo</DialogTitle>
          <DialogDescription>
            Aggiorna le informazioni operative usate anche nel planning consegne.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="commission-city">Città</Label>
            <Input
              id="commission-city"
              value={draft.city}
              onChange={(e) => setDraft((current) => ({ ...current, city: e.target.value }))}
              placeholder="Es. Palermo"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="commission-floor">Piano</Label>
            <Input
              id="commission-floor"
              value={draft.floor}
              onChange={(e) => setDraft((current) => ({ ...current, floor: e.target.value }))}
              placeholder="Es. 3"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="commission-staircase">Scala</Label>
            <Input
              id="commission-staircase"
              value={draft.staircase}
              onChange={(e) => setDraft((current) => ({ ...current, staircase: e.target.value }))}
              placeholder="Es. B"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Ascensore</Label>
            <Select
              value={draft.elevator || undefined}
              onValueChange={(value) => setDraft((current) => ({
                ...current,
                elevator: value as 'yes' | 'no',
              }))}
            >
              <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Sì</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Autoscala</Label>
            <Select
              value={draft.hoist || undefined}
              onValueChange={(value) => setDraft((current) => ({
                ...current,
                hoist: value as 'yes' | 'no',
              }))}
            >
              <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Sì</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Misure</Label>
            <Select
              value={draft.measureSource || undefined}
              onValueChange={(value) => setDraft((current) => ({
                ...current,
                measureSource: value as 'seller' | 'buyer',
              }))}
            >
              <SelectTrigger><SelectValue placeholder="Responsabilità misure" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="seller">A carico del venditore</SelectItem>
                <SelectItem value="buyer">Comunicate dall'acquirente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Allegati / disegni</Label>
            <Select
              value={draft.attachments || undefined}
              onValueChange={(value) => setDraft((current) => ({
                ...current,
                attachments: value as 'yes' | 'no',
                attachmentPages: value === 'yes' ? current.attachmentPages : null,
              }))}
            >
              <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Sì</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="commission-pages">N. pagine</Label>
            <Input
              id="commission-pages"
              type="number"
              min="0"
              step="1"
              disabled={draft.attachments !== 'yes'}
              value={draft.attachmentPages ?? ''}
              onChange={(e) => setDraft((current) => ({
                ...current,
                attachmentPages: e.target.value ? Math.max(0, Math.floor(Number(e.target.value))) : null,
              }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="commission-date">Data consegna</Label>
            <Input
              id="commission-date"
              type="date"
              value={draft.scheduledDate}
              onChange={(e) => setDraft((current) => ({ ...current, scheduledDate: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="commission-time">Ora consegna</Label>
            <Input
              id="commission-time"
              type="time"
              value={draft.scheduledTime}
              onChange={(e) => setDraft((current) => ({ ...current, scheduledTime: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
          <Button onClick={save} disabled={update.isPending}>
            {update.isPending ? 'Salvataggio…' : 'Salva dati consegna'}
          </Button>
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
      <div className="space-y-5">
        <Skeleton className="h-9 w-72" />
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
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

  const payment = getPaymentSummary(bill);
  const { paidTotal, balance } = payment;
  const commissionNotes = parseCommissionNotes(bill.notes);
  const commission = commissionNotes.metadata;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild aria-label="Indietro" className="rounded-full bg-white">
          <Link to="/vendite"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <PageHeader
          title={bill.client || 'Fattura'}
          description={`Vendita del ${formatDate(bill.date)} · ${bill.seller}`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link to={`/vendite/${bill.uuid}/stampa?tipo=documento`}>
                  <Printer className="h-4 w-4" /> Stampa vendita
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to={`/vendite/${bill.uuid}/stampa?tipo=bolla`}>
                  <Truck className="h-4 w-4" /> Bolla
                </Link>
              </Button>
              <StatusBadge status={bill.status} />
              {bill.status !== 'Annullata' && <PaymentStatusBadge status={payment.status} />}
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

      <Card className="border-[#e5dbd1] bg-[#fffaf7]">
        <CardContent className="p-4">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Avanzamento vendita
          </div>
          <WorkflowStepper status={bill.status} />
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-5 text-sm">
              <p className="text-lg font-bold tracking-[-0.02em] text-foreground">{bill.client || '—'}</p>
              {bill.address && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-[#9a8e86]" /> {bill.address}
                </p>
              )}
              {bill.phone && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0 text-[#9a8e86]" /> {bill.phone}
                </p>
              )}
              {bill.assistance && (
                <Badge variant="info" className="mt-1">
                  <Wrench className="h-3 w-3" /> Assistenza
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 border-b border-[#eee6de] bg-[#fffefd]">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  Dati consegna e rilievo
                </CardTitle>
                <CardDescription>
                  Informazioni operative collegate anche al planning consegne.
                </CardDescription>
              </div>
              <EditCommissionDialog billUuid={bill.uuid} notes={bill.notes ?? ''} />
            </CardHeader>
            <CardContent className="pt-5">
              {commission ? (
                <div className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Città</p>
                    <p className="mt-1 font-semibold">{commission.city || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Piano / scala</p>
                    <p className="mt-1 font-semibold">
                      {[commission.floor ? `Piano ${commission.floor}` : '', commission.staircase ? `Scala ${commission.staircase}` : '']
                        .filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Ascensore</p>
                    <p className="mt-1 font-semibold">{yesNoLabel(commission.elevator)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Misure</p>
                    <p className="mt-1 font-semibold">{measureSourceLabel(commission.measureSource)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Autoscala</p>
                    <p className="mt-1 font-semibold">{yesNoLabel(commission.hoist)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Allegati / disegni</p>
                    <p className="mt-1 font-semibold">
                      {yesNoLabel(commission.attachments)}
                      {commission.attachments === 'yes' && commission.attachmentPages !== null
                        ? ` · ${commission.attachmentPages} pag.`
                        : ''}
                    </p>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Consegna programmata</p>
                    <p className="mt-1 font-semibold">
                      {[
                        commission.scheduledDate ? formatDate(commission.scheduledDate) : '',
                        commission.scheduledTime ? `ore ${commission.scheduledTime}` : '',
                      ].filter(Boolean).join(' · ') || 'Da programmare'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#d8cec5] bg-[#faf7f3] px-4 py-5">
                  <p className="text-sm font-semibold text-[#514843]">Dati logistici non ancora inseriti.</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Aggiungi piano, ascensore, autoscala, responsabilità misure e data di consegna.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[#eee6de] bg-[#fffefd]">
              <CardTitle className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#fff0f1] text-primary">
                  <Package className="h-4 w-4" />
                </span>
                Articoli ({bill.items?.length ?? 0})
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
                        <TableCell className="font-semibold">{item.name}</TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          <EditCompanyDialog billUuid={bill.uuid} item={item} />
                        </TableCell>
                        <TableCell><ItemProgress billUuid={bill.uuid} item={item} /></TableCell>
                        <TableCell className="tnum text-right font-bold">{formatCurrency(item.price)}</TableCell>
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

          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[#eee6de] bg-[#fffefd]">
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-[#8f8178]" /> Note
              </CardTitle>
              <EditNotesDialog billUuid={bill.uuid} notes={bill.notes ?? ''} />
            </CardHeader>
            <CardContent className="pt-5">
              {commissionNotes.visibleNotes ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#5d5550]">{commissionNotes.visibleNotes}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Nessuna nota.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="overflow-hidden border-[#e7ddd3]">
            <CardHeader className="border-b border-[#eee6de] bg-[#fbf7f2]">
              <CardTitle>Riepilogo economico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Articoli</span>
                <span className="tnum font-semibold">{formatCurrency(bill.itemsPrice)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Trasporto</span>
                <span className="tnum font-semibold">{formatCurrency(bill.transport)}</span>
              </div>
              {bill.settlement !== 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Acconto iniziale</span>
                  <span className="tnum font-semibold">{formatCurrency(bill.settlement)}</span>
                </div>
              )}
              <Separator />
              <div className="rounded-xl border border-[#f0d2d4] bg-[#fff2f2] p-3.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9e5c60]">Totale vendita</p>
                <p className="tnum mt-1.5 text-2xl font-extrabold tracking-[-0.03em] text-[#8d0f17]">
                  {formatCurrency(bill.totalPrice)}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Stato pagamento</span>
                <PaymentStatusBadge status={payment.status} />
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Versato</span>
                <span className="tnum font-bold text-success">{formatCurrency(paidTotal)}</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-[#eee6de] pt-3">
                <span className="font-semibold">Residuo</span>
                <span className={cn('tnum font-extrabold', balance > 0 ? 'text-[#8a6123]' : 'text-success')}>
                  {formatCurrency(balance)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-start justify-between space-y-0 border-b border-[#eee6de] bg-[#fffefd]">
              <div>
                <CardTitle>Acconti ({bill.deposits?.length ?? 0})</CardTitle>
                <CardDescription>Versamenti registrati sulla vendita</CardDescription>
              </div>
              <AddDepositDialog billUuid={bill.uuid} seller={bill.seller} />
            </CardHeader>
            <CardContent className="space-y-2.5 pt-5">
              {(bill.deposits ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Nessun acconto.</p>
              ) : (
                bill.deposits.map((d) => (
                  <div
                    key={d.uuid}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#e8e0d8] bg-[#fcfaf7] px-3.5 py-3 text-sm"
                  >
                    <div>
                      <p className="tnum font-bold text-foreground">{formatCurrency(d.amount)}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(d.date)} · {d.method} · {d.seller}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={d.collected ? 'success' : 'warning'}>
                        {d.collected ? 'Incassato' : 'Da incassare'}
                      </Badge>
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Rimuovi acconto">
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

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
              <CardTitle className="flex items-center gap-2">
                <HandCoins className="h-4 w-4 text-[#9a6b24]" /> Provvigione
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {bill.provision ? (
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="tnum font-bold text-foreground">{formatCurrency(bill.provision.amount)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{bill.provision.seller}</p>
                  </div>
                  <Badge variant={bill.provision.payed ? 'success' : 'warning'}>
                    {bill.provision.payed ? 'Pagata' : 'Da pagare'}
                  </Badge>
                </div>
              ) : (
                <div className="space-y-3">
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
