import {
  BadgeCheck,
  Building2,
  CircleAlert,
  Database,
  FileCheck2,
  LockKeyhole,
  Printer,
  ServerCog,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SOFT_COMFORT_COMPANY } from '@/config/company';
import { useAuth } from '@/features/auth/AuthContext';
import {
  API_CONNECTION_MODE,
  AUTOMATIC_DEMO_MODE,
} from '@/services/api/config';

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

export function AdministrationPage() {
  const { user, isDemo } = useAuth();

  const connectionLabel =
    API_CONNECTION_MODE === 'demo'
      ? 'Demo'
      : API_CONNECTION_MODE === 'remote'
        ? 'Backend remoto'
        : 'Stessa origine';

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
              description="Documento di vendita e bolla A4 mantengono il layout familiare Soft Comfort con ottimizzazione per stampa in bianco e nero."
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
