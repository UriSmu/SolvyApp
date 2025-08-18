import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function SolverHome({ navigation }) {
  const [nombre, setNombre] = useState(null);
  const [serviciosRecomendados, setServiciosRecomendados] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(true);

  useEffect(() => {
    const cargarNombre = async () => {
      try {
        const usuarioStr = await AsyncStorage.getItem('usuario');
        if (usuarioStr) {
          const usuarioObj = JSON.parse(usuarioStr);
          // Para solver, el nombre puede estar en diferentes lugares
          setNombre(
            usuarioObj?.profile?.user?.nombre ||
            usuarioObj?.profile?.user?.nombre_usuario ||
            usuarioObj?.profile?.user?.email ||
            usuarioObj?.profile?.nombre ||
            usuarioObj?.profile?.nombre_usuario ||
            usuarioObj?.profile?.email ||
            usuarioObj?.nombre ||
            usuarioObj?.nombre_usuario ||
            usuarioObj?.email ||
            'Solver'
          );
        } else {
          setNombre('Solver');
        }
      } catch (e) {
        setNombre('Solver');
      }
    };
    cargarNombre();
  }, []);

  useEffect(() => {
    const fetchServicios = async () => {
      setLoadingServicios(true);
      try {
        // Siempre obtener el token actualizado
        const token = await AsyncStorage.getItem('token');
        const res = await fetch('https://solvy-app-api.vercel.app/ser/servicios', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          const shuffled = data.sort(() => 0.5 - Math.random());
          setServiciosRecomendados(shuffled.slice(0, 6));
        } else {
          setServiciosRecomendados([]);
        }
      } catch (e) {
        setServiciosRecomendados([]);
      }
      setLoadingServicios(false);
    };
    fetchServicios();
  }, []);

  function ServicioLogo({ idlogoapp }) {
    const [iconData, setIconData] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
      let mounted = true;
      setIconData(null);
      setError(false);
      if (!idlogoapp) {
        setError(true);
        return;
      }
      fetch(`https://solvy-app-api.vercel.app/logos/logo/${idlogoapp}`)
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(data => {
          if (mounted && Array.isArray(data) && data.length > 0) setIconData(data[0]);
          else setError(true);
        })
        .catch(() => {
          if (mounted) setError(true);
        });
      return () => { mounted = false; };
    }, [idlogoapp]);

    if (error || !iconData) {
      return <Image source={require('../../assets/Logo.png')} style={{ width: 60, height: 60 }} resizeMode="contain" />;
    }

    const family = iconData.icon_family ? iconData.icon_family.trim() : 'FontAwesome';
    let IconComponent = FontAwesome;
    if (family === 'MaterialIcons') IconComponent = MaterialIcons;
    if (family === 'Ionicons') IconComponent = Ionicons;
    if (family === 'Entypo') IconComponent = Entypo;
    if (family === 'Fontisto') IconComponent = Fontisto;
    if (family === 'FontAwesome5') IconComponent = FontAwesome5;
    if (family === 'MaterialCommunityIcons') IconComponent = MaterialCommunityIcons;
    if (family === 'FontAwesome6') IconComponent = FontAwesome6;

    return (
      <IconComponent
        name={iconData.icon_name || 'question'}
        size={iconData.icon_size ? Math.max(Number(iconData.icon_size), 50) : 60}
        color={iconData.icon_color || '#fff'}
        style={{ textAlign: 'center', textAlignVertical: 'center' }}
      />
    );
  }

  const renderServiciosRecomendados = () => {
    const filas = [];
    for (let i = 0; i < serviciosRecomendados.length; i += 3) {
      filas.push(serviciosRecomendados.slice(i, i + 3));
    }
    return filas.map((fila, idx) => (
      <View style={styles.filaServicios} key={idx}>
        {fila.map(servicio => (
          <View style={styles.servicio} key={servicio.idservicio}>
            <TouchableOpacity
              style={styles.botonServicios}
              onPress={() => navigation.navigate('SolverServicios', { idservicio: servicio.idservicio, nombre: servicio.nombre })}
            >
              <LinearGradient colors={['#007cc0', '#003f5c']} style={styles.iconoServicio}>
                <ServicioLogo idlogoapp={servicio.idlogoapp} />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.nombreServicio}>{servicio.nombre}</Text>
          </View>
        ))}
        {fila.length < 3 &&
          Array.from({ length: 3 - fila.length }).map((_, i) => (
            <View style={styles.servicio} key={`empty-${i}`} />
          ))}
      </View>
    ));
  };

  return (
    <View style={styles.todo}>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.titulo}>
            ¡Hola, {nombre ? nombre : 'Solver'}!
          </Text>
          <Text style={styles.subtitulo}>Servicios recomendados</Text>
          {loadingServicios ? (
            <View style={{ alignItems: 'center', marginVertical: 30 }}>
              <ActivityIndicator size="large" color="#007cc0" style={{ marginTop: 40 }} />
            </View>
          ) : (
            renderServiciosRecomendados()
          )}
          <View style={styles.filaBoton}>
            <TouchableOpacity style={styles.botonMasServicios} onPress={() => navigation.navigate('SolverServicios')}>
              <Text style={styles.textoBotonMasServicios}>Más servicios</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',  
  },
  scrollContainer: { 
    padding: 20, 
    paddingBottom: 0, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoText: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  iconoPerfil: { 
    fontSize: 30 
  },
  titulo: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    marginVertical: 20 
  },
  botonReciente: {
    backgroundColor: '#007cc0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  textoReciente: { 
    color: '#fff', 
    fontStyle: 'italic', 
    opacity: 75 
  },
  subtitulo: { 
    fontSize: 30, 
    fontWeight: 'bold', 
    marginTop: 20, 
    marginBottom: 20, 
    textAlign: 'center'
  },
  filaServicios: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  servicio: {
    width: '30%',
    alignItems: 'center',
  },
  botonServicios: {
    marginBottom: 3,
    width: '100%',
    alignItems: 'center',
  },
  iconoServicio: {
    backgroundColor: '#007cc0',
    width: 85,
    height: 85, 
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
  },
  iconoTexto: { 
    fontSize: 30, 
    color: '#fff' 
  },
  nombreServicio: { 
    textAlign: 'center', 
    fontSize: 13 ,
    fontWeight: '600'
  },
  footerContainer: {
    backgroundColor: '#007cc0',
    paddingBottom: 20, 
  },
  menuInferior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  menuItem: { 
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
    fontSize: 12,
  },
  todo: {
    flex: 1,
    flexDirection: 'column'
  },
  footerImagenes:{
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  centrarFooter:{
    width: 40, height: 30, alignItems: 'center', justifyContent: 'center' 
  },
  contenedorBotonMasServicios: { 
    marginTop: 30,
    marginBottom: 100, // Más espacio con el footer
    alignItems: 'center',
    justifyContent: 'center',
  },
  filaBoton: {
    marginTop: 30,
    marginBottom: 100, // separación del footer
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonMasServicios: {
    backgroundColor: '#007ACC',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    transform: [{ scale: 1 }],
  },
  textoBotonMasServicios: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});