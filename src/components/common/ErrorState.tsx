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
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-sm text-xs text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          <RefreshCw className="h-3.5 w-3.5" /> Riprova
        </Button>
      )}
    </div>
  );
}
