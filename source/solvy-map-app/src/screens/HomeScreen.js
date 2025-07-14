import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapSelector from '../components/MapSelector';

const HomeScreen = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Location</Text>
      <MapSelector onLocationSelect={handleLocationSelect} />
      {selectedLocation && (
        <Text style={styles.locationText}>
          Selected Location: {selectedLocation.latitude}, {selectedLocation.longitude}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  locationText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
});

export default HomeScreen;