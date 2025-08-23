import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Try to load from localStorage
    const stored = localStorage.getItem('rvwd_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (email, name) => {
    const newUser = { email, name };
    setUser(newUser);
    localStorage.setItem('rvwd_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rvwd_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
