import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

const ParteTrabajo = ({ navigation, route }) => {
  const [comentario, setComentario] = useState('');
  const { solicitudId } = route.params; // Asegúrate de pasar el id de la solicitud

  const guardarComentario = async () => {
    try {
      if (!solicitudId) {
        Alert.alert('Error', 'No se recibió el id de la solicitud.');
        return;
      }
      if (!comentario.trim()) {
        Alert.alert('Error', 'Por favor ingresa una reseña.');
        return;
      }
      // URL corregida (ajusta si tu API es diferente)
      const response = await fetch(`https://solvy-app-api.vercel.app/solicitudes/parte_trabajo/${solicitudId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parte_trabajo: comentario }),
      });
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      Alert.alert('Reseña guardada correctamente');
      navigation.navigate('Home'); // Cambia 'Home' si tu pantalla principal tiene otro nombre
    } catch (error) {
      console.error(error);
      Alert.alert('Error al guardar la reseña', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Reseña del servicio:</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        value={comentario}
        onChangeText={setComentario}
        placeholder="Escribe aquí tu reseña..."
      />
      <Button title="Guardar reseña" onPress={guardarComentario} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  label: { fontSize: 18, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 16, minHeight: 80 },
});

export default ParteTrabajo;