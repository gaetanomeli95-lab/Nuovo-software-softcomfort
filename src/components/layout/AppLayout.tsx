import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const navigate = useNavigate();

  const handleGlobalSearch = (q: string) => {
    const query = q.trim();
    if (query) navigate(`/vendite?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div className="hidden h-full shrink-0 lg:block">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onSearch={handleGlobalSearch} />
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
