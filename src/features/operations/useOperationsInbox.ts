import { useAuth } from '@/features/auth/AuthContext';
import {
  useChecks,
  useDepositsToCollect,
  useProvisionsToPay,
  useSellingBills,
} from '@/hooks/useQueries';
import { buildOperationsInbox } from './operationsInbox';

/**
 * Attività "Da fare" visibili all'utente corrente.
 * Acconti, assegni e provvigioni sono dati riservati all'admin: sui PC operativi
 * non vengono nemmeno richiesti al server e non compaiono nell'elenco.
 */
export function useOperationsInbox() {
  const { user } = useAuth();
  const isAdmin = Boolean(user?.isAdmin);

  const bills = useSellingBills();
  const deposits = useDepositsToCollect({ enabled: isAdmin });
  const provisions = useProvisionsToPay({ enabled: isAdmin });
  const checks = useChecks({ enabled: isAdmin });

  const adminQueries = isAdmin ? [deposits, provisions, checks] : [];
  const isLoading = bills.isLoading || adminQueries.some((query) => query.isLoading);
  const error = bills.error ?? adminQueries.find((query) => query.error)?.error ?? null;

  const inbox = buildOperationsInbox(
    bills.data ?? [],
    isAdmin ? deposits.data?.depositResponses ?? [] : [],
    isAdmin ? provisions.data?.provisionResponses ?? [] : [],
    isAdmin ? checks.data ?? [] : [],
  );

  const retry = () => {
    bills.refetch();
    adminQueries.forEach((query) => query.refetch());
  };

  return { inbox, isAdmin, isLoading, error, hasBills: Boolean(bills.data), retry };
}
