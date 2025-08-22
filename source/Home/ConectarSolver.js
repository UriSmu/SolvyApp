import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Alert, Dimensions, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { supabase } from '../context/supabaseClient';

export default function ConectarSolver({ route, navigation }) {
  const { solicitudData } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [solver, setSolver] = useState(null);
  const [error, setError] = useState(null);
  const [panelAnim] = useState(new Animated.Value(180));
  const { width, height } = Dimensions.get('window');
  const [solicitudId, setSolicitudId] = useState(null);
  const [solicitudDataActualizada, setSolicitudDataActualizada] = useState(null);

  // Extraer datos desde solicitudData
  const coord = solicitudData?.coord;
  const address = solicitudData?.direccion_servicio;
  const duracion = solicitudData?.duracion_servicio;
  const precio = solicitudData?.monto;

  useEffect(() => {
    let channel;
    const crearSolicitud = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!solicitudData?.idcliente || !solicitudData?.horainicial) {
          setError('Faltan datos obligatorios en la solicitud.');
          setLoading(false);
          return;
        }
        const { data, error: insertError } = await supabase.from('solicitudes').insert([solicitudData]).select();
        if (insertError) {
          setError(insertError.message || 'Error al crear la solicitud.');
          setLoading(false);
          return;
        }
        const id = data[0]?.idsolicitud;
        setSolicitudId(id);

        // Suscribirse a cambios en la solicitud para saber si fue aceptada
        channel = supabase
          .channel('solicitud-aceptada')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'solicitudes',
              filter: `idsolicitud=eq.${id}`,
            },
            async (payload) => {
              if (payload.new.hay_solver && payload.new.idsolver) {
                // Obtener datos del solver
                await obtenerDatosSolver(payload.new.idsolver);
                // Mostrar datos de la solicitud actualizada
                setSolicitudDataActualizada(payload.new);
              }
            }
          )
          .subscribe();

        Animated.timing(panelAnim, {
          toValue: 320,
          duration: 350,
          useNativeDriver: false,
        }).start();
      } catch (e) {
        setError('Error al crear la solicitud.');
      }
      setLoading(false);
    };

    const obtenerDatosSolver = async (idsolver) => {
      try {
        const token = await AsyncStorage.getItem('token');
        const solverRes = await fetch(
          `https://solvy-app-api.vercel.app/sol/solver/${idsolver}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const solverData = await solverRes.json();
        setSolver(Array.isArray(solverData) ? solverData[0] : solverData);
        setLoading(false);
      } catch {
        setError('No se pudo obtener el solver.');
      }
    };

    crearSolicitud();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handleVolver = () => {
    navigation.goBack();
  };

  // Usar datos actualizados si existen
  const datosSolicitud = solicitudDataActualizada || solicitudData;
  const datosDireccion = typeof datosSolicitud?.direccion_servicio === 'string'
    ? JSON.parse(datosSolicitud.direccion_servicio)
    : datosSolicitud?.direccion_servicio;

  const region = datosDireccion
    ? {
        latitude: datosDireccion.latitude,
        longitude: datosDireccion.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      }
    : {
        latitude: -34.6037,
        longitude: -58.3816,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  const panelHeight = 320;

  return (
    <View style={styles.main}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        region={region}
        pointerEvents="none"
      >
        {datosDireccion && (
          <Marker
            coordinate={{
              latitude: datosDireccion.latitude,
              longitude: datosDireccion.longitude,
            }}
            title="Tu pedido"
            description={datosDireccion.title}
            pinColor="#007cc0"
          />
        )}
      </MapView>

      <View style={styles.topCard}>
        <TouchableOpacity style={styles.backBtn} onPress={handleVolver}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Ionicons name="sparkles" size={28} color="#fff" style={{ marginBottom: 6 }} />
        <Text style={styles.topCardTitle}>Conexión con Solver</Text>
        <Text style={styles.topCardDesc}>Aquí verás toda la información de tu servicio.</Text>
      </View>

      <Animated.View style={[styles.panel, { height: panelHeight }]}>
        {loading && (
          <View style={{ alignItems: 'center', marginTop: 18 }}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>Esperando que un solver acepte...</Text>
          </View>
        )}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        {!loading && solver && datosSolicitud && (
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
            <Text style={[styles.solverInfoBold, { marginBottom: 8 }]}>{datosDireccion?.title || 'No especificada'}</Text>
            <Text style={styles.solverInfo}>Duración: <Text style={styles.solverInfoBold}>{datosSolicitud?.duracion_servicio || 'No especificada'} min</Text></Text>
            <Text style={styles.solverInfo}>Precio: <Text style={styles.solverInfoBold}>${datosSolicitud?.monto?.toFixed(2) || 'No especificado'}</Text></Text>
            {/* Si querés mostrar el código de finalización, descomenta la siguiente línea */}
            {/* <Text style={styles.solverInfo}>Código de finalización: <Text style={styles.solverInfoBold}>{datosSolicitud?.codigo_confirmacion}</Text></Text> */}
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