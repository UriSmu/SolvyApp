import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, SafeAreaView, Image, Button, TouchableOpacity, Alert, TextInput} from 'react-native';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';



export default function Registrarse() {
  const fondo = require('../../assets/Fondo-de-pantalla.png');
  const logo = require('../../assets/Logo.png');
  const fondoBoton = require('../../assets/Fondo-boton.png')

  const onPress = (obj) => {
    console.log(`Se quiere iniciar con ${obj}`)
  }
  
    const router = useRouter();
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
        <TouchableOpacity onPress={() => onPress("Usuario")}>
        <ImageBackground source={fondoBoton} style={styles.botonLogin} imageStyle={styles.botonImagen}>
            <Text style={styles.botonTexto}>Registrarse</Text>
        </ImageBackground>
        </TouchableOpacity>
      </View>
      <View style={styles.container3}>
        <View style={styles.horizontalLine} />
          <Text style={styles.subtituloLogin}>Registrarse con:</Text>
        <View style={styles.containerLogos}>
          <TouchableOpacity onPress={() => onPress("Google")}>
              <AntDesign name="google" color="white" style={styles.LogosLogin} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onPress("Facebook")}>
            <AntDesign name="facebook-square" size={24} color="white" style={styles.LogosLogin} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onPress("Linkedin")}>
            <AntDesign name="linkedin-square" size={24} color="white" style={styles.LogosLogin}/>
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
    marginTop: '2%'
  },
  subtituloLogin: {
    fontSize: 25,
    fontWeight: 500,
    color: 'white',
    marginTop: '2%',
    marginBottom: '2%'
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
  },
  textInput: {
    backgroundColor: 'white',
    marginTop: '5%',
    opacity: 0.9,
    borderRadius: 8,
    paddingVertical: 5,
    width: '100%',
    input: {
    paddingVertical: 8
    },
  },
  
});