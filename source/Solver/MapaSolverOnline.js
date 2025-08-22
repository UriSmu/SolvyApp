import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Dimensions, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../context/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function MapaSolverOnline() {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [solicitudActual, setSolicitudActual] = useState(null);
  const [servicioActivo, setServicioActivo] = useState(false);
  const panelHeight = useRef(new Animated.Value(220)).current;
  const mapRef = useRef(null);

  // Obtener ubicación del solver
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permiso de ubicación denegado');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      const initialRegion = {
        latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01
      };
      setRegion(initialRegion);
      setLocation({ latitude, longitude });
    })();
  }, []);

  // Suscripción realtime a la tabla solicitudes
  useEffect(() => {
    const channel = supabase
    .channel('solicitudes-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'solicitudes' },
      (payload) => {
        console.log('Realtime payload:', payload);
      }
    )
    .subscribe((status) => {
      console.log('Supabase channel status:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  // Obtener el idsolver del solver logueado
  const getSolverId = async () => {
    // Aquí deberías obtener el idsolver del solver logueado (por ejemplo desde AsyncStorage)
    // Ejemplo:
    const solverId = await AsyncStorage.getItem('idsolver');
    return solverId;
  };

  // Aceptar solicitud
  const handleAceptar = async () => {
    setServicioActivo(true);
    Animated.timing(panelHeight, {
      toValue: 300,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (solicitudActual?.id) {
      const idsolver = await getSolverId();
      await supabase
        .from('solicitudes')
        .update({
          estado: 'aceptada',
          hay_solver: true,
          idsolver: idsolver,
        })
        .eq('id', solicitudActual.id);
    }
  };

  // Rechazar solicitud
  const handleRechazar = async () => {
    setPanelVisible(false);
    setSolicitudActual(null);
    setServicioActivo(false);
    Animated.timing(panelHeight, {
      toValue: 220,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (solicitudActual?.id) {
      await supabase
        .from('solicitudes')
        .update({
          estado: 'rechazada',
          hay_solver: false,
          idsolver: null,
        })
        .eq('id', solicitudActual.id);
    }
  };

  // Finalizar servicio
  const handleFinalizar = async () => {
    setPanelVisible(false);
    setSolicitudActual(null);
    setServicioActivo(false);
    Animated.timing(panelHeight, {
      toValue: 220,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (solicitudActual?.id) {
      await supabase
        .from('solicitudes')
        .update({
          estado: 'finalizada',
        })
        .eq('id', solicitudActual.id);
    }
  };

  return (
    <View style={styles.main}>
      <StatusBar style="auto" />
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.mapa}
        region={region}
        showsUserLocation
        showsMyLocationButton
        showsPointsOfInterest
      >
        {solicitudActual && solicitudActual.coord && (
          <Marker
            coordinate={{
              latitude: solicitudActual.coord.latitude,
              longitude: solicitudActual.coord.longitude
            }}
            title={solicitudActual.direccion}
          />
        )}
      </MapView>

      {panelVisible && (
        <Animated.View style={[
          styles.panel,
          { bottom: 0, height: panelHeight }
        ]}>
          {!servicioActivo ? (
            <>
              <Text style={styles.tituloPanel}>Conectando con Clientes</Text>
              <View style={styles.infoSolicitud}>
                <Text style={styles.label}>Dirección:</Text>
                <Text style={styles.valor}>{solicitudActual?.direccion}</Text>
                <Text style={styles.label}>Subservicio:</Text>
                <Text style={styles.valor}>{solicitudActual?.subservicio}</Text>
                <Text style={styles.label}>Cliente:</Text>
                <Text style={styles.valor}>{solicitudActual?.cliente}</Text>
                <Text style={styles.label}>Duración:</Text>
                <Text style={styles.valor}>{solicitudActual?.duracion}</Text>
                <Text style={styles.label}>Monto:</Text>
                <Text style={styles.valor}>{solicitudActual?.monto}</Text>
              </View>
              <View style={styles.botonesRow}>
                <TouchableOpacity style={styles.aceptarBtn} onPress={handleAceptar}>
                  <Text style={styles.btnText}>Aceptar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rechazarBtn} onPress={handleRechazar}>
                  <Text style={styles.btnText}>Rechazar</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.tituloPanel}>Servicio en curso</Text>
              <View style={styles.infoSolicitud}>
                <Text style={styles.label}>Dirección:</Text>
                <Text style={styles.valor}>{solicitudActual?.direccion}</Text>
                <Text style={styles.label}>Subservicio:</Text>
                <Text style={styles.valor}>{solicitudActual?.subservicio}</Text>
                <Text style={styles.label}>Cliente:</Text>
                <Text style={styles.valor}>{solicitudActual?.cliente}</Text>
                <Text style={styles.label}>Duración:</Text>
                <Text style={styles.valor}>{solicitudActual?.duracion}</Text>
                <Text style={styles.label}>Monto:</Text>
                <Text style={styles.valor}>{solicitudActual?.monto}</Text>
              </View>
              <TouchableOpacity style={styles.finalizarBtn} onPress={handleFinalizar}>
                <Text style={styles.btnText}>Finalizar Servicio</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#fff' },
  mapa: { flex: 1 },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#009FE3',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 18,
    elevation: 10,
    zIndex: 10,
  },
  tituloPanel: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoSolicitud: {
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 6,
  },
  valor: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 2,
  },
  botonesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  aceptarBtn: {
    backgroundColor: '#00c853',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginRight: 10,
  },
  rechazarBtn: {
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginLeft: 10,
  },
  finalizarBtn: {
    backgroundColor: '#007cc0',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});