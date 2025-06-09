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


  export default function Home() {
    //const fondoServicios = require('../../assets/Fondo-servicios.png')
    return (
      <View style={styles.todo}>
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
      </ScrollView>
      </SafeAreaView>
      <TouchableOpacity style={styles.botonMasServicios}>
            <Text style={styles.textoMasServicios}>Mas servicios</Text>
      </TouchableOpacity>

  <View style={styles.footerContainer}>
  <View style={styles.menuInferior}>
    <View style={styles.footerImagenes}>  
    <View style={styles.centrarFooter}>
      <Entypo name="home" size={30} color="white" />
    </View>
      <Text style={styles.menuItem}>Home</Text>
    </View>
    <View style={styles.footerImagenes}>
    <View style={styles.centrarFooter}>
      <Fontisto name="person" size={30} color="white" />
    </View>
      <Text style={styles.menuItem}>Servicios</Text>
    </View>
    <View style={styles.footerImagenes}>
    <View style={styles.centrarFooter}>
      <FontAwesome5 name="shopping-cart" size={30} color="white" />
    </View>
      <Text style={styles.menuItem}>Productos</Text>
    </View>
    <View style={styles.footerImagenes}>
      <View style={styles.centrarFooter}>
        <FontAwesome name="list-ul" size={30} color="white" />    
      </View> 
      <Text style={styles.menuItem}>Actividad</Text>
    </View>
      </View>
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
        opacity: '75%' 
      },
      botonMasServicios: {
        backgroundColor: '#007cc0',
        padding: 12,
        borderRadius: 10,
        marginBottom: 50,
        marginHorizontal: '37.5%',
        width: 103,
      },
      textoMasServicios: { 
        color: '#fff', 
        fontStyle: 'italic', 
        opacity: '75%' 
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
        width: '30%',
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
      }
    })
    

