import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Alert, Dimensions, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function ConectarSolver({ route, navigation }) {
  const { coord, address, suggestion, subservicio, duracion, precio } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [solver, setSolver] = useState(null);
  const [error, setError] = useState(null);
  const [panelAnim] = useState(new Animated.Value(180));
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    const fetchAvailableSolver = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setError('No se encontró el token de autenticación.');
          setLoading(false);
          return;
        }
        if (!subservicio || !subservicio.idsubservicio) {
          setError('No se especificó el subservicio.');
          setLoading(false);
          return;
        }
        // Buscar solvers del subservicio recibido
        const res = await fetch(
          `https://solvy-app-api.vercel.app/ser/solversubservicio/${subservicio.idsubservicio}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const solversIds = await res.json();
        // Filtrar solvers disponibles
        const availableSolvers = solversIds.filter(s => s.esta_disponible);
        if (!Array.isArray(availableSolvers) || availableSolvers.length === 0) {
          setError('No hay solvers disponibles para este subservicio.');
          setLoading(false);
          return;
        }
        const solverId = availableSolvers[0].idsolver || availableSolvers[0].id || availableSolvers[0]._id;
        const solverRes = await fetch(
          `https://solvy-app-api.vercel.app/sol/solver/${solverId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const solverData = await solverRes.json();
        setSolver(Array.isArray(solverData) ? solverData[0] : solverData);

        Animated.timing(panelAnim, {
          toValue: 320,
          duration: 350,
          useNativeDriver: false,
        }).start();
      } catch (e) {
        setError('Error al conectar con un solver.');
        setSolver(null);
      }
      setLoading(false);
    };
    fetchAvailableSolver();
  }, []);

  const handleVolver = () => {
    navigation.goBack();
  };

  // Región para el mapa
  const region = coord
    ? {
        latitude: coord.latitude,
        longitude: coord.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      }
    : {
        latitude: -34.6037,
        longitude: -58.3816,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  // Altura del panel para que entre todo sin scrollear
  const panelHeight = 320;

  return (
    <View style={styles.main}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        region={region}
        pointerEvents="none"
      >
        {coord && (
          <Marker
            coordinate={{
              latitude: coord.latitude,
              longitude: coord.longitude,
            }}
            title="Tu pedido"
            description={address}
            pinColor="#007cc0"
          />
        )}
      </MapView>

      {/* Card superior */}
      <View style={styles.topCard}>
        <TouchableOpacity style={styles.backBtn} onPress={handleVolver}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Ionicons name="sparkles" size={28} color="#fff" style={{ marginBottom: 6 }} />
        <Text style={styles.topCardTitle}>Conexión con Solver</Text>
        <Text style={styles.topCardDesc}>Aquí verás toda la información de tu servicio.</Text>
      </View>

      {/* Panel inferior tipo "desplegable" */}
      <Animated.View style={[styles.panel, { height: panelHeight }]}>
        {loading && (
          <View style={{ alignItems: 'center', marginTop: 18 }}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>Conectando...</Text>
          </View>
        )}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        {!loading && solver && (
          <View style={styles.solverCard}>
            {solver.foto_perfil && (
              <Image
                source={{ uri: solver.foto_perfil }}
                style={{ width: 70, height: 70, borderRadius: 35, marginBottom: 8 }}
              />
            )}
            <Text style={styles.solverName}>
              {solver.nombre} {solver.apellido}
            </Text>
            <Text style={styles.solverInfo}>Tel: <Text style={styles.solverInfoBold}>{solver.telefono || 'No disponible'}</Text></Text>
            <Text style={styles.solverInfo}>Email: <Text style={styles.solverInfoBold}>{solver.email || 'No disponible'}</Text></Text>
            <Text style={styles.solverInfo}>Dirección del pedido:</Text>
            <Text style={[styles.solverInfoBold, { marginBottom: 8 }]}>{address || 'No especificada'}</Text>
            <Text style={styles.solverInfo}>Duración: <Text style={styles.solverInfoBold}>{duracion || 'No especificada'} min</Text></Text>
            <Text style={styles.solverInfo}>Precio: <Text style={styles.solverInfoBold}>${precio?.toFixed(2) || 'No especificado'}</Text></Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => Alert.alert('Código de finalización', 'Tu código es: 123456')}
            >
              <Ionicons name="key-outline" size={22} color="#007cc0" style={{ marginRight: 8 }} />
              <Text style={styles.btnText}>VER CÓDIGO DE FINALIZACION</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#fff', justifyContent: 'flex-end' },
  topCard: {
    position: 'absolute',
    top: 48,
    left: 24,
    right: 24,
    backgroundColor: '#007cc0',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    elevation: 7,
    shadowColor: '#007cc0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    zIndex: 10,
  },
  backBtn: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 20,
    backgroundColor: '#005b8a',
    borderRadius: 20,
    padding: 4,
  },
  topCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  topCardDesc: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 0,
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#007cc0',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 18,
    elevation: 10,
    zIndex: 20,
    minHeight: 120,
    shadowColor: '#007cc0',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    justifyContent: 'center',
  },
  errorText: { color: '#fff', fontSize: 18, textAlign: 'center', marginTop: 30 },
  solverCard: {
    alignItems: 'center',
    marginTop: 0,
    flex: 1,
    justifyContent: 'center',
  },
  solverName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  solverInfo: { fontSize: 16, color: '#fff', marginTop: 6, textAlign: 'center' },
  solverInfoBold: { fontSize: 16, color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  btn: {
    marginTop: 18,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  btnText: { color: '#007cc0', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5, textAlign: 'center', marginLeft: 8 },
});