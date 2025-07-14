import React from 'react';
import { Marker } from 'react-native-maps';

const LocationMarker = ({ coordinate, title, description }) => {
  return (
    <Marker
      coordinate={coordinate}
      title={title}
      description={description}
      pinColor="#007cc0" // Customize the marker color
    />
  );
};

export default LocationMarker;