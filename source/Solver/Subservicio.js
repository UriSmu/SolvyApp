import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Subservicio({ route, navigation }) {
  const { subservicio, servicio } = route.params;
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDescripcion = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`https://solvy-app-api.vercel.app/ser/subservicio/${subservicio.idsubservicio}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDescripcion(data.descripcion || '');
        } else {
          setDescripcion('');
        }
      } catch (e) {
        setDescripcion('');
      }
      setLoading(false);
    };
    fetchDescripcion();
  }, [subservicio]);

  const handleAgregar = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const usuarioStr = await AsyncStorage.getItem('usuario');
      let idsolver = null;
      if (usuarioStr) {
        try {
          const usuarioObj = JSON.parse(usuarioStr);
          idsolver =
            usuarioObj?.profile?.user?.idsolver ||
            usuarioObj?.profile?.idsolver ||
            usuarioObj?.user?.idsolver ||
            usuarioObj?.idsolver ||
            null;
        } catch (err) {
          console.log('Error parsing usuario:', err);
        }
      }

      // 1. Agregar el servicio principal si no lo tiene
      await fetch(`https://solvy-app-api.vercel.app/sol/agregarservicio/${idsolver}/${servicio.idservicio}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      // 2. Agregar el subservicio
      await fetch(`https://solvy-app-api.vercel.app/sol/agregarsubservicio/${idsolver}/${subservicio.idsubservicio}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      Alert.alert('¡Listo!', 'Subservicio agregado correctamente.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo agregar el subservicio.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{subservicio.nombre}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007cc0" style={{ marginTop: 40 }} />
      ) : (
        <Text style={styles.descripcion}>{descripcion}</Text>
      )}
      <TouchableOpacity style={styles.agregarBtn} onPress={handleAgregar}>
        <Text style={styles.agregarBtnText}>Agregar subservicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  descripcion: { fontSize: 16, color: '#222', marginBottom: 40, textAlign: 'center' },
  agregarBtn: {
    backgroundColor: '#007cc0',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignSelf: 'center',
  },
  agregarBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});