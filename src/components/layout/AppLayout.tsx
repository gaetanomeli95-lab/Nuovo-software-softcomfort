import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '@/lib/utils';

/**
 * Shell applicativa: sidebar fissa su desktop, drawer su mobile,
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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Drawer mobile */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform transition-transform lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} onSearch={handleGlobalSearch} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
