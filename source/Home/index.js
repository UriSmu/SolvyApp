import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, SafeAreaView, Image, Button, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';


export default function Login() {
  const fondo = require('../../assets/Fondo-de-pantalla.png');
  const logo = require('../../assets/Logo.png');
  const fondoBoton = require('../../assets/Fondo-boton.png')

  const onPress = (obj) => {
    console.log(`Se quiere iniciar como ${obj}`)
  }
  
  const router = useRouter();
  return (
    <SafeAreaView style={styles.SafeArea}>
      <StatusBar style="dark" backgroundColor="#eeda9d" />
      <ImageBackground source={fondo} resizeMode="cover" style={styles.backgroundImage}>
      <View style={styles.container}>
        <Image source={logo} style={styles.ImagenLogo}/>
        </View>
        <View>
            <Text style={styles.texto}>¡Hola, "Nombre"!</Text>
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
  ImagenLogo: {
    marginHorizontal: '25%',
  },
  texto: {
    marginBottom: '150%',
    marginLeft: '10%',
    fontSize: 40,
  },
});