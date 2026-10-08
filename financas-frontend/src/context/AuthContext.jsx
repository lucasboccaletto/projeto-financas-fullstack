import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [tema, setTema] = useState(() => localStorage.getItem('tema') || 'light');

  const login = useCallback((novoToken) => {
    localStorage.setItem('token', novoToken);
    setToken(novoToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
  }, []);

  const alternarTema = useCallback(() => {
    const novoTema = tema === 'light' ? 'dark' : 'light';
    localStorage.setItem('tema', novoTema);
    setTema(novoTema);
    document.documentElement.setAttribute('data-theme', novoTema);
  }, [tema]);

  // Aplicar tema ao montar
  useState(() => {
    document.documentElement.setAttribute('data-theme', tema);
  });

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout, tema, alternarTema }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
};
