import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ParteTrabajo = ({ navigation, route }) => {
  const [realizado, setRealizado] = useState('');
  const [noSolucionado, setNoSolucionado] = useState('');
  const [recomendacion, setRecomendacion] = useState('');
  const [productos, setProductos] = useState([]);
  const [usosProductos, setUsosProductos] = useState({});
  const [loadingProductos, setLoadingProductos] = useState(true);
  const { solicitudId } = route.params;

  useEffect(() => {
    // Traer productos usados en la solicitud
    const fetchProductos = async () => {
      setLoadingProductos(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`https://solvy-app-api.vercel.app/solit/productos/${solicitudId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        const data = await res.json();

        // El backend puede devolver un array de strings tipo '[{...}][{...}]' o un array de objetos
        let productosArray = [];
        if (Array.isArray(data) && data.length > 0) {
          // Si viene como [{ productos_usados: '[{...}][{...}]' }]
          if (typeof data[0].productos_usados === 'string') {
            // Puede venir como '[{...}][{...}]' (dos arrays pegados)
            let str = data[0].productos_usados;
            // Separar por '][' y parsear cada uno
            const partes = str.split('][').map((s, idx, arr) => {
              if (arr.length === 1) return s; // solo uno
              if (idx === 0) return s + ']';
              if (idx === arr.length - 1) return '[' + s;
              return '[' + s + ']';
            });
            for (let parte of partes) {
              try {
                const arr = JSON.parse(parte);
                if (Array.isArray(arr)) {
                  productosArray = productosArray.concat(arr);
                }
              } catch (e) {
                // Si falla, intentar parsear como objeto único
                try {
                  const obj = JSON.parse(parte);
                  productosArray.push(obj);
                } catch {}
              }
            }
          } else if (Array.isArray(data[0].productos_usados)) {
            productosArray = data[0].productos_usados;
          } else if (Array.isArray(data)) {
            productosArray = data;
          }
        }

        // Si los productos no tienen nombre/foto, traer info por idproducto
        const productosConInfo = await Promise.all(
          productosArray.map(async (prod) => {
            if (prod.nombre && prod.foto) return prod;
            try {
              const token = await AsyncStorage.getItem('token');
              const resProd = await fetch(`https://solvy-app-api.vercel.app/prod/productos/${prod.idproducto}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
              });
              const prodData = await resProd.json();
              // prodData puede ser array o objeto
              let info = Array.isArray(prodData) ? prodData[0] : prodData;
              return {
                ...prod,
                nombre: prod.nombre || info?.nombre || '',
                foto: prod.foto || info?.imagen_url || info?.foto || '',
              };
            } catch {
              return prod;
            }
          })
        );

        setProductos(productosConInfo);
      } catch (e) {
        setProductos([]);
      }
      setLoadingProductos(false);
    };
    fetchProductos();
  }, [solicitudId]);

  const handleUsoProductoChange = (index, value) => {
    setUsosProductos(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const guardarParteTrabajo = async () => {
    try {
      if (!solicitudId) {
        Alert.alert('Error', 'No se recibió el id de la solicitud.');
        return;
      }
      if (!realizado.trim()) {
        Alert.alert('Error', 'Por favor describe qué realizaste en tu tarea.');
        return;
      }

      // Validar que se haya respondido para cada producto
      for (let i = 0; i < productos.length; i++) {
        if (!usosProductos[i] || !usosProductos[i].trim()) {
          Alert.alert('Falta información', `Por favor indica para qué usaste el producto "${productos[i].nombre || 'Producto'}".`);
          return;
        }
      }

      const parteTrabajo = {
        realizado: realizado.trim(),
        no_solucionado: noSolucionado.trim(),
        recomendacion: recomendacion.trim(),
        productos_usados: productos.map((prod, i) => ({
          ...prod,
          uso: usosProductos[i] || ''
        }))
      };

      const horaFinal = new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 8);

      const response = await fetch(`https://solvy-app-api.vercel.app/solit/${solicitudId}/finalizar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parte_trabajo: parteTrabajo,
          hora_final: horaFinal,
        }),
      });

      let errorMsg = 'Error en la respuesta del servidor';
      let responseText = '';
      try {
        responseText = await response.text();
        if (responseText && responseText[0] === '{') {
          const json = JSON.parse(responseText);
          errorMsg = json.message || json.error || errorMsg;
        } else if (responseText) {
          errorMsg = responseText;
        }
      } catch {}

      if (!response.ok) {
        throw new Error(errorMsg);
      }

      Alert.alert('Parte de trabajo guardado correctamente');
      navigation.navigate('Home');
    } catch (error) {
      console.error(error);
      Alert.alert('Error al guardar el parte de trabajo', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>¿Qué realizaste en tu tarea?</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        value={realizado}
        onChangeText={setRealizado}
        placeholder="Describe brevemente las tareas realizadas..."
      />

      <Text style={styles.label}>
        ¿Hay algo que hayas encontrado y no hayas podido solucionar? (ej: una mancha en la alfombra)
      </Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={3}
        value={noSolucionado}
        onChangeText={setNoSolucionado}
        placeholder="Describe aquí si hubo algo que no pudiste solucionar..."
      />

      <Text style={styles.label}>
        ¿Hay algo que le hayas recomendado al cliente a futuro? (ej: cambiar el termotanque por uno nuevo)
      </Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={3}
        value={recomendacion}
        onChangeText={setRecomendacion}
        placeholder="Escribe aquí tus recomendaciones para el cliente..."
      />

      {loadingProductos ? (
        <Text style={{ marginVertical: 20, textAlign: 'center' }}>Cargando productos usados...</Text>
      ) : productos.length > 0 ? (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>Productos usados en este servicio:</Text>
          {productos.map((prod, i) => (
            <View key={i} style={styles.productoBox}>
              {prod.foto ? (
                <Image source={{ uri: prod.foto }} style={styles.productoImg} />
              ) : null}
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{prod.nombre || `Producto ${i + 1}`}</Text>
              <Text>Cantidad: {prod.cantidad}</Text>
              <Text>¿Para qué usó el producto adquirido?</Text>
              <TextInput
                style={styles.input}
                multiline
                numberOfLines={2}
                value={usosProductos[i] || ''}
                onChangeText={text => handleUsoProductoChange(i, text)}
                placeholder="Describe el uso del producto..."
              />
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ marginVertical: 20, textAlign: 'center' }}>No hay productos usados registrados para esta solicitud.</Text>
      )}

      <Button title="Guardar parte de trabajo" onPress={guardarParteTrabajo} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, justifyContent: 'center' },
  label: { fontSize: 17, marginBottom: 8, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 18,
    minHeight: 60,
    backgroundColor: '#fafafa',
    textAlignVertical: 'top',
  },
  productoBox: {
    marginBottom: 18,
    padding: 10,
    backgroundColor: '#f0f6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b3d1ff',
  },
  productoImg: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 8,
    alignSelf: 'center',
  },
});

export default ParteTrabajo;