import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, SafeAreaView, Image, TouchableOpacity, TextInput } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

export default function IniciarSesionSolv() {
  const fondo = require('../../assets/Fondo-de-pantalla.png');
  const logo = require('../../assets/Logo.png');
  const fondoBoton = require('../../assets/Fondo-boton.png');

  const navigation = useNavigation();
  const { login } = useAuth();

  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoginError('');
    setLoading(true);
    try {
      const res = await fetch(`https://solvy-app-api.vercel.app/sol/solvers/${usuario}/${password}`);
      if (!res.ok) {
        setLoginError('Usuario o contraseña incorrectos');
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
      }
      login(data, { usuario, password, esSolver: true });
      navigation.reset({
        index: 0,
        routes: [{ name: 'SolverHome' }]
      });
      setLoading(false);
    } catch (err) {
      setLoginError('Error de conexión');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.SafeArea}>
      <StatusBar style="dark" backgroundColor="#eeda9d" />
      <ImageBackground source={fondo} resizeMode="cover" style={styles.backgroundImage}>
        <View style={styles.container}>
          <Image source={logo} style={styles.ImagenLogo}/>
          <Text style={styles.tituloLogin}>Iniciar Sesión como Solver</Text>
        </View>
        <View style={styles.container2}>
          <View style={styles.textInput}>
            <TextInput
              style={styles.textInput.input}
              placeholder='Usuario (email o DNI)'
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.textInput}>
            <TextInput
              style={styles.textInput.input}
              placeholder='Contraseña'
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          {loginError ? (
            <Text style={styles.loginError}>{loginError}</Text>
          ) : null}
          <TouchableOpacity onPress={handleLogin} disabled={loading}>
            <ImageBackground source={fondoBoton} style={styles.botonLogin} imageStyle={styles.botonImagen}>
              <Text style={styles.botonTexto}>{loading ? 'Ingresando...' : 'Ingresar'}</Text>
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
  containerLogos: {
    flexDirection: 'row',
  },
  LogosLogin: {
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
  loginError: {
    color: 'red',
    marginTop: 8,
    marginBottom: 0,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});