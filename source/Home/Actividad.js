import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ActividadScreen() {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombresSubservicio, setNombresSubservicio] = useState({});
  const [idCliente, setIdCliente] = useState(null);

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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
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
        </ScrollView>
      </View>
    </View>
  );
}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconoPerfil: {
    fontSize: 30,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 20,
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