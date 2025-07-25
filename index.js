import { registerRootComponent } from 'expo';

import App from './App'

//npm i --g @expo/ngrok@^4.1.0


import Login from './source/Login/index';
import IniciarComoCliente from './source/Login/IniciarComoCliente';
import IniciarSesion from './source/Login/IniciarSesion';
import Registrarse from './source/Login/Registrarse'
import IniciarComoSolver from './source/Login/IniciarComoSolver'
import Registrarse2 from './source/Login/Registrarse2'
import Home from './source/Home/index';
import ActividadScreen from './source/Home/Actividad';
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);