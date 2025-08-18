import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AgregarServicios({ navigation }) {
  const [misServicios, setMisServicios] = useState([]);
  const [otrosServicios, setOtrosServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServicios = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const usuarioStr = await AsyncStorage.getItem('usuario');
        const usuarioObj = JSON.parse(usuarioStr);
        const idsolver = usuarioObj?.profile?.user?.idsolver;
        const resMis = await fetch(`https://solvy-app-api.vercel.app/ser/serviciossolver/${idsolver}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const mis = await resMis.json();
        setMisServicios(Array.isArray(mis) ? mis : []);
        const resTodos = await fetch('https://solvy-app-api.vercel.app/ser/servicios', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const todos = await resTodos.json();
        const otros = Array.isArray(todos)
          ? todos.filter(s => !mis.some(m => m.idservicio === s.idservicio))
          : [];
        setOtrosServicios(otros);
      } catch (e) {
        setMisServicios([]);
        setOtrosServicios([]);
      }
      setLoading(false);
    };
    fetchServicios();
  }, []);

  const handleAgregarMas = () => {
    navigation.navigate('AgregarMasServicios', { otrosServicios });
  };

  const handleServicioPress = (servicio) => {
    navigation.navigate('Subservicios', { idservicio: servicio.idservicio, nombre: servicio.nombre });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis servicios</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007cc0" style={{ marginTop: 40 }} />
      ) : (
        <>
          <FlatList
            data={misServicios}
            keyExtractor={item => item.idservicio?.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.servicioItem} onPress={() => handleServicioPress(item)}>
                <Text style={styles.servicioText}>{item.nombre}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.btn} onPress={handleAgregarMas}>
            <Text style={styles.btnText}>Agregar más servicios</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  btn: {
    backgroundColor: '#007cc0',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 24,
    alignSelf: 'center',
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  servicioItem: {
    backgroundColor: '#e6f2fb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  servicioText: { fontSize: 16, fontWeight: '600', color: '#007cc0' },
});