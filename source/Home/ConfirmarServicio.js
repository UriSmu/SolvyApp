import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ConfirmarServicio({ route, navigation }) {
  const { coord, address, suggestion, subservicio } = route.params || {};
  const [duracion, setDuracion] = useState(15);

  // Tarifas
  const tarifaBase = subservicio?.tarifabase || 1000;
  const precioPorTiempo = subservicio?.precioportiempo || 500;
  const precio = tarifaBase + (precioPorTiempo * (duracion / 15));

  const handlePedirSolver = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const usuarioStr = await AsyncStorage.getItem('usuario');
      let idcliente = null;
      if (usuarioStr) {
        try {
          const usuarioObj = JSON.parse(usuarioStr);
          idcliente =
            usuarioObj?.profile?.user?.idcliente ||
            usuarioObj?.profile?.idcliente ||
            usuarioObj?.user?.idcliente ||
            usuarioObj?.idcliente ||
            null;
        } catch (err) {
          idcliente = null;
        }
      }

      // Validación extra para idservicio
      if (!idcliente || !subservicio?.idsubservicio || !subservicio?.idservicio) {
        Alert.alert('Error', 'No se pudo obtener el usuario, subservicio o servicio.');
        return;
      }

      // Fecha y hora actual
      const fecha = new Date();
      const fechasolicitud = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
      const horainicial = fecha.toTimeString().slice(0,5); // HH:MM

      const solicitudData = {
        idsubservicio: subservicio.idsubservicio,
        idservicio: subservicio.idservicio,
        idcliente,
        direccion_servicio: address,
        fechasolicitud,
        horainicial,
        duracion_servicio: duracion,
        monto: precio,
      };

      console.log('Solicitud enviada:', solicitudData);

      const res = await fetch('https://solvy-app-api.vercel.app/solit/nuevasolicitud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(solicitudData),
      });

      if (!res.ok) {
        const error = await res.json();
        Alert.alert('Error', error?.message || 'No se pudo crear la solicitud.');
        return;
      }

      navigation.navigate('ConectarSolver', {
        coord,
        address,
        suggestion,
        subservicio,
        duracion,
        precio,
      });
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
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