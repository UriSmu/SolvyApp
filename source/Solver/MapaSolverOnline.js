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
  const [modalVisible, setModalVisible] = useState(false);
  const [subservicioNombre, setSubservicioNombre] = useState('');
  const [codigoInicial, setCodigoInicial] = useState('');
  const [codigoFinal, setCodigoFinal] = useState('');
  const [inputCodigoFinal, setInputCodigoFinal] = useState('');
  const [puedeFinalizar, setPuedeFinalizar] = useState(false);
  const panelHeight = useRef(new Animated.Value(220)).current;
  const mapRef = useRef(null);

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

  useEffect(() => {
    const fetchSubservicio = async () => {
      if (solicitudActual?.idsubservicio) {
        try {
          const token = await AsyncStorage.getItem('token');
          const res = await fetch(`https://solvy-app-api.vercel.app/ser/nombresubservicio/${solicitudActual.idsubservicio}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setSubservicioNombre(data.nombre || '');
          } else {
            setSubservicioNombre('');
          }
        } catch {
          setSubservicioNombre('');
        }
      } else {
        setSubservicioNombre('');
      }
    };
    fetchSubservicio();
  }, [solicitudActual?.idsubservicio]);

  useEffect(() => {
    const fetchCodigos = async () => {
      if (solicitudActual?.idsolicitud) {
        try {
          const token = await AsyncStorage.getItem('token');
          // Código inicial
          const resInicial = await fetch(`https://solvy-app-api.vercel.app/solit/iniciar/${solicitudActual.idsolicitud}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const logDataInicial = await resInicial.clone().json().catch(() => ({}));
          let dataInicial = logDataInicial;
          if (Array.isArray(dataInicial) && dataInicial.length > 0) {
            dataInicial = dataInicial[0];
          }
          setCodigoInicial(dataInicial?.codigo_inicial?.toString() || '');

          // Código final (nuevo endpoint, desestructurado)
          const resFinal = await fetch(`https://solvy-app-api.vercel.app/solit/codigo/${solicitudActual.idsolicitud}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const logDataFinal = await resFinal.clone().json().catch(() => ({}));
          // DEBUG: Mostramos el valor real que llega
          console.log('DEBUG CODIGO FINAL:', logDataFinal);
          let codigo = '';
          if (Array.isArray(logDataFinal) && logDataFinal.length > 0) {
            codigo = logDataFinal[0]?.codigo_confirmacion?.toString() || '';
          } else if (logDataFinal?.codigo_confirmacion) {
            codigo = logDataFinal.codigo_confirmacion.toString();
          }
          setCodigoFinal(codigo);
        } catch (e) {
          setCodigoInicial('');
          setCodigoFinal('');
        }
      } else {
        setCodigoInicial('');
        setCodigoFinal('');
      }
    };
    fetchCodigos();
  }, [solicitudActual?.idsolicitud]);

  useEffect(() => {
    const channel = supabase
      .channel('solicitudes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'solicitudes' },
        (payload) => {
          if (
            payload.new &&
            solicitudActual &&
            payload.new.idsolicitud === solicitudActual.idsolicitud
          ) {
            setSolicitudActual(payload.new);
            if (payload.new.estado === 'en_curso') setPuedeFinalizar(true);
            if (payload.new.estado === 'finalizada') {
              setPanelVisible(false);
              setServicioActivo(false);
              setModalVisible(false);
              setSolicitudActual(null);
              setPuedeFinalizar(false);
              setInputCodigoFinal('');
              navigation.navigate('ParteTrabajo');
            }
          }
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

  const getSolverId = async () => {
    try {
      const usuarioStr = await AsyncStorage.getItem('usuario');
      const usuarioObj = usuarioStr ? JSON.parse(usuarioStr) : null;
      const idsolver =
        usuarioObj?.profile?.user?.idsolver ||
        usuarioObj?.profile?.idsolver ||
        usuarioObj?.idsolver ||
        null;
      return idsolver;
    } catch (e) {
      return null;
    }
  };

  const generarCodigo = () => Math.floor(1000 + Math.random() * 9000);

  const handleAceptar = async () => {
    setServicioActivo(true);
    Animated.timing(panelHeight, {
      toValue: 300,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (solicitudActual?.idsolicitud) {
      const idsolver = await getSolverId();
      await supabase
        .from('solicitudes')
        .update({
          estado: 'aceptada',
          hay_solver: true,
          idsolver: idsolver,
        })
        .eq('idsolicitud', solicitudActual.idsolicitud)
        .select();
    }
  };

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
      await supabase
        .from('solicitudes')
        .update({
          estado: 'rechazada',
          hay_solver: false,
          idsolver: null,
        })
        .eq('idsolicitud', solicitudActual.idsolicitud)
        .select();
    }
  };

  const handleMostrarCodigo = () => {
    setModalVisible(true);
  };

  const handleValidarCodigoFinal = async () => {
    // DEBUG: Mostramos los valores que se comparan
    console.log('DEBUG inputCodigoFinal:', inputCodigoFinal);
    console.log('DEBUG codigoFinal:', codigoFinal);
    // Comparamos ambos como string y sin espacios
    if (
      inputCodigoFinal.trim() === codigoFinal.trim()
    ) {
      if (solicitudActual?.idsolicitud) {
        await supabase
          .from('solicitudes')
          .update({ estado: 'finalizada' })
          .eq('idsolicitud', solicitudActual.idsolicitud);
      }
      setModalVisible(false);
      setPuedeFinalizar(false);
      setInputCodigoFinal('');
      Alert.alert('¡Servicio finalizado!', 'Gracias por usar Solvy.');
    } else {
      Alert.alert('Código incorrecto', 'El código ingresado no es válido.');
    }
  };

  const direccionObj = typeof solicitudActual?.direccion_servicio === 'string'
    ? JSON.parse(solicitudActual.direccion_servicio)
    : solicitudActual?.direccion_servicio;

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
                <Text style={styles.label}>Subservicio:</Text>
                <Text style={styles.valor}>{subservicioNombre || 'Sin nombre'}</Text>
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
                <Text style={styles.label}>Subservicio:</Text>
                <Text style={styles.valor}>{subservicioNombre || 'Sin nombre'}</Text>
                <Text style={styles.label}>Dirección:</Text>
                <Text style={styles.valor}>
                  {direccionObj?.title || 'Sin dirección'}
                </Text>
                <Text style={styles.label}>Duración:</Text>
                <Text style={styles.valor}>{solicitudActual?.duracion_servicio} min</Text>
                <Text style={styles.label}>Monto:</Text>
                <Text style={styles.valor}>${solicitudActual?.monto}</Text>
              </View>
              {!puedeFinalizar ? (
                <TouchableOpacity style={styles.finalizarBtn} onPress={handleMostrarCodigo}>
                  <Text style={styles.btnText}>Mostrar código inicial</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.finalizarBtn, { backgroundColor: '#00c853' }]} onPress={handleMostrarCodigo}>
                  <Text style={styles.btnText}>Finalizar servicio</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </Animated.View>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            {!puedeFinalizar ? (
              <>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Código inicial para el cliente</Text>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#007cc0', marginBottom: 18 }}>
                  {codigoInicial || '----'}
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 8, textAlign: 'center' }}>
                  Dale este código al cliente para que pueda iniciar el servicio.
                </Text>
                <TouchableOpacity
                  style={[styles.finalizarBtn, { backgroundColor: '#d32f2f', marginTop: 8 }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.btnText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Ingrese el código final</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#007cc0',
                    borderRadius: 8,
                    padding: 10,
                    fontSize: 18,
                    width: '80%',
                    marginBottom: 18,
                    textAlign: 'center',
                    backgroundColor: '#f9f9f9',
                  }}
                  keyboardType="numeric"
                  maxLength={4}
                  value={inputCodigoFinal}
                  onChangeText={setInputCodigoFinal}
                  placeholder="Ingrese el código"
                />
                <TouchableOpacity
                  style={[styles.finalizarBtn, { width: 120, paddingVertical: 10, paddingHorizontal: 0 }]}
                  onPress={handleValidarCodigoFinal}
                >
                  <Text style={[styles.btnText, { color: '#fff', fontSize: 16 }]}>Validar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.finalizarBtn, { backgroundColor: '#d32f2f', width: 120, paddingVertical: 10, paddingHorizontal: 0, marginTop: 8 }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.btnText, { color: '#fff', fontSize: 16 }]}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
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
});