import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LocationSelectScreen = ({ route }) => {
  const navigation = useNavigation();
  const { selectedLocation } = route.params;

  const handleConfirmLocation = () => {
    // Logic to confirm the selected location and proceed
    navigation.navigate('HomeScreen', { confirmedLocation: selectedLocation });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Your Location</Text>
      <Text style={styles.locationText}>
        Selected Location: {selectedLocation.latitude}, {selectedLocation.longitude}
      </Text>
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
        <Text style={styles.buttonText}>Confirm Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  locationText: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#007cc0',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default LocationSelectScreen;