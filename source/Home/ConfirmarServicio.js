import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function ConfirmarServicio({ route, navigation }) {
  const { coord, address, suggestion, subservicio } = route.params || {};
  const [duracion, setDuracion] = useState(15);

  // Ejemplo de tarifas (puedes obtenerlas de subservicio si lo tienes)
  const tarifaBase = subservicio?.tarifabase || 1000;
  const precioPorTiempo = subservicio?.precioportiempo || 500;
  const precio = tarifaBase + (precioPorTiempo * (duracion / 15));

  const handlePedirSolver = () => {
    navigation.navigate('ConectarSolver', {
      coord,
      address,
      suggestion,
      subservicio,
      duracion,
      precio,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmar Servicio</Text>
      <Text style={styles.label}>Dirección:</Text>
      <Text style={styles.value}>{address}</Text>
      <Text style={styles.label}>Duración (minutos):</Text>
      <Picker
        selectedValue={duracion}
        style={styles.picker}
        onValueChange={setDuracion}
      >
        <Picker.Item label="15" value={15} />
        <Picker.Item label="30" value={30} />
        <Picker.Item label="45" value={45} />
        <Picker.Item label="60" value={60} />
      </Picker>
      <Text style={styles.label}>Precio:</Text>
      <Text style={styles.value}>${precio.toFixed(2)}</Text>
      <TouchableOpacity style={styles.button} onPress={handlePedirSolver}>
        <Text style={styles.buttonText}>Pedir Solver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 18 },
  label: { fontSize: 16, marginTop: 12 },
  value: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  picker: { height: 50, width: 120 },
  button: {
    marginTop: 30,
    backgroundColor: '#007cc0',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});