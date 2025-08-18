import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SolverActividad() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actividad Solver</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold' },
});