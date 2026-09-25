import { useState } from 'react';
import {
  Activity,
  BadgeCheck,
  Building2,
  CheckCircle2,
  CircleAlert,
  Database,
  FileCheck2,
  FileDown,
  LockKeyhole,
  Printer,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SOFT_COMFORT_COMPANY } from '@/config/company';
import { useAuth } from '@/features/auth/AuthContext';
import {
  API_CONNECTION_MODE,
  AUTOMATIC_DEMO_MODE,
} from '@/services/api/config';
import {
  runReadinessDiagnostics,
  summarizeDiagnostics,
  type DiagnosticResult,
} from '@/services/readinessDiagnostics';

function StatusRow({
  icon: Icon,
  title,
  description,
  status,
  tone = 'outline',
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  status: string;
  tone?: 'success' | 'warning' | 'outline' | 'info';
}) {
  return (
    <div className="flex items-start gap-3 border-b border-[#eee6de] py-4 last:border-b-0">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#e4dcd4] bg-[#faf7f3]">
        <Icon className="h-4 w-4 text-[#6d625c]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-extrabold text-[#302925]">{title}</p>
          <Badge variant={tone}>{status}</Badge>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function DiagnosticRow({ result }: { result: DiagnosticResult }) {
  const ok = result.status === 'ok';

  return (
    <div className="flex items-center gap-3 border-b border-[#eee6de] py-3 last:border-b-0">
      <div className={
        ok
          ? 'grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eff7f2] text-success'
          : 'grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#fff0f1] text-destructive'
      }>
        {ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-[#302925]">{result.label}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {ok
            ? String(result.records ?? '—') + ' record letti · ' + result.durationMs + ' ms'
            : result.message || 'Controllo non riuscito'}
        </p>
      </div>
      <Badge variant={ok ? 'success' : 'warning'}>{ok ? 'OK' : 'Errore'}</Badge>
    </div>
  );
}

export function AdministrationPage() {
  const { user, isDemo } = useAuth();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [checking, setChecking] = useState(false);

  const connectionLabel =
    API_CONNECTION_MODE === 'demo'
      ? 'Demo'
      : API_CONNECTION_MODE === 'remote'
        ? 'Backend remoto'
        : 'Stessa origine';

  const diagnosticSummary = summarizeDiagnostics(diagnostics);

  const runDiagnostics = async () => {
    setChecking(true);
    try {
      setDiagnostics(await runReadinessDiagnostics());
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Amministrazione"
        description="Stato del gestionale, configurazione operativa e controlli prima dell'uso definitivo."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden border-[#ded4cb]">
          <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
            <CardTitle className="flex items-center gap-2">
              <ServerCog className="h-4 w-4 text-primary" />
              Ambiente
            </CardTitle>
            <CardDescription>Come sta lavorando questa installazione.</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-muted-foreground">Modalità dati</p>
            <p className="mt-1 text-xl font-black tracking-[-0.03em]">{connectionLabel}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {AUTOMATIC_DEMO_MODE || isDemo
                ? 'I dati sono dimostrativi: nessuna operazione raggiunge il database reale.'
                : 'Le operazioni sono indirizzate al backend configurato per questa installazione.'}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-[#ded4cb]">
          <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              Accesso
            </CardTitle>
            <CardDescription>Sessione e privilegi correnti.</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-muted-foreground">Utente</p>
            <p className="mt-1 text-xl font-black tracking-[-0.03em]">{user?.username || '—'}</p>
            <div className="mt-3">
              <Badge variant={user?.isAdmin ? 'success' : 'outline'}>
                {user?.isAdmin ? 'Amministratore' : 'Utente operativo'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-[#ded4cb]">
          <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#9a6b24]" />
              Identità Soft Comfort
            </CardTitle>
            <CardDescription>Dati usati nelle superfici operative e nelle stampe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-5 text-sm">
            <p className="font-extrabold">{SOFT_COMFORT_COMPANY.name}</p>
            {SOFT_COMFORT_COMPANY.locations.map((location) => (
              <p key={location} className="text-muted-foreground">{location}</p>
            ))}
            <p className="text-muted-foreground">Tel. {SOFT_COMFORT_COMPANY.phone}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-[#d9cfc6]">
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 border-b border-[#eee6de] bg-[#fffefd]">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Diagnostica dati
            </CardTitle>
            <CardDescription>
              Controllo di sola lettura dei moduli principali. Non modifica né elimina dati.
            </CardDescription>
          </div>
          <Button onClick={runDiagnostics} disabled={checking}>
            <RefreshCw className={checking ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            {checking ? 'Controllo…' : diagnostics.length ? 'Ripeti controllo' : 'Esegui controllo'}
          </Button>
        </CardHeader>
        <CardContent>
          {diagnostics.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm font-bold text-[#3d3531]">Nessun controllo eseguito</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Avvia il test per verificare lettura vendite, acquisti, magazzino, assegni, acconti, provvigioni e ordini.
              </p>
            </div>
          ) : (
            <>
              <div className={
                diagnosticSummary.healthy
                  ? 'my-4 rounded-xl border border-[#c7e0d1] bg-[#eff7f2] px-4 py-3 text-sm text-[#245f42]'
                  : 'my-4 rounded-xl border border-[#f1c7ca] bg-[#fff0f1] px-4 py-3 text-sm text-[#8d1720]'
              }>
                <p className="font-extrabold">
                  {diagnosticSummary.healthy
                    ? 'Tutti i ' + diagnosticSummary.total + ' controlli di lettura sono riusciti.'
                    : diagnosticSummary.failed + ' controlli su ' + diagnosticSummary.total + ' richiedono attenzione.'}
                </p>
                <p className="mt-0.5 text-xs opacity-80">
                  {AUTOMATIC_DEMO_MODE || isDemo
                    ? 'Il test è stato eseguito sui dati demo.'
                    : 'Il test ha interrogato il backend configurato per questa installazione.'}
                </p>
              </div>
              <div>
                {diagnostics.map((result) => <DiagnosticRow key={result.id} result={result} />)}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
            <CardTitle>Controlli operativi</CardTitle>
            <CardDescription>Ciò che il gestionale gestisce già in modo strutturato.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusRow
              icon={Database}
              title="Dati e workflow"
              description="Vendite, ordini, consegne, magazzino, acquisti, assegni, acconti e provvigioni sono collegati all'adapter legacy."
              status="Operativo"
              tone="success"
            />
            <StatusRow
              icon={Printer}
              title="Stampe vendita"
              description="Documento di vendita, bolla e proposta di commissione A4 mantengono un layout familiare Soft Comfort con ottimizzazione per stampa in bianco e nero."
              status="Operativo"
              tone="success"
            />
            <StatusRow
              icon={FileDown}
              title="Esportazioni operative"
              description="Vendite e magazzino possono essere esportati in CSV; il planning consegne può essere esportato anche in calendario ICS."
              status="Operativo"
              tone="success"
            />
            <StatusRow
              icon={LockKeyhole}
              title="Autenticazione"
              description="Accesso JWT e funzioni amministrative protette dal ruolo amministratore."
              status="Attivo"
              tone="success"
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-[#eee6de] bg-[#fffefd]">
            <CardTitle>Controlli prima della produzione definitiva</CardTitle>
            <CardDescription>
              Punti che richiedono una verifica reale, non supposizioni nel codice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusRow
              icon={CircleAlert}
              title="Chiusura definitiva vendita"
              description="L'endpoint legacy /sellingBill/update esiste, ma il suo contratto esatto non è ancora stato verificato. Il gestionale mostra la readiness senza inviare scritture non sicure."
              status="Da validare"
              tone="warning"
            />
            <StatusRow
              icon={FileCheck2}
              title="Dati fiscali aziendali"
              description="Prima di trasformare il documento gestionale in documento fiscale devono essere verificati ragione sociale corrente, P.IVA/CF, sede legale e dati tributari."
              status="Da verificare"
              tone="warning"
            />
            <StatusRow
              icon={BadgeCheck}
              title="Collaudo backend reale"
              description="Prima del go-live va eseguito un ciclo completo su dati di prova: creazione vendita, articoli, acconti, ordine, consegna, stampa e chiusura."
              status="Necessario"
              tone="info"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
