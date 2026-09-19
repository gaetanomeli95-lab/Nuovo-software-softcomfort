import { ArrowUpRight, ChevronRight, CircleCheck, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NAV_SECTIONS } from '@/app/nav';
import { SoftComfortBrand } from '@/components/common/SoftComfortBrand';
import { useAuth } from '@/features/auth/AuthContext';

const sectionStyles: Record<string, {
  accent: string;
  icon: string;
  glow: string;
  eyebrow: string;
}> = {
  Vendite: {
    accent: 'bg-[#f20f1f]',
    icon: 'border-[#f2c8cb] bg-[#fff1f2] text-[#bd0c16]',
    glow: 'bg-[#f20f1f]/[0.055]',
    eyebrow: 'text-[#a40b13]',
  },
  'Acquisti e magazzino': {
    accent: 'bg-[#b8873d]',
    icon: 'border-[#ead8bc] bg-[#fbf5ea] text-[#8a6428]',
    glow: 'bg-[#d9a858]/[0.07]',
    eyebrow: 'text-[#7a5a27]',
  },
  Contabilità: {
    accent: 'bg-[#3e3733]',
    icon: 'border-[#d8d0c8] bg-[#f3f0ec] text-[#403934]',
    glow: 'bg-[#3e3733]/[0.045]',
    eyebrow: 'text-[#4f4641]',
  },
  Sistema: {
    accent: 'bg-[#77706b]',
    icon: 'border-[#ddd7d1] bg-[#f5f3f0] text-[#5f5752]',
    glow: 'bg-[#77706b]/[0.04]',
    eyebrow: 'text-[#625a55]',
  },
};

export function HomePage() {
  const { user, isDemo } = useAuth();
  const dashboard = NAV_SECTIONS[0]?.items[0];
  const operationalSections = NAV_SECTIONS.slice(1);

  return (
    <div className="mx-auto max-w-[1240px] space-y-7 pb-10">
      <section className="softcomfort-home-hero relative overflow-hidden rounded-[32px] border border-black/15 px-6 py-7 text-white shadow-[0_28px_70px_rgba(49,32,28,0.20)] sm:px-9 sm:py-9 lg:px-11 lg:py-10">
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/[0.06]" />
        <div className="pointer-events-none absolute -right-4 -top-16 h-56 w-56 rounded-full border border-[#d9a858]/[0.14]" />
        <div className="pointer-events-none absolute bottom-[-130px] left-[30%] h-64 w-64 rounded-full bg-[#f20f1f]/[0.10] blur-3xl" />
        <div className="pointer-events-none absolute right-[18%] top-[-90px] h-56 w-56 rounded-full bg-[#d9a858]/[0.08] blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_290px] lg:items-end">
          <div>
            <SoftComfortBrand
              className="text-white"
              imageClassName="h-16 w-16 rounded-[18px] shadow-[0_16px_38px_rgba(0,0,0,0.28)]"
            />

            <div className="mt-8 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#e7c98f]">
                Gestionale Soft Comfort
              </div>
              <h1 className="mt-4 text-[30px] font-extrabold leading-[1.03] tracking-[-0.045em] text-white sm:text-[38px] lg:text-[44px]">
                Tutto quello che serve,
                <span className="block text-[#f4eee8]">senza cambiare il modo di lavorare.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#cfc4bd] sm:text-[15px]">
                Scegli la sezione e vai subito al lavoro. Le funzioni restano familiari,
                con un’interfaccia più chiara, veloce e ordinata.
              </p>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/[0.10] bg-white/[0.055] p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#d9a858]">
              <CircleCheck className="h-3.5 w-3.5" />
              Sessione attiva
            </div>
            <p className="mt-3 text-lg font-extrabold tracking-[-0.02em] text-white">
              {user?.username || 'Utente'}
            </p>
            <p className="mt-1 text-xs text-[#c7bbb4]">
              {isDemo ? 'Modalità demo' : user?.isAdmin ? 'Amministratore' : 'Utente operativo'}
            </p>
            <div className="mt-4 h-px bg-white/[0.08]" />
            <p className="mt-3 text-[11px] leading-relaxed text-[#a99e98]">
              Apri una card per entrare direttamente nella relativa area.
            </p>
          </div>
        </div>
      </section>

      {dashboard && (
        <section>
          <Link
            to={dashboard.to}
            className="group block rounded-[28px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f20f1f]/60"
          >
            <article className="relative overflow-hidden rounded-[28px] border border-[#ded4cc] bg-[#fffefd] shadow-[0_16px_45px_rgba(67,51,42,0.08)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#d1c3b8] group-hover:shadow-[0_24px_60px_rgba(67,51,42,0.13)]">
              <div className="absolute inset-y-0 left-0 w-[5px] bg-[#f20f1f]" />
              <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full bg-[#f20f1f]/[0.055]" />
              <div className="pointer-events-none absolute right-24 -top-24 h-60 w-60 rounded-full bg-[#d9a858]/[0.075]" />

              <div className="relative grid gap-5 p-6 sm:p-7 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-7">
                <div className="grid h-14 w-14 place-items-center rounded-[18px] border border-[#f0c7ca] bg-[#fff0f1] text-[#bd0c16] shadow-[0_8px_20px_rgba(173,20,30,0.08)]">
                  <LayoutDashboard className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#a90d16]">
                    Panoramica
                  </p>
                  <h2 className="mt-1 text-[22px] font-extrabold tracking-[-0.035em] text-[#272120] sm:text-[25px]">
                    Dashboard
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#766c66]">
                    {dashboard.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm font-extrabold text-[#3b332f] transition-colors group-hover:text-[#b60d17]">
                  Apri dashboard
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </div>
            </article>
          </Link>
        </section>
      )}

      <div className="space-y-7">
        {operationalSections.map((section) => {
          const items = section.items.filter((item) => !item.adminOnly || user?.isAdmin);
          if (items.length === 0) return null;

          const style = sectionStyles[section.title] ?? sectionStyles.Sistema;

          return (
            <section
              key={section.title}
              className="rounded-[28px] border border-[#c8b8aa] bg-[#d8c9bd]/92 p-4 shadow-[0_14px_36px_rgba(73,57,48,0.08)] backdrop-blur-[2px] sm:p-5"
            >
              <div className="mb-4 flex items-end justify-between gap-4 px-1">
                <div>
                  <p className={`text-[10px] font-extrabold uppercase tracking-[0.16em] ${style.eyebrow}`}>
                    Area operativa
                  </p>
                  <h2 className="mt-1 text-[19px] font-extrabold tracking-[-0.025em] text-[#302925]">
                    {section.title}
                  </h2>
                  <p className="mt-1 text-xs text-[#81766f]">{section.description}</p>
                </div>
                <div className={`hidden h-[3px] w-16 rounded-full sm:block ${style.accent}`} />
              </div>

              <div className={`grid gap-4 ${items.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                {items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="group rounded-[24px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f20f1f]/60"
                  >
                    <article className="relative flex min-h-[174px] h-full flex-col overflow-hidden rounded-[24px] border border-[#ddd4cc] bg-[#fffefd] p-5 shadow-[0_10px_28px_rgba(67,51,42,0.055)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#d0c2b7] group-hover:shadow-[0_20px_46px_rgba(67,51,42,0.105)] sm:p-6">
                      <div className={`pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full ${style.glow}`} />
                      <div className={`absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${style.accent}`} />

                      <div className="relative flex items-start justify-between gap-4">
                        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-[15px] border shadow-[0_7px_18px_rgba(69,51,42,0.045)] ${style.icon}`}>
                          <item.icon className="h-[21px] w-[21px]" />
                        </div>

                        <div className="grid h-8 w-8 place-items-center rounded-full border border-[#e8e0d9] bg-white text-[#9e938c] transition-all duration-300 group-hover:border-[#d8ccc3] group-hover:text-[#3e3733]">
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>

                      <div className="relative mt-7">
                        <h3 className="text-[18px] font-extrabold tracking-[-0.03em] text-[#272120]">
                          {item.label}
                        </h3>
                        <p className="mt-2 max-w-[34rem] text-[12.5px] leading-[1.6] text-[#746b65]">
                          {item.description}
                        </p>
                      </div>

                      <div className="relative mt-auto pt-5">
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9a8e86] transition-colors group-hover:text-[#5a504a]">
                          Apri sezione
                        </span>
                      </div>
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
