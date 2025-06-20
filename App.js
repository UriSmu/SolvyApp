import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './source/context/AuthContext';

import Login from './source/Login';
import IniciarComoCliente from './source/Login/IniciarComoCliente';
import IniciarComoSolver from './source/Login/IniciarComoSolver';
import IniciarSesion from './source/Login/IniciarSesion';
import Registrarse from './source/Login/Registrarse';
import Registrarse2 from './source/Login/Registrarse2';

import Home from './source/Home';

const Stack = createNativeStackNavigator();

function LoginStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="IniciarComoCliente" component={IniciarComoCliente} />
      <Stack.Screen name="IniciarComoSolver" component={IniciarComoSolver} />
      <Stack.Screen name="IniciarSesion" component={IniciarSesion} />
      <Stack.Screen name="Registrarse" component={Registrarse} />
      <Stack.Screen name="Registrarse2" component={Registrarse2} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  );
}

function RootNavigation() {
  const { estaLogeado } = useAuth();
  return estaLogeado ? <HomeStack /> : <LoginStack />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigation />
      </NavigationContainer>
    </AuthProvider>
  );
}