import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileSearch,
  Landmark,
  Package,
  ReceiptText,
  Search,
  ShoppingCart,
  TimerReset,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useBuyingBills,
  useChecks,
  useInventoryAvailable,
  useInventoryDelivered,
  usePendingOrders,
  useSellingBills,
} from '@/hooks/useQueries';
import {
  buildGlobalSearch,
  globalSearchCount,
  type GlobalSearchResult,
} from './globalSearch';

function ResultList({
  rows,
  empty,
}: {
  rows: GlobalSearchResult[];
  empty: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="px-4 py-7 text-center text-xs text-muted-foreground">
        {empty}
      </div>
    );
  }

  return (
    <div>
      {rows.map((row) => (
        <Link
          key={row.id}
          to={row.to}
          className="group flex items-center gap-3 border-b border-[#eee6de] px-4 py-3.5 last:border-b-0 hover:bg-[#faf7f3]"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-[#342c28]">{row.title}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">{row.detail || 'Apri dettaglio'}</p>
          </div>
          <span className="text-xs font-bold text-[#9a8e86] transition-colors group-hover:text-primary">
            Apri →
          </span>
        </Link>
      ))}
    </div>
  );
}

export function GlobalSearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';

  const sales = useSellingBills();
  const purchases = useBuyingBills();
  const available = useInventoryAvailable();
  const delivered = useInventoryDelivered();
  const pending = usePendingOrders();
  const checks = useChecks();

  const groups = useMemo(
    () => buildGlobalSearch(query, {
      sales: sales.data ?? [],
      purchases: purchases.data ?? [],
      inventory: [...(available.data ?? []), ...(delivered.data ?? [])],
      pending: pending.data ?? [],
      checks: checks.data ?? [],
    }),
    [
      query,
      sales.data,
      purchases.data,
      available.data,
      delivered.data,
      pending.data,
      checks.data,
    ],
  );

  const total = globalSearchCount(groups);
  const isLoading =
    sales.isLoading ||
    purchases.isLoading ||
    available.isLoading ||
    delivered.isLoading ||
    pending.isLoading ||
    checks.isLoading;
  const error =
    sales.error ??
    purchases.error ??
    available.error ??
    delivered.error ??
    pending.error ??
    checks.error;

  const retry = () => {
    sales.refetch();
    purchases.refetch();
    available.refetch();
    delivered.refetch();
    pending.refetch();
    checks.refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ricerca globale"
        description="Trova rapidamente vendite, acquisti, articoli, ordini e assegni."
      />

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8178]" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                const value = e.target.value;
                if (value.trim()) next.set('q', value);
                else next.delete('q');
                setParams(next, { replace: true });
              }}
              placeholder="Cliente, telefono, articolo, fornitore, riferimento…"
              className="h-11 pl-9"
            />
          </div>
          {query.trim() && !isLoading && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant={total > 0 ? 'info' : 'outline'}>{total} risultati</Badge>
              <span>per “{query.trim()}”</span>
            </div>
          )}
        </CardContent>
      </Card>

      {!query.trim() ? (
        <Card>
          <EmptyState
            icon={FileSearch}
            title="Inizia a digitare"
            description="La ricerca attraversa i principali moduli del gestionale senza modificare alcun dato."
          />
        </Card>
      ) : isLoading ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </div>
      ) : error ? (
        <Card><ErrorState error={error} onRetry={retry} /></Card>
      ) : total === 0 ? (
        <Card>
          <EmptyState
            icon={FileSearch}
            title="Nessun risultato"
            description="Prova con nome cliente, telefono, descrizione articolo, marca o riferimento."
          />
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
              <CardTitle className="flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-primary" />
                Vendite
                <Badge variant="outline">{groups.sales.length}</Badge>
              </CardTitle>
              <CardDescription>Cliente, venditore, indirizzo e articoli.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ResultList rows={groups.sales} empty="Nessuna vendita corrispondente." />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-[#9a6b24]" />
                Acquisti
                <Badge variant="outline">{groups.purchases.length}</Badge>
              </CardTitle>
              <CardDescription>Fornitore, stato e articoli acquistati.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ResultList rows={groups.purchases} empty="Nessun acquisto corrispondente." />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4 text-info" />
                Magazzino
                <Badge variant="outline">{groups.inventory.length}</Badge>
              </CardTitle>
              <CardDescription>Articolo, marca, riferimento e posizione.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ResultList rows={groups.inventory} empty="Nessun articolo di magazzino corrispondente." />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
              <CardTitle className="flex items-center gap-2">
                <TimerReset className="h-4 w-4 text-[#756a63]" />
                Ordini in sospeso
                <Badge variant="outline">{groups.pending.length}</Badge>
              </CardTitle>
              <CardDescription>Articoli e ditte ancora nel flusso ordini.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ResultList rows={groups.pending} empty="Nessun ordine corrispondente." />
            </CardContent>
          </Card>

          <Card className="overflow-hidden xl:col-span-2">
            <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-[#6f4a16]" />
                Assegni
                <Badge variant="outline">{groups.checks.length}</Badge>
              </CardTitle>
              <CardDescription>Intestatario e riferimenti documento.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ResultList rows={groups.checks} empty="Nessun assegno corrispondente." />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
