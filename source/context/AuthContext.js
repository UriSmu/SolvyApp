import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [estaLogeado, setEstaLogeado] = useState(false);

  const login = () => setEstaLogeado(true);
  const logout = () => setEstaLogeado(false);

  return (
    <AuthContext.Provider value={{ estaLogeado, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
