import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '@/lib/utils';

/**
 * Shell applicativa Soft Comfort: sidebar fissa su desktop, drawer su mobile,
 * topbar con ricerca globale (reindirizza alla lista vendite filtrata).
 */
export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleGlobalSearch = (q: string) => {
    const query = q.trim();
    if (query) navigate(`/vendite?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} onSearch={handleGlobalSearch} />
        <main className="relative flex-1 overflow-y-auto scrollbar-thin">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-primary/[0.035] via-brand-gold/[0.018] to-transparent" />
          <div className="softcomfort-grid pointer-events-none absolute inset-0 opacity-35" />
          <div className="relative mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-7">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
