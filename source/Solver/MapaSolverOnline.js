import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Dimensions, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function MapaSolverOnline({ solicitud }) {
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

  // Simulación: cuando llega una solicitud, mostrar el panel
  useEffect(() => {
    if (solicitud) {
      setSolicitudActual(solicitud);
      setPanelVisible(true);
      Animated.timing(panelHeight, {
        toValue: 350,
        duration: 200,
        useNativeDriver: false,
      }).start();
      // Centrar el mapa en la dirección del cliente
      if (solicitud.coord) {
        setRegion({
          latitude: solicitud.coord.latitude,
          longitude: solicitud.coord.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        });
      }
    } else {
      setPanelVisible(false);
      setSolicitudActual(null);
      setServicioActivo(false);
      Animated.timing(panelHeight, {
        toValue: 220,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [solicitud]);

  // Aceptar solicitud
  const handleAceptar = () => {
    setServicioActivo(true);
    Animated.timing(panelHeight, {
      toValue: 300,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Rechazar solicitud
  const handleRechazar = () => {
    setPanelVisible(false);
    setSolicitudActual(null);
    setServicioActivo(false);
    Animated.timing(panelHeight, {
      toValue: 220,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Finalizar servicio
  const handleFinalizar = () => {
    setPanelVisible(false);
    setSolicitudActual(null);
    setServicioActivo(false);
    Animated.timing(panelHeight, {
      toValue: 220,
      duration: 200,
      useNativeDriver: false,
    }).start();
    // Aquí podrías disparar una acción para finalizar el servicio
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
        {/* Marcar la dirección del cliente si hay solicitud */}
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

      {/* Panel azul solo si hay solicitud */}
      {panelVisible && (
        <Animated.View style={[
          styles.panel,
          { bottom: 0, height: panelHeight }
        ]}>
          {/* Estado: esperando solicitud */}
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