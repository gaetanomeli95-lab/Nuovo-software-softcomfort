import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  onMenuClick: () => void;
  onSearch: (q: string) => void;
}

export function Topbar({ onMenuClick, onSearch }: TopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  return (
    <header className="flex h-[68px] shrink-0 items-center gap-3 border-b border-[#ddd5cc] bg-[#fffefd]/95 px-4 shadow-[0_1px_0_rgba(64,47,38,0.02)] backdrop-blur-xl sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <form
        className="relative w-full max-w-xl"
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
        <div className="hidden text-right md:block">
          <p className="text-xs font-semibold text-foreground">{user?.username}</p>
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {user?.isAdmin ? 'Amministratore' : 'Utente'}
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
              <User className="h-4.5 w-4.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user?.username}
              {user?.isAdmin && <span className="ml-1 text-primary">· admin</span>}
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
