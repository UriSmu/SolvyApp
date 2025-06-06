import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, SafeAreaView, Image, Button, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';


export default function Login() {
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
        <Text style={styles.tituloLogin}>Bienvenido</Text>
      </View>
      <View style={styles.container2}>
    <TouchableOpacity onPress={() => navigation.navigate('IniciarComoSolver')}>
  <ImageBackground source={fondoBoton} style={styles.botonLogin} imageStyle={styles.botonImagen}>
    <Text style={styles.botonTexto}>Iniciar como Solver</Text>
  </ImageBackground>
</TouchableOpacity>

        <View style={styles.horizontalLine} />
        <TouchableOpacity onPress={() => navigation.navigate('IniciarComoCliente')}> 
  <ImageBackground source={fondoBoton} style={styles.botonLogin} imageStyle={styles.botonImagen}>
    <Text style={styles.botonTexto}>Iniciar como Cliente</Text>
  </ImageBackground>
</TouchableOpacity>
      </View>
      <View style={styles.container3}>
        <Text style={styles.link} href='#'>Explorar Solvy</Text>
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
  container2: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: '40%',
    paddingBottom: '20%',
    margin: '10%'
  },
  ImagenLogo: {
    alignItems: 'center',
  },

  horizontalLine: {
    borderTopWidth: 1,
    borderStyle: 'solid',
    borderColor: 'white',
    width: '90%',
    marginVertical: '5%'
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
    flex: 1,
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
  
});