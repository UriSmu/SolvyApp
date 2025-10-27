import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ImageBackground, Image, TouchableOpacity } from 'react-native';
import { supabase } from '../context/supabaseClient';
import { useAuth } from '../context/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Linking from 'expo-linking';

const fondo = require("../../assets/Fondo-de-pantalla.png");
const logo = require("../../assets/Logo.png");
const fondoBoton = require("../../assets/Fondo-boton.png");

const VerificarMagicLink = ({ navigation, route }) => {
  const [verificando, setVerificando] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    verificarMagicLink();
  }, []);

  const verificarMagicLink = async () => {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔐 VERIFICANDO MAGIC LINK');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Obtener la URL completa
      const url = await Linking.getInitialURL();
      console.log('URL recibida:', url);
      
      // Parsear los parámetros de la URL
      const params = Linking.parse(url || '');
      console.log('Parámetros parseados:', JSON.stringify(params, null, 2));
      
      // Los parámetros también pueden venir desde route.params
      const routeParams = route?.params || {};
      console.log('Route params:', JSON.stringify(routeParams, null, 2));
      
      // Combinar parámetros de ambas fuentes
      const allParams = { ...params.queryParams, ...routeParams };
      console.log('Todos los parámetros:', JSON.stringify(allParams, null, 2));

      // Supabase envía el token como parte de un hash fragment (#access_token=...)
      // Necesitamos extraerlo correctamente
      const token = allParams.access_token || allParams.token;
      const refresh_token = allParams.refresh_token;
      const type = allParams.type || 'magiclink';

      console.log('Token extraído:', token ? 'Sí (longitud: ' + token.length + ')' : 'No');
      console.log('Refresh token:', refresh_token ? 'Sí' : 'No');
      console.log('Type:', type);

      if (!token) {
        console.log('❌ No se recibió token en los parámetros');
        setError('Enlace inválido. No se encontró el token de autenticación.');
        setVerificando(false);
        return;
      }

      // Establecer la sesión con los tokens recibidos
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: refresh_token || token,
      });

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 RESPUESTA DE SESIÓN:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Data:', JSON.stringify(data, null, 2));
      console.log('Error:', sessionError ? JSON.stringify(sessionError, null, 2) : 'null');

      if (sessionError) {
        console.log('❌ Error al establecer sesión:', sessionError.message);
        
        let errorMsg = 'No se pudo verificar el enlace.';
        if (sessionError.message.includes('expired')) {
          errorMsg = 'El enlace ha expirado. Por favor solicita uno nuevo.';
        } else if (sessionError.message.includes('invalid')) {
          errorMsg = 'El enlace es inválido o ya fue utilizado.';
        } else {
          errorMsg = sessionError.message;
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

      // Marcar como exitoso
      setSuccess(true);
      setVerificando(false);

      // Cerrar la sesión de Supabase ya que el sistema principal usa su propio auth
      await supabase.auth.signOut();

      // Nota: En este punto, el usuario ha sido verificado por Supabase,
      // pero el sistema principal de autenticación de la app usa un API diferente.
      // Por ahora, redirigimos a la pantalla de login con el email verificado.
      console.log('ℹ️ Redirigiendo a pantalla de inicio de sesión...');
      console.log('⚠️ Email verificado:', data.user.email);

    } catch (err) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💥 ERROR INESPERADO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Error:', err);
      console.log('Mensaje:', err.message);
      console.log('Stack:', err.stack);
      
      setError('Ocurrió un error inesperado. Por favor intenta nuevamente.');
      setVerificando(false);
    }
  };

  const handleContinue = () => {
    navigation.navigate('IniciarSesion');
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
            <TouchableOpacity
              onPress={handleContinue}
              style={styles.button}
              activeOpacity={0.8}
            >
              <ImageBackground
                source={fondoBoton}
                style={styles.buttonBackground}
                imageStyle={{ borderRadius: 10 }}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                  <Text style={[styles.buttonText, { marginLeft: 8 }]}>Ir a Iniciar Sesión</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </>
        ) : success ? (
          <>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={70} color="#00c853" />
            </View>
            <Text style={styles.title}>¡Verificación exitosa!</Text>
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                Tu identidad ha sido verificada correctamente mediante el enlace mágico.
              </Text>
              <Text style={styles.successText}>
                Ahora puedes iniciar sesión con tus credenciales normales.
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleContinue}
              style={styles.button}
              activeOpacity={0.8}
            >
              <ImageBackground
                source={fondoBoton}
                style={styles.buttonBackground}
                imageStyle={{ borderRadius: 10 }}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="log-in" size={20} color="#fff" />
                  <Text style={[styles.buttonText, { marginLeft: 8 }]}>Iniciar Sesión</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </>
        ) : null}
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
  successBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    width: '100%',
  },
  successText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  button: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 10,
  },
  buttonBackground: {
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    textShadowColor: "#007cc0",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default VerificarMagicLink;
