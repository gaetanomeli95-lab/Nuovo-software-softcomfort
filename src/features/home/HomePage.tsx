import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NAV_SECTIONS } from '@/app/nav';
import { SoftComfortBrand } from '@/components/common/SoftComfortBrand';
import { useAuth } from '@/features/auth/AuthContext';

export function HomePage() {
  const { user, isDemo } = useAuth();

  return (
    <div className="mx-auto max-w-[1180px] space-y-8 pb-8">
      <section className="overflow-hidden rounded-[28px] border border-[#e4dcd4] bg-[#fffefd] shadow-[0_18px_55px_rgba(72,55,45,0.08)]">
        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute right-[-45px] top-[-90px] h-60 w-60 rounded-full bg-[#f20f1f]/[0.045]" />
          <div className="pointer-events-none absolute right-24 top-[-105px] h-56 w-56 rounded-full bg-[#d9a858]/[0.06]" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <SoftComfortBrand
                className="text-[#272120]"
                imageClassName="h-14 w-14 rounded-[17px]"
              />
              <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.035em] text-[#272120] sm:text-[30px]">
                Cosa vuoi fare?
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#746b65]">
                Scegli una sezione per iniziare. Le funzioni sono le stesse del gestionale,
                organizzate in modo più semplice e immediato.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e5ddd5] bg-[#faf7f3] px-4 py-3 text-left sm:min-w-[190px]">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#91847b]">
                Sessione attiva
              </p>
              <p className="mt-1 text-sm font-bold text-[#302925]">
                {user?.username || 'Utente'}
              </p>
              <p className="mt-0.5 text-[11px] text-[#81766f]">
                {isDemo ? 'Modalità demo' : user?.isAdmin ? 'Amministratore' : 'Utente'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {NAV_SECTIONS.map((section) => {
        const items = section.items.filter((item) => !item.adminOnly || user?.isAdmin);
        if (items.length === 0) return null;

        return (
          <section key={section.title} className="space-y-3">
            <div className="px-1">
              <h2 className="text-sm font-extrabold tracking-[-0.01em] text-[#302925]">
                {section.title}
              </h2>
              <p className="mt-0.5 text-xs text-[#81766f]">{section.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group rounded-[22px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f20f1f]/60"
                >
                  <article className="relative flex min-h-[154px] h-full flex-col overflow-hidden rounded-[22px] border border-[#ded6ce] bg-[#fffefd] p-5 shadow-[0_10px_30px_rgba(67,51,42,0.06)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-[#d4c8bd] group-hover:shadow-[0_18px_42px_rgba(67,51,42,0.10)]">
                    <div className="absolute inset-x-0 top-0 h-[3px] bg-[#f20f1f] opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="flex items-start justify-between gap-4">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border border-[#eadfd7] bg-[#f8f4ef] text-[#413934] transition-colors group-hover:border-[#f0c8cb] group-hover:bg-[#fff0f1] group-hover:text-[#c70d18]">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 text-[#aaa09a] transition-all group-hover:translate-x-1 group-hover:text-[#c70d18]" />
                    </div>

                    <div className="mt-5">
                      <h3 className="text-[17px] font-extrabold tracking-[-0.025em] text-[#272120]">
                        {item.label}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#766d67]">
                        {item.description}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
