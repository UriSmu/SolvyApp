  import { StatusBar } from 'expo-status-bar';
  import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
  import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
  import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
  import MaterialIcons from '@expo/vector-icons/MaterialIcons';
  import { ImageBackground } from 'react-native-web';
  import { LinearGradient } from 'expo-linear-gradient';
  import Entypo from '@expo/vector-icons/Entypo';
  import Fontisto from '@expo/vector-icons/Fontisto';
  import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
  import FontAwesome from '@expo/vector-icons/FontAwesome';

  import { useUserProfile } from '../context/UserProfileContext';


export default function Home({ navigation }) {
    //const fondoServicios = require('../../assets/Fondo-servicios.png')
    const { profile } = useUserProfile();
    return (
      <View style={styles.todo}>
        <StatusBar style="auto" />
        <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Encabezado */}

          {/* Saludo */}
          <Text style={styles.titulo}>
            ¡Hola, {profile && profile.nombre ? profile.nombre : 'Usuario'}!
          </Text>

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
             <TouchableOpacity style={styles.botonServicios}>
            <LinearGradient colors={['#007cc0', '#003f5c']} style={styles.iconoServicio}>
              <FontAwesome6 name="fire-burner" size={50} color="white" />
            </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.nombreServicio}>Gasista</Text>
          </View>


         

          <View style={styles.servicio}>
          <TouchableOpacity style={styles.botonServicios}>
            <LinearGradient colors={['#007cc0', '#003f5c']} style={styles.iconoServicio}>
              <MaterialCommunityIcons name="chef-hat" size={50} color="white" />
            </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.nombreServicio}>Cocina</Text>
          </View>

          <View style={styles.servicio}>
          <TouchableOpacity style={styles.botonServicios}>
            <LinearGradient colors={['#007cc0', '#003f5c']} style={styles.iconoServicio}>
              <FontAwesome6 name="broom" size={50} color="white" />
            </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.nombreServicio}>Limpieza</Text>
          </View>
        </View>


        <View style={styles.filaServicios}>
        <View style={styles.servicio}>
        <TouchableOpacity style={styles.botonServicios}>
          <LinearGradient colors={['#007cc0', '#003f5c']} style={styles.iconoServicio}>
            <MaterialIcons name="local-car-wash" size={50} color="white" />
          </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.nombreServicio}>Lavado de auto</Text>
        </View>

        <View style={styles.servicio}>
        <TouchableOpacity style={styles.botonServicios}>
          <LinearGradient colors={['#007cc0', '#003f5c']} style={styles.iconoServicio}>
            <MaterialIcons name="electrical-services" size={50} color="white" />
          </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.nombreServicio}>Electricista</Text>
        </View>

        <View style={styles.servicio}>
        <TouchableOpacity style={styles.botonServicios}>
          <LinearGradient colors={['#007cc0', '#003f5c']} style={styles.iconoServicio}>
            <FontAwesome6 name="truck-moving" size={50} color="white" />
          </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.nombreServicio}>Mudancero</Text>
        </View>
      </View>
      
      <View style={styles.filaBoton}>
    <TouchableOpacity style={styles.botonMasServicios} onPress={() => navigation.navigate('Servicios')}>
      <Text style={styles.textoBotonMasServicios}>Más servicios</Text>
    </TouchableOpacity>
     </View>
     </ScrollView>
     </View>
      </View>
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
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      logoText: { 
        fontSize: 18, 
        fontWeight: 'bold' 
      },
      iconoPerfil: { 
        fontSize: 30 
      },
      titulo: { 
        fontSize: 26, 
        fontWeight: 'bold', 
        marginVertical: 20 
      },
      botonReciente: {
        backgroundColor: '#007cc0',
        padding: 12,
        borderRadius: 10,
        marginBottom: 20,
      },
      textoReciente: { 
        color: '#fff', 
        fontStyle: 'italic', 
        opacity: 75 
      },
      subtitulo: { 
        fontSize: 30, 
        fontWeight: 'bold', 
        marginTop: 20, 
        marginBottom: 20, 
        textAlign: 'center'
      },
      filaServicios: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
      },
      servicio: {
        width: 30,
        alignItems: 'center',
      },
      iconoServicio: {
        backgroundColor: '#007cc0',
        width: 95,
        height: 95, 
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
      },
      iconoTexto: { 
        fontSize: 30, 
        color: '#fff' 
      },
      nombreServicio: { 
        textAlign: 'center', 
        fontSize: 13 ,
        fontWeight: '600'
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
      menuItem: { 
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 5,
        textAlign: 'center',
        fontSize: 12,
      },
      todo: {
        flex: 1,
        flexDirection: 'column'
      },
      footerImagenes:{
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
      },
      centrarFooter:{
        width: 40, height: 30, alignItems: 'center', justifyContent: 'center' 
      },
      contenedorBotonMasServicios: { 
        marginTop: 30,
        marginBottom: 100, // Más espacio con el footer
        alignItems: 'center',
        justifyContent: 'center',
      },
      filaBoton: {
        marginTop: 30,
        marginBottom: 100, // separación del footer
        alignItems: 'center',
        justifyContent: 'center',
      },
      
      botonMasServicios: {
        backgroundColor: '#007ACC',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
      
        // Sombra para iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      
        // Elevación para Android
        elevation: 6,
      
        // Animación visual de profundidad
        transform: [{ scale: 1 }],
      },
      
      textoBotonMasServicios: {
        color: 'white',
        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        textAlign: 'center',
      },
      
      
    })
    

