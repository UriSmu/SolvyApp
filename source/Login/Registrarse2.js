import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, SafeAreaView, Image, Button, TouchableOpacity, Alert, TextInput} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import {useState} from 'react';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../context/supabaseClient';

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
      // Primero crear usuario en Supabase Auth para que aparezca en Authentication -> Users
      const { data: signData, error: signError } = await supabase.auth.signUp({
        email: finalData.email,
        password: finalData.contraseña,
      });

      if (signError) {
        // Si el error es que el usuario ya existe, continuamos (el usuario puede haber sido creado antes)
        // De lo contrario mostramos error
        const msg = (signError?.message || '').toLowerCase();
        if (!msg.includes('already registered') && !msg.includes('user already exists')) {
          Alert.alert('Error', signError.message || 'No se pudo crear usuario en Auth');
          return;
        }
      }

      // Si se creó correctamente, signData.user.id contiene el uid
      if (signData?.user?.id) {
        finalData.auth_uid = signData.user.id;
      }

      // Intentar iniciar sesión en Supabase para generar la sesión JS (necesaria para RLS desde el cliente)
      try {
        // signInWithPassword es la forma de obtener sesión en supabase-js v2
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: finalData.email,
          password: finalData.contraseña,
        });
        // Si hay error de signin y no se obtuvo session, lo ignoramos (el backend puede seguir creando la fila)
        if (signInError) {
          // si es "Invalid login" es posible que el usuario no exista aun en Auth
          console.warn('Sign-in tras registro falló:', signInError.message);
        }
      } catch (e) {
        console.warn('Error al intentar signInWithPassword:', e);
      }

      // En cualquier caso, ahora creamos el registro en el backend tradicional
      const response = await fetch('https://solvy-app-api.vercel.app/cli/clientes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        const responseData = await response.json();
        // Autologin: llamamos a login con los datos del backend y las credenciales usadas
        // (esto guarda AsyncStorage y mantiene la UX)
        login(responseData, { usuario: finalData.nombre_usuario, contrasena: finalData.contraseña, esSolver: false });
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
        <Text style={styles.tituloLogin}>Bienvenido, {registerData.nombre}</Text>
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonFlecha}>
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