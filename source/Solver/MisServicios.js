import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Entypo from '@expo/vector-icons/Entypo';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function MisServicios({ navigation }) {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMisServicios = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const usuarioStr = await AsyncStorage.getItem('usuario');
        let idsolver = null;
        if (usuarioStr) {
          try {
            const usuarioObj = JSON.parse(usuarioStr);
            idsolver =
              usuarioObj?.profile?.user?.idsolver ||
              usuarioObj?.profile?.idsolver ||
              usuarioObj?.user?.idsolver ||
              usuarioObj?.idsolver ||
              null;
            console.log('usuarioObj:', usuarioObj);
            console.log('idsolver:', idsolver);
          } catch (err) {
            console.log('Error parsing usuario:', err);
          }
        }
        if (!idsolver) {
          console.log('No idsolver encontrado');
          setServicios([]);
          setLoading(false);
          return;
        }
        const url = `https://solvy-app-api.vercel.app/sol/solverservicio/${idsolver}`;
        console.log('fetch url:', url);
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('Servicios recibidos:', data);

        // Para cada servicio, obtener el logo usando idservicio
        const serviciosConLogo = await Promise.all(
          (Array.isArray(data) ? data : []).map(async (serv) => {
            try {
              // Cambiado: ahora toma el primer elemento del array devuelto por la API
              const logoRes = await fetch(`https://solvy-app-api.vercel.app/logos/serv/${serv.idservicio}`);
              const logoData = await logoRes.json();
              let logo = Array.isArray(logoData) && logoData.length > 0 ? logoData[0] : {};
              return { ...serv, logo };
            } catch (e) {
              console.log('Error obteniendo logo para servicio:', serv.idservicio, e);
              return { ...serv, logo: undefined };
            }
          })
        );
        setServicios(serviciosConLogo);
      } catch (e) {
        console.log('Error en fetchMisServicios:', e);
        setServicios([]);
      }
      setLoading(false);
    };
    fetchMisServicios();
  }, []);

  const handleServicioPress = (servicio) => {
    console.log('Servicio seleccionado:', servicio);
    navigation.navigate('AgregarSubservicios', { idservicio: servicio.idservicio, nombre: servicio.nombre_servicio });
  };

  const handleOnlinePress = () => {
    console.log('Botón Ponerse Online presionado');
    navigation.navigate('MapaSolverOnline');
  };

  function ServicioLogo({ logo }) {
    const [iconData, setIconData] = useState(logo || null);
    const [error, setError] = useState(!logo);

    useEffect(() => {
      setIconData(logo || null);
      setError(!logo);
    }, [logo]);

    if (error || !iconData) {
      console.log('Mostrando imagen por defecto para logo:', logo);
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

    console.log('Renderizando icono:', {
      family,
      name: iconData.icon_name,
      size: iconData.icon_size,
      color: iconData.icon_color
    });

    return (
      <IconComponent
        name={iconData.icon_name || 'question'}
        size={iconData.icon_size ? Math.max(Number(iconData.icon_size), 50) : 60}
        color={iconData.icon_color || '#fff'}
        style={{ textAlign: 'center', textAlignVertical: 'center' }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis servicios</Text>
      <TouchableOpacity style={styles.onlineBtn} onPress={handleOnlinePress}>
        <Text style={styles.onlineBtnText}>Ponerse Online</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color="#007cc0" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={servicios}
          keyExtractor={item => {
            console.log('FlatList keyExtractor item:', item);
            return item.idservicio?.toString();
          }}
          renderItem={({ item }) => {
            console.log('FlatList renderItem item:', item);
            return (
              <TouchableOpacity style={styles.servicioItem} onPress={() => handleServicioPress(item)}>
                <LinearGradient colors={['#007cc0', '#003f5c']} style={styles.iconoServicio}>
                  <ServicioLogo logo={item.logo} />
                </LinearGradient>
                <Text style={styles.servicioText}>{item.nombre_servicio}</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No tenés servicios agregados.</Text>}
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
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignSelf: 'center',
    marginBottom: 18,
  },
  onlineBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  servicioItem: {
    backgroundColor: '#e6f2fb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconoServicio: {
    backgroundColor: '#007cc0',
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  servicioText: { fontSize: 16, fontWeight: '600', color: '#007cc0' },
});