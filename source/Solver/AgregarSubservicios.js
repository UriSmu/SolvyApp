import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, Image } from 'react-native';
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

export default function AgregarSubservicios({ route, navigation }) {
  const { idservicio, nombre } = route.params;
  const [loading, setLoading] = useState(true);
  const [subserviciosAgregados, setSubserviciosAgregados] = useState([]);
  const [subserviciosDisponibles, setSubserviciosDisponibles] = useState([]);
  const [idsolverservicio, setIdSolverservicio] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
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
        // 1. Obtener el idsolverservicio para este servicio
        const resSolverServicio = await fetch(`https://solvy-app-api.vercel.app/sol/solverservicio/${idsolver}?idservicio=${idservicio}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const solverServicioData = await resSolverServicio.json();
        let idsolverservicio = null;
        if (Array.isArray(solverServicioData) && solverServicioData.length > 0) {
          idsolverservicio = solverServicioData[0].idsolverservicio;
        } else if (solverServicioData?.idsolverservicio) {
          idsolverservicio = solverServicioData.idsolverservicio;
        }
        setIdSolverservicio(idsolverservicio);

        // 2. Subservicios ya agregados
        const resAgregados = await fetch(`https://solvy-app-api.vercel.app/sol/solverservicio/subservicios/${idsolverservicio}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const agregados = await resAgregados.json();
        setSubserviciosAgregados(Array.isArray(agregados) ? agregados : []);

        // 3. Todos los subservicios del servicio
        const resTodos = await fetch(`https://solvy-app-api.vercel.app/ser/${idservicio}/subservicios`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const todos = await resTodos.json();

        // 4. Filtrar los que NO están agregados
        const agregadosIds = new Set((agregados || []).map(s => s.idsubservicio));
        const disponibles = (todos || []).filter(s => !agregadosIds.has(s.idsubservicio));
        setSubserviciosDisponibles(disponibles);
      } catch (e) {
        setSubserviciosAgregados([]);
        setSubserviciosDisponibles([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [idservicio]);

  async function handleAgregarSubservicio(idsubservicio) {
    if (!idsolverservicio || !idsubservicio) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('https://solvy-app-api.vercel.app/sol/solverservicio/subservicio', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ idsolverservicio, idsubservicio })
      });
      const text = await res.text();
      if (res.ok) {
        Alert.alert('¡Listo!', 'Subservicio agregado.');
        setSubserviciosDisponibles(subserviciosDisponibles.filter(s => s.idsubservicio !== idsubservicio));
        setSubserviciosAgregados([
          ...subserviciosAgregados,
          subserviciosDisponibles.find(s => s.idsubservicio === idsubservicio)
        ]);
      } else {
        Alert.alert('Error', 'No se pudo agregar el subservicio.\n' + text);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  }

  function ServicioLogo({ idlogosapp }) {
    const [iconData, setIconData] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
      let mounted = true;
      setIconData(null);
      setError(false);
      if (!idlogosapp) {
        setError(true);
        return;
      }
      fetch(`https://solvy-app-api.vercel.app/logos/logo/${idlogosapp}`)
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
    }, [idlogosapp]);

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
      <Text style={styles.title}>{nombre}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007cc0" style={{ marginTop: 40 }} />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Subservicios que ya ofrecés</Text>
          <FlatList
            data={subserviciosAgregados}
            keyExtractor={item => item.idsubservicio?.toString()}
            renderItem={({ item }) => (
              <View style={styles.servicioItem}>
                <LinearGradient colors={['#007cc0', '#003f5c']} style={styles.iconoServicio}>
                  <ServicioLogo idlogosapp={item.idlogosapp} />
                </LinearGradient>
                <Text style={styles.servicioText}>{item.nombre}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginBottom: 20 }}>No tenés subservicios agregados.</Text>}
          />
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Agregar subservicios</Text>
          <FlatList
            data={subserviciosDisponibles}
            keyExtractor={item => item.idsubservicio?.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.servicioItem} onPress={() => handleAgregarSubservicio(item.idsubservicio)}>
                <LinearGradient colors={['#007cc0', '#003f5c']} style={styles.iconoServicio}>
                  <ServicioLogo idlogosapp={item.idlogosapp} />
                </LinearGradient>
                <Text style={styles.servicioText}>{item.nombre}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginBottom: 20 }}>No hay subservicios para agregar.</Text>}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 12, color: '#007cc0' },
  divider: {
    height: 2,
    backgroundColor: '#007cc0',
    marginVertical: 18,
    borderRadius: 2,
    opacity: 0.2,
  },
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