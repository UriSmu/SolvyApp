import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, SafeAreaView, Image, Button, TouchableOpacity, Alert, TextInput} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import {useState} from 'react';

import { useAuth } from '../context/AuthContext';

import { useRegister } from '../context/RegisterContext';


export default function Registrarse() {
  const fondo = require('../../assets/Fondo-de-pantalla.png');
  const logo = require('../../assets/Logo.png');
  const fondoBoton = require('../../assets/Fondo-boton.png')
  const fondoFlecha = require('../../assets/Fondo-flecha.png')

  const navigation = useNavigation()
  const { login } = useAuth();

  const { registerData, setRegisterData } = useRegister();
  
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [direccion, setDireccion] = useState('');

  const handleRegister = async () => {
    if (password !== repeatPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    const finalData = {
      nombre: registerData.nombre,
      apellido: registerData.apellido,
      direccion, // Nuevo campo
      email: registerData.email,
      telefono,
      nombre_usuario: registerData.username, // Cambia el nombre del campo
      contraseña: password, // Cambia el nombre del campo
      dni,
    };

    try {
      const response = await fetch('http://localhost:3000/cli/clientes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        login();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'No se pudo registrar');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    }
  };

  return (
    <SafeAreaView style={styles.SafeArea}>
      <StatusBar style="dark" backgroundColor="#eeda9d" />
      <ImageBackground source={fondo} resizeMode="cover" style={styles.backgroundImage}>
      <View style={styles.container}>
        <Image source={logo} style={styles.ImagenLogo}/>
        <Text style={styles.tituloLogin}>Bienvenido, *UserName*</Text>
      </View>
      <View style={styles.container2}>
        <View style={styles.textInput}>
            <TextInput style={styles.textInput.input} placeholder='Ingrese su DNI' value={dni} onChangeText={setDni}/>
        </View>
        <View style={styles.textInput}>
            <TextInput style={styles.textInput.input} placeholder='Ingrese su Teléfono' value={telefono} onChangeText={setTelefono}/>
        </View>
        <View style={styles.textInput}>
            <TextInput style={styles.textInput.input} placeholder='Ingrese su contraseña' value={password} onChangeText={setPassword} secureTextEntry/>
        </View>
        <View style={styles.textInput}>
            <TextInput style={styles.textInput.input} placeholder='Repita su contraseña' value={repeatPassword} onChangeText={setRepeatPassword} secureTextEntry/>
        </View>
        <View style={styles.textInput}>
          <TextInput style={styles.textInput.input} placeholder='Ingrese su Dirección' value={direccion} onChangeText={setDireccion}/>
        </View>
          <TouchableOpacity onPress={() => navigation.navigate('Registrarse')} style={styles.botonFlecha}>
              <MaterialIcons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRegister} style={styles.botonLogin}>
            <ImageBackground source={fondoBoton} imageStyle={styles.botonImagen}>
              <Text style={styles.botonTexto}>Registrarse</Text>
            </ImageBackground>
          </TouchableOpacity>
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
    fontSize: 30,
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
    flex: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    marginTop: 10,
    paddingHorizontal: 20,
  },
  
  botonImagen: {
    resizeMode: 'stretch',
    borderRadius: 10,
  },
  
  botonTexto: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 50,
    marginVertical: 10,
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
    width: '90%',
    input: {
      paddingVertical: 8,
      paddingLeft: '3%',
    },
  },
  botonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  botonFlecha: {
    backgroundColor: 'white',
    opacity: 0.9,
    borderRadius: 25, 
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 33,
    marginTop: 10,
    marginBottom: 5,
  },
  
});