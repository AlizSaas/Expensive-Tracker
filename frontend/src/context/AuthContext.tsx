import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getCurrentUser, loginUser, registerUser } from '../services/api';
import { extractErrorMessage, mergeStoredUser } from '../utils';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const persistAuth = (token: string, user: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const clearStoredAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser);
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      persistAuth(currentToken, nextUser);
      setToken(currentToken);
    }
  }, []);

  useEffect(() => {
    const hydrateAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = mergeStoredUser(localStorage.getItem('user'));

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);
      if (storedUser) {
        setUser(storedUser);
      }

      try {
        const response = await getCurrentUser();
        if (response.success) {
          setUser(response.user);
          persistAuth(storedToken, response.user);
        } else {
          logout();
        }
      } catch (error) {
        console.error(extractErrorMessage(error));
        logout();
      } finally {
        setLoading(false);
      }
    };

    void hydrateAuth();
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginUser(email, password);
    persistAuth(response.token, response.user);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const response = await registerUser(name, email, password);
    persistAuth(response.token, response.user);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loading,
      login,
      register,
      logout,
      updateUser,
    }),
    [loading, login, logout, register, token, updateUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
