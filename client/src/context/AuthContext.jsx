import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

// Single shared gate — no accounts, no roles. Persisted in localStorage so
// it survives browser restarts (not sessionStorage, which clears on tab close).
const STORAGE_KEY = 'cc_authenticated';
const VALID_USERNAME = 'class';
const VALID_PASSWORD = 'classroom';

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );

  const login = useCallback((username, password) => {
    if (username.trim() === VALID_USERNAME && password === VALID_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- colocating the hook with its provider is intentional
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
