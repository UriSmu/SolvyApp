import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, ActivityIndicator,
  TouchableOpacity, Dimensions, Animated, Platform, Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

// Ajustá este valor si tu Tabbar tiene otro alto
const TABBAR_HEIGHT = 70;

export default function HomeTab() {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [selectedCoord, setSelectedCoord] = useState(null);
  const mapRef = useRef(null);

  // Panel animation
  const [panelExpanded, setPanelExpanded] = useState(false);
  const panelHeight = useRef(new Animated.Value(200)).current;
  const [userExpanded, setUserExpanded] = useState(false);

  // Simulación de favoritos y recientes
  const favoritos = [
    { id: 1, label: 'Destino favorito 1', icon: 'location' },
    { id: 2, label: 'Destino favorito 2', icon: 'location' }
  ];
  // Solo 3 recientes
  const recientes = [
    { id: 1, label: 'Destino reciente 1', icon: 'time-outline' },
    { id: 2, label: 'Destino reciente 2', icon: 'time-outline' },
    { id: 3, label: 'Destino reciente 3', icon: 'time-outline' }
  ];

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permiso de ubicación denegado');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      const initialRegion = {
        latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01
      };
      setRegion(initialRegion);
      setLocation({ latitude, longitude });
    })();
  }, []);

  // Keyboard listeners SOLO para abrir/cerrar el panel, NO para moverlo
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      Animated.timing(panelHeight, {
        toValue: 500,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setPanelExpanded(true);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      // No mover el panel ni cambiar offset
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    function toRad(x) { return x * Math.PI / 180; }
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchSuggestions = async (text) => {
    setAddress(text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`https://api.locationiq.com/v1/autocomplete?key=pk.c09af81eae38ab3e2065f77fe4ff6d64&q=${encodeURIComponent(text)}&limit=5&dedupe=1&normalizeaddress=1`);
      let data = await response.json();

      // Ordenar por cercanía si hay ubicación actual
      if (location && Array.isArray(data)) {
        data = data
          .map(item => {
            if (item.lat && item.lon) {
              const dist = haversineDistance(
                location.latitude,
                location.longitude,
                parseFloat(item.lat),
                parseFloat(item.lon)
              );
              return { ...item, _distance: dist };
            }
            return { ...item, _distance: Infinity };
          })
          .sort((a, b) => a._distance - b._distance);
      }

      setSuggestions(data);
    } catch (error) {
      setSuggestions([]);
    }
    setLoading(false);
  };

  // Panel expand/collapse SOLO con la línea superior
  const handlePanelHandlePress = () => {
    Animated.timing(panelHeight, {
      toValue: panelExpanded ? 220 : 500,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setPanelExpanded(!panelExpanded);
    setUserExpanded(!panelExpanded); // Guardar si el usuario expandió o no
  };

  // Cuando se empieza a escribir, el panel SIEMPRE debe estar abierto (pero no guardar como userExpanded)
  useEffect(() => {
    if (address.length > 0) {
      Animated.timing(panelHeight, {
        toValue: 500,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setPanelExpanded(true);
      // NO modificar userExpanded aquí
    } else if (!userExpanded) {
      // Si el usuario no lo dejó abierto, volver a colapsar
      Animated.timing(panelHeight, {
        toValue: 220,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setPanelExpanded(false);
    }
  }, [address, userExpanded]);

  const showAutocomplete = address.length > 0 && suggestions.length > 0;

  // Acción al tocar "Tu ubicación"
  const handleTuUbicacion = async () => {
    if (!location) {
      setLoading(true);
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        setAddress('Tu ubicación actual');
        setSelectedCoord({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          title: 'Tu ubicación actual'
        });
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        });
      } catch (e) {
        // Manejo de error
      }
      setLoading(false);
    } else {
      setAddress('Tu ubicación actual');
      setSelectedCoord({
        latitude: location.latitude,
        longitude: location.longitude,
        title: 'Tu ubicación actual'
      });
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      });
    }
    setSuggestions([]);
  };

  return (
    <View style={styles.main}>
      <StatusBar style="auto" />
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.mapa}
        region={region}
        showsUserLocation
        showsMyLocationButton
        showsPointsOfInterest
      >
        {selectedCoord && (
          <Marker
            coordinate={{
              latitude: selectedCoord.latitude,
              longitude: selectedCoord.longitude
            }}
            title={selectedCoord.title}
          />
        )}
      </MapView>

      {/* Panel azul DESPLEGABLE */}
      <Animated.View style={[
        styles.panel,
        { bottom: 0, height: panelHeight }
      ]}>
        {/* Línea superior como handle */}
        <TouchableOpacity
          style={styles.panelHandle}
          activeOpacity={0.7}
          onPress={handlePanelHandlePress}
        >
          {/* Solo la línea, sin flecha */}
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={styles.inputRow}>
            <Ionicons name="search" size={22} color="#222" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Ingresa la dirección"
              style={styles.input}
              value={address}
              onChangeText={fetchSuggestions}
              placeholderTextColor="#888"
              onFocus={() => {
                Animated.timing(panelHeight, {
                  toValue: 500,
                  duration: 200,
                  useNativeDriver: false,
                }).start();
                setPanelExpanded(true);
                // NO modificar userExpanded aquí
              }}
            />
          </View>

          {/* Mostrar solo autocomplete si hay texto */}
          {showAutocomplete ? (
            <View style={styles.autocompleteList}>
              {loading && <ActivityIndicator size="small" color="#fff" />}
              {suggestions.map((item, idx) => (
                <TouchableOpacity
                  key={item.place_id || idx}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSelectedSuggestion(item);
                    setAddress(item.display_name);
                    setSuggestions([]);
                    if (item.lat && item.lon) {
                      const lat = parseFloat(item.lat);
                      const lon = parseFloat(item.lon);
                      setSelectedCoord({
                        latitude: lat,
                        longitude: lon,
                        title: item.display_name
                      });
                      setRegion({
                        latitude: lat,
                        longitude: lon,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01
                      });
                    }
                  }}
                >
                  <Ionicons name="location-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: "#fff", flex: 1 }}>{item.display_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            // Mostrar favoritos y recientes SOLO si no hay texto
            <View style={{ flex: 1, justifyContent: 'flex-start' }}>
              <TouchableOpacity style={styles.favItem} onPress={handleTuUbicacion}>
                <Ionicons name="person" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.favText}>Tu ubicación</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.favItem}>
                <Ionicons name="location" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.favText}>{favoritos[0].label}</Text>
              </TouchableOpacity>
              {panelExpanded && (
                <>
                  <TouchableOpacity style={styles.favItem}>
                    <Ionicons name="location" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.favText}>{favoritos[1].label}</Text>
                  </TouchableOpacity>
                  {recientes.length > 0 && recientes.map((r) => (
                    <TouchableOpacity style={styles.favItem} key={r.id}>
                      <Ionicons name={r.icon} size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.favText}>{r.label}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#fff' },
  mapa: { flex: 1 },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#009FE3',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 18,
    elevation: 10,
    zIndex: 10,
    // bottom se setea dinámicamente para pegarlo al Tabbar
  },
  panelHandle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginBottom: 12,
    opacity: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 18,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
  },
  favItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  favText: {
    color: '#fff',
    fontSize: 16,
  },
  autocompleteList: {
    backgroundColor: 'rgba(0,0,0,0.10)',
    borderRadius: 10,
    padding: 6,
    marginTop: 2,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
});