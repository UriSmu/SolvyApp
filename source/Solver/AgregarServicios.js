import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Image } from 'react-native';
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

export default function AgregarServicios({ navigation }) {
  const [otrosServicios, setOtrosServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServicios = async () => {
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
          } catch (err) {
            console.log('Error parsing usuario:', err);
          }
        }
        // Trae todos los servicios que el solver ya realiza
        const resMis = await fetch(`https://solvy-app-api.vercel.app/sol/solverservicio/${idsolver}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const mis = await resMis.json();
        // Trae todos los servicios posibles
        const resTodos = await fetch('https://solvy-app-api.vercel.app/ser/servicios');
        const todos = await resTodos.json();
        // Filtra los que el solver NO realiza
        const otros = Array.isArray(todos)
          ? todos.filter(s => !mis.some(m => m.idservicio === s.idservicio))
          : [];
        setOtrosServicios(otros);
      } catch (e) {
        setOtrosServicios([]);
      }
      setLoading(false);
    };
    fetchServicios();
  }, []);

  const handleServicioPress = (servicio) => {
    navigation.navigate('AgregarMasServicios', { servicio });
  };

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Servicios para agregar</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007cc0" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={otrosServicios}
          keyExtractor={item => item.idservicio?.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.servicioItem} onPress={() => handleServicioPress(item)}>
              <LinearGradient colors={['#007cc0', '#003f5c']} style={styles.iconoServicio}>
                <ServicioLogo idlogoapp={item.idlogoapp} />
              </LinearGradient>
              <Text style={styles.servicioText}>{item.nombre}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No hay servicios para agregar.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
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