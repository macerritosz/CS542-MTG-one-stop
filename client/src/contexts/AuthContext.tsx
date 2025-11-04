import { createContext, useContext, useState, type ReactNode } from 'react';

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
      localStorage.setItem("token", newToken);
      localStorage.setItem("display_name", newDisplayName);
      setToken(newToken);
      setDisplayName(newDisplayName);
      window.location.href = "/";
    };

    const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("display_name");
      setToken(null);
      setDisplayName(null);
      window.location.href = "/";
    };
  
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
