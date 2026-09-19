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
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Menu">
        <Menu className="h-5 w-5" />
      </Button>

      <form
        className="relative w-full max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(q);
        }}
      >
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Cerca cliente, venditore, articolo…"
          className="h-9 pl-9"
          aria-label="Ricerca"
        />
      </form>

      <div className="ml-auto flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Account">
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
