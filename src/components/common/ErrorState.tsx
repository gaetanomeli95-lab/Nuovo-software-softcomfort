import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/services/api/http';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({ error, onRetry, title = 'Errore di caricamento' }: ErrorStateProps) {
  const message =
    error instanceof ApiError
      ? error.status === 0
        ? 'Server non raggiungibile. Verifica che il backend sia attivo.'
        : error.message
      : error instanceof Error
        ? error.message
        : 'Si è verificato un errore imprevisto.';

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#efcbd0] bg-[#fff0f2]">
        <AlertTriangle className="h-5 w-5 text-destructive" />
      </div>
      <p className="text-sm font-bold text-foreground">{title}</p>
      <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          <RefreshCw className="h-3.5 w-3.5" /> Riprova
        </Button>
      )}
    </div>
  );
}
