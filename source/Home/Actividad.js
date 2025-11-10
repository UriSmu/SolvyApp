import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { formatDate } from '../utils/formatDate';

const TABS = [
  { key: 'actividad', label: 'Actividad' },
  { key: 'estadisticas', label: 'Estadísticas' }
];

// Componente para mostrar el logo del subservicio (igual que Subservicios.js)
function SubservicioLogo({ idlogo }) {
  const [iconData, setIconData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIconData(null);
    setError(false);
    if (!idlogo) {
      setError(true);
      return;
    }
    fetch(`https://solvy-app-api.vercel.app/logos/logo/${idlogo}`)
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
  }, [idlogo]);

  if (error || !iconData) {
    return <FontAwesome5 name="question" size={40} color="#003f5c" />;
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
      size={iconData.icon_size ? Math.max(Number(iconData.icon_size), 40) : 40}
      color={iconData.icon_color || '#003f5c'}
      style={{ textAlign: 'center', textAlignVertical: 'center' }}
    />
  );
}

// Traduce coordenadas a dirección si corresponde
async function getDireccionTitle(item) {
  let direccion = item.direccion_servicio;
  if (typeof direccion === 'string' && direccion.startsWith('{') && direccion.endsWith('}')) {
    try {
      direccion = JSON.parse(direccion);
    } catch {}
  }
  if (
    direccion === 'Tu ubicación actual' ||
    (typeof direccion === 'object' && direccion.title === 'Tu ubicación actual')
  ) {
    let lat, lon;
    if (typeof direccion === 'object') {
      lat = direccion.latitude;
      lon = direccion.longitude;
    } else if (typeof direccion === 'string' && direccion.includes(',')) {
      [lat, lon] = direccion.split(',').map(Number);
    }
    if (lat && lon) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await res.json();
        return data.display_name || `${lat},${lon}`;
      } catch {
        return `${lat},${lon}`;
      }
    }
    return 'Tu ubicación actual';
  }
  if (typeof direccion === 'object' && direccion.title) {
    return direccion.title;
  }
  return typeof direccion === 'string' ? direccion : '';
}

// Componente para cada actividad (soluciona el error de hooks)
function ActividadItem({ item, nombre, idlogo, getHoraMinutos }) {
  const [direccion, setDireccion] = useState('');
  useEffect(() => {
    let mounted = true;
    getDireccionTitle(item).then(title => { if (mounted) setDireccion(title); });
    return () => { mounted = false; };
  }, [item.direccion_servicio]);

  // Mostrar fecha: usar fechaservicio, si no existe usar fechasolicitud
  const rawFecha = item.fechaservicio || item.fechasolicitud || '';
  const fechaMostrar = formatDate(rawFecha, { withTime: false });

  return (
    <View style={styles.card}>
      <View style={styles.cardImageContainer}>
        <SubservicioLogo idlogo={idlogo} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.title}>
          {nombre || 'Servicio'}
        </Text>
        <Text style={styles.address}>{direccion}</Text>
        <View style={styles.dateTimeRow}>
          <Text style={styles.date}>{fechaMostrar}</Text>
          <Text style={styles.time}>{getHoraMinutos(item.horainicial)}</Text>
        </View>
        <Text style={styles.price}>{item.monto}</Text>
      </View>
      <TouchableOpacity style={styles.repeatButton}>
        <FontAwesome name="repeat" size={24} color="#003f5c" />
        <Text style={styles.repeatText}>Repetir</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ActividadScreen() {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombresSubservicio, setNombresSubservicio] = useState({});
  const [logosSubservicio, setLogosSubservicio] = useState({});
  const [idCliente, setIdCliente] = useState(null);
  const [tab, setTab] = useState('actividad');

  useEffect(() => {
    const cargarIdCliente = async () => {
      try {
        const usuarioStr = await AsyncStorage.getItem('usuario');
        if (usuarioStr) {
          const usuarioObj = JSON.parse(usuarioStr);
          const id = usuarioObj?.profile?.user?.idcliente;
          setIdCliente(id);
        } else {
          setIdCliente(null);
        }
      } catch (e) {
        setIdCliente(null);
      }
    };
    cargarIdCliente();
  }, []);

  useEffect(() => {
    const fetchActividades = async () => {
      setLoading(true);
      try {
        if (!idCliente) {
          setActividades([]);
          setLoading(false);
          return;
        }
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`https://solvy-app-api.vercel.app/cli/actividades/${idCliente}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (response.ok) {
          const data = await response.json();
          setActividades(data);

          const nombres = {};
          const logos = {};
          await Promise.all(
            data.map(async (item) => {
              if (item.idsubservicio) {
                try {
                  const res = await fetch(`https://solvy-app-api.vercel.app/ser/nombresubservicio/${item.idsubservicio}`, {
                    method: "GET",
                    headers: {
                      "Authorization": `Bearer ${token}`,
                      "Content-Type": "application/json"
                    }
                  });
                  if (res.ok) {
                    const nombreData = await res.json();
                    nombres[item.idsubservicio] = nombreData.nombre || nombreData.nombresubservicio || '';
                    logos[item.idsubservicio] = nombreData.idlogo || null;
                  }
                } catch (e) {
                  nombres[item.idsubservicio] = '';
                  logos[item.idsubservicio] = null;
                }
              }
            })
          );
          setNombresSubservicio(nombres);
          setLogosSubservicio(logos);
        } else {
          setActividades([]);
        }
      } catch (e) {
        setActividades([]);
      }
      setLoading(false);
    };
    if (idCliente) fetchActividades();
  }, [idCliente]);

  const getHoraMinutos = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      const match = timestamp.match(/T(\d{2}:\d{2})/);
      return match ? match[1] : '';
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ARREGLO: considerar fechasolicitud si fechaservicio es null
  const actividadesUltimoMes = actividades.filter(item => {
    // Usar fechaservicio si existe, sino fechasolicitud
    const fechaStr = item.fechaservicio || item.fechasolicitud;
    if (!fechaStr) return false;
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return false;
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hoy.getDate() - 30);
    return fecha >= hace30 && fecha <= hoy;
  });

  const serviciosPorTipo = {};
  actividadesUltimoMes.forEach(item => {
    const nombre = nombresSubservicio[item.idsubservicio] || 'Servicio';
    serviciosPorTipo[nombre] = (serviciosPorTipo[nombre] || 0) + 1;
  });

  const serviciosPorDia = {};
  actividadesUltimoMes.forEach(item => {
    const fechaStr = item.fechaservicio || item.fechasolicitud;
    if (fechaStr) {
      const f = new Date(fechaStr);
      if (!isNaN(f.getTime())) {
        const dayKey = f.toISOString().slice(0, 10);
        serviciosPorDia[dayKey] = (serviciosPorDia[dayKey] || 0) + 1;
      }
    }
  });

  const totalGastado = actividadesUltimoMes.reduce((acc, item) => {
    let monto = parseFloat(item.monto);
    if (isNaN(monto)) monto = 0;
    return acc + monto;
  }, 0);

  const chartWidth = Math.min(Dimensions.get('window').width - 40, 400);

  const pieData = Object.keys(serviciosPorTipo).map((key, idx) => ({
    name: key,
    count: serviciosPorTipo[key],
    color: ['#003f5c', '#58508d', '#bc5090', '#ff6361', '#ffa600'][idx % 5],
    legendFontColor: "#333",
    legendFontSize: 13
  }));

  const barLabels = Object.keys(serviciosPorDia).sort();
  const barData = barLabels.map(fecha => serviciosPorDia[fecha]);

  return (
    <View style={styles.todo}>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <View style={styles.tabsContainer}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, tab === t.key && styles.tabActive]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {tab === 'actividad' ? (
  <>
    <Text style={styles.titulo}>Actividad</Text>
    {loading ? (
      <ActivityIndicator size="large" color="#007cc0" />
    ) : (
      <FlatList
        data={actividades}
        renderItem={({ item }) => (
          <ActividadItem
            item={item}
            nombre={nombresSubservicio[item.idsubservicio]}
            idlogo={logosSubservicio[item.idsubservicio]}
            getHoraMinutos={getHoraMinutos}
          />
        )}
        keyExtractor={item => item.idsolicitud?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30 }}>No hay actividades.</Text>}
      />
    )}
  </>
) : (
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    <Text style={styles.titulo}>Estadísticas (últimos 30 días)</Text>
    {loading ? (
      <ActivityIndicator size="large" color="#007cc0" />
    ) : actividadesUltimoMes.length === 0 ? (
      <Text style={{ textAlign: 'center', marginTop: 30 }}>No hay datos para mostrar.</Text>
    ) : (
      <View>
        <Text style={styles.statsTitle}>Servicios pedidos por tipo</Text>
        <PieChart
          data={pieData}
          width={chartWidth}
          height={180}
          chartConfig={chartConfig}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="10"
          absolute
        />
        <Text style={styles.statsTitle}>Servicios pedidos por día</Text>
        <BarChart
          data={{
            labels: barLabels.map(f => f.slice(5)),
            datasets: [{ data: barData }]
          }}
          width={chartWidth}
          height={180}
          yAxisLabel=""
          chartConfig={chartConfig}
          verticalLabelRotation={-30}
          fromZero
          showBarTops={false}
        />
        <Text style={styles.statsTitle}>Total gastado en servicios</Text>
        <View style={styles.gastoContainer}>
          <FontAwesome5 name="money-bill-wave" size={28} color="#007cc0" />
          <Text style={styles.gastoText}>${totalGastado.toFixed(2)}</Text>
        </View>
      </View>
      )}
    </ScrollView>
    )}
      </View>
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 63, 92, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  decimalPlaces: 0,
  style: { borderRadius: 16 },
  propsForDots: { r: "4", strokeWidth: "2", stroke: "#ffa726" }
};

const styles = StyleSheet.create({
  todo: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007cc0',
  },
  tabText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#007cc0',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#007cc0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  cardImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#003f5c',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  address: {
    color: 'white',
    fontSize: 12,
    fontStyle: 'italic',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  date: {
    color: 'white',
    marginRight: 10,
    fontSize: 12,
  },
  time: {
    color: 'white',
    fontSize: 12,
  },
  price: {
    color: 'white',
    marginTop: 4,
    fontWeight: 'bold',
  },
  repeatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#005a9c',
    borderRadius: 6,
  },
  repeatText: {
    color: '#003f5c',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
    color: '#003f5c',
  },
  gastoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  gastoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007cc0',
    marginLeft: 10,
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
  footerImagenes: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 40,
  },
});