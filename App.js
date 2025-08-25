import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './source/context/AuthContext';
import { RegisterProvider } from './source/context/RegisterContext';
import { UserProfileProvider } from './source/context/UserProfileContext';
import { StyleSheet, View, SafeAreaView } from 'react-native';

import Login from './source/Login';
import IniciarComoCliente from './source/Login/IniciarComoCliente';
import IniciarComoSolver from './source/Login/IniciarComoSolver';
import IniciarSesion from './source/Login/IniciarSesion';
import IniciarSesionSolv from './source/Login/IniciarSesionSolv';
import Registrarse from './source/Login/Registrarse';
import Registrarse2 from './source/Login/Registrarse2';
import RegistrarseSolv from './source/Login/RegistrarseSolv';
import OlvideMiContrasenia from './source/Login/OlvideMiContrasenia';

import Home from './source/Home';
import Productos from './source/Home/Productos';
import Servicios from './source/Home/Servicios';
import Actividad from './source/Home/Actividad';
import Mapa from './source/Home/Mapa';
import ReseniaSolv from './source/Home/ReseniaSolv';
import Subservicios from './source/Home/Subservicios';
import ConectarSolver from './source/Home/ConectarSolver';
import Perfil from './source/Home/Perfil';
import ConfirmarServicio from './source/Home/ConfirmarServicio';

import SolverHome from './source/Solver/index';
import SolverProductos from './source/Solver/Productos';
import SolverServicios from './source/Solver/Servicios';
import SolverActividad from './source/Solver/Actividad';
import SolverPerfil from './source/Solver/Perfil';
import SolverSubservicio from './source/Solver/Subservicio';

// NUEVAS PANTALLAS DEL STACK SOLVER
import MisServicios from './source/Solver/MisServicios';
import AgregarServicios from './source/Solver/AgregarServicios';
import AgregarMasServicios from './source/Solver/AgregarMasServicios';
import MapaSolverOnline from './source/Solver/MapaSolverOnline';

import ParteTrabajo from './source/Solver/ParteTrabajo';

import Header from './source/Layout/Header';
import Tabbar from './source/Layout/Tabbar';

const Stack = createNativeStackNavigator();

function LoginStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="IniciarComoCliente" component={IniciarComoCliente} />
      <Stack.Screen name="IniciarComoSolver" component={IniciarComoSolver} />
      <Stack.Screen name="IniciarSesion" component={IniciarSesion} />
      <Stack.Screen name="IniciarSesionSolv" component={IniciarSesionSolv} />
      <Stack.Screen name="Registrarse" component={Registrarse} />
      <Stack.Screen name="Registrarse2" component={Registrarse2} />
      <Stack.Screen name="RegistrarseSolv" component={RegistrarseSolv} />
      <Stack.Screen name="OlvideMiContrasenia" component={OlvideMiContrasenia} />
    </Stack.Navigator>
  );
}

function HomeLayout({ children }) {
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header perfilScreen="Perfil" style={styles.header}/>
        <View style={{ flex: 1 }}>
          {children}
        </View>
        <Tabbar style={styles.footer}/>
      </SafeAreaView>
    </View>
  );
}

function SolverLayout({ children }) {
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header perfilScreen="Perfil" style={styles.header}/>
        <View style={{ flex: 1 }}>
          {children}
        </View>
        <Tabbar style={styles.footer}/>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#007cc0',
  },
});

function HomeStack() {
  return (
    <HomeLayout>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Productos" component={Productos} />
        <Stack.Screen name="Servicios" component={Servicios} />
        <Stack.Screen name="Actividad" component={Actividad} />
        <Stack.Screen name="Mapa" component={Mapa}/>
        <Stack.Screen name="ReseniaSolv" component={ReseniaSolv}/>
        <Stack.Screen name="Subservicios" component={Subservicios}/>
        <Stack.Screen name="ConectarSolver" component={ConectarSolver} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen name="ConfirmarServicio" component={ConfirmarServicio} />

        <Stack.Screen name="ParteTrabajo" component={ParteTrabajo}/>
      </Stack.Navigator>
    </HomeLayout>
  );
}

function SolverStack() {
  return (
    <SolverLayout>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={SolverHome} />
        <Stack.Screen name="Productos" component={SolverProductos} />
        <Stack.Screen name="Servicios" component={SolverServicios} />
        <Stack.Screen name="Actividad" component={SolverActividad} />
        <Stack.Screen name="Perfil" component={SolverPerfil} />
        {/* NUEVAS RUTAS DEL STACK SOLVER */}
        <Stack.Screen name="MisServicios" component={MisServicios} />
        <Stack.Screen name="AgregarServicios" component={AgregarServicios} />
        <Stack.Screen name="AgregarMasServicios" component={AgregarMasServicios} />
        <Stack.Screen name="MapaSolverOnline" component={MapaSolverOnline} />
        <Stack.Screen name="Subservicios" component={Subservicios} />
        <Stack.Screen name="Subservicio" component={SolverSubservicio} />
      </Stack.Navigator>
    </SolverLayout>
  );
}

function RootNavigation() {
  const { estaLogeado, esSolver, loading } = useAuth();
  if (loading) return null; // O un loader
  if (!estaLogeado) return <LoginStack />;
  return esSolver ? <SolverStack /> : <HomeStack />;
}

export default function App() {
  return (
    <UserProfileProvider>
      <AuthProvider>
        <RegisterProvider>
          <NavigationContainer>
            <RootNavigation />
          </NavigationContainer>
        </RegisterProvider>
      </AuthProvider>
    </UserProfileProvider>
  );
}