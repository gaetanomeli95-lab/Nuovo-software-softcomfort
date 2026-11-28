import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { signIn } from '@/services/api/auth';
import { AUTOMATIC_DEMO_MODE } from '@/services/api/config';
import { setOnUnauthorized } from '@/services/api/http';
import {
  clearSession,
  DEMO_SESSION_TOKEN,
  isDemoSession,
  loadSession,
  saveSession,
} from '@/services/api/tokenStore';
import type { AuthUser } from '@/types/domain';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginDemo: () => void;
  logout: () => void;
  /** Solo in demo: prova il gestionale come PC admin o come PC operativo. */
  setDemoRole: (role: DemoRole) => void;
}

export type DemoRole = 'admin' | 'operatore';

const AuthContext = createContext<AuthState | null>(null);

const DEMO_USERNAME = 'Demo Soft Comfort';
const DEMO_ROLE_KEY = 'gestionale.demoRole';

function readDemoRole(): DemoRole {
  try {
    return sessionStorage.getItem(DEMO_ROLE_KEY) === 'operatore' ? 'operatore' : 'admin';
  } catch {
    return 'admin';
  }
}

function demoRoles(role: DemoRole = readDemoRole()): string[] {
  return role === 'admin' ? ['ROLE_ADMIN'] : ['ROLE_USER'];
}

function toUser(username: string, roles: string[]): AuthUser {
  return {
    username,
    roles,
    isAdmin: roles.includes('ROLE_ADMIN'),
  };
}

function automaticDemoUser(): AuthUser | null {
  return AUTOMATIC_DEMO_MODE ? toUser(DEMO_USERNAME, demoRoles()) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (AUTOMATIC_DEMO_MODE) return automaticDemoUser();
    const session = loadSession();
    return session ? toUser(session.username, session.roles) : null;
  });
  const [demo, setDemo] = useState(() => AUTOMATIC_DEMO_MODE || isDemoSession());

  const logout = useCallback(() => {
    clearSession();

    // In anteprima Vercel la demo è volutamente sempre disponibile:
    // "Esci" non deve lasciare l'app in uno stato senza backend/login.
    if (AUTOMATIC_DEMO_MODE) {
      setUser(automaticDemoUser());
      setDemo(true);
      return;
    }

    setUser(null);
    setDemo(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await signIn({ username, password });
    saveSession({
      token: res.token,
      username: res.username,
      roles: res.roles,
    });
    setDemo(false);
    setUser(toUser(res.username, res.roles));
  }, []);

  const loginDemo = useCallback(() => {
    saveSession({
      token: DEMO_SESSION_TOKEN,
      username: DEMO_USERNAME,
      roles: demoRoles(),
    });
    setDemo(true);
    setUser(toUser(DEMO_USERNAME, demoRoles()));
  }, []);

  const setDemoRole = useCallback((role: DemoRole) => {
    if (!demo) return;
    try {
      sessionStorage.setItem(DEMO_ROLE_KEY, role);
    } catch {
      // sessionStorage non disponibile: il cambio vale solo per questa pagina.
    }
    const roles = demoRoles(role);
    if (!AUTOMATIC_DEMO_MODE) {
      saveSession({ token: DEMO_SESSION_TOKEN, username: DEMO_USERNAME, roles });
    }
    setUser(toUser(DEMO_USERNAME, roles));
  }, [demo]);

  useEffect(() => {
    setOnUnauthorized(() => {
      if (AUTOMATIC_DEMO_MODE) {
        setUser(automaticDemoUser());
        setDemo(true);
      } else {
        setUser(null);
      }
    });

    return () => setOnUnauthorized(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isDemo: demo,
      login,
      loginDemo,
      logout,
      setDemoRole,
    }),
    [user, demo, login, loginDemo, logout, setDemoRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve essere usato dentro <AuthProvider>');
  return ctx;
}
