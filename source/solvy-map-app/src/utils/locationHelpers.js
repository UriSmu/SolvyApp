import * as Location from 'expo-location';

export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (response.length > 0) {
      const { city, region, country } = response[0];
      return `${city}, ${region}, ${country}`;
    }
    return null;
  } catch (error) {
    console.error("Error getting address from coordinates:", error);
    return null;
  }
};

export const getCoordinatesFromAddress = async (address) => {
  try {
    const response = await Location.geocodeAsync(address);
    if (response.length > 0) {
      const { latitude, longitude } = response[0];
      return { latitude, longitude };
    }
    return null;
  } catch (error) {
    console.error("Error getting coordinates from address:", error);
    return null;
  }
};