import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Dimensions, Animated, Modal, TextInput, Alert
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../context/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function MapaSolverOnline({ navigation }) {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [solicitudActual, setSolicitudActual] = useState(null);
  const [servicioActivo, setServicioActivo] = useState(false);
  const [codigoInput, setCodigoInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
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

  // Suscripción realtime a la tabla solicitudes (INSERT y UPDATE)
  useEffect(() => {
    const channel = supabase
      .channel('solicitudes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'solicitudes' },
        (payload) => {
          console.log('Realtime payload:', payload);
          // Si es la solicitud actual, actualiza el estado local
          if (
            payload.new &&
            solicitudActual &&
            payload.new.idsolicitud === solicitudActual.idsolicitud
          ) {
            setSolicitudActual(payload.new);
            if (payload.new.estado === 'finalizada') {
              setPanelVisible(false);
              setServicioActivo(false);
              setModalVisible(false);
              setSolicitudActual(null);
              navigation.navigate('Home');
            }
          }
          // Si es una nueva solicitud pendiente
          if (
            payload.new &&
            payload.new.hay_solver === false &&
            !payload.new.idsolver
          ) {
            setSolicitudActual(payload.new);
            setPanelVisible(true);
            let direccionObj = payload.new.direccion_servicio;
            if (typeof direccionObj === 'string') {
              try {
                direccionObj = JSON.parse(direccionObj);
              } catch (e) {
                direccionObj = null;
              }
            }
            if (
              direccionObj &&
              typeof direccionObj.latitude === 'number' &&
              typeof direccionObj.longitude === 'number'
            ) {
              setRegion({
                latitude: direccionObj.latitude,
                longitude: direccionObj.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [solicitudActual]);

  // Obtener el idsolver del solver logueado desde AsyncStorage
  const getSolverId = async () => {
    try {
      const usuarioStr = await AsyncStorage.getItem('usuario');
      const usuarioObj = usuarioStr ? JSON.parse(usuarioStr) : null;
      console.log('DEBUG usuarioObj:', usuarioObj); // LOG para ver la estructura
      const idsolver =
        usuarioObj?.profile?.user?.idsolver ||
        usuarioObj?.profile?.idsolver ||
        usuarioObj?.idsolver ||
        null;
      console.log('DEBUG idsolver:', idsolver);
      return idsolver;
    } catch (e) {
      console.log('DEBUG error getSolverId:', e);
      return null;
    }
  };

  // Generar código de confirmación de 4 dígitos
  const generarCodigo = () => Math.floor(1000 + Math.random() * 9000);

  // Aceptar solicitud
  const handleAceptar = async () => {
    setServicioActivo(true);
    Animated.timing(panelHeight, {
      toValue: 300,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (solicitudActual?.idsolicitud) {
      const idsolver = await getSolverId();
      const codigo = generarCodigo();
      console.log('DEBUG handleAceptar:', {
        idsolicitud: solicitudActual.idsolicitud,
        idsolver,
        codigo
      });
      const { data, error } = await supabase
        .from('solicitudes')
        .update({
          estado: 'aceptada', // Cambia a tu nombre real de columna si es distinto
          hay_solver: true,
          idsolver: idsolver,
          codigo_confirmacion: codigo,
        })
        .eq('idsolicitud', solicitudActual.idsolicitud)
        .select();
      console.log('DEBUG supabase update (aceptar):', { data, error });
      if (error) {
        Alert.alert('Error', 'No se pudo aceptar el servicio: ' + error.message);
      }
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
    if (solicitudActual?.idsolicitud) {
      const { data, error } = await supabase
        .from('solicitudes')
        .update({
          estado: 'rechazada', // Cambia a tu nombre real de columna si es distinto
          hay_solver: false,
          idsolver: null,
        })
        .eq('idsolicitud', solicitudActual.idsolicitud)
        .select();
      console.log('DEBUG supabase update (rechazar):', { data, error });
      if (error) {
        Alert.alert('Error', 'No se pudo rechazar el servicio: ' + error.message);
      }
    }
  };

  // Abrir modal para finalizar servicio
  const handleFinalizar = () => {
    setModalVisible(true);
    setCodigoInput('');
  };

  // Chequear código y finalizar
  const confirmarFinalizacion = async () => {
    const codigoReal = solicitudActual?.codigo_confirmacion;
    console.log('DEBUG confirmarFinalizacion:', { codigoInput, codigoReal });
    if (parseInt(codigoInput) === codigoReal) {
      const fecha = new Date();
      const horafinal = fecha.toTimeString().slice(0,8);
      const { data, error } = await supabase
        .from('solicitudes')
        .update({
          estado: 'finalizada', // Cambia a tu nombre real de columna si es distinto
          horafinal: horafinal,
        })
        .eq('idsolicitud', solicitudActual.idsolicitud)
        .select();
      console.log('DEBUG supabase update (finalizar):', { data, error });
      if (error) {
        Alert.alert('Error', 'No se pudo finalizar el servicio: ' + error.message);
      }
    } else {
      Alert.alert('Error', 'El código ingresado es incorrecto.');
    }
  };

  // Parsear direccion_servicio si viene como string
  const direccionObj = typeof solicitudActual?.direccion_servicio === 'string'
    ? JSON.parse(solicitudActual.direccion_servicio)
    : solicitudActual?.direccion_servicio;

  console.log('DEBUG solicitudActual:', solicitudActual);
  console.log('DEBUG direccionObj:', direccionObj);

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
        {direccionObj &&
          typeof direccionObj.latitude === 'number' &&
          typeof direccionObj.longitude === 'number' && (
            <Marker
              coordinate={{
                latitude: direccionObj.latitude,
                longitude: direccionObj.longitude,
              }}
              title={direccionObj.title || 'Dirección'}
            />
        )}
      </MapView>

      {panelVisible && solicitudActual && (
        <Animated.View style={[
          styles.panel,
          { bottom: 0, height: panelHeight }
        ]}>
          {!servicioActivo ? (
            <>
              <Text style={styles.tituloPanel}>Nueva Solicitud</Text>
              <View style={styles.infoSolicitud}>
                <Text style={styles.label}>Dirección:</Text>
                <Text style={styles.valor}>
                  {direccionObj?.title || 'Sin dirección'}
                </Text>
                <Text style={styles.label}>Duración:</Text>
                <Text style={styles.valor}>{solicitudActual?.duracion_servicio} min</Text>
                <Text style={styles.label}>Monto:</Text>
                <Text style={styles.valor}>${solicitudActual?.monto}</Text>
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
                <Text style={styles.valor}>
                  {direccionObj?.title || 'Sin dirección'}
                </Text>
                <Text style={styles.label}>Duración:</Text>
                <Text style={styles.valor}>{solicitudActual?.duracion_servicio} min</Text>
                <Text style={styles.label}>Monto:</Text>
                <Text style={styles.valor}>${solicitudActual?.monto}</Text>
              </View>
              <TouchableOpacity style={styles.finalizarBtn} onPress={handleFinalizar}>
                <Text style={styles.btnText}>Finalizar Servicio</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      )}

      {/* Modal para ingresar código de finalización */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Ingrese el código de finalización</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              maxLength={4}
              value={codigoInput}
              onChangeText={setCodigoInput}
              placeholder="Código"
            />
            <TouchableOpacity style={styles.finalizarBtn} onPress={confirmarFinalizacion}>
              <Text style={styles.btnText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.finalizarBtn, { backgroundColor: '#d32f2f', marginTop: 8 }]} onPress={() => setModalVisible(false)}>
              <Text style={styles.btnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    bottom: 0,
    backgroundColor: '#009FE3',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 48,
    elevation: 10,
    zIndex: 100,
    minHeight: 320,
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    width: 300,
  },
  input: {
    borderWidth: 1,
    borderColor: '#007cc0',
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
    width: '80%',
    marginBottom: 18,
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
});