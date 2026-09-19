import { NavLink } from 'react-router-dom';
import { NAV_SECTIONS } from '@/app/nav';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';
import { SoftComfortBrand } from '@/components/common/SoftComfortBrand';

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/10 bg-[#070707]/95 shadow-[18px_0_55px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="px-4 pb-3 pt-4">
        <SoftComfortBrand imageClassName="h-11 w-11 rounded-[14px]" />
        <div className="brand-divider mt-4 h-px w-full opacity-80" />
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-2 scrollbar-thin">
        {NAV_SECTIONS.map((section, i) => {
          const items = section.items.filter((it) => !it.adminOnly || user?.isAdmin);
          if (items.length === 0) return null;

          return (
            <div key={i} className={cn(i > 0 && 'mt-5')}>
              {section.title && (
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold/65">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-all duration-200',
                          isActive
                            ? 'border-primary/25 bg-primary/10 font-semibold text-foreground shadow-[inset_3px_0_0_#f20f1f]'
                            : 'border-transparent text-muted-foreground hover:border-white/5 hover:bg-white/[0.035] hover:text-foreground',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={cn(
                              'h-4 w-4 shrink-0 transition-colors',
                              isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-brand-gold',
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="mx-4 h-px bg-white/10" />
      <div className="p-3">
        <div className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-gold/70">
            Sessione attiva
          </p>
          <p className="mt-1 truncate text-xs font-medium text-foreground">
            {user?.username}
            {user?.isAdmin && <span className="ml-1.5 text-primary">· admin</span>}
          </p>
        </div>
      </div>
    </aside>
  );
}
