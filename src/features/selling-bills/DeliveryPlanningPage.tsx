import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarCheck2,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Phone,
  Search,
  Truck,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useSellingBills } from '@/hooks/useQueries';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  deliveryCounts,
  getDeliveryEntries,
  localISODate,
  type DeliveryEntry,
  type DeliveryState,
} from './deliveryPlanning';
import { yesNoLabel } from './commissionMetadata';

type FilterState = 'all' | DeliveryState;

const FILTERS: Array<{ value: FilterState; label: string }> = [
  { value: 'all', label: 'Tutte' },
  { value: 'late', label: 'In ritardo' },
  { value: 'today', label: 'Oggi' },
  { value: 'upcoming', label: 'Prossime' },
  { value: 'completed', label: 'Completate' },
];

function stateLabel(state: DeliveryState) {
  if (state === 'late') return 'In ritardo';
  if (state === 'today') return 'Oggi';
  if (state === 'completed') return 'Completata';
  return 'Programmata';
}

function stateClass(state: DeliveryState) {
  if (state === 'late') return 'border-[#f1c7ca] bg-[#fff0f1] text-[#a40d16]';
  if (state === 'today') return 'border-[#ead4a8] bg-[#fff8e9] text-[#805d20]';
  if (state === 'completed') return 'border-[#c7e0d1] bg-[#eff7f2] text-success';
  return 'border-[#d8d0c8] bg-[#f7f3ee] text-[#5f5752]';
}

function DeliveryCard({ entry }: { entry: DeliveryEntry }) {
  const { bill, metadata } = entry;
  const address = [bill.address, metadata.city].filter(Boolean).join(' · ');

  return (
    <Card className="group overflow-hidden border-[#ded5cd] bg-[#fffefd] transition-all hover:-translate-y-0.5 hover:border-[#cfc1b6] hover:shadow-[0_18px_44px_rgba(67,51,42,0.10)]">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-[128px_1fr_auto]">
          <div className="flex flex-col justify-between border-b border-[#eee7e0] bg-[#f8f4ef] p-4 md:border-b-0 md:border-r">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8b7e75]">
                Consegna
              </p>
              <p className="mt-2 text-lg font-black tracking-[-0.03em] text-[#272120]">
                {formatDate(metadata.scheduledDate)}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#6f645d]">
                <Clock3 className="h-3.5 w-3.5" />
                {metadata.scheduledTime || 'Orario da definire'}
              </p>
            </div>
            <span className={cn(
              'mt-4 inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em]',
              stateClass(entry.state),
            )}>
              {stateLabel(entry.state)}
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold tracking-[-0.025em] text-[#272120]">
                  {bill.client || 'Cliente'}
                </h3>
                <p className="mt-1 text-xs text-[#81766f]">
                  Venditore: <strong className="text-[#5c514b]">{bill.seller || '—'}</strong>
                </p>
              </div>
              <StatusBadge status={bill.status} />
            </div>

            <div className="mt-4 grid gap-2 text-sm text-[#655b55] sm:grid-cols-2">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#a2948a]" />
                <span>{address || 'Indirizzo da definire'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#a2948a]" />
                <span>{bill.phone || 'Recapito non presente'}</span>
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(metadata.floor || metadata.staircase) && (
                <Badge variant="outline">
                  {[metadata.floor ? `Piano ${metadata.floor}` : '', metadata.staircase ? `Scala ${metadata.staircase}` : '']
                    .filter(Boolean).join(' · ')}
                </Badge>
              )}
              {metadata.elevator && <Badge variant="outline">Ascensore: {yesNoLabel(metadata.elevator)}</Badge>}
              {metadata.hoist && <Badge variant="outline">Autoscala: {yesNoLabel(metadata.hoist)}</Badge>}
              {metadata.attachments === 'yes' && (
                <Badge variant="outline">
                  Allegati{metadata.attachmentPages !== null ? ` · ${metadata.attachmentPages} pag.` : ''}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end border-t border-[#eee7e0] p-4 md:border-l md:border-t-0">
            <Button variant="outline" asChild>
              <Link to={`/vendite/${bill.uuid}`}>
                Apri vendita <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DeliveryPlanningPage() {
  const { data, isLoading, error, refetch } = useSellingBills();
  const [filter, setFilter] = useState<FilterState>('all');
  const [query, setQuery] = useState('');

  const todayISO = localISODate();
  const entries = useMemo(() => getDeliveryEntries(data ?? [], todayISO), [data, todayISO]);
  const counts = useMemo(() => deliveryCounts(entries), [entries]);

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('it');
    return entries.filter((entry) => {
      if (filter !== 'all' && entry.state !== filter) return false;
      if (!needle) return true;

      const haystack = [
        entry.bill.client,
        entry.bill.phone,
        entry.bill.address,
        entry.bill.seller,
        entry.metadata.city,
      ].join(' ').toLocaleLowerCase('it');

      return haystack.includes(needle);
    });
  }, [entries, filter, query]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planning consegne"
        description="Consegne programmate, ritardi e informazioni logistiche raccolte nelle vendite."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[#f0cdd0] bg-[#fff7f7]">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#a76469]">In ritardo</p>
              <p className="mt-1 text-2xl font-black text-[#97111a]">{counts.late}</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-[#b82630]" />
          </CardContent>
        </Card>
        <Card className="border-[#ead9b7] bg-[#fffaf0]">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#86662f]">Oggi</p>
              <p className="mt-1 text-2xl font-black text-[#72511c]">{counts.today}</p>
            </div>
            <Truck className="h-5 w-5 text-[#9a6b24]" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Prossime</p>
              <p className="mt-1 text-2xl font-black">{counts.upcoming}</p>
            </div>
            <CalendarDays className="h-5 w-5 text-[#776b64]" />
          </CardContent>
        </Card>
        <Card className="border-[#cde1d4] bg-[#f5faf7]">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#59806a]">Completate</p>
              <p className="mt-1 text-2xl font-black text-success">{counts.completed}</p>
            </div>
            <CalendarCheck2 className="h-5 w-5 text-success" />
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a8e86]" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cerca cliente, città, indirizzo, venditore…"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  size="sm"
                  variant={filter === item.value ? 'default' : 'outline'}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {visible.length > 0 ? (
          visible.map((entry) => <DeliveryCard key={entry.bill.uuid} entry={entry} />)
        ) : (
          <Card>
            <EmptyState
              title={entries.length === 0 ? 'Nessuna consegna programmata' : 'Nessun risultato'}
              description={
                entries.length === 0
                  ? 'Imposta data e ora di consegna nel dettaglio di una vendita per farla comparire qui.'
                  : 'Prova a cambiare filtro o termine di ricerca.'
              }
            />
          </Card>
        )}
      </div>
    </div>
  );
}
