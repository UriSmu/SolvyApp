import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground, Image, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';

// Backend API URL - change this to your backend URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const fondo = require("../../assets/Fondo-de-pantalla.png");
const logo = require("../../assets/Logo.png");
const fondoBoton = require("../../assets/Fondo-boton.png");

const OlvideMiContrasenia = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkEnviado, setLinkEnviado] = useState(false);

  // Enviar magic link usando el backend API
  const handleEnviarMagicLink = async () => {
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
    console.log('🔄 ENVIANDO MAGIC LINK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', emailLower);
    console.log('⏰ Hora:', new Date().toLocaleTimeString());

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailLower }),
      });

      const data = await response.json();

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 RESPUESTA DEL BACKEND:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar el magic link');
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ MAGIC LINK ENVIADO EXITOSAMENTE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Destinatario:', emailLower);
      console.log('📋 Revisa tu correo electrónico');
      console.log('�� REVISA SPAM si no aparece en 1-2 minutos');
      console.log('⏱️ El enlace es válido por 60 minutos');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      setLinkEnviado(true);
      Alert.alert(
        '¡Enlace enviado! 📧',
        `Email enviado a:\n${emailLower}\n\n⚠️ IMPORTANTE:\n\n1. REVISA LA CARPETA DE SPAM\n2. Puede tardar 1-2 minutos\n3. El enlace es válido por 60 min.\n4. Haz clic en el enlace del correo para verificar tu identidad`
      );
    } catch (error) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💥 ERROR AL ENVIAR:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Error completo:', error);
      console.log('Mensaje:', error.message);

      Alert.alert(
        'Error',
        'No se pudo enviar el enlace. Por favor, verifica tu conexión e intenta nuevamente.'
      );
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
            {!linkEnviado
              ? "Ingresa tu correo y te enviaremos un enlace mágico para recuperar tu cuenta"
              : "¡Enlace enviado! Revisa tu correo electrónico"
            }
          </Text>

          {/* Ingresar email */}
          {!linkEnviado && (
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
                onPress={handleEnviarMagicLink}
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
                      <Text style={[styles.buttonText, { marginLeft: 8 }]}>Enviar enlace mágico</Text>
                    </View>
                  )}
                </ImageBackground>
              </TouchableOpacity>
            </>
          )}

          {/* Enlace enviado */}
          {linkEnviado && (
            <>
              <View style={styles.successMessage}>
                <Ionicons name="checkmark-circle" size={24} color="#00c853" />
                <Text style={styles.successText}>¡Enlace enviado a {email}!</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Próximos pasos:</Text>
                <Text style={styles.infoItem}>1. Abre tu correo electrónico</Text>
                <Text style={styles.infoItem}>2. Busca el email de SolvyApp</Text>
                <Text style={styles.infoItem}>3. Haz clic en el enlace mágico</Text>
                <Text style={styles.infoItem}>4. Serás redirigido automáticamente</Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setLinkEnviado(false);
                }}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>Reenviar enlace</Text>
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
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007cc0',
    marginBottom: 10,
  },
  infoItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    lineHeight: 20,
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
