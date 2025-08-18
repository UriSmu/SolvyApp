import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MisServicios({ navigation }) {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMisServicios = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const usuarioStr = await AsyncStorage.getItem('usuario');
        const usuarioObj = JSON.parse(usuarioStr);
        const idsolver = usuarioObj?.profile?.user?.idsolver;
        const res = await fetch(`https://solvy-app-api.vercel.app/ser/serviciossolver/${idsolver}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setServicios(Array.isArray(data) ? data : []);
      } catch (e) {
        setServicios([]);
      }
      setLoading(false);
    };
    fetchMisServicios();
  }, []);

  const handleOnline = () => {
    navigation.navigate('MapaSolverOnline');
  };

  const handleServicioPress = (servicio) => {
    navigation.navigate('Subservicios', { idservicio: servicio.idservicio, nombre: servicio.nombre });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis servicios</Text>
      <TouchableOpacity style={styles.onlineBtn} onPress={handleOnline}>
        <Text style={styles.onlineBtnText}>Ponerme Online</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color="#007cc0" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={servicios}
          keyExtractor={item => item.idservicio?.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.servicioItem} onPress={() => handleServicioPress(item)}>
              <Text style={styles.servicioText}>{item.nombre}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  onlineBtn: {
    backgroundColor: '#007cc0',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 24,
    alignSelf: 'center',
  },
  onlineBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  servicioItem: {
    backgroundColor: '#e6f2fb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  servicioText: { fontSize: 16, fontWeight: '600', color: '#007cc0' },
});