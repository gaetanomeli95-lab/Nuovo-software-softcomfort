import { Outlet, useNavigate } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function AppLayout() {
  const navigate = useNavigate();
  const online = useOnlineStatus();

  const handleGlobalSearch = (q: string) => {
    const query = q.trim();
    if (query) navigate(`/cerca?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div className="hidden h-full shrink-0 lg:block">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onSearch={handleGlobalSearch} />
        {!online && (
          <div
            role="status"
            className="flex shrink-0 items-center justify-center gap-2 border-b border-[#ead4a8] bg-[#fff8e9] px-4 py-2 text-center text-xs font-bold text-[#7b5920]"
          >
            <WifiOff className="h-4 w-4" />
            Il dispositivo risulta offline. Evita di salvare modifiche finché la connessione non torna disponibile; le bozze della nuova vendita restano salvate su questo dispositivo.
          </div>
        )}
        <main className="softcomfort-workspace relative flex-1 overflow-y-auto scrollbar-thin">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white/55 to-transparent" />
          <div className="relative mx-auto w-full max-w-[1480px] p-4 sm:p-6 lg:px-8 lg:py-7">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
