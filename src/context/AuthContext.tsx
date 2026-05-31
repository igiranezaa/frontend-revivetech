import { createContext, useContext, useState, type ReactNode } from 'react';
import { api, getApiErrorMessage, type ApiRole, type ApiUser } from '../lib/api';

export type UserRole = 'customer' | 'admin' | 'finance' | 'technician' | 'agent';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  redirectTo: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const ROLE_MAP: Record<ApiRole, UserRole> = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  TECHNICIAN: 'technician',
  FINANCE_OFFICER: 'finance',
  SUPPORT_AGENT: 'agent',
};

const REDIRECTS: Record<UserRole, string> = {
  customer: '/',
  admin: '/admin',
  technician: '/technician',
  finance: '/finance',
  agent: '/agent',
};

function mapUser(user: ApiUser): AuthUser {
  const role = ROLE_MAP[user.role] ?? 'customer';
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    role,
    redirectTo: REDIRECTS[role],
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('auth_token'));

  async function login(email: string, password: string): Promise<AuthUser> {
    try {
      const { data } = await api.post<{ token: string; user: ApiUser }>('/api/auth/login', {
        email,
        password,
      }, {
        timeout: 15_000,
      });
      const authUser = mapUser(data.user);
      sessionStorage.setItem('auth_user', JSON.stringify(authUser));
      sessionStorage.setItem('auth_token', data.token);
      setUser(authUser);
      setToken(data.token);
      return authUser;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Invalid email or password.'), { cause: error });
    }
  }

  function logout() {
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
