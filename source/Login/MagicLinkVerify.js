import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ImageBackground, 
  Image, 
  ActivityIndicator, 
  StyleSheet, 
  SafeAreaView 
} from "react-native";
import { useAuth } from "../context/AuthContext";
import Ionicons from '@expo/vector-icons/Ionicons';

const fondo = require("../../assets/Fondo-de-pantalla.png");
const logo = require("../../assets/Logo.png");
const fondoBoton = require("../../assets/Fondo-boton.png");

// Backend API URL - change this to your backend URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const MagicLinkVerify = ({ route, navigation }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Get token from route params (passed from deep link or navigation)
  const token = route?.params?.token || null;

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setError("No se proporcionó un token de verificación");
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async (magicToken) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${BACKEND_URL}/api/auth/magic-link/verify?token=${magicToken}`
      );
      
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Token inválido o expirado");
      }

      // Success! Token verified
      setSuccess(true);
      
      // Store the token and user data
      // The login function from AuthContext will handle storing in AsyncStorage
      if (data.token && data.user) {
        // Create login credentials for the auth context
        const loginCredentials = {
          usuario: data.user.email,
          // Note: We don't have a password here since it's passwordless
          // You may need to adapt your AuthContext to support passwordless login
          token: data.token,
        };
        
        await login(data.user, loginCredentials);
        
        // Navigate to home after a brief delay
        setTimeout(() => {
          // The AuthContext will automatically navigate to the appropriate home screen
          // based on user type (client or solver)
        }, 2000);
      } else {
        throw new Error("No se recibió información de sesión");
      }
    } catch (err) {
      console.error("Error verifying magic link:", err);
      setError(err.message || "Error al verificar el enlace");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewLink = () => {
    navigation.navigate("OlvideMiContrasenia");
  };

  if (loading) {
    return (
      <ImageBackground source={fondo} style={styles.background}>
        <SafeAreaView style={styles.container}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007cc0" />
            <Text style={styles.loadingText}>Verificando enlace...</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (success) {
    return (
      <ImageBackground source={fondo} style={styles.background}>
        <SafeAreaView style={styles.container}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#00c853" />
            <Text style={styles.successTitle}>¡Verificación exitosa!</Text>
            <Text style={styles.successText}>
              Tu identidad ha sido verificada correctamente.
            </Text>
            <Text style={styles.successSubtext}>
              Serás redirigido automáticamente...
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground source={fondo} style={styles.background}>
        <SafeAreaView style={styles.container}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          
          <View style={styles.errorContainer}>
            <Ionicons name="close-circle" size={80} color="#f44336" />
            <Text style={styles.errorTitle}>Error de verificación</Text>
            <Text style={styles.errorText}>{error}</Text>
            
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Posibles causas:</Text>
              <Text style={styles.infoItem}>• El enlace ha expirado (60 minutos)</Text>
              <Text style={styles.infoItem}>• El enlace ya fue utilizado</Text>
              <Text style={styles.infoItem}>• El enlace es inválido</Text>
            </View>

            <TouchableOpacity
              onPress={handleRequestNewLink}
              style={styles.button}
              activeOpacity={0.8}
            >
              <ImageBackground
                source={fondoBoton}
                style={styles.buttonBackground}
                imageStyle={{ borderRadius: 10 }}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="mail" size={20} color="#fff" />
                  <Text style={[styles.buttonText, { marginLeft: 8 }]}>
                    Solicitar nuevo enlace
                  </Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("IniciarSesion")}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>Volver al inicio de sesión</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
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
    marginBottom: 30,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  successContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 30,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00c853",
    marginTop: 20,
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  successSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  errorContainer: {
    alignItems: "center",
    width: "100%",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: 20,
    marginBottom: 25,
    width: "100%",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  infoItem: {
    fontSize: 14,
    color: "#666",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    textShadowColor: "#007cc0",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  linkButton: {
    marginTop: 10,
    padding: 8,
  },
  linkText: {
    color: "#fff",
    fontSize: 15,
    textDecorationLine: "underline",
    textAlign: "center",
  },
});

export default MagicLinkVerify;
