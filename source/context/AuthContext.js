import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserProfile } from './UserProfileContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [estaLogeado, setEstaLogeado] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const { saveProfile, clearProfile } = useUserProfile();

  useEffect(() => {
    const checkStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('usuario');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const response = await fetch(
            `https://solvy-app-api.vercel.app/cli/clientes/${encodeURIComponent(userData.usuario)}/${encodeURIComponent(userData.contrasena)}`
          );
          if (response.ok) {
            const data = await response.json();
            setUsuario(data);
            setEstaLogeado(true);
            saveProfile(data);
            if (data.token) {
              await AsyncStorage.setItem('token', data.token);
            }
          } else {
            await AsyncStorage.removeItem('usuario');
            setEstaLogeado(false);
            clearProfile();
          }
        }
      } catch (e) {
        setEstaLogeado(false);
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
        const response = await fetch(
          `https://solvy-app-api.vercel.app/cli/clientes/${encodeURIComponent(userData.usuario)}/${encodeURIComponent(userData.contrasena)}`
        );
        if (response.ok) {
          const data = await response.json();
          setUsuario(data);
          setEstaLogeado(true);
          saveProfile(data);
          return true;
        } else {
          await AsyncStorage.removeItem('usuario');
          clearProfile();
        }
      }
    } catch (e) {
      clearProfile();
    }
    setEstaLogeado(false);
    return false;
  };

  const login = async (data, loginCredentials) => {
    setUsuario(data);
    setEstaLogeado(true);
    saveProfile(data);

    if (data.token) {
      await AsyncStorage.setItem('token', data.token);
    }

    await AsyncStorage.setItem('usuario', JSON.stringify({
      usuario: loginCredentials.usuario,
      contrasena: loginCredentials.contrasena,
      profile: data
    }));
  };

  const logout = async () => {
    setUsuario(null);
    setEstaLogeado(false);
    await AsyncStorage.removeItem('usuario');
    clearProfile();
  };

  // --- NUEVA FUNCIÓN PARA RECUPERAR CONTRASEÑA ---
  const resetPassword = async (email, newPassword) => {
    try {
      // Llama a tu API para actualizar la contraseña
      const response = await fetch(
        `https://solvy-app-api.vercel.app/cli/clientes/reset-password`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword })
        }
      );
      if (response.ok) {
        // Si el usuario estaba logueado y cambia su propia contraseña, actualiza AsyncStorage
        const storedUser = await AsyncStorage.getItem('usuario');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.usuario === email) {
            userData.contrasena = newPassword;
            await AsyncStorage.setItem('usuario', JSON.stringify(userData));
          }
        }
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      estaLogeado,
      usuario,
      login,
      logout,
      cargando,
      autoLoginIntent,
      resetPassword // <-- AGREGA AQUÍ
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}