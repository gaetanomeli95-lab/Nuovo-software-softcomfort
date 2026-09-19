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

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h2 className="text-sm font-bold tracking-[-0.01em] text-foreground">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

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
      <div className="space-y-5">
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
    <div className="space-y-7">
      <PageHeader
        title="Dashboard"
        description="Una lettura chiara di vendite, ordini, consegne e scadenze."
      />

      <section className="space-y-3">
        <SectionHeading title="Panoramica commerciale" description="I numeri principali dell'attività." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link to="/vendite" className="md:col-span-2 block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="group relative h-full overflow-hidden border-[#eadfd6] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
              <div className="absolute right-[-30px] top-[-56px] h-40 w-40 rounded-full bg-primary/[0.055]" />
              <div className="absolute right-10 top-[-70px] h-44 w-44 rounded-full bg-[#d9a858]/[0.07]" />
              <CardContent className="relative flex min-h-[128px] items-center gap-5 p-6">
                <div className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl border border-[#f4c9cc] bg-[#fff0f1] text-primary">
                  <Banknote className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Fatturato complessivo
                  </p>
                  {isLoading ? (
                    <Skeleton className="mt-2 h-9 w-52" />
                  ) : (
                    <p className="tnum mt-1 text-3xl font-extrabold tracking-[-0.035em] text-foreground sm:text-[34px]">
                      {formatCurrency(metrics?.fatturatoTotale ?? 0)}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {metrics?.totaleFatture ?? 0} fatture registrate
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <StatCard
            label="Fatture aperte"
            value={metrics?.fattureAperte ?? 0}
            icon={ReceiptText}
            tone="info"
            loading={isLoading}
            to="/vendite"
          />
          <StatCard
            label="Consegnate"
            value={metrics?.consegnate ?? 0}
            icon={Truck}
            tone="success"
            loading={isLoading}
            to="/vendite?status=Consegnata"
          />
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading title="Flusso ordini" description="Dove si trova oggi il lavoro da completare." />
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Da ordinare"
            value={metrics?.daOrdinare ?? 0}
            icon={ClipboardList}
            tone="warning"
            loading={isLoading}
            to="/vendite?status=Da Ordinare"
          />
          <StatCard
            label="Ordinate"
            value={metrics?.ordinati ?? 0}
            icon={ShoppingBag}
            tone="info"
            loading={isLoading}
            to="/vendite?status=Ordinato"
          />
          <StatCard
            label="Pronte"
            value={metrics?.pronte ?? 0}
            icon={PackageCheck}
            loading={isLoading}
            to="/vendite?status=Pronta"
          />
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading title="Scadenze operative" description="Incassi, provvigioni e assegni da tenere sotto controllo." />
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Acconti da incassare"
            value={formatCurrency(metrics?.accontiDaIncassare.total ?? 0)}
            sub={`${metrics?.accontiDaIncassare.count ?? 0} acconti`}
            icon={PiggyBank}
            tone="warning"
            loading={isLoading}
            to="/acconti"
          />
          <StatCard
            label="Provvigioni da pagare"
            value={formatCurrency(metrics?.provvigioniDaPagare.total ?? 0)}
            sub={`${metrics?.provvigioniDaPagare.count ?? 0} provvigioni`}
            icon={HandCoins}
            tone="warning"
            loading={isLoading}
            to="/provvigioni"
          />
          <StatCard
            label="Assegni in scadenza (60gg)"
            value={metrics?.assegniInScadenza.length ?? 0}
            sub={
              metrics?.assegniInScadenza[0]
                ? `prossimo: ${formatDateShort(metrics.assegniInScadenza[0].expireDate)}`
                : 'nessuno'
            }
            icon={CalendarClock}
            tone={metrics && metrics.assegniInScadenza.length > 0 ? 'destructive' : 'default'}
            loading={isLoading}
            to="/assegni"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader className="border-b border-[#eee6de]">
            <CardTitle>Andamento vendite</CardTitle>
            <CardDescription>Fatturato mensile delle fatture non annullate</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : chartData.length === 0 ? (
              <EmptyState title="Nessun dato" description="Non ci sono vendite da mostrare." />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9e1d9" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: '#7b726c' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#7b726c' }}
                      tickLine={false}
                      axisLine={false}
                      width={64}
                      tickFormatter={(v: number) =>
                        v >= 1000 ? `€${(v / 1000).toFixed(0)}k` : `€${v}`
                      }
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Fatturato']}
                      labelFormatter={(l) => `Mese: ${l}`}
                      cursor={{ fill: '#fff4f3' }}
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e1d9d0',
                        background: '#fffefd',
                        color: '#272120',
                        boxShadow: '0 14px 35px rgba(77,59,47,0.12)',
                      }}
                    />
                    <Bar dataKey="total" fill="#f20f1f" radius={[6, 6, 2, 2]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-[#eee6de]">
            <CardTitle>Performance venditori</CardTitle>
            <CardDescription>Fatturato e numero di vendite</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)
            ) : (metrics?.venditePerVenditore.length ?? 0) === 0 ? (
              <EmptyState title="Nessun venditore" />
            ) : (
              metrics!.venditePerVenditore.map((s) => {
                const max = metrics!.venditePerVenditore[0]?.total || 1;
                return (
                  <div key={s.seller}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-semibold text-foreground">{s.seller}</span>
                      <span className="tnum whitespace-nowrap text-xs text-muted-foreground">
                        {formatCurrency(s.total)} · {s.count}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#eee8e0]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-[#df4851]"
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

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[#eee6de]">
          <div>
            <CardTitle>Attività recenti</CardTitle>
            <CardDescription>Ultime fatture di vendita</CardDescription>
          </div>
          <Link to="/vendite" className="text-xs font-bold text-primary hover:text-brand-red-dark">
            Vedi tutte →
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
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
                  <TableRow key={b.uuid}>
                    <TableCell className="tnum whitespace-nowrap">{formatDate(b.date)}</TableCell>
                    <TableCell className="max-w-[220px] truncate">
                      <Link to={`/vendite/${b.uuid}`} className="data-link">
                        {b.client || '—'}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{b.seller}</TableCell>
                    <TableCell><StatusBadge status={b.status} /></TableCell>
                    <TableCell className="tnum text-right font-bold">
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
