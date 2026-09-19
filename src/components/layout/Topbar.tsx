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
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-[#090909]/[0.88] px-4 backdrop-blur-xl sm:px-5">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Menu">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden xl:block">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gold/[0.65]">
          Soft Comfort · Operations
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">Vendite, logistica e contabilità</p>
      </div>

      <form
        className="relative w-full max-w-lg xl:ml-6"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(q);
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gold/[0.55]" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Cerca cliente, venditore, articolo…"
          className="h-9 border-white/10 bg-white/[0.035] pl-9 shadow-none hover:border-white/15"
          aria-label="Ricerca"
        />
      </form>

      <div className="ml-auto flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="border border-white/[0.08] bg-white/[0.025]"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
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
