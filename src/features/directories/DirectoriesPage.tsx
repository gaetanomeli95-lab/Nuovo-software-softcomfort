import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, Search, Users } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { SummaryPill } from '@/components/common/SummaryPill';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  useBuyingBills,
  useInventoryAvailable,
  useInventoryDelivered,
  usePendingOrders,
  useSellingBills,
} from '@/hooks/useQueries';
import { formatCurrency, formatDate } from '@/lib/format';
import { buildCustomerDirectory, buildSupplierDirectory } from './directories';

export function DirectoriesPage() {
  const sales = useSellingBills();
  const purchases = useBuyingBills();
  const inventoryAvailable = useInventoryAvailable();
  const inventoryDelivered = useInventoryDelivered();
  const pending = usePendingOrders();
  const [q, setQ] = useState('');

  const customers = useMemo(
    () => buildCustomerDirectory(sales.data ?? []),
    [sales.data],
  );
  const suppliers = useMemo(
    () => buildSupplierDirectory(
      purchases.data ?? [],
      [...(inventoryAvailable.data ?? []), ...(inventoryDelivered.data ?? [])],
      pending.data ?? [],
    ),
    [purchases.data, inventoryAvailable.data, inventoryDelivered.data, pending.data],
  );

  const needle = q.trim().toLocaleLowerCase('it');
  const visibleCustomers = useMemo(
    () => customers.filter((row) => !needle || [
      row.name, row.phone, row.address,
    ].join(' ').toLocaleLowerCase('it').includes(needle)),
    [customers, needle],
  );
  const visibleSuppliers = useMemo(
    () => suppliers.filter((row) => !needle || row.name.toLocaleLowerCase('it').includes(needle)),
    [suppliers, needle],
  );

  const isLoading =
    sales.isLoading ||
    purchases.isLoading ||
    inventoryAvailable.isLoading ||
    inventoryDelivered.isLoading ||
    pending.isLoading;

  const error =
    sales.error ??
    purchases.error ??
    inventoryAvailable.error ??
    inventoryDelivered.error ??
    pending.error;

  const retry = () => {
    sales.refetch();
    purchases.refetch();
    inventoryAvailable.refetch();
    inventoryDelivered.refetch();
    pending.refetch();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Anagrafiche"
        description="Clienti e fornitori ricostruiti automaticamente dai dati operativi già presenti."
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-3.5">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca cliente, telefono, indirizzo o fornitore…"
              className="pl-9"
            />
          </div>
          <SummaryPill label="Clienti" value={String(customers.length)} tone="neutral" />
          <SummaryPill label="Fornitori" value={String(suppliers.length)} tone="gold" />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-11 w-full" />
              ))}
            </div>
          ) : error ? (
            <ErrorState error={error} onRetry={retry} />
          ) : (
            <Tabs defaultValue="customers">
              <div className="border-b border-[#eee6de] bg-[#fffefd] px-4 py-3">
                <TabsList>
                  <TabsTrigger value="customers">Clienti ({visibleCustomers.length})</TabsTrigger>
                  <TabsTrigger value="suppliers">Fornitori ({visibleSuppliers.length})</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="customers" className="mt-0">
                {visibleCustomers.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="Nessun cliente trovato"
                    description="I clienti vengono ricavati automaticamente dalle vendite non annullate."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="hidden md:table-cell">Recapito</TableHead>
                        <TableHead className="hidden lg:table-cell">Indirizzo</TableHead>
                        <TableHead className="text-center">Vendite</TableHead>
                        <TableHead className="text-right">Totale storico</TableHead>
                        <TableHead className="hidden text-right xl:table-cell">Ultima vendita</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleCustomers.map((row) => (
                        <TableRow key={row.key}>
                          <TableCell>
                            <Link
                              to={`/vendite?q=${encodeURIComponent(row.name)}`}
                              className="data-link"
                            >
                              {row.name}
                            </Link>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {row.phone ? (
                              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                <Phone className="h-3.5 w-3.5" /> {row.phone}
                              </span>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="hidden max-w-[260px] truncate text-muted-foreground lg:table-cell">
                            {row.address || '—'}
                          </TableCell>
                          <TableCell className="tnum text-center font-semibold">{row.salesCount}</TableCell>
                          <TableCell className="tnum text-right font-bold">{formatCurrency(row.totalSpent)}</TableCell>
                          <TableCell className="hidden whitespace-nowrap text-right text-muted-foreground xl:table-cell">
                            {row.lastSaleDate ? formatDate(row.lastSaleDate) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="suppliers" className="mt-0">
                {visibleSuppliers.length === 0 ? (
                  <EmptyState
                    icon={Building2}
                    title="Nessun fornitore trovato"
                    description="I fornitori vengono ricavati da acquisti, magazzino e ordini in sospeso."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fornitore</TableHead>
                        <TableHead className="text-center">Acquisti</TableHead>
                        <TableHead className="text-right">Valore acquisti</TableHead>
                        <TableHead className="hidden text-center md:table-cell">Articoli magazzino</TableHead>
                        <TableHead className="hidden text-center lg:table-cell">Ordini aperti</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleSuppliers.map((row) => (
                        <TableRow key={row.key}>
                          <TableCell>
                            <Link
                              to={`/acquisti?q=${encodeURIComponent(row.name)}`}
                              className="data-link"
                            >
                              {row.name}
                            </Link>
                          </TableCell>
                          <TableCell className="tnum text-center font-semibold">{row.purchaseCount}</TableCell>
                          <TableCell className="tnum text-right font-bold">{formatCurrency(row.purchaseValue)}</TableCell>
                          <TableCell className="tnum hidden text-center md:table-cell">{row.inventoryItems}</TableCell>
                          <TableCell className="tnum hidden text-center lg:table-cell">{row.pendingOrders}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
