import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";

const OlvideMiContrasenia = ({ navigation }) => {
  const [identificador, setIdentificador] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Recuperar contraseña</Text>
      <TextInput
        placeholder="Email, usuario, teléfono o DNI"
        value={identificador}
        onChangeText={setIdentificador}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 15,
          borderRadius: 5,
        }}
      />
      <TextInput
        placeholder="Nueva contraseña"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 20,
          borderRadius: 5,
        }}
      />
      <TouchableOpacity
        onPress={handleReset}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#aaa" : "#007bff",
          padding: 15,
          borderRadius: 5,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          {loading ? "Procesando..." : "Restablecer contraseña"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OlvideMiContrasenia;