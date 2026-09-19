import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Banknote,
  CalendarClock,
  ClipboardList,
  HandCoins,
  PackageCheck,
  PiggyBank,
  ReceiptText,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  useChecks,
  useDepositsToCollect,
  useProvisionsToPay,
  useSellingBills,
} from '@/hooks/useQueries';
import { computeDashboardMetrics } from './dashboardMetrics';
import { formatCurrency, formatDate, formatDateShort, monthLabel } from '@/lib/format';

export function DashboardPage() {
  const bills = useSellingBills();
  const deposits = useDepositsToCollect();
  const provisions = useProvisionsToPay();
  const checks = useChecks();

  const isLoading =
    bills.isLoading || deposits.isLoading || provisions.isLoading || checks.isLoading;
  const error = bills.error ?? deposits.error ?? provisions.error ?? checks.error;

  const metrics = useMemo(() => {
    if (!bills.data) return null;
    return computeDashboardMetrics(
      bills.data,
      deposits.data?.depositResponses ?? [],
      provisions.data?.provisionResponses ?? [],
      checks.data ?? [],
    );
  }, [bills.data, deposits.data, provisions.data, checks.data]);

  const retry = () => {
    bills.refetch();
    deposits.refetch();
    provisions.refetch();
    checks.refetch();
  };

  if (error && !bills.data) {
    return (
      <div className="space-y-4">
        <PageHeader title="Dashboard" description="Panoramica dell'attività" />
        <Card><ErrorState error={error} onRetry={retry} /></Card>
      </div>
    );
  }

  const chartData = (metrics?.venditePerMese ?? []).map((m) => ({
    ...m,
    label: monthLabel(m.month),
  }));

  return (
    <div className="space-y-5">
      <PageHeader title="Dashboard" description="Panoramica dell'attività in tempo reale" />

      {/* KPI principali */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Fatturato" value={formatCurrency(metrics?.fatturatoTotale ?? 0)}
          sub={`${metrics?.totaleFatture ?? 0} fatture`} icon={Banknote} loading={isLoading} to="/vendite" />
        <StatCard label="Fatture aperte" value={metrics?.fattureAperte ?? 0}
          icon={ReceiptText} tone="info" loading={isLoading} to="/vendite" />
        <StatCard label="Da ordinare" value={metrics?.daOrdinare ?? 0}
          icon={ClipboardList} tone="warning" loading={isLoading} to="/vendite?status=Da Ordinare" />
        <StatCard label="Ordinate" value={metrics?.ordinati ?? 0}
          icon={ShoppingBag} tone="info" loading={isLoading} to="/vendite?status=Ordinato" />
        <StatCard label="Pronte" value={metrics?.pronte ?? 0}
          icon={PackageCheck} loading={isLoading} to="/vendite?status=Pronta" />
        <StatCard label="Consegnate" value={metrics?.consegnate ?? 0}
          icon={Truck} tone="success" loading={isLoading} to="/vendite?status=Consegnata" />
      </div>

      {/* Scadenze operative */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard
          label="Acconti da incassare"
          value={formatCurrency(metrics?.accontiDaIncassare.total ?? 0)}
          sub={`${metrics?.accontiDaIncassare.count ?? 0} acconti`}
          icon={PiggyBank} tone="warning" loading={isLoading} to="/acconti"
        />
        <StatCard
          label="Provvigioni da pagare"
          value={formatCurrency(metrics?.provvigioniDaPagare.total ?? 0)}
          sub={`${metrics?.provvigioniDaPagare.count ?? 0} provvigioni`}
          icon={HandCoins} tone="warning" loading={isLoading} to="/provvigioni"
        />
        <StatCard
          label="Assegni in scadenza (60gg)"
          value={metrics?.assegniInScadenza.length ?? 0}
          sub={metrics?.assegniInScadenza[0] ? `prossimo: ${formatDateShort(metrics.assegniInScadenza[0].expireDate)}` : 'nessuno'}
          icon={CalendarClock}
          tone={metrics && metrics.assegniInScadenza.length > 0 ? 'destructive' : 'default'}
          loading={isLoading} to="/assegni"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Andamento vendite */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Andamento vendite</CardTitle>
            <CardDescription>Fatturato mensile (fatture non annullate)</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : chartData.length === 0 ? (
              <EmptyState title="Nessun dato" description="Non ci sono vendite da mostrare." />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis
                      tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={64}
                      tickFormatter={(v: number) =>
                        v >= 1000 ? `€${(v / 1000).toFixed(0)}k` : `€${v}`
                      }
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Fatturato']}
                      labelFormatter={(l) => `Mese: ${l}`}
                      cursor={{ fill: 'var(--color-muted)' }}
                    />
                    <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Per venditore */}
        <Card>
          <CardHeader>
            <CardTitle>Per venditore</CardTitle>
            <CardDescription>Fatturato e numero vendite</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
            ) : (metrics?.venditePerVenditore.length ?? 0) === 0 ? (
              <EmptyState title="Nessun venditore" />
            ) : (
              metrics!.venditePerVenditore.map((s) => {
                const max = metrics!.venditePerVenditore[0]?.total || 1;
                return (
                  <div key={s.seller}>
                    <div className="mb-1 flex items-baseline justify-between text-sm">
                      <span className="font-medium">{s.seller}</span>
                      <span className="tnum text-muted-foreground">
                        {formatCurrency(s.total)} · {s.count}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.max(2, (s.total / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ultime vendite */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Attività recenti</CardTitle>
            <CardDescription>Ultime fatture di vendita</CardDescription>
          </div>
          <Link to="/vendite" className="text-xs font-medium text-primary hover:underline">
            Vedi tutte →
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Venditore</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Totale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(metrics?.ultimeVendite ?? []).map((b) => (
                  <TableRow key={b.uuid} className="cursor-pointer" onClick={() => {}}>
                    <TableCell className="tnum whitespace-nowrap">{formatDate(b.date)}</TableCell>
                    <TableCell className="max-w-[220px] truncate font-medium">
                      <Link to={`/vendite/${b.uuid}`} className="hover:underline">
                        {b.client || '—'}
                      </Link>
                    </TableCell>
                    <TableCell>{b.seller}</TableCell>
                    <TableCell><StatusBadge status={b.status} /></TableCell>
                    <TableCell className="tnum text-right font-medium">
                      {formatCurrency(b.totalPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
