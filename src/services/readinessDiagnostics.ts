import { buyingBillsApi } from '@/services/api/buyingBills';
import { checksApi } from '@/services/api/checks';
import { depositsApi } from '@/services/api/deposits';
import { inventoryApi } from '@/services/api/inventory';
import { pendingApi } from '@/services/api/pending';
import { provisionsApi } from '@/services/api/provisions';
import { sellingBillsApi } from '@/services/api/sellingBills';

export type DiagnosticStatus = 'ok' | 'error';

export interface DiagnosticResult {
  id: string;
  label: string;
  status: DiagnosticStatus;
  durationMs: number;
  records?: number;
  message?: string;
}

interface DiagnosticDefinition {
  id: string;
  label: string;
  run: () => Promise<unknown>;
  count?: (data: unknown) => number | undefined;
}

function arrayCount(data: unknown): number | undefined {
  return Array.isArray(data) ? data.length : undefined;
}

function nestedCount(key: string) {
  return (data: unknown): number | undefined => {
    if (!data || typeof data !== 'object') return undefined;
    const value = (data as Record<string, unknown>)[key];
    return Array.isArray(value) ? value.length : undefined;
  };
}

export function diagnosticMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Controllo non riuscito';
}

export async function runReadinessDiagnostics(): Promise<DiagnosticResult[]> {
  const checks: DiagnosticDefinition[] = [
    {
      id: 'sales',
      label: 'Vendite',
      run: () => sellingBillsApi.getAll(),
      count: arrayCount,
    },
    {
      id: 'purchases',
      label: 'Acquisti',
      run: () => buyingBillsApi.getAll(),
      count: arrayCount,
    },
    {
      id: 'inventory-available',
      label: 'Magazzino disponibile',
      run: () => inventoryApi.getAllAvailable(),
      count: arrayCount,
    },
    {
      id: 'inventory-delivered',
      label: 'Storico magazzino',
      run: () => inventoryApi.getDelivered(),
      count: arrayCount,
    },
    {
      id: 'checks',
      label: 'Assegni',
      run: () => checksApi.getAll(),
      count: arrayCount,
    },
    {
      id: 'deposits',
      label: 'Acconti da incassare',
      run: () => depositsApi.getToCollect(),
      count: nestedCount('depositResponses'),
    },
    {
      id: 'provisions',
      label: 'Provvigioni da pagare',
      run: () => provisionsApi.getToPay(),
      count: nestedCount('provisionResponses'),
    },
    {
      id: 'pending',
      label: 'Ordini in sospeso',
      run: () => pendingApi.getAll(),
      count: arrayCount,
    },
  ];

  return Promise.all(
    checks.map(async (check) => {
      const startedAt = performance.now();
      try {
        const data = await check.run();
        return {
          id: check.id,
          label: check.label,
          status: 'ok' as const,
          durationMs: Math.round(performance.now() - startedAt),
          records: check.count?.(data),
        };
      } catch (error) {
        return {
          id: check.id,
          label: check.label,
          status: 'error' as const,
          durationMs: Math.round(performance.now() - startedAt),
          message: diagnosticMessage(error),
        };
      }
    }),
  );
}

export function summarizeDiagnostics(results: DiagnosticResult[]) {
  const ok = results.filter((result) => result.status === 'ok').length;
  const failed = results.length - ok;
  return {
    total: results.length,
    ok,
    failed,
    healthy: results.length > 0 && failed === 0,
  };
}
