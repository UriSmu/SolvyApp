import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";

const OlvideMiContrasenia = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { resetPassword } = useAuth();

  const handleReset = async () => {
    if (!email || !newPassword) {
      Alert.alert("Error", "Completa todos los campos.");
      return;
    }
    // Normaliza el email: quita espacios y lo pone en minúsculas
    const cleanEmail = email.trim().toLowerCase();
    const success = await resetPassword(cleanEmail, newPassword);
    if (success) {
      Alert.alert("Éxito", "Contraseña actualizada correctamente.");
      navigation.navigate("IniciarSesion");
    } else {
      Alert.alert("Error", "El correo no existe o hubo un problema. Verifica que esté bien escrito.");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Recuperar contraseña</Text>
      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
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
        style={{
          backgroundColor: "#007bff",
          padding: 15,
          borderRadius: 5,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Restablecer contraseña</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OlvideMiContrasenia;