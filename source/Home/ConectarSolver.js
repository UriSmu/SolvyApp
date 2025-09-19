import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Dimensions, Animated, Image, Modal, TextInput, Alert } from 'react-native';
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
  const [solicitudId, setSolicitudId] = useState(null);
  const [solicitudDataActualizada, setSolicitudDataActualizada] = useState(null);
  const [subservicioNombre, setSubservicioNombre] = useState('');
  const [showTopCard, setShowTopCard] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [codigoInicial, setCodigoInicial] = useState('');
  const [inputCodigo, setInputCodigo] = useState('');
  const [codigoValidado, setCodigoValidado] = useState(false);

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
        const id = Array.isArray(data) ? data[0]?.idsolicitud : data?.idsolicitud;
        setSolicitudId(id);

        // Obtener el código inicial desde la API
        try {
          const token = await AsyncStorage.getItem('token');
          const res = await fetch(`https://solvy-app-api.vercel.app/solit/iniciar/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const logData = await res.clone().json().catch(() => ({}));
          console.log('API codigo_inicial:', logData);
          if (res.ok) {
            const dataCodigo = logData;
            setCodigoInicial(dataCodigo?.codigo_inicial?.toString() || '');
          }
        } catch (e) {
          console.log('Error obteniendo código inicial:', e);
        }

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
              setSolicitudDataActualizada(payload.new);
              if (payload.new.hay_solver && payload.new.idsolver) {
                await obtenerDatosSolver(payload.new.idsolver);
                setShowTopCard(false);
                setLoading(false);
              }
              if (payload.new.estado === 'finalizada') {
                setModalVisible(false);
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
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
      } catch {
        setError('No se pudo obtener el solver.');
      }
    };

    crearSolicitud();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Traer nombre del subservicio
  useEffect(() => {
    const fetchSubservicio = async () => {
      const datosSolicitud = solicitudDataActualizada || solicitudData;
      if (datosSolicitud?.idsubservicio) {
        try {
          const token = await AsyncStorage.getItem('token');
          const res = await fetch(`https://solvy-app-api.vercel.app/ser/nombresubservicio/${datosSolicitud.idsubservicio}`, {
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
  }, [solicitudDataActualizada, solver]);

  const handleVolver = () => {
    navigation.goBack();
  };

  // Validar código inicial ingresado por el usuario
  const handleValidarCodigo = () => {
    if (inputCodigo === codigoInicial) {
      Alert.alert('¡Código correcto!', 'El solver comenzará tu servicio.');
      setCodigoValidado(true);
      setModalVisible(false);
    } else {
      Alert.alert('Código incorrecto', 'El código ingresado no es válido.');
    }
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

      {showTopCard && (
        <View style={styles.topCard}>
          <TouchableOpacity style={styles.backBtn} onPress={handleVolver}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Ionicons name="sparkles" size={28} color="#fff" style={{ marginBottom: 6 }} />
          <Text style={styles.topCardTitle}>Conexión con Solver</Text>
          <Text style={styles.topCardDesc}>Aquí verás toda la información de tu servicio.</Text>
        </View>
      )}

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
            <Text style={styles.solverInfo}>Subservicio:</Text>
            <Text style={[styles.solverInfoBold, { marginBottom: 8 }]}>{subservicioNombre || 'No especificado'}</Text>
            <Text style={styles.solverInfo}>Dirección del pedido:</Text>
            <Text style={[styles.solverInfoBold, { marginBottom: 8 }]}>{datosDireccion?.title || 'No especificada'}</Text>
            <Text style={styles.solverInfo}>Duración: <Text style={styles.solverInfoBold}>{datosSolicitud?.duracion_servicio || 'No especificada'} min</Text></Text>
            <Text style={styles.solverInfo}>Precio: <Text style={styles.solverInfoBold}>${datosSolicitud?.monto?.toFixed(2) || 'No especificado'}</Text></Text>
            {!codigoValidado ? (
              <TouchableOpacity
                style={[styles.finalizarBtn, { width: 220, paddingVertical: 10, paddingHorizontal: 0 }]}
                onPress={() => setModalVisible(true)}
              >
                <Text style={[styles.btnText, { color: '#fff', fontSize: 16 }]}>Ingresar código inicial</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.finalizarBtn, { width: 220, paddingVertical: 10, paddingHorizontal: 0, backgroundColor: '#00c853' }]}
                onPress={() => Alert.alert('Servicio finalizado', 'Aquí iría la lógica de finalización.')}
              >
                <Text style={[styles.btnText, { color: '#fff', fontSize: 16 }]}>Finalizar servicio</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Animated.View>

      {/* Modal para ingresar código inicial */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Ingrese el código inicial</Text>
            <Text style={{ fontSize: 16, marginBottom: 8, textAlign: 'center' }}>
              El solver le debe entregar este código para comenzar el servicio.
            </Text>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#007cc0', marginBottom: 18 }}>
              {codigoInicial || '----'}
            </Text>
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
              value={inputCodigo}
              onChangeText={setInputCodigo}
              placeholder="Ingrese el código"
            />
            <TouchableOpacity
              style={[styles.finalizarBtn, { width: 120, paddingVertical: 10, paddingHorizontal: 0 }]}
              onPress={handleValidarCodigo}
            >
              <Text style={[styles.btnText, { color: '#fff', fontSize: 16 }]}>Validar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.finalizarBtn, { backgroundColor: '#d32f2f', width: 120, paddingVertical: 10, paddingHorizontal: 0, marginTop: 8 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.btnText, { color: '#fff', fontSize: 16 }]}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5, textAlign: 'center', marginLeft: 0 },
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