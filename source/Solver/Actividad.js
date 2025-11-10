import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { formatDate } from '../utils/formatDate';

const TABS = [
  { key: 'actividad', label: 'Actividad' },
  { key: 'estadisticas', label: 'Estadísticas' }
];

// Pantalla de actividad para Solver: muestra servicios realizados y permite "repetir"
export default function SolverActividad({ navigation }) {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombresSubservicio, setNombresSubservicio] = useState({});
  const [logosSubservicio, setLogosSubservicio] = useState({});

  useEffect(() => {
    const fetchActividadesSolver = async () => {
      setLoading(true);
      try {
        const usuarioStr = await AsyncStorage.getItem('usuario');
        const token = await AsyncStorage.getItem('token');
        let idsolver = null;
        if (usuarioStr) {
          try {
            const usuarioObj = JSON.parse(usuarioStr);
            idsolver = usuarioObj?.profile?.user?.idsolver || usuarioObj?.profile?.idsolver || usuarioObj?.user?.idsolver || usuarioObj?.idsolver || null;
          } catch (e) {
            idsolver = null;
          }
        }
        if (!idsolver) {
          setActividades([]);
          setLoading(false);
          return;
        }

        // Intentamos obtener las actividades del solver desde la API REST
        const res = await fetch(`https://solvy-app-api.vercel.app/sol/actividades/${idsolver}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          setActividades([]);
          setLoading(false);
          return;
        }
  const data = await res.json();
  const all = Array.isArray(data) ? data : [];
  // Mostrar solo actividades finalizadas (o que tienen fecha de servicio)
  const finished = all.filter(item => item.estado === 'finalizada' || item.fechaservicio);
  setActividades(finished);

        // Obtener nombres y logos para cada subservicio
        const nombres = {};
        const logos = {};
        await Promise.all((Array.isArray(data) ? data : []).map(async (item) => {
          if (item.idsubservicio) {
            try {
              const r = await fetch(`https://solvy-app-api.vercel.app/ser/nombresubservicio/${item.idsubservicio}`, {
                method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
              });
              if (r.ok) {
                const nameData = await r.json();
                nombres[item.idsubservicio] = nameData.nombre || nameData.nombresubservicio || '';
                logos[item.idsubservicio] = nameData.idlogo || null;
              }
            } catch (e) {
              nombres[item.idsubservicio] = '';
              logos[item.idsubservicio] = null;
            }
          }
        }));
        setNombresSubservicio(nombres);
        setLogosSubservicio(logos);
      } catch (e) {
        setActividades([]);
      }
      setLoading(false);
    };
    fetchActividadesSolver();
  }, []);

  // Nota: acción "Repetir" eliminada por solicitud del usuario.

  const renderItem = ({ item }) => {
    const nombre = nombresSubservicio[item.idsubservicio] || item.nombre_subservicio || 'Servicio';
    const rawFecha = item.fechaservicio || item.fechasolicitud || '';
    const fecha = formatDate(rawFecha, { withTime: false });
    const hora = item.horainicial || '';
    const horaFormateada = (() => {
      if (!hora) return '';
      const d = new Date(hora);
      if (!isNaN(d.getTime())) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const m = hora.match(/T(\d{2}:\d{2})/);
      return m ? m[1] : hora;
    })();
    const monto = item.monto || '';
    return (
      <View style={styles.card}>
        <View style={styles.left}>
          <View style={styles.iconPlaceholder}>
            <FontAwesome name="wrench" size={28} color="#fff" />
          </View>
        </View>
        <View style={styles.center}>
          <Text style={styles.title}>{nombre}</Text>
          <Text style={styles.meta}>{fecha}{horaFormateada ? ` - ${horaFormateada}` : ''}</Text>
          <Text style={styles.meta}>${monto}</Text>
        </View>
      </View>
    );
  };

  const [tab, setTab] = useState('actividad');

  const getHoraMinutos = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      const match = timestamp.match(/T(\d{2}:\d{2})/);
      return match ? match[1] : '';
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Estadísticas: últimos 30 días
  const actividadesUltimoMes = actividades.filter(item => {
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
        const dayKey = f.toISOString().slice(0, 10); // YYYY-MM-DD
        serviciosPorDia[dayKey] = (serviciosPorDia[dayKey] || 0) + 1;
      }
    }
  });

  const totalGanado = actividadesUltimoMes.reduce((acc, item) => {
    let monto = parseFloat(item.monto);
    if (isNaN(monto)) monto = 0;
    return acc + monto;
  }, 0);

  const chartWidth = Math.min(Dimensions.get('window').width - 40, 400);

  const pieData = Object.keys(serviciosPorTipo).map((key, idx) => ({
    name: key,
    count: serviciosPorTipo[key],
    color: ['#003f5c', '#58508d', '#bc5090', '#ff6361', '#ffa600'][idx % 5],
    legendFontColor: '#333',
    legendFontSize: 13
  }));

  const barLabels = Object.keys(serviciosPorDia).sort();
  const barData = barLabels.map(fecha => serviciosPorDia[fecha]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Actividad</Text>
      <View style={styles.tabsContainer}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'actividad' ? (
        loading ? (
          <ActivityIndicator size="large" color="#007cc0" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={actividades}
            keyExtractor={item => item.idactividad?.toString() || item.idsolicitud?.toString() || Math.random().toString()}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30 }}>No hay actividades registradas.</Text>}
            contentContainerStyle={styles.listContent}
          />
        )
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.titulo}>Estadísticas (últimos 30 días)</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#007cc0" style={{ marginTop: 20 }} />
          ) : actividadesUltimoMes.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 30 }}>No hay datos para mostrar.</Text>
          ) : (
            <View>
              <Text style={styles.statsTitle}>Servicios realizados por tipo</Text>
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

              <Text style={styles.statsTitle}>Servicios por día</Text>
              <BarChart
                data={{ labels: barLabels.map(f => f.slice(5)), datasets: [{ data: barData }] }}
                width={chartWidth}
                height={180}
                yAxisLabel=""
                chartConfig={chartConfig}
                verticalLabelRotation={-30}
                fromZero
                showBarTops={false}
              />

              <Text style={styles.statsTitle}>Total ganado</Text>
              <View style={styles.gastoContainer}>
                <Text style={styles.gastoText}>${totalGanado.toFixed(2)}</Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 16, color: '#003f5c' },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#007cc0' },
  tabText: { color: '#888', fontWeight: 'bold', fontSize: 15 },
  tabTextActive: { color: '#007cc0' },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 12 },
  card: { flexDirection: 'row', backgroundColor: '#e9f4fb', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  left: { width: 60, alignItems: 'center', justifyContent: 'center' },
  iconPlaceholder: { width: 54, height: 54, borderRadius: 8, backgroundColor: '#007cc0', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, paddingHorizontal: 10 },
  title: { fontSize: 16, fontWeight: '700', color: '#003f5c' },
  meta: { color: '#333', fontSize: 13, marginTop: 4 },
  // right and repeat styles removed (no repetir button)
  scrollContainer: { paddingBottom: 100, paddingHorizontal: 20 },
  statsTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 18, marginBottom: 8, textAlign: 'center', color: '#003f5c' },
  gastoContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  gastoText: { fontSize: 28, fontWeight: 'bold', color: '#007cc0' },
  listContent: { paddingBottom: 40 },
});

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(0, 63, 92, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  decimalPlaces: 0,
  style: { borderRadius: 16 },
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#ffa726' }
};