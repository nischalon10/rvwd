import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  function login(userObj) {
    setUser(userObj);
  }

  function setUserId(userId) {
    setUser(prev => prev ? { ...prev, userId } : prev);
    localStorage.setItem('userId', userId);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('userId');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}