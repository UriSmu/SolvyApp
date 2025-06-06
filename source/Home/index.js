import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ImageBackground } from 'react-native-web';



export default function Home() {
  const fondoServicios = require('../../assets/Fondo-servicios.png')
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.logoText}>LOGO</Text>
          <Text style={styles.iconoPerfil}>PERFIL</Text>
        </View>

        {/* Saludo */}
        <Text style={styles.titulo}>¡Hola, (NOMBRE)!</Text>

        {/* Servicios recientes */}
        <TouchableOpacity style={styles.botonReciente}>
          <Text style={styles.textoReciente}>(Servicios favoritos/recientes)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botonReciente}>
          <Text style={styles.textoReciente}>(Servicios favoritos/recientes)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botonReciente}>
          <Text style={styles.textoReciente}>(Servicios favoritos/recientes)</Text>
        </TouchableOpacity>

        {/* Título servicios recomendados */}
        <Text style={styles.subtitulo}>Servicios recomendados</Text>

        {/* Servicios recomendados */}
        <View style={styles.filaServicios}>
          <View style={styles.servicio}>
            <ImageBackground source={fondoServicios}>
              <View style={styles.iconoServicio}><Text style={styles.iconoTexto}><FontAwesome6 name="fire-burner" size={50} color="white" /></Text></View>
            </ImageBackground>
            <Text style={styles.nombreServicio}>Gasista</Text>
          </View>
          <View style={styles.servicio}>
            <View style={styles.iconoServicio}><Text style={styles.iconoTexto}><MaterialCommunityIcons name="chef-hat" size={50} color="white" /></Text></View>
            <Text style={styles.nombreServicio}>Cocina</Text>
          </View>
          <View style={styles.servicio}>
            <View style={styles.iconoServicio}><Text style={styles.iconoTexto}><FontAwesome6 name="broom" size={50} color="white" /></Text></View>
            <Text style={styles.nombreServicio}>Limpieza</Text>
          </View>
        </View>

        <View style={styles.filaServicios}>
          <View style={styles.servicio}>
            <View style={styles.iconoServicio}><Text style={styles.iconoTexto}><MaterialIcons name="local-car-wash" size={50} color="white" /></Text></View>
            <Text style={styles.nombreServicio}>Lavado de auto</Text>
          </View>
          <View style={styles.servicio}>
            <View style={styles.iconoServicio}><Text style={styles.iconoTexto}><MaterialIcons name="electrical-services" size={50} color="white" /></Text></View>
            <Text style={styles.nombreServicio}>Electricista</Text>
          </View>
          <View style={styles.servicio}>
            <View style={styles.iconoServicio}><Text style={styles.iconoTexto}><FontAwesome6 name="truck-moving" size={50} color="white" /></Text></View>
            <Text style={styles.nombreServicio}>Mudancero</Text>
          </View>
        </View>
      </ScrollView>

      {/* Menú inferior */}
      <View style={styles.menuInferior}>
        <Text style={styles.menuItem}>🏠 Home</Text>
        <Text style={styles.menuItem}>👷 Servicios</Text>
        <Text style={styles.menuItem}>🛒 Productos</Text>
        <Text style={styles.menuItem}>📊 Actividad</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 20, paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoText: { fontSize: 18, fontWeight: 'bold' },
  iconoPerfil: { fontSize: 24 },
  titulo: { fontSize: 26, fontWeight: 'bold', marginVertical: 20 },
  botonReciente: {
    backgroundColor: '#007cc0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  textoReciente: { color: '#fff', fontStyle: 'italic', textAlign: 'center' },
  subtitulo: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, marginBottom: 30},
  filaServicios: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    
  },
  servicio: {
    width: '30%',
    alignItems: 'center',
    
  },
  iconoServicio: {
    backgroundColor: '#007cc0',
    width: 90,
    height: 90, 
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  
  iconoTexto: { fontSize: 24, color: '#fff' },
  nombreServicio: { textAlign: 'center', fontSize: 12 },
  menuInferior: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#007cc0',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  menuItem: { color: '#fff', fontWeight: 'bold' },
});
