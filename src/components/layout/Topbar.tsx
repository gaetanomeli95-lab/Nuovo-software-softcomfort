import { useLocation, useNavigate } from 'react-router-dom';
import { Home, LogOut, Search, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SoftComfortBrand } from '@/components/common/SoftComfortBrand';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/auth/AuthContext';
import { useState } from 'react';

interface TopbarProps {
  onSearch: (q: string) => void;
}

export function Topbar({ onSearch }: TopbarProps) {
  const { user, isDemo, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState('');
  const isHome = location.pathname === '/';

  return (
    <header className="flex min-h-[68px] shrink-0 items-center gap-3 border-b border-[#ddd5cc] bg-[#fffefd]/95 px-4 py-2.5 shadow-[0_1px_0_rgba(64,47,38,0.02)] backdrop-blur-xl sm:px-6">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="hidden rounded-xl text-left transition-opacity hover:opacity-80 sm:block"
        aria-label="Torna alla home"
      >
        <SoftComfortBrand
          className="text-[#272120]"
          imageClassName="h-10 w-10 rounded-[12px]"
          showTagline={false}
        />
      </button>

      {!isHome && (
        <Button
          variant="outline"
          className="shrink-0 border-[#d9d0c6] bg-white"
          onClick={() => navigate('/')}
        >
          <Home className="h-4 w-4" />
          <span className="hidden md:inline">Home</span>
        </Button>
      )}

      <form
        className="relative ml-0 w-full max-w-xl sm:ml-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(q);
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8178]" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Cerca cliente, venditore, articolo…"
          className="h-10 border-[#ddd5cc] bg-[#faf8f5] pl-9 shadow-none"
          aria-label="Ricerca"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        {isDemo && (
          <Badge variant="warning" className="hidden sm:inline-flex">
            Modalità demo
          </Badge>
        )}
        <div className="hidden text-right lg:block">
          <p className="text-xs font-semibold text-foreground">{user?.username}</p>
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {isDemo ? 'Dati dimostrativi' : user?.isAdmin ? 'Amministratore' : 'Utente'}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-[#d9d0c6] bg-white"
              aria-label="Account"
            >
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user?.username}
              {isDemo ? (
                <span className="ml-1 text-[#8a6123]">· demo</span>
              ) : user?.isAdmin ? (
                <span className="ml-1 text-primary">· admin</span>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <LogOut /> Esci
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
