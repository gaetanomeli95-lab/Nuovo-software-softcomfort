import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarClock,
  MapPin,
  PackagePlus,
  Paperclip,
  Plus,
  ReceiptText,
  Ruler,
  Save,
  Trash2,
  Truck,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/features/auth/AuthContext';
import { useSellingBills } from '@/hooks/useQueries';
import { useCreateSellingBill } from '@/hooks/useMutations';
import { formatCurrency } from '@/lib/format';
import {
  composeCommissionNotes,
  type MeasureSource,
  type YesNo,
} from './commissionMetadata';

type DraftItem = {
  id: string;
  code: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

const PAYMENT_METHODS = ['Contanti', 'Pos', 'Assegno', 'Bonifico', 'Finanziamento'];

function newItem(index: number): DraftItem {
  return {
    id: `draft-${Date.now()}-${index}`,
    code: '',
    description: '',
    quantity: '1',
    unitPrice: '',
  };
}

function YesNoField({
  value,
  onValueChange,
  placeholder = 'Seleziona',
}: {
  value: YesNo;
  onValueChange: (value: YesNo) => void;
  placeholder?: string;
}) {
  return (
    <Select value={value || undefined} onValueChange={(value) => onValueChange(value as YesNo)}>
      <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="yes">Sì</SelectItem>
        <SelectItem value="no">No</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function NewSellingBillPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const existingBills = useSellingBills();
  const create = useCreateSellingBill();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [seller, setSeller] = useState(user?.username ?? '');
  const [client, setClient] = useState('');
  const [phone, setPhone] = useState('');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [floor, setFloor] = useState('');
  const [staircase, setStaircase] = useState('');
  const [elevator, setElevator] = useState<YesNo>('');
  const [measureSource, setMeasureSource] = useState<MeasureSource>('');
  const [hoist, setHoist] = useState<YesNo>('');

  const [attachments, setAttachments] = useState<YesNo>('');
  const [attachmentPages, setAttachmentPages] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');

  const [transport, setTransport] = useState('0');
  const [settlement, setSettlement] = useState('0');
  const [method, setMethod] = useState('Contanti');
  const [items, setItems] = useState<DraftItem[]>([newItem(0)]);

  const sellerOptions = useMemo(
    () =>
      [...new Set((existingBills.data ?? []).map((bill) => bill.seller).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b)),
    [existingBills.data],
  );

  const normalizedItems = useMemo(
    () =>
      items
        .map((item) => {
          const description = item.description.trim();
          const code = item.code.trim();
          const quantity = Math.max(1, Math.floor(Number(item.quantity || 1)));
          const unitPrice = Math.max(0, Number(item.unitPrice || 0));
          const linePrice = quantity * unitPrice;
          const label = [
            code ? `Art. ${code}` : '',
            description,
            `Q.tà ${quantity}`,
          ].filter(Boolean).join(' · ');

          return {
            name: label,
            price: linePrice,
            description,
            quantity,
            unitPrice,
          };
        })
        .filter((item) => item.description),
    [items],
  );

  const pieces = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
  const itemsPrice = normalizedItems.reduce((sum, item) => sum + item.price, 0);
  const transportValue = Math.max(0, Number(transport || 0));
  const totalPrice = itemsPrice + transportValue;
  const settlementValue = Math.max(0, Math.min(Number(settlement || 0), totalPrice));
  const balance = Math.max(0, totalPrice - settlementValue);

  const canSubmit =
    Boolean(date && seller.trim() && client.trim()) &&
    normalizedItems.length > 0 &&
    normalizedItems.every((item) => item.unitPrice >= 0 && item.quantity >= 1) &&
    !create.isPending;

  const updateItem = (id: string, patch: Partial<DraftItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id: string) => {
    setItems((current) => {
      const next = current.filter((item) => item.id !== id);
      return next.length > 0 ? next : [newItem(Date.now())];
    });
  };

  const submit = async () => {
    if (!canSubmit) return;

    const operationalNotes = composeCommissionNotes(
      {
        city: city.trim(),
        floor: floor.trim(),
        staircase: staircase.trim(),
        elevator,
        measureSource,
        hoist,
        attachments,
        attachmentPages:
          attachments === 'yes' && attachmentPages
            ? Math.max(0, Math.floor(Number(attachmentPages)))
            : null,
        scheduledDate,
        scheduledTime,
      },
      notes,
    );

    const created = await create.mutateAsync({
      date,
      seller: seller.trim(),
      client: client.trim(),
      address: address.trim(),
      phone: phone.trim(),
      items: normalizedItems.map(({ name, price }) => ({ name, price })),
      method,
      transport: transportValue,
      itemsPrice,
      totalPrice,
      settlement: settlementValue,
      notes: operationalNotes,
    });

    if (created?.uuid) navigate(`/vendite/${created.uuid}`);
    else navigate('/vendite');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild aria-label="Indietro" className="rounded-full bg-white">
          <Link to="/vendite"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <PageHeader
          title="Nuova fattura"
          description="Proposta di commissione digitale: cliente, consegna, articoli, acconto e programmazione in un unico flusso."
          className="flex-1"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_350px]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#e7ddd4] bg-[#fffefd]">
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-primary" />
                Dati vendita e cliente
              </CardTitle>
              <CardDescription>Le prime informazioni della proposta di commissione.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="sale-date">Data proposta</Label>
                <Input id="sale-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sale-seller">Venditore</Label>
                <Input
                  id="sale-seller"
                  list="seller-options"
                  value={seller}
                  onChange={(e) => setSeller(e.target.value)}
                  placeholder="Nome venditore"
                />
                <datalist id="seller-options">
                  {sellerOptions.map((name) => <option key={name} value={name} />)}
                </datalist>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sale-client">Cliente</Label>
                <Input
                  id="sale-client"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Nome e cognome / ragione sociale"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sale-phone">Cellulare</Label>
                <Input
                  id="sale-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Recapito telefonico"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#e7ddd4] bg-[#fffefd]">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Consegna
              </CardTitle>
              <CardDescription>Indirizzo e condizioni di accesso come nel modulo cartaceo Soft Comfort.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-5 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                <Label htmlFor="delivery-address">Indirizzo di consegna</Label>
                <Input
                  id="delivery-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Via / Piazza e numero civico"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="delivery-city">Città</Label>
                <Input
                  id="delivery-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Es. Bagheria"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="delivery-floor">Piano</Label>
                <Input
                  id="delivery-floor"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="Es. 3"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="delivery-staircase">Scala</Label>
                <Input
                  id="delivery-staircase"
                  value={staircase}
                  onChange={(e) => setStaircase(e.target.value)}
                  placeholder="Es. B"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Ascensore</Label>
                <YesNoField value={elevator} onValueChange={setElevator} />
              </div>

              <div className="space-y-1.5">
                <Label>Possibile intervento autoscala</Label>
                <YesNoField value={hoist} onValueChange={setHoist} />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#e7ddd4] bg-[#fffefd]">
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-primary" />
                Misure e rilievo
              </CardTitle>
              <CardDescription>Indica da chi provengono le misure utilizzate per l'ordine.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="max-w-xl space-y-1.5">
                <Label>Misure</Label>
                <Select
                  value={measureSource || undefined}
                  onValueChange={(value) => setMeasureSource(value as MeasureSource)}
                >
                  <SelectTrigger><SelectValue placeholder="Seleziona responsabilità misure" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seller">A carico del venditore</SelectItem>
                    <SelectItem value="buyer">Comunicate dall'acquirente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[#e7ddd4] bg-[#fffefd]">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PackagePlus className="h-4 w-4 text-primary" />
                  Articoli
                </CardTitle>
                <CardDescription>Codice, descrizione, quantità e prezzo unitario.</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItems((current) => [...current, newItem(current.length)])}
              >
                <Plus className="h-4 w-4" /> Articolo
              </Button>
            </CardHeader>

            <CardContent className="space-y-3 pt-5">
              {items.map((item, index) => {
                const qty = Math.max(1, Math.floor(Number(item.quantity || 1)));
                const unit = Math.max(0, Number(item.unitPrice || 0));

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#d8ccc1] bg-[#faf7f3] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#ebe2da] text-xs font-extrabold text-[#6c6059]">
                          {index + 1}
                        </div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[#756960]">
                          Riga articolo
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        aria-label="Rimuovi articolo"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[120px_1fr_110px_155px_130px] md:items-end">
                      <div className="space-y-1.5">
                        <Label htmlFor={`item-code-${item.id}`}>Articolo</Label>
                        <Input
                          id={`item-code-${item.id}`}
                          value={item.code}
                          onChange={(e) => updateItem(item.id, { code: e.target.value })}
                          placeholder="01"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor={`item-description-${item.id}`}>Descrizione merce</Label>
                        <Input
                          id={`item-description-${item.id}`}
                          value={item.description}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          placeholder="Es. Divano mod. Turi expo"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor={`item-quantity-${item.id}`}>Q.tà</Label>
                        <Input
                          id={`item-quantity-${item.id}`}
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor={`item-price-${item.id}`}>Prezzo unitario (€)</Label>
                        <Input
                          id={`item-price-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, { unitPrice: e.target.value })}
                          placeholder="0,00"
                        />
                      </div>

                      <div className="rounded-xl border border-[#ded3ca] bg-white px-3 py-2.5 text-right">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#8b7f76]">
                          Totale riga
                        </p>
                        <p className="tnum mt-1 font-extrabold">{formatCurrency(qty * unit)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#e7ddd4] bg-[#fffefd]">
              <CardTitle className="flex items-center gap-2">
                <WalletCards className="h-4 w-4 text-primary" />
                Importi e acconto
              </CardTitle>
              <CardDescription>Totali calcolati automaticamente dalla merce inserita.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-5 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="sale-transport">Trasporto e montaggio (€)</Label>
                <Input
                  id="sale-transport"
                  type="number"
                  min="0"
                  step="0.01"
                  value={transport}
                  onChange={(e) => setTransport(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sale-deposit">Acconto confirmatorio (€)</Label>
                <Input
                  id="sale-deposit"
                  type="number"
                  min="0"
                  max={totalPrice}
                  step="0.01"
                  value={settlement}
                  onChange={(e) => setSettlement(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Metodo acconto</Label>
                <Select value={method} onValueChange={setMethod} disabled={settlementValue <= 0}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((paymentMethod) => (
                      <SelectItem key={paymentMethod} value={paymentMethod}>
                        {paymentMethod}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#e7ddd4] bg-[#fffefd]">
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                Consegna programmata
              </CardTitle>
              <CardDescription>Data e ora previste, modificabili anche successivamente.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="scheduled-date">Data consegna</Label>
                <Input
                  id="scheduled-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="scheduled-time">Ora consegna</Label>
                <Input
                  id="scheduled-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#e7ddd4] bg-[#fffefd]">
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" />
                Allegati e note
              </CardTitle>
              <CardDescription>Disegni, pagine allegate e indicazioni operative.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-5 md:grid-cols-[220px_160px_1fr]">
              <div className="space-y-1.5">
                <Label>Presenza allegati / disegni</Label>
                <YesNoField value={attachments} onValueChange={setAttachments} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="attachment-pages">N. pagine</Label>
                <Input
                  id="attachment-pages"
                  type="number"
                  min="0"
                  step="1"
                  value={attachmentPages}
                  onChange={(e) => setAttachmentPages(e.target.value)}
                  disabled={attachments !== 'yes'}
                  placeholder="0"
                />
              </div>

              <div className="space-y-1.5 md:row-span-2">
                <Label htmlFor="sale-notes">Note</Label>
                <Textarea
                  id="sale-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Accordi, dettagli di consegna, finiture, richieste del cliente…"
                  className="min-h-[112px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5 xl:sticky xl:top-[84px] xl:self-start">
          <Card className="overflow-hidden border-[#b9a89a] bg-[#fffefd] shadow-[0_18px_45px_rgba(59,43,35,0.12)]">
            <CardHeader className="border-b border-[#ded2c7] bg-[#f6efe8]">
              <CardTitle className="flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-primary" />
                Riepilogo commissione
              </CardTitle>
              <CardDescription>{normalizedItems.length} righe · {pieces} pezzi</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-5">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Totale merce</span>
                <strong className="tnum">{formatCurrency(itemsPrice)}</strong>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Trasporto e montaggio</span>
                <strong className="tnum">{formatCurrency(transportValue)}</strong>
              </div>

              <Separator />

              <div className="flex items-end justify-between gap-4">
                <span className="text-sm font-bold">Totale fornitura</span>
                <strong className="tnum text-xl font-extrabold tracking-[-0.03em]">
                  {formatCurrency(totalPrice)}
                </strong>
              </div>

              <div className="rounded-2xl border border-[#ddd0c4] bg-[#f5eee7] p-4">
                <div className="flex justify-between gap-4 text-sm">
                  <span>Acconto confirmatorio</span>
                  <strong className="tnum">{formatCurrency(settlementValue)}</strong>
                </div>
                <div className="mt-3 border-t border-[#d5c7bb] pt-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#82746c]">
                    Saldo alla consegna
                  </p>
                  <p className="tnum mt-1 text-[28px] font-black tracking-[-0.04em] text-[#9c0610]">
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>

              {(address || city) && (
                <div className="rounded-xl border border-[#e3d8cf] bg-white p-3 text-xs leading-relaxed text-[#655b55]">
                  <div className="mb-1 flex items-center gap-1.5 font-extrabold text-[#3f3733]">
                    <Truck className="h-3.5 w-3.5 text-primary" />
                    Consegna
                  </div>
                  <p>{[address, city].filter(Boolean).join(' · ')}</p>
                  {(floor || staircase || elevator) && (
                    <p className="mt-1 text-[#82766e]">
                      {[
                        floor ? `Piano ${floor}` : '',
                        staircase ? `Scala ${staircase}` : '',
                        elevator ? `Ascensore ${elevator === 'yes' ? 'Sì' : 'No'}` : '',
                      ].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              )}

              {!client.trim() && (
                <p className="text-xs leading-relaxed text-[#8a6123]">
                  Inserisci almeno il cliente, il venditore e un articolo per salvare.
                </p>
              )}

              <Button
                className="h-11 w-full text-sm font-extrabold shadow-[0_10px_26px_rgba(242,15,31,0.20)]"
                disabled={!canSubmit}
                onClick={submit}
              >
                <Save className="h-4 w-4" />
                {create.isPending ? 'Salvataggio…' : 'Salva fattura'}
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link to="/vendite">Annulla</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
