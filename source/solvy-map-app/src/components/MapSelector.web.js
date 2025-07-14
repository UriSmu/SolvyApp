import { View, StyleSheet } from 'react-native';

export default function MapSelector() {
  return (
    <View style={styles.container}>
      <div style={{ padding: 20, textAlign: 'center' }}>
        Mapa no disponible en web
      </div>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});