import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ImageBackground, Image } from 'react-native';
import { supabase } from '../context/supabaseClient';
import { useAuth } from '../context/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const fondo = require("../../assets/Fondo-de-pantalla.png");
const logo = require("../../assets/Logo.png");

const VerificarMagicLink = ({ navigation, route }) => {
  const [verificando, setVerificando] = useState(true);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  useEffect(() => {
    verificarMagicLink();
  }, []);

  const verificarMagicLink = async () => {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔐 VERIFICANDO MAGIC LINK');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Obtener los parámetros de la URL
      const params = route?.params || {};
      const token = params.token || params.access_token;
      const type = params.type || 'magiclink';
      const email = params.email;

      console.log('Token recibido:', token ? 'Sí' : 'No');
      console.log('Email:', email);
      console.log('Type:', type);

      if (!token) {
        console.log('❌ No se recibió token en los parámetros');
        setError('Enlace inválido. No se encontró el token de autenticación.');
        setVerificando(false);
        return;
      }

      // Verificar el token con Supabase
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type,
      });

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 RESPUESTA DE VERIFICACIÓN:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Data:', JSON.stringify(data, null, 2));
      console.log('Error:', verifyError ? JSON.stringify(verifyError, null, 2) : 'null');

      if (verifyError) {
        console.log('❌ Error al verificar:', verifyError.message);
        
        let errorMsg = 'No se pudo verificar el enlace.';
        if (verifyError.message.includes('expired')) {
          errorMsg = 'El enlace ha expirado. Por favor solicita uno nuevo.';
        } else if (verifyError.message.includes('invalid')) {
          errorMsg = 'El enlace es inválido o ya fue utilizado.';
        } else {
          errorMsg = verifyError.message;
        }
        
        setError(errorMsg);
        setVerificando(false);
        return;
      }

      if (!data?.user || !data?.session) {
        console.log('❌ No se recibió usuario o sesión');
        setError('No se pudo autenticar. El enlace puede haber expirado o ya fue usado.');
        setVerificando(false);
        return;
      }

      console.log('✅ Magic Link verificado exitosamente');
      console.log('Usuario:', data.user.email);
      console.log('Session ID:', data.session.access_token.substring(0, 20) + '...');

      // Ahora necesitamos sincronizar con el sistema de autenticación existente
      // El usuario tiene una sesión de Supabase, pero necesitamos obtener sus datos del API existente
      const userEmail = data.user.email;
      
      // Intentar obtener el usuario del sistema existente
      // Como es un magic link, no tenemos la contraseña, así que usamos el email
      // Nota: Esto requiere que el backend tenga un endpoint para autenticar con Supabase session
      // Por ahora, simplemente redirigimos indicando que deben configurar su acceso
      
      console.log('⚠️ Sesión de Supabase creada para:', userEmail);
      console.log('ℹ️ Redirigiendo a pantalla de inicio de sesión...');

      // Cerrar la sesión de Supabase ya que el sistema principal usa su propio auth
      await supabase.auth.signOut();

      setVerificando(false);
      
      // Redirigir a la pantalla de login con un mensaje
      setTimeout(() => {
        navigation.navigate('IniciarSesion', {
          magicLinkVerified: true,
          email: userEmail
        });
      }, 2000);

    } catch (err) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💥 ERROR INESPERADO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Error:', err);
      console.log('Mensaje:', err.message);
      
      setError('Ocurrió un error inesperado. Por favor intenta nuevamente.');
      setVerificando(false);
    }
  };

  return (
    <ImageBackground source={fondo} style={styles.background}>
      <View style={styles.container}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        
        {verificando ? (
          <>
            <View style={styles.iconContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
            <Text style={styles.title}>Verificando enlace...</Text>
            <Text style={styles.subtitle}>
              Estamos verificando tu enlace de acceso. Esto solo tomará un momento.
            </Text>
          </>
        ) : error ? (
          <>
            <View style={styles.iconContainer}>
              <Ionicons name="close-circle" size={70} color="#ff5252" />
            </View>
            <Text style={styles.title}>Error de verificación</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.subtitle}>
              Puedes solicitar un nuevo enlace desde la pantalla de inicio de sesión.
            </Text>
          </>
        ) : (
          <>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={70} color="#00c853" />
            </View>
            <Text style={styles.title}>¡Verificación exitosa!</Text>
            <Text style={styles.subtitle}>
              Tu enlace ha sido verificado correctamente. Serás redirigido en un momento...
            </Text>
          </>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(0, 124, 192, 0.2)',
    borderRadius: 50,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    minHeight: 120,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
    paddingHorizontal: 10,
    opacity: 0.95,
  },
  errorText: {
    fontSize: 16,
    color: "#ff5252",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    width: '100%',
  },
});

export default VerificarMagicLink;
