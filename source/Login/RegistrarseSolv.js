import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, SafeAreaView, Image } from 'react-native';

export default function RegistrarseSolv() {
  const fondo = require('../../assets/Fondo-de-pantalla.png');
  const logo = require('../../assets/Logo.png');

  return (
    <SafeAreaView style={styles.SafeArea}>
      <StatusBar style="dark" backgroundColor="#eeda9d" />
      <ImageBackground source={fondo} resizeMode="cover" style={styles.backgroundImage}>
        <View style={styles.container}>
          <Image source={logo} style={styles.ImagenLogo}/>
          <Text style={styles.tituloLogin}>
            Para registrarte como Solver, usá la web solvy.com o descargá la app "Solvy Solvers".
          </Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  SafeArea: { flex: 1 },
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
  ImagenLogo: { alignItems: 'center' },
  tituloLogin: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: '10%',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});