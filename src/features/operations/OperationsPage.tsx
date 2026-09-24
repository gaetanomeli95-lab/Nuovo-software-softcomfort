import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  HandCoins,
  PiggyBank,
  Truck,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { SummaryPill } from '@/components/common/SummaryPill';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useChecks,
  useDepositsToCollect,
  useProvisionsToPay,
  useSellingBills,
} from '@/hooks/useQueries';
import { buildOperationsInbox, type WorkItem, type WorkPriority } from './operationsInbox';

function priorityVariant(priority: WorkPriority) {
  if (priority === 'critical') return 'destructive' as const;
  if (priority === 'warning') return 'warning' as const;
  if (priority === 'positive') return 'success' as const;
  return 'outline' as const;
}

function priorityLabel(priority: WorkPriority) {
  if (priority === 'critical') return 'Urgente';
  if (priority === 'warning') return 'Attenzione';
  if (priority === 'positive') return 'Pronta';
  return 'Da fare';
}

function WorkList({
  items,
  emptyTitle,
  limit = 7,
}: {
  items: WorkItem[];
  emptyTitle: string;
  limit?: number;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title={emptyTitle}
        description="Non risultano attività aperte in questa categoria."
        className="py-9"
      />
    );
  }

  return (
    <div>
      {items.slice(0, limit).map((item) => (
        <Link
          key={item.id}
          to={item.to}
          className="group flex items-center gap-3 border-b border-[#eee6de] px-4 py-3.5 transition-colors last:border-b-0 hover:bg-[#faf7f3]"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-extrabold text-[#342c28]">{item.title}</p>
              <Badge variant={priorityVariant(item.priority)}>
                {priorityLabel(item.priority)}
              </Badge>
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">{item.detail}</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-[#a0948b] transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>
      ))}
      {items.length > limit && (
        <div className="border-t border-[#eee6de] bg-[#fcfaf7] px-4 py-2.5 text-xs font-semibold text-muted-foreground">
          Altre {items.length - limit} attività disponibili nelle sezioni operative.
        </div>
      )}
    </div>
  );
}

export function OperationsPage() {
  const bills = useSellingBills();
  const deposits = useDepositsToCollect();
  const provisions = useProvisionsToPay();
  const checks = useChecks();

  const isLoading =
    bills.isLoading || deposits.isLoading || provisions.isLoading || checks.isLoading;
  const error = bills.error ?? deposits.error ?? provisions.error ?? checks.error;

  const inbox = buildOperationsInbox(
    bills.data ?? [],
    deposits.data?.depositResponses ?? [],
    provisions.data?.provisionResponses ?? [],
    checks.data ?? [],
  );

  const totalOpen =
    inbox.urgent.length +
    inbox.sales.length +
    inbox.collections.length +
    inbox.administration.length;

  const retry = () => {
    bills.refetch();
    deposits.refetch();
    provisions.refetch();
    checks.refetch();
  };

  if (error && !bills.data) {
    return (
      <div className="space-y-5">
        <PageHeader title="Da fare" description="Attività operative da gestire" />
        <Card><ErrorState error={error} onRetry={retry} /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Da fare"
        description="Un'unica vista delle cose che richiedono attenzione, senza dover controllare ogni sezione."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryPill
          label="Attività aperte"
          value={isLoading ? '…' : String(totalOpen)}
          tone="neutral"
          className="min-w-0"
        />
        <SummaryPill
          label="Urgenti"
          value={isLoading ? '…' : String(inbox.urgent.length)}
          tone={inbox.urgent.length > 0 ? 'red' : 'green'}
          className="min-w-0"
        />
        <SummaryPill
          label="Incassi"
          value={isLoading ? '…' : String(inbox.collections.length)}
          tone={inbox.collections.length > 0 ? 'gold' : 'green'}
          className="min-w-0"
        />
        <SummaryPill
          label="Vendite operative"
          value={isLoading ? '…' : String(inbox.sales.length)}
          tone="neutral"
          className="min-w-0"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="overflow-hidden border-[#e9cdd0]">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[#eee0e1] bg-[#fff9f9]">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Urgenti e scadenze
                </CardTitle>
                <CardDescription>Consegne e assegni che richiedono priorità.</CardDescription>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link to="/consegne">Planning</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <WorkList items={inbox.urgent} emptyTitle="Nessuna urgenza" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[#eee6de] bg-[#fffefd]">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  Vendite
                </CardTitle>
                <CardDescription>Ordini da avviare e vendite pronte per la chiusura.</CardDescription>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link to="/vendite">Vendite</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <WorkList items={inbox.sales} emptyTitle="Vendite sotto controllo" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[#eee6de] bg-[#fffefd]">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-[#9a6b24]" />
                  Incassi
                </CardTitle>
                <CardDescription>Acconti registrati ma ancora da incassare.</CardDescription>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link to="/acconti">Acconti</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <WorkList items={inbox.collections} emptyTitle="Nessun acconto da incassare" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[#eee6de] bg-[#fffefd]">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <HandCoins className="h-4 w-4 text-[#756a63]" />
                  Amministrazione
                </CardTitle>
                <CardDescription>Provvigioni e attività amministrative aperte.</CardDescription>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link to="/provvigioni">Provvigioni</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <WorkList items={inbox.administration} emptyTitle="Amministrazione aggiornata" />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
