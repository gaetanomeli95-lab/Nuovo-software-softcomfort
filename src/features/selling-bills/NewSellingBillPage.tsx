import { useMemo, useState } from 'react';
import { ArrowLeft, Plus, ReceiptText, Save, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/features/auth/AuthContext';
import { useSellingBills } from '@/hooks/useQueries';
import { useCreateSellingBill } from '@/hooks/useMutations';
import { formatCurrency } from '@/lib/format';

type DraftItem = {
  id: string;
  name: string;
  price: string;
};

const PAYMENT_METHODS = ['Contanti', 'Pos', 'Assegno', 'Bonifico', 'Finanziamento'];

function newItem(index: number): DraftItem {
  return { id: `draft-${Date.now()}-${index}`, name: '', price: '' };
}

export function NewSellingBillPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const existingBills = useSellingBills();
  const create = useCreateSellingBill();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [seller, setSeller] = useState(user?.username ?? '');
  const [client, setClient] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
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
        .map((item) => ({
          name: item.name.trim(),
          price: Number(item.price || 0),
        }))
        .filter((item) => item.name),
    [items],
  );

  const itemsPrice = normalizedItems.reduce((sum, item) => sum + item.price, 0);
  const transportValue = Math.max(0, Number(transport || 0));
  const totalPrice = itemsPrice + transportValue;
  const settlementValue = Math.max(0, Math.min(Number(settlement || 0), totalPrice));
  const balance = Math.max(0, totalPrice - settlementValue);

  const canSubmit =
    Boolean(date && seller.trim() && client.trim()) &&
    normalizedItems.length > 0 &&
    normalizedItems.every((item) => item.price >= 0) &&
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

    const created = await create.mutateAsync({
      date,
      seller: seller.trim(),
      client: client.trim(),
      address: address.trim(),
      phone: phone.trim(),
      items: normalizedItems,
      method,
      transport: transportValue,
      itemsPrice,
      totalPrice,
      settlement: settlementValue,
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
          description="Inserisci i dati della vendita come nel vecchio gestionale, con totale e saldo calcolati automaticamente."
          className="flex-1"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#e7ddd4] bg-[#fffefd]">
              <CardTitle>Dati vendita</CardTitle>
              <CardDescription>Data, venditore e cliente.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="sale-date">Data</Label>
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

              <div className="space-y-1.5 md:col-span-2">
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
                <Label htmlFor="sale-address">Indirizzo</Label>
                <Input
                  id="sale-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Indirizzo cliente"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sale-phone">Recapito</Label>
                <Input
                  id="sale-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Telefono"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[#e7ddd4] bg-[#fffefd]">
              <div>
                <CardTitle>Articoli</CardTitle>
                <CardDescription>Aggiungi una riga per ogni articolo della vendita.</CardDescription>
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
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-2xl border border-[#d8ccc1] bg-[#faf7f3] p-4 md:grid-cols-[44px_1fr_160px_42px] md:items-end"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#ebe2da] text-xs font-extrabold text-[#6c6059]">
                    {index + 1}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`item-name-${item.id}`}>Descrizione</Label>
                    <Input
                      id={`item-name-${item.id}`}
                      value={item.name}
                      onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      placeholder="Es. Divano 3 posti"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`item-price-${item.id}`}>Prezzo (€)</Label>
                    <Input
                      id={`item-price-${item.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, { price: e.target.value })}
                      placeholder="0,00"
                    />
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
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#e7ddd4] bg-[#fffefd]">
              <CardTitle>Trasporto e primo acconto</CardTitle>
              <CardDescription>Il primo acconto è facoltativo e viene considerato nel saldo.</CardDescription>
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
                <Label htmlFor="sale-deposit">Acconto iniziale (€)</Label>
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
                <Label>Metodo</Label>
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
        </div>

        <div className="space-y-5 xl:sticky xl:top-[84px] xl:self-start">
          <Card className="overflow-hidden border-[#b9a89a] bg-[#fffefd] shadow-[0_18px_45px_rgba(59,43,35,0.12)]">
            <CardHeader className="border-b border-[#ded2c7] bg-[#f6efe8]">
              <CardTitle className="flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-primary" />
                Riepilogo
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 pt-5">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Articoli</span>
                <strong className="tnum">{formatCurrency(itemsPrice)}</strong>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Trasporto</span>
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
                  <span>Acconto</span>
                  <strong className="tnum">{formatCurrency(settlementValue)}</strong>
                </div>
                <div className="mt-3 border-t border-[#d5c7bb] pt-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#82746c]">
                    A saldo
                  </p>
                  <p className="tnum mt-1 text-[28px] font-black tracking-[-0.04em] text-[#9c0610]">
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>

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
