import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, SafeAreaView, Image, Button, TouchableOpacity, Alert, TextInput} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';



export default function Registrarse() {
  const fondo = require('../../assets/Fondo-de-pantalla.png');
  const logo = require('../../assets/Logo.png');
  const fondoBoton = require('../../assets/Fondo-boton.png')

  const navigation = useNavigation()

  return (
    <SafeAreaView style={styles.SafeArea}>
      <StatusBar style="dark" backgroundColor="#eeda9d" />
      <ImageBackground source={fondo} resizeMode="cover" style={styles.backgroundImage}>
      <View style={styles.container}>
        <Image source={logo} style={styles.ImagenLogo}/>
        <Text style={styles.tituloLogin}>Registrarse</Text>
      </View>
      <View style={styles.container2}>
        <View style={styles.textInput}>
            <TextInput style={styles.textInput .input} placeholder='Ingrese su Nombre'/>
        </View>
        <View style={styles.textInput}>
            <TextInput style={styles.textInput .input} placeholder='Ingrese su Apellido'/>
        </View>
        <View style={styles.textInput}>
            <TextInput style={styles.textInput .input} placeholder='Ingrese su Nombre de Usuario'/>
        </View>
        <View style={styles.textInput}>
            <TextInput style={styles.textInput .input} placeholder='Ingrese su Email'/>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Registrarse2')} style={styles.botonContenedor}>
          <ImageBackground source={fondoBoton} style={styles.botonLogin} imageStyle={styles.botonImagen}>
            <View style={styles.botonContenido}>
              <Text style={styles.botonTexto}>Siguiente</Text>
              <MaterialIcons name="forward" size={24} color="white" style={{ marginLeft: 8 }} />
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
      <View style={styles.container3}>
        <View style={styles.horizontalLine} />
          <Text style={styles.subtituloLogin}>Registrarse con:</Text>
        <View style={styles.containerLogos}>
          <TouchableOpacity onPress={() => console.log('Google')}>
              <AntDesign name="google" size={28} color="white" style={styles.LogosLogin} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log("Facebook")}>
          <FontAwesome5 name="facebook-f" size={28} color="white" style={styles.LogosLogin} />        
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log("Linkedin")}>
          <Entypo name="linkedin" size={28} color="white" style={styles.LogosLogin} />
          </TouchableOpacity>
        </View>
      </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  SafeArea:{
    flex: 1 
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: '25%',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-start',
    opacity: 0.8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 1,
    borderWidth: 2,
    borderColor: 'white',
  },
  tituloLogin: {
    fontSize: 40,
    fontWeight: 500,
    color: 'white',
    marginTop: '5%', 
    alignItems: 'center'
  },
  subtituloLogin: {
    fontSize: 25,
    fontWeight: 500,
    color: 'white',
    paddingHorizontal: 30
  },
  container2: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: '15%',
    margin: '10%',
    marginBottom: '15%',
  },
  ImagenLogo: {
    alignItems: 'center',
  },

  horizontalLine: {
    borderTopWidth: 1,
    borderStyle: 'solid',
    borderColor: 'white',
    width: '90%',
    marginVertical: '5%',
  },
  
  botonLogin: {
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    marginTop: 10,
    borderRadius: 30,
  },
  
  botonImagen: {
    borderRadius: 30,
  },
  
  botonTexto: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },

  container3: {
    flex: 1,
    marginBottom: '15%',
    marginTop: '25%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  link: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    alignItems: 'center',
    textDecorationLine: 'underline',
    marginBottom: '10%'
  },  
  containerLogos: {
    flexDirection: 'row',
  },
  LogosLogin:
  {
    marginHorizontal: 5,
    paddingHorizontal: 10,
    alignItems:'center',
    marginTop:15
  },
  textInput: {
    backgroundColor: 'white',
    marginTop: '5%',
    opacity: 0.9,
    borderRadius: 8,
    paddingVertical: 5,
    width: '90%',
    input: {
    paddingVertical: 8,
      paddingLeft: '3%',
    },
  },
  botonContenido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  botonContenedor: {
    width: '90%',        
    alignItems: 'flex-end',
  },
});