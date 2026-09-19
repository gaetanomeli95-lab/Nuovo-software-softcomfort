import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { signIn } from '@/services/api/auth';
import { setOnUnauthorized } from '@/services/api/http';
import {
  clearSession,
  loadSession,
  saveSession,
} from '@/services/api/tokenStore';
import type { AuthUser } from '@/types/domain';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

function toUser(username: string, roles: string[]): AuthUser {
  return {
    username,
    roles,
    isAdmin: roles.includes('ROLE_ADMIN'),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const session = loadSession();
    return session ? toUser(session.username, session.roles) : null;
  });

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await signIn({ username, password });
    saveSession({
      token: res.token,
      username: res.username,
      roles: res.roles,
    });
    setUser(toUser(res.username, res.roles));
  }, []);

  // Se una chiamata riceve 401 → sessione invalidata → logout automatico.
  useState(() => {
    setOnUnauthorized(() => setUser(null));
    return () => setOnUnauthorized(null);
  });

  const value = useMemo<AuthState>(
    () => ({ user, isAuthenticated: user !== null, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve essere usato dentro <AuthProvider>');
  return ctx;
}
