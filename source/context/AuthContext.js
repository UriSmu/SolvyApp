import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserProfile } from './UserProfileContext'; // <--- IMPORTA

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [estaLogeado, setEstaLogeado] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const { saveProfile, clearProfile } = useUserProfile(); // <--- USA

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
            // Guarda el token si existe
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
          saveProfile(data); // <--- AGREGA ESTO
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

    // Guarda el token si existe
    if (data.token) {
      await AsyncStorage.setItem('token', data.token);
    }

    // Guarda el usuario y contraseña, y el perfil completo
    await AsyncStorage.setItem('usuario', JSON.stringify({
      usuario: loginCredentials.usuario,
      contrasena: loginCredentials.contrasena,
      profile: data // <-- usa 'profile' en vez de 'perfil'
    }));
  };

  const logout = async () => {
    setUsuario(null);
    setEstaLogeado(false);
    await AsyncStorage.removeItem('usuario');
    clearProfile();
  };

  return (
    <AuthContext.Provider value={{ estaLogeado, usuario, login, logout, cargando, autoLoginIntent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}