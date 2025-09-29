import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, FlatList, StyleSheet, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SolverProductos({ navigation, route }) {
  // Recibe el id de la solicitud activa por props o route.params
  const idsolicitud = route?.params?.idsolicitud;
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Traer productos de la API
  useEffect(() => {
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Token', 'No se encontró el token JWT');
      }
      const res = await fetch('https://solvy-app-api.vercel.app/prod/productos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        Alert.alert('Error parseando JSON', text);
        setProducts([]);
        setLoading(false);
        return;
      }
      // DEBUG: Mostrar la respuesta cruda
      if (!Array.isArray(data)) {
        Alert.alert('Respuesta inesperada', JSON.stringify(data));
        setProducts([]);
        setLoading(false);
        return;
      }
      if (data.length === 0) {
        Alert.alert('Sin productos', 'La API devolvió un array vacío');
      }
      const mapped = data.map((prod) => ({
        id: prod.idproducto?.toString() ?? prod.id?.toString() ?? '',
        name: prod.nombre,
        price: prod.preciounitario ?? prod.precioUnitario ?? prod['Precio unitario'],
        image: prod.imagen_url,
        description: prod.descripcion,
      }));
      // DEBUG: Mostrar productos mapeados
      setProducts(mapped);
    } catch (err) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
      setProducts([]);
    }
    setLoading(false);
  };
  fetchProducts();
}, []);

  // Agregar producto al carrito
  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((p) => p.id === product.id);
      if (found) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [...prev, { ...product, cantidad: 1 }];
    });
  };

  // Quitar producto del carrito
  const removeFromCart = (product) => {
    setCart((prev) => {
      const found = prev.find((p) => p.id === product.id);
      if (!found) return prev;
      if (found.cantidad === 1) {
        return prev.filter((p) => p.id !== product.id);
      }
      return prev.map((p) =>
        p.id === product.id ? { ...p, cantidad: p.cantidad - 1 } : p
      );
    });
  };

  // Comprar productos (enviar a la API)
  const handleComprar = async () => {
  if (!idsolicitud) {
    Alert.alert('Error', 'No se encontró la solicitud activa.');
    return;
  }
  if (cart.length === 0) {
    Alert.alert('Carrito vacío', 'Agrega productos antes de comprar.');
    return;
  }
  try {
    const token = await AsyncStorage.getItem('token');
    const productosPayload = cart.map(({ id, cantidad, name, price }) => ({
      idproducto: Number(id),
      cantidad: Number(cantidad),
      nombre: name,
      precio: Number(price),
    }));
    const res = await fetch(
      `https://solvy-app-api.vercel.app/solit/agregar-productos/${idsolicitud}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ productos: productosPayload }),
      }
    );
    const text = await res.text();
    if (res.ok) {
      Alert.alert('¡Éxito!', 'Productos agregados a la solicitud.');
      setCart([]);
      navigation.goBack();
    } else {
      Alert.alert(
        'Error',
        `No se pudieron agregar los productos.\nStatus: ${res.status}\nBody: ${text}`
      );
    }
  } catch (e) {
    Alert.alert('Error', 'No se pudo conectar con el servidor.');
  }
};

  const renderProduct = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="contain" />
      <View style={styles.cardFooter}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>Precio: ${item.price?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</Text>
        {item.description ? (
          <Text style={{ color: '#fff', fontSize: 11, marginBottom: 4 }}>{item.description}</Text>
        ) : null}
        <View style={styles.cartRow}>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => removeFromCart(item)}
            disabled={!cart.find((p) => p.id === item.id)}
          >
            <Ionicons name="remove-circle-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.cantidadText}>
            {cart.find((p) => p.id === item.id)?.cantidad ?? 0}
          </Text>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => addToCart(item)}
          >
            <Ionicons name="add-circle-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.todo}>
      {/* Flecha para volver */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="#009FE3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adquirir Productos</Text>
      </View>
      <View style={styles.container}>
        <FlatList
          ListHeaderComponent={
            <View style={styles.searchCartRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar..."
                value={search}
                onChangeText={setSearch}
              />
              <TouchableOpacity style={styles.cartButton} onPress={handleComprar}>
                <Ionicons name="cart" size={20} color="#fff" />
                <Text style={styles.cartButtonText}>Comprar ({cart.reduce((a, b) => a + b.cantidad, 0)})</Text>
              </TouchableOpacity>
            </View>
          }
          stickyHeaderIndices={[0]}
          data={products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text>Cargando productos...</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text>No hay productos disponibles.</Text>
              </View>
            )
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  todo: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  backBtn: {
    marginRight: 10,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#009FE3',
  },
  container: { flex: 1, backgroundColor: '#fff' },
  searchCartRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#E6F0F7',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 38,
    marginRight: 10,
  },
  cartButton: {
    backgroundColor: '#009FE3',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 6,
  },
  productsList: {
    paddingHorizontal: 8,
    paddingBottom: 80,
    marginTop: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    borderWidth: 1,
    borderColor: '#eee',
    minWidth: 150,
    maxWidth: '48%',
  },
  productImage: {
    width: '100%',
    height: 100,
    alignSelf: 'center',
    marginTop: 10,
  },
  cardFooter: {
    backgroundColor: '#009FE3',
    padding: 10,
    alignItems: 'center',
  },
  productName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  productPrice: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 8,
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  cartBtn: {
    padding: 4,
  },
  cantidadText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginHorizontal: 8,
    minWidth: 18,
    textAlign: 'center',
  },
});