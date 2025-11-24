import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
    token: string | null;
    display_name: string | null;
    login: (newToken: string, newDisplayName: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token") || null);
    const [display_name, setDisplayName] = useState<string | null>(localStorage.getItem("display_name") || null);

    const login = (newToken: string, newDisplayName: string) => {
      const now = Date.now();
      localStorage.setItem("token", newToken);
      localStorage.setItem("display_name", newDisplayName);
      localStorage.setItem("loginTime", now.toString());
      setToken(newToken);
      setDisplayName(newDisplayName);
      window.location.href = "/";
    };

    const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("display_name");
      localStorage.removeItem("loginTime");
      setToken(null);
      setDisplayName(null);
      window.location.href = "/";
    };

    useEffect(() => {
      const loginTime = localStorage.getItem("loginTime");
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        const time = 4 * 60 * 60 * 1000; // 4 hours
        if (elapsed > time) {
          logout();
        } else {
          const remaining = time - elapsed;
          const timeout = setTimeout(logout, remaining);
          return () => clearTimeout(timeout);
        }
      }
    }, []);

  
    const isAuthenticated = !!token;
  
    return (
      <AuthContext.Provider value={ {token, display_name, login, logout, isAuthenticated} }>
        {children}
      </AuthContext.Provider>
    );
}
  
export const useAuth = (): AuthContextType => {
    return useContext(AuthContext)!
};
