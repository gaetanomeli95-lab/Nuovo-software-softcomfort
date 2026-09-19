import { NavLink } from 'react-router-dom';
import { Store } from 'lucide-react';
import { NAV_SECTIONS } from '@/app/nav';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2.5 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Store className="h-4.5 w-4.5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Gestionale</p>
          <p className="text-[11px] text-muted-foreground">Vendite &amp; contabilità</p>
        </div>
      </div>
      <Separator />
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3">
        {NAV_SECTIONS.map((section, i) => {
          const items = section.items.filter((it) => !it.adminOnly || user?.isAdmin);
          if (items.length === 0) return null;
          return (
            <div key={i} className={cn(i > 0 && 'mt-4')}>
              {section.title && (
                <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-accent font-medium text-accent-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
      <Separator />
      <div className="px-4 py-3">
        <p className="truncate text-xs text-muted-foreground">
          {user?.username}
          {user?.isAdmin && <span className="ml-1.5 text-primary">· admin</span>}
        </p>
      </div>
    </aside>
  );
}
