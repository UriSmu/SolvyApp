import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground, Image, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";

// Puedes usar un ícono de ojito de react-native-vector-icons o un PNG/SVG local.
// Aquí te muestro con emoji para simplicidad, pero puedes reemplazarlo por un ícono real.
const fondo = require("../../assets/Fondo-de-pantalla.png");
const logo = require("../../assets/Logo.png");
const fondoBoton = require("../../assets/Fondo-boton.png");

const OlvideMiContrasenia = ({ navigation }) => {
  const [identificador, setIdentificador] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = async () => {
    if (!identificador || !newPassword) {
      Alert.alert("Error", "Completa todos los campos.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        "https://solvy-app-api.vercel.app/cli/reset-password",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: identificador.trim(),
            newPassword: newPassword,
          }),
        }
      );
      if (response.ok) {
        Alert.alert("Éxito", "Contraseña actualizada correctamente.");
        navigation.navigate("IniciarSesion");
      } else {
        const error = await response.json();
        Alert.alert(
          "Error",
          error?.message ||
            "El usuario no existe o hubo un problema. Verifica que esté bien escrito."
        );
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo conectar con el servidor.");
    }
    setLoading(false);
  };

  return (
    <ImageBackground source={fondo} style={styles.background}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Recuperar contraseña</Text>
          <TextInput
            placeholder="Email, usuario, teléfono o DNI"
            value={identificador}
            onChangeText={setIdentificador}
            autoCapitalize="none"
            placeholderTextColor="#888"
            style={styles.input}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Nueva contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#888"
              style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.eyeButton}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 22 }}>
                {showPassword ? "🙈" : "👁️"}
              </Text>
              {/* Si usas vector icons, reemplaza el emoji por el ícono correspondiente */}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleReset}
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
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Restablecer contraseña</Text>
              )}
            </ImageBackground>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}
          >
            <Text style={styles.backText}>Volver</Text>
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
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffffff",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#007cc0",
    color: "#222",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#007cc0",
    marginBottom: 15,
    paddingRight: 10,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 2,
  },
  button: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  buttonBackground: {
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
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
    marginTop: 10,
  },
  backText: {
    color: "#ffffffff",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default OlvideMiContrasenia;