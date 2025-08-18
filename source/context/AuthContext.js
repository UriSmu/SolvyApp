import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserProfile } from './UserProfileContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [estaLogeado, setEstaLogeado] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [esSolver, setEsSolver] = useState(false);
  const [cargando, setCargando] = useState(true);

  const { saveProfile, clearProfile } = useUserProfile();

  useEffect(() => {
    const checkStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('usuario');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          let url;
          let solverFlag = false;
          if (userData.esSolver) {
            url = `https://solvy-app-api.vercel.app/sol/solvers/${encodeURIComponent(userData.usuario)}/${encodeURIComponent(userData.contrasena)}`;
            solverFlag = true;
          } else {
            url = `https://solvy-app-api.vercel.app/cli/clientes/${encodeURIComponent(userData.usuario)}/${encodeURIComponent(userData.contrasena)}`;
          }
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            setUsuario(data);
            setEstaLogeado(true);
            setEsSolver(solverFlag);
            saveProfile(data);
            if (data.token) {
              await AsyncStorage.setItem('token', data.token);
            }
          } else {
            await AsyncStorage.removeItem('usuario');
            setEstaLogeado(false);
            setEsSolver(false);
            clearProfile();
          }
        }
      } catch (e) {
        setEstaLogeado(false);
        setEsSolver(false);
        clearProfile();
      }
      setCargando(false);
    };
    checkStoredUser();
  }, []);

  const autoLoginIntent = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('usuario');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        let url;
        let solverFlag = false;
        if (userData.esSolver) {
          url = `https://solvy-app-api.vercel.app/sol/solvers/${encodeURIComponent(userData.usuario)}/${encodeURIComponent(userData.contrasena)}`;
          solverFlag = true;
        } else {
          url = `https://solvy-app-api.vercel.app/cli/clientes/${encodeURIComponent(userData.usuario)}/${encodeURIComponent(userData.contrasena)}`;
        }
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setUsuario(data);
          setEstaLogeado(true);
          setEsSolver(solverFlag);
          saveProfile(data);
          return true;
        } else {
          await AsyncStorage.removeItem('usuario');
          setEsSolver(false);
          clearProfile();
        }
      }
    } catch (e) {
      setEsSolver(false);
      clearProfile();
    }
    setEstaLogeado(false);
    setEsSolver(false);
    return false;
  };

  const login = async (data, loginCredentials) => {
    setUsuario(data);
    setEstaLogeado(true);
    setEsSolver(!!loginCredentials.esSolver);
    saveProfile(data);

    if (data.token) {
      await AsyncStorage.setItem('token', data.token);
    }

    await AsyncStorage.setItem('usuario', JSON.stringify({
      usuario: loginCredentials.usuario,
      contrasena: loginCredentials.contrasena,
      esSolver: !!loginCredentials.esSolver,
      profile: data
    }));
  };

  const logout = async () => {
    setUsuario(null);
    setEstaLogeado(false);
    setEsSolver(false);
    await AsyncStorage.removeItem('usuario');
    await AsyncStorage.removeItem('token');
    clearProfile();
  };

  return (
    <AuthContext.Provider value={{ estaLogeado, usuario, esSolver, login, logout, cargando, autoLoginIntent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}