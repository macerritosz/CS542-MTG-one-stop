import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
    token: string | null;
    login: (newToken: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token") || null);
    
    const login = (newToken: string) => {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      window.location.href = "/";
    };

    const logout = () => {
      localStorage.removeItem("token");
      setToken(null);
      window.location.href = "/";
    };
  
    const isAuthenticated = !!token;
  
    return (
      <AuthContext.Provider value={ {token, login, logout, isAuthenticated} }>
        {children}
      </AuthContext.Provider>
    );
}
  
export const useAuth = (): AuthContextType => {
    return useContext(AuthContext)!
};
