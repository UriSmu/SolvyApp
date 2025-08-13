import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import Entypo from '@expo/vector-icons/Entypo';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function Subservicios({ route, navigation }) {
  const { idservicio, nombre } = route.params;
  const [subservicios, setSubservicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubservicios = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`https://solvy-app-api.vercel.app/ser/${idservicio}/subservicios`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSubservicios(data);
        } else {
          setSubservicios([]);
        }
      } catch (e) {
        setSubservicios([]);
      }
      setLoading(false);
    };
    fetchSubservicios();
  }, [idservicio]);

  const renderSubservicios = () => {
    const filas = [];
    for (let i = 0; i < subservicios.length; i += 3) {
      filas.push(subservicios.slice(i, i + 3));
    }
    return filas.map((fila, idx) => (
      <View style={styles.filaServicios} key={idx}>
        {fila.map(sub => (
          <View style={styles.servicio} key={sub.idsubservicio}>
            <TouchableOpacity
              style={styles.botonServicios}
              onPress={() => {
                navigation.navigate('Mapa', { subservicio: sub });
              }}
            >
              <LinearGradient colors={['#007cc0', '#003f5c']} style={styles.iconoServicio}>
                <ServicioLogo idlogoapp={sub.idlogo} />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.nombreServicio}>{sub.nombre}</Text>
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
          <Text style={styles.subtitulo}>Subservicios de {nombre}</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#007cc0" style={{ marginTop: 40 }} />
          ) : (
            renderSubservicios()
          )}
        </ScrollView>
      </View>
    </View>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',  
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  subtitulo: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'left'
  },
  filaServicios: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  servicio: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  botonServicios: {
    marginBottom: 8,
    width: '100%',
    alignItems: 'center',
  },
  iconoServicio: {
    backgroundColor: '#007cc0',
    width: 100,
    height: 100,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
  },
  nombreServicio: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    width: '100%',
    minHeight: 40,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  todo: {
    flex: 1,
    flexDirection: 'column'
  },
});