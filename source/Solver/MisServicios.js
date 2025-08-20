import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'expo-linear-gradient';
import Entypo from '@expo/vector-icons/Entypo';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
          } catch (err) {
            console.log('Error parsing usuario:', err);
          }
        }
        if (!idsolver) {
          setServicios([]);
          setLoading(false);
          return;
        }
        const res = await fetch(`https://solvy-app-api.vercel.app/sol/solverservicio/${idsolver}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setServicios(Array.isArray(data) ? data : []);
      } catch (e) {
        setServicios([]);
      }
      setLoading(false);
    };
    fetchMisServicios();
  }, []);

  const handleOnline = () => {
    navigation.navigate('MapaSolverOnline');
  };

  const handleServicioPress = (servicio) => {
    navigation.navigate('Subservicios', { idservicio: servicio.idservicio, nombre: servicio.nombre });
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
    else if (family === 'Ionicons') IconComponent = Ionicons;
    else if (family === 'Entypo') IconComponent = Entypo;
    else if (family === 'Fontisto') IconComponent = Fontisto;
    else if (family === 'FontAwesome5') IconComponent = FontAwesome5;
    else if (family === 'MaterialCommunityIcons') IconComponent = MaterialCommunityIcons;
    else if (family === 'FontAwesome6') IconComponent = FontAwesome6;

    if (!IconComponent) {
      return <Image source={require('../../assets/Logo.png')} style={{ width: 60, height: 60 }} resizeMode="contain" />;
    }

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
      <TouchableOpacity style={styles.onlineBtn} onPress={handleOnline}>
        <Text style={styles.onlineBtnText}>Ponerme Online</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color="#007cc0" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={servicios}
          keyExtractor={item => item.idservicio?.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.servicioItem} onPress={() => handleServicioPress(item)}>
              <LinearGradient colors={['#007cc0', '#003f5c']} style={styles.iconoServicio}>
                <ServicioLogo idlogoapp={item.idlogoapp} />
              </LinearGradient>
              <Text style={styles.servicioText}>{item.nombre}</Text>
            </TouchableOpacity>
          )}
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
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 24,
    alignSelf: 'center',
  },
  onlineBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
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