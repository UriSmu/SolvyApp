import React from 'react';
import ConectarSolver from '../Home/ConectarSolver';

export default function MapaSolverOnline(props) {
  // Puedes pasar props personalizados si lo necesitas
  // Aquí simplemente renderiza el componente esperando ser contactado
  return <ConectarSolver {...props} modoSolverOnline={true} />;
}