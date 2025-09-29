import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';

const ParteTrabajo = ({ navigation, route }) => {
  const [realizado, setRealizado] = useState('');
  const [noSolucionado, setNoSolucionado] = useState('');
  const [recomendacion, setRecomendacion] = useState('');
  const { solicitudId } = route.params;

  const guardarParteTrabajo = async () => {
    try {
      if (!solicitudId) {
        Alert.alert('Error', 'No se recibió el id de la solicitud.');
        return;
      }
      if (!realizado.trim()) {
        Alert.alert('Error', 'Por favor describe qué realizaste en tu tarea.');
        return;
      }

      const parteTrabajo = {
        realizado: realizado.trim(),
        no_solucionado: noSolucionado.trim(),
        recomendacion: recomendacion.trim(),
      };

      // Genera la hora en formato HH:mm:ss justo antes de enviar
      const horaFinal = new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 8);
      console.log('Hora enviada:', horaFinal);

      const response = await fetch(`https://solvy-app-api.vercel.app/solit/${solicitudId}/finalizar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parte_trabajo: parteTrabajo,
          hora_final: horaFinal,
        }),
      });

      // Intenta leer el mensaje de error del backend
      let errorMsg = 'Error en la respuesta del servidor';
      let responseText = '';
      try {
        responseText = await response.text();
        if (responseText && responseText[0] === '{') {
          const json = JSON.parse(responseText);
          errorMsg = json.message || json.error || errorMsg;
        } else if (responseText) {
          errorMsg = responseText;
        }
      } catch {}

      if (!response.ok) {
        throw new Error(errorMsg);
      }

      Alert.alert('Parte de trabajo guardado correctamente');
      navigation.navigate('Home');
    } catch (error) {
      console.error(error);
      Alert.alert('Error al guardar el parte de trabajo', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>¿Qué realizaste en tu tarea?</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        value={realizado}
        onChangeText={setRealizado}
        placeholder="Describe brevemente las tareas realizadas..."
      />

      <Text style={styles.label}>
        ¿Hay algo que hayas encontrado y no hayas podido solucionar? (ej: una mancha en la alfombra)
      </Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={3}
        value={noSolucionado}
        onChangeText={setNoSolucionado}
        placeholder="Describe aquí si hubo algo que no pudiste solucionar..."
      />

      <Text style={styles.label}>
        ¿Hay algo que le hayas recomendado al cliente a futuro? (ej: cambiar el termotanque por uno nuevo)
      </Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={3}
        value={recomendacion}
        onChangeText={setRecomendacion}
        placeholder="Escribe aquí tus recomendaciones para el cliente..."
      />

      <Button title="Guardar parte de trabajo" onPress={guardarParteTrabajo} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, justifyContent: 'center' },
  label: { fontSize: 17, marginBottom: 8, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 18,
    minHeight: 60,
    backgroundColor: '#fafafa',
    textAlignVertical: 'top',
  },
});

export default ParteTrabajo;