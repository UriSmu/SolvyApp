import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground, Image, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { supabase } from "../context/supabaseClient";
import Ionicons from '@expo/vector-icons/Ionicons';

const fondo = require("../../assets/Fondo-de-pantalla.png");
const logo = require("../../assets/Logo.png");
const fondoBoton = require("../../assets/Fondo-boton.png");

const OlvideMiContrasenia = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkEnviado, setLinkEnviado] = useState(false);

  // Enviar magic link usando signInWithOtp
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
      // Usar signInWithOtp para enviar magic link
      const { data, error } = await supabase.auth.signInWithOtp({
        email: emailLower,
        options: {
          emailRedirectTo: 'solvy://magic-link',
          shouldCreateUser: false, // No crear usuario si no existe
        }
      });

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
        
        // Por seguridad, no revelar si el email existe o no
        Alert.alert(
          'Error al enviar',
          'No se pudo enviar el enlace. Por favor verifica tu correo electrónico e intenta nuevamente.'
        );
      } else {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ MAGIC LINK ENVIADO EXITOSAMENTE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Remitente: noreply@mail.app.supabase.io');
        console.log('📬 Destinatario:', emailLower);
        console.log('🔗 El enlace es válido por 60 minutos');
        console.log('🔒 El enlace es de un solo uso');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        setLinkEnviado(true);
      }
    } catch (error) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💥 ERROR INESPERADO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Error completo:', error);
      console.log('Mensaje:', error.message);
      console.log('Stack:', error.stack);
      
      Alert.alert('Error', 'Ocurrió un error inesperado. Por favor intenta nuevamente.');
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
            <Ionicons name="mail-outline" size={70} color="#fff" />
          </View>
          
          <Text style={styles.title}>
            {!linkEnviado ? "Recuperar Acceso" : "¡Revisa tu correo!"}
          </Text>
          <Text style={styles.subtitle}>
            {!linkEnviado 
              ? "Ingresa tu correo y te enviaremos un enlace mágico para acceder sin contraseña"
              : "Te hemos enviado un enlace de acceso. Haz clic en él para iniciar sesión automáticamente."
            }
          </Text>

          {/* PASO 1: Ingresar email */}
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
                      <Ionicons name="link" size={20} color="#fff" />
                      <Text style={[styles.buttonText, { marginLeft: 8 }]}>Enviar enlace mágico</Text>
                    </View>
                  )}
                </ImageBackground>
              </TouchableOpacity>
            </>
          )}

          {/* PASO 2: Confirmación de envío */}
          {linkEnviado && (
            <>
              <View style={styles.successMessage}>
                <Ionicons name="checkmark-circle" size={60} color="#00c853" />
              </View>

              <View style={styles.instructionsBox}>
                <View style={styles.instructionItem}>
                  <Ionicons name="mail-open" size={24} color="#007cc0" />
                  <Text style={styles.instructionText}>
                    Revisa tu bandeja de entrada en {email}
                  </Text>
                </View>

                <View style={styles.instructionItem}>
                  <Ionicons name="warning" size={24} color="#ff9800" />
                  <Text style={styles.instructionText}>
                    Si no lo ves, revisa la carpeta de SPAM
                  </Text>
                </View>

                <View style={styles.instructionItem}>
                  <Ionicons name="time" size={24} color="#007cc0" />
                  <Text style={styles.instructionText}>
                    El enlace es válido por 60 minutos
                  </Text>
                </View>

                <View style={styles.instructionItem}>
                  <Ionicons name="shield-checkmark" size={24} color="#00c853" />
                  <Text style={styles.instructionText}>
                    El enlace es de un solo uso y seguro
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setLinkEnviado(false);
                  setEmail('');
                }}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>Enviar a otro correo</Text>
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
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  instructionsBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  instructionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
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