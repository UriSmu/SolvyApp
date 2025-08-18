import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function SolverServicios({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Servicios Solver</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('MisServicios')}
      >
        <Text style={styles.btnText}>Mis servicios</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('AgregarServicios')}
      >
        <Text style={styles.btnText}>Agregar servicios</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 40 },
  btn: {
    backgroundColor: '#007cc0',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
});