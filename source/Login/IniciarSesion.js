import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, SafeAreaView, Image, Button, TouchableOpacity, Alert, TextInput} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';



export default function IniciarSesion() {
  const fondo = require('../../assets/Fondo-de-pantalla.png');
  const logo = require('../../assets/Logo.png');
  const fondoBoton = require('../../assets/Fondo-boton.png')

  const navigation = useNavigation()
  const { login } = useAuth();

  return (
    <SafeAreaView style={styles.SafeArea}>
      <StatusBar style="dark" backgroundColor="#eeda9d" />
      <ImageBackground source={fondo} resizeMode="cover" style={styles.backgroundImage}>
      <View style={styles.container}>
        <Image source={logo} style={styles.ImagenLogo}/>
        <Text style={styles.tituloLogin}>Iniciar Sesión</Text>
      </View>
      <View style={styles.container2}>
      <View style={styles.textInput}>
            <TextInput style={styles.textInput.input} placeholder='Ingrese su DNI, Username, Mail o Teléfono'/>
        </View>
        <View style={styles.textInput}>
            <TextInput style={styles.textInput.input} placeholder='Ingrese su contraseña'/>
        </View>
        <TouchableOpacity onPress={() => login()}>
          <ImageBackground source={fondoBoton} style={styles.botonLogin} imageStyle={styles.botonImagen}>
            <Text style={styles.botonTexto}>Iniciar Sesion</Text>
          </ImageBackground>
        </TouchableOpacity>
      </View>
      <View style={styles.container3}>
      <View style={styles.horizontalLine} />
        <Text style={styles.subtituloLogin}>Iniciar Sesión con:</Text>
      <View style={styles.containerLogos}>
        <TouchableOpacity onPress={() => console.log("Google")}>
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
    marginTop: '30%',
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
    width: 250,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    marginTop: 10 
  },
  
  botonImagen: {
    resizeMode: 'stretch',
    borderRadius: 10,
  },
  
  botonTexto: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },

  container3: {
    flex: 3,
    marginBottom: '15%',
    marginTop: '20%',
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
});