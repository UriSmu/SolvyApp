import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground, Image, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { supabase } from "../context/supabaseClient";
import Ionicons from '@expo/vector-icons/Ionicons';

// Puedes usar un ícono de ojito de react-native-vector-icons o un PNG/SVG local.
// Aquí te muestro con emoji para simplicidad, pero puedes reemplazarlo por un ícono real.
const fondo = require("../../assets/Fondo-de-pantalla.png");
const logo = require("../../assets/Logo.png");
const fondoBoton = require("../../assets/Fondo-boton.png");

const OlvideMiContrasenia = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");

  // Enviar código de recuperación usando resetPasswordForEmail
  const handleEnviarCodigo = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Por favor ingresa tu correo electrónico");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Por favor ingresa un correo válido");
      return;
    }

    setLoading(true);
    const emailLower = email.toLowerCase().trim();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 ENVIANDO CÓDIGO DE RECUPERACIÓN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', emailLower);
    console.log('⏰ Hora:', new Date().toLocaleTimeString());

    try {
      // Método que SÍ funciona: resetPasswordForEmail
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        emailLower,
        {
          redirectTo: 'solvy://reset-password',
        }
      );

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 RESPUESTA DE SUPABASE:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Data:', JSON.stringify(data, null, 2));
      console.log('Error:', error ? JSON.stringify(error, null, 2) : 'null');

      if (error) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('❌ ERROR AL ENVIAR:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Código:', error.code);
        console.log('Mensaje:', error.message);
        console.log('Estado:', error.status);
        
        Alert.alert(
          'Error al enviar',
          `No se pudo enviar el código.\n\nMotivo: ${error.message}\n\n¿El email está registrado en la app?`
        );
      } else {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ CÓDIGO ENVIADO EXITOSAMENTE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Remitente: noreply@mail.app.supabase.io');
        console.log('📬 Destinatario:', emailLower);
        console.log('📋 Asunto: "Reset Your Password" o similar');
        console.log('🚫 REVISA SPAM si no aparece en 1-2 minutos');
        console.log('⏱️ El código es válido por 60 minutos');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        setCodigoEnviado(true);
        Alert.alert(
          '¡Código enviado! 📧',
          `Email enviado a:\n${emailLower}\n\n⚠️ IMPORTANTE:\n\n1. REVISA LA CARPETA DE SPAM\n2. Remitente: noreply@mail.app.supabase.io\n3. Puede tardar 1-2 minutos\n4. Código válido por 60 min.`
        );
      }
    } catch (error) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💥 ERROR INESPERADO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Error completo:', error);
      console.log('Mensaje:', error.message);
      console.log('Stack:', error.stack);
      
      Alert.alert('Error', 'Ocurrió un error inesperado. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  // Verificar código y cambiar contraseña
  const handleVerificarCodigo = async () => {
    if (!codigo.trim() || codigo.length !== 6) {
      Alert.alert("Error", "Ingresa el código de 6 dígitos que recibiste");
      return;
    }

    if (!nuevaPassword || nuevaPassword.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    console.log('🔐 Verificando código...');

    try {
      // Verificar el código OTP de tipo 'recovery' para reset password
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.toLowerCase().trim(),
        token: codigo.trim(),
        type: 'recovery', // Tipo 'recovery' para resetPasswordForEmail
      });

      if (error) {
        console.error('❌ Error al verificar código:', error);
        Alert.alert(
          'Error',
          'Código incorrecto o expirado. Verifica que hayas ingresado bien los 6 dígitos.'
        );
        setLoading(false);
        return;
      }

      if (!data?.session) {
        Alert.alert('Error', 'No se pudo verificar el código');
        setLoading(false);
        return;
      }

      console.log('✅ Código verificado correctamente');

      // Si el código es correcto, cambiar la contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: nuevaPassword
      });

      if (updateError) {
        console.error('❌ Error al actualizar contraseña:', updateError);
        Alert.alert('Error', 'No se pudo actualizar la contraseña');
      } else {
        console.log('✅ Contraseña actualizada exitosamente');
        
        // Cerrar sesión automáticamente
        await supabase.auth.signOut();
        
        Alert.alert(
          '¡Éxito! ✅',
          'Tu contraseña ha sido actualizada correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('IniciarSesion'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('💥 Error inesperado:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={fondo} style={styles.background}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={70} color="#fff" />
          </View>
          
          <Text style={styles.title}>Recuperar Contraseña</Text>
          <Text style={styles.subtitle}>
            {!codigoEnviado 
              ? "Ingresa tu correo y te enviaremos un código de verificación"
              : "Ingresa el código que recibiste y tu nueva contraseña"
            }
          </Text>

          {/* PASO 1: Ingresar email */}
          {!codigoEnviado && (
            <>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail" size={20} color="#007cc0" style={styles.inputIcon} />
                <TextInput
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#888"
                  style={styles.input}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                onPress={handleEnviarCodigo}
                disabled={loading}
                style={styles.button}
                activeOpacity={0.8}
              >
                <ImageBackground
                  source={fondoBoton}
                  style={styles.buttonBackground}
                  imageStyle={{ borderRadius: 10 }}
                >
                  {loading ? (
                    <View style={styles.buttonContent}>
                      <ActivityIndicator color="#fff" />
                      <Text style={[styles.buttonText, { marginLeft: 10 }]}>Enviando...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Ionicons name="send" size={20} color="#fff" />
                      <Text style={[styles.buttonText, { marginLeft: 8 }]}>Enviar código</Text>
                    </View>
                  )}
                </ImageBackground>
              </TouchableOpacity>
            </>
          )}

          {/* PASO 2: Ingresar código y nueva contraseña */}
          {codigoEnviado && (
            <>
              <View style={styles.successMessage}>
                <Ionicons name="checkmark-circle" size={24} color="#00c853" />
                <Text style={styles.successText}>¡Código enviado a {email}!</Text>
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="keypad" size={20} color="#007cc0" style={styles.inputIcon} />
                <TextInput
                  placeholder="Código de 6 dígitos"
                  value={codigo}
                  onChangeText={setCodigo}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholderTextColor="#888"
                  style={styles.input}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={20} color="#007cc0" style={styles.inputIcon} />
                <TextInput
                  placeholder="Nueva contraseña"
                  value={nuevaPassword}
                  onChangeText={setNuevaPassword}
                  secureTextEntry
                  placeholderTextColor="#888"
                  style={styles.input}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                onPress={handleVerificarCodigo}
                disabled={loading}
                style={styles.button}
                activeOpacity={0.8}
              >
                <ImageBackground
                  source={fondoBoton}
                  style={styles.buttonBackground}
                  imageStyle={{ borderRadius: 10 }}
                >
                  {loading ? (
                    <View style={styles.buttonContent}>
                      <ActivityIndicator color="#fff" />
                      <Text style={[styles.buttonText, { marginLeft: 10 }]}>Verificando...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={[styles.buttonText, { marginLeft: 8 }]}>Cambiar contraseña</Text>
                    </View>
                  )}
                </ImageBackground>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setCodigoEnviado(false);
                  setCodigo('');
                  setNuevaPassword('');
                }}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>Reenviar código</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate('IniciarSesion')}
            style={styles.back}
          >
            <Ionicons name="arrow-back" size={18} color="#fff" style={{ marginRight: 5 }} />
            <Text style={styles.backText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: 15,
    backgroundColor: 'rgba(0, 124, 192, 0.2)',
    borderRadius: 50,
    padding: 20,
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
    marginBottom: 30,
    lineHeight: 22,
    paddingHorizontal: 10,
    opacity: 0.95,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#007cc0",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#222",
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    width: '100%',
  },
  successText: {
    color: '#00c853',
    fontSize: 15,
    marginLeft: 8,
    fontWeight: '600',
  },
  button: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
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
  back: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: "underline",
  },
  linkButton: {
    marginTop: 10,
    padding: 8,
  },
  linkText: {
    color: "#fff",
    fontSize: 15,
    textDecorationLine: "underline",
    textAlign: 'center',
  },
});

export default OlvideMiContrasenia;