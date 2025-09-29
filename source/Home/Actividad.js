import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, PieChart } from 'react-native-chart-kit';

const TABS = [
  { key: 'actividad', label: 'Actividad' },
  { key: 'estadisticas', label: 'Estadísticas' }
];

export default function ActividadScreen() {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombresSubservicio, setNombresSubservicio] = useState({});
  const [idCliente, setIdCliente] = useState(null);
  const [tab, setTab] = useState('actividad');

  // Cargar idcliente desde AsyncStorage
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

  // Obtener actividades y nombres de subservicio
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

          // Obtener nombres de subservicio para cada actividad
          const nombres = {};
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
                  }
                } catch (e) {
                  nombres[item.idsubservicio] = '';
                }
              }
            })
          );
          setNombresSubservicio(nombres);
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

  // Función para extraer solo la hora y minutos de un timestamp
  const getHoraMinutos = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      const match = timestamp.match(/T(\d{2}:\d{2})/);
      return match ? match[1] : '';
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filtrar actividades de los últimos 30 días
  const actividadesUltimoMes = actividades.filter(item => {
    if (!item.fechaservicio) return false;
    const fecha = new Date(item.fechaservicio);
    if (isNaN(fecha.getTime())) return false;
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hoy.getDate() - 30);
    return fecha >= hace30 && fecha <= hoy;
  });

  // Estadísticas: servicios pedidos por tipo
  const serviciosPorTipo = {};
  actividadesUltimoMes.forEach(item => {
    const nombre = nombresSubservicio[item.idsubservicio] || 'Servicio';
    serviciosPorTipo[nombre] = (serviciosPorTipo[nombre] || 0) + 1;
  });

  // Estadísticas: servicios por día
  const serviciosPorDia = {};
  actividadesUltimoMes.forEach(item => {
    const fecha = item.fechaservicio;
    if (fecha) {
      serviciosPorDia[fecha] = (serviciosPorDia[fecha] || 0) + 1;
    }
  });

  // Estadísticas: plata gastada
  const totalGastado = actividadesUltimoMes.reduce((acc, item) => {
    let monto = parseFloat(item.monto);
    if (isNaN(monto)) monto = 0;
    return acc + monto;
  }, 0);

  // Preparar datos para gráficos
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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardImageContainer}>
        <FontAwesome5 name="chef-hat" size={40} color="#003f5c" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.title}>
          {nombresSubservicio[item.idsubservicio] || 'Servicio'}
        </Text>
        <Text style={styles.address}>{item.direccion_servicio}</Text>
        <View style={styles.dateTimeRow}>
          <Text style={styles.date}>{item.fechaservicio}</Text>
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

  return (
    <View style={styles.todo}>
      <StatusBar style="auto" />
      <View style={styles.container}>
        {/* Tabs */}
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
        {/* Contenido de la pestaña */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {tab === 'actividad' ? (
            <>
              <Text style={styles.titulo}>Actividad</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#007cc0" />
              ) : (
                <FlatList
                  data={actividades}
                  renderItem={renderItem}
                  keyExtractor={item => item.id?.toString() || Math.random().toString()}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30 }}>No hay actividades.</Text>}
                />
              )}
            </>
          ) : (
            <>
              <Text style={styles.titulo}>Estadísticas (últimos 30 días)</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#007cc0" />
              ) : actividadesUltimoMes.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 30 }}>No hay datos para mostrar.</Text>
              ) : (
                <View>
                  {/* Pie Chart: Servicios pedidos por tipo */}
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
                  {/* Bar Chart: Servicios por día */}
                  <Text style={styles.statsTitle}>Servicios pedidos por día</Text>
                  <BarChart
                    data={{
                      labels: barLabels.map(f => f.slice(5)), // MM-DD
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
                  {/* Total gastado */}
                  <Text style={styles.statsTitle}>Total gastado en servicios</Text>
                  <View style={styles.gastoContainer}>
                    <FontAwesome5 name="money-bill-wave" size={28} color="#007cc0" />
                    <Text style={styles.gastoText}>${totalGastado.toFixed(2)}</Text>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
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
});