import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { ArrowRight, ChevronRight, ClipboardCheck, Lock, ShieldCheck, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { visibleNavSections } from '@/app/nav';
import { SoftComfortBrand } from '@/components/common/SoftComfortBrand';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/AuthContext';
import { priorityLabel, priorityVariant } from '@/features/operations/priority';
import { useOperationsInbox } from '@/features/operations/useOperationsInbox';

const sectionStyles: Record<string, {
  accent: string;
  icon: string;
  glow: string;
  eyebrow: string;
}> = {
  Negozio: {
    accent: 'bg-[#f20f1f]',
    icon: 'border-[#f2c8cb] bg-[#fff1f2] text-[#bd0c16]',
    glow: 'bg-[#f20f1f]/[0.055]',
    eyebrow: 'text-[#a40b13]',
  },
  'Consegne e magazzino': {
    accent: 'bg-[#b8873d]',
    icon: 'border-[#ead8bc] bg-[#fbf5ea] text-[#8a6428]',
    glow: 'bg-[#d9a858]/[0.07]',
    eyebrow: 'text-[#7a5a27]',
  },
  Amministratore: {
    accent: 'bg-[#3e3733]',
    icon: 'border-[#d8d0c8] bg-[#f3f0ec] text-[#403934]',
    glow: 'bg-[#3e3733]/[0.045]',
    eyebrow: 'text-[#4f4641]',
  },
};

const HOME_TODAY_LIMIT = 5;

function TodayPanel() {
  const { inbox, isLoading } = useOperationsInbox();
  const items = [...inbox.urgent, ...inbox.sales];
  const shown = items.slice(0, HOME_TODAY_LIMIT);

  return (
    <section
      aria-labelledby="home-today"
      className="overflow-hidden rounded-[28px] border border-[#ded4cc] bg-[#fffefd] shadow-[0_16px_45px_rgba(67,51,42,0.08)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee6de] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-[13px] border border-[#f0c7ca] bg-[#fff0f1] text-[#bd0c16]">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 id="home-today" className="text-[18px] font-extrabold tracking-[-0.03em] text-[#272120]">
              Oggi
            </h2>
            <p className="text-xs text-[#81766f]">
              {isLoading
                ? 'Controllo delle attività…'
                : items.length === 0
                  ? 'Nessuna urgenza: tutto sotto controllo.'
                  : `${inbox.urgent.length} urgenti · ${inbox.sales.length} vendite da seguire`}
            </p>
          </div>
        </div>
        <Link
          to="/attivita"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#ddd4cc] bg-white px-3.5 py-1.5 text-xs font-extrabold text-[#3b332f] transition-colors hover:border-[#d1c3b8] hover:text-[#b60d17]"
        >
          Vedi tutto in Da fare
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      ) : shown.length > 0 ? (
        <div>
          {shown.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className="group flex items-center gap-3 border-b border-[#eee6de] px-5 py-3 transition-colors last:border-b-0 hover:bg-[#faf7f3] sm:px-6"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-extrabold text-[#342c28]">{item.title}</p>
                  <Badge variant={priorityVariant(item.priority)}>{priorityLabel(item.priority)}</Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#a0948b] transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
          {items.length > HOME_TODAY_LIMIT && (
            <div className="border-t border-[#eee6de] bg-[#fcfaf7] px-5 py-2.5 text-xs font-semibold text-muted-foreground sm:px-6">
              Altre {items.length - HOME_TODAY_LIMIT} attività in Da fare.
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

export function HomePage() {
  const { user, isDemo, setDemoRole } = useAuth();
  const isAdmin = Boolean(user?.isAdmin);
  const sections = visibleNavSections(isAdmin);
  const weekday = format(new Date(), 'EEEE d MMMM', { locale: it });
  const today = weekday.charAt(0).toUpperCase() + weekday.slice(1);

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 pb-10">
      <section className="softcomfort-home-hero relative overflow-hidden rounded-[28px] border border-black/15 px-6 py-5 text-white shadow-[0_22px_55px_rgba(49,32,28,0.18)] sm:px-8">
        <div className="pointer-events-none absolute bottom-[-130px] left-[30%] h-64 w-64 rounded-full bg-[#f20f1f]/[0.10] blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <SoftComfortBrand
              className="text-white"
              imageClassName="h-12 w-12 rounded-[15px] shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
              showTagline={false}
            />
            <div className="hidden h-10 w-px bg-white/[0.12] sm:block" />
            <div>
              <h1 className="text-[22px] font-extrabold tracking-[-0.035em] text-white sm:text-[26px]">
                Buon lavoro{user?.username && !isDemo ? `, ${user.username}` : ''}
              </h1>
              <p className="text-xs text-[#cfc4bd] sm:text-sm">{today}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.07] px-3 py-1.5 text-[11px] font-bold text-[#f4eee8]">
              {isAdmin ? <ShieldCheck className="h-3.5 w-3.5 text-[#d9a858]" /> : <Store className="h-3.5 w-3.5 text-[#d9a858]" />}
              {isAdmin ? 'PC amministratore' : 'PC operativo'}
              {isDemo && <span className="text-[#d9a858]">· demo</span>}
            </span>
            {isDemo && (
              <button
                type="button"
                onClick={() => setDemoRole(isAdmin ? 'operatore' : 'admin')}
                className="rounded-full border border-[#d9a858]/40 bg-[#d9a858]/[0.12] px-3 py-1.5 text-[11px] font-extrabold text-[#f1d9a8] transition-colors hover:bg-[#d9a858]/[0.22]"
              >
                {isAdmin ? 'Prova come PC operativo' : 'Torna al PC amministratore'}
              </button>
            )}
          </div>
        </div>
      </section>

      <TodayPanel />

      <div className="space-y-6">
        {sections.map((section) => {
          const style = sectionStyles[section.title] ?? sectionStyles.Amministratore;
          const reserved = section.items.every((item) => item.adminOnly);

          return (
            <section
              key={section.title}
              className="rounded-[28px] border border-[#c8b8aa] bg-[#d8c9bd]/92 p-4 shadow-[0_14px_36px_rgba(73,57,48,0.08)] backdrop-blur-[2px] sm:p-5"
            >
              <div className="mb-4 flex items-end justify-between gap-4 px-1">
                <div>
                  <h2 className="flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.025em] text-[#302925]">
                    {section.title}
                    {reserved && (
                      <span className={`inline-flex items-center gap-1 rounded-full border border-[#bfb1a5] bg-[#efe8e1] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em] ${style.eyebrow}`}>
                        <Lock className="h-3 w-3" />
                        Solo admin
                      </span>
                    )}
                  </h2>
                  <p className="mt-1 text-xs text-[#81766f]">{section.description}</p>
                </div>
                <div className={`hidden h-[3px] w-16 rounded-full sm:block ${style.accent}`} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="group rounded-[22px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f20f1f]/60"
                  >
                    <article className="relative flex h-full items-start gap-4 overflow-hidden rounded-[22px] border border-[#ddd4cc] bg-[#fffefd] p-4 shadow-[0_10px_28px_rgba(67,51,42,0.055)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#d0c2b7] group-hover:shadow-[0_18px_40px_rgba(67,51,42,0.10)] sm:p-5">
                      <div className={`pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full ${style.glow}`} />
                      <div className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border ${style.icon}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="relative min-w-0 flex-1">
                        <h3 className="text-[16px] font-extrabold tracking-[-0.025em] text-[#272120]">
                          {item.label}
                        </h3>
                        <p className="mt-1 text-[12.5px] leading-[1.5] text-[#746b65]">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className="relative mt-1 h-4 w-4 shrink-0 text-[#9e938c] transition-transform group-hover:translate-x-0.5 group-hover:text-[#3e3733]" />
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
