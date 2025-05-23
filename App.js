import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, SafeAreaView, Image, Button } from 'react-native';

export default function App() {
  const fondo = require('./assets/Fondo-de-pantalla.png');
  const logo = require('./assets/Logo.png');
  const fondoBoton = require('./assets/Fondo-boton.png')
  return (
    <SafeAreaView style={styles.SafeArea}>
      <StatusBar style="dark" backgroundColor="#eeda9d" />
      <ImageBackground source={fondo} resizeMode="cover" style={styles.backgroundImage}>
      <View style={styles.container}>
        <Image source={logo} style={styles.ImagenLogo}/>
        <Text style={styles.tituloLogin}>Bienvenido</Text>
      </View>
      <View style={styles.container2}>
        <Button style={styles.botonLogin} backgroundImage={fondoBoton} title='Iniciar como Solver'/>
        <View style={styles.horizontalLine} />
        <Button style={styles.botonLogin} backgroundImage={fondoBoton} title='Iniciar como Cliente'/>
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
    fontSize: 35,
    fontWeight: 'bold',
    color: 'white',
  },
  container2: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: '50%'
  },
  ImagenLogo: {
    alignItems: 'center',
  },
  horizontalLine: {
    borderTopWidth: 1,
    borderStyle: 'solid',
    borderColor: 'white',
    width: '75%',
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
  },
  botonLogin: {

  },
});