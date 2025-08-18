import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

export default function AgregarMasServicios({ route, navigation }) {
  const otrosServicios = route.params?.otrosServicios || [];

  const handleAgregar = async (servicio) => {
    // Aquí deberías hacer el POST para asociar el servicio al solver
    // Por simplicidad, solo muestra un alert
    alert(`Servicio "${servicio.nombre}" agregado (simulado)`);
    // Idealmente, recargar la lista o navegar hacia atrás
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar más servicios</Text>
      <FlatList
        data={otrosServicios}
        keyExtractor={item => item.idservicio?.toString()}
        renderItem={({ item }) => (
          <View style={styles.servicioItem}>
            <Text style={styles.servicioText}>{item.nombre}</Text>
            <TouchableOpacity style={styles.agregarBtn} onPress={() => handleAgregar(item)}>
              <Text style={styles.agregarBtnText}>Agregar</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No hay servicios para agregar.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  servicioItem: {
    backgroundColor: '#f7f7f7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  servicioText: { fontSize: 16, fontWeight: '600', color: '#007cc0' },
  agregarBtn: {
    backgroundColor: '#007cc0',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  agregarBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});