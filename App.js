import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './source/context/AuthContext';
import { RegisterProvider } from './source/context/RegisterContext';
import { UserProfileProvider } from './source/context/UserProfileContext';

import Login from './source/Login';
import IniciarComoCliente from './source/Login/IniciarComoCliente';
import IniciarComoSolver from './source/Login/IniciarComoSolver';
import IniciarSesion from './source/Login/IniciarSesion';
import Registrarse from './source/Login/Registrarse';
import Registrarse2 from './source/Login/Registrarse2';
import OlvideMiContrasenia from './source/Login/OlvideMiContrasenia';

import Home from './source/Home';
import Productos from './source/Home/productos';
import Servicios from './source/Home/servicios';

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
      <Stack.Screen name="Registrarse" component={Registrarse} />
      <Stack.Screen name="Registrarse2" component={Registrarse2} />
      <Stack.Screen name="OlvideMiContrasenia" component={OlvideMiContrasenia} />
    </Stack.Navigator>
  );
}

function HomeLayout({ children }) {
  return (
    <>{/* Fragment */}
      <Header />
      <>{children}</>
      <Tabbar />
    </>
  );
}

function HomeStack() {
  return (
    <HomeLayout>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Productos" component={Productos} />
        <Stack.Screen name="Servicios" component={Servicios} />
      </Stack.Navigator>
    </HomeLayout>
  );
}

function RootNavigation() {
  const { estaLogeado } = useAuth();
  return estaLogeado ? <HomeStack /> : <LoginStack />;
}

export default function App() {
  return (
    <UserProfileProvider>
      <AuthProvider>
        <RegisterProvider>
          <UserProfileProvider>
            <NavigationContainer>
              <RootNavigation />
            </NavigationContainer>
          </UserProfileProvider>
        </RegisterProvider>
      </AuthProvider>
    </UserProfileProvider>
  );
}