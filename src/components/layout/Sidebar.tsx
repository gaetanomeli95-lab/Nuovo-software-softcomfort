import { NavLink } from 'react-router-dom';
import { NAV_SECTIONS } from '@/app/nav';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';
import { SoftComfortBrand } from '@/components/common/SoftComfortBrand';

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();

  return (
    <aside className="softcomfort-shell flex h-full w-64 flex-col border-r border-black/20 text-[#f8f4ee] shadow-[16px_0_45px_rgba(58,39,31,0.10)]">
      <div className="px-4 pb-3 pt-4">
        <SoftComfortBrand
          className="text-[#f8f4ee]"
          imageClassName="h-11 w-11 rounded-[14px]"
        />
        <div className="brand-divider mt-4 h-px w-full opacity-80" />
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-2 scrollbar-thin">
        {NAV_SECTIONS.map((section, i) => {
          const items = section.items.filter((it) => !it.adminOnly || user?.isAdmin);
          if (items.length === 0) return null;

          return (
            <div key={i} className={cn(i > 0 && 'mt-5')}>
              {section.title && (
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d9a858]/80">
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
                          'group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-all duration-200',
                          isActive
                            ? 'border-white/10 bg-white/[0.075] font-semibold text-white shadow-[inset_3px_0_0_#f20f1f,0_6px_20px_rgba(0,0,0,0.08)]'
                            : 'border-transparent text-[#c8bfba] hover:border-white/[0.06] hover:bg-white/[0.045] hover:text-white',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={cn(
                              'h-4 w-4 shrink-0 transition-colors',
                              isActive
                                ? 'text-[#ff3946]'
                                : 'text-[#9d938e] group-hover:text-[#d9a858]',
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

      <div className="mx-4 h-px bg-white/[0.08]" />
      <div className="p-3">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#d9a858]/75">
            Sessione attiva
          </p>
          <p className="mt-1 truncate text-xs font-semibold text-[#f8f4ee]">
            {user?.username}
            {user?.isAdmin && <span className="ml-1.5 text-[#ff4652]">· admin</span>}
          </p>
        </div>
      </div>
    </aside>
  );
}
