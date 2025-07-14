import { useState } from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert, Platform } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReseniaSolv({ navigation }) {
  const route = useRoute();
  const { solver } = route.params;
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState("");

  // Renderiza estrellas con medias
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let icon = "star-o";
      if (puntuacion >= i) {
        icon = "star";
      } else if (puntuacion >= i - 0.5) {
        icon = "star-half-o";
      }
      stars.push(
        <View key={i} style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={() => setPuntuacion(i - 0.5)}>
            <FontAwesome
              name={puntuacion >= i - 0.5 && puntuacion < i ? "star-half-o" : "star-o"}
              size={32}
              color="#FFD700"
              style={{ position: "absolute", left: 0, zIndex: 1, width: 16 }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPuntuacion(i)}>
            <FontAwesome
              name={icon}
              size={32}
              color="#FFD700"
              style={{ marginLeft: 0 }}
            />
          </TouchableOpacity>
        </View>
      );
    }
    return stars;
  };

  const handleEnviar = async () => {
    const token = await AsyncStorage.getItem('token');
    const usuarioStr = await AsyncStorage.getItem('usuario');
    let idcliente = null;
    if (usuarioStr) {
      try {
        const usuarioObj = JSON.parse(usuarioStr);
        idcliente = usuarioObj?.profile?.user?.idcliente;
      } catch (e) {
        idcliente = null;
      }
    }

    if (!puntuacion || !comentario.trim()) {
      Alert.alert("Completa la reseña", "Debes puntuar y dejar un comentario.");
      return;
    }
    if (!idcliente) {
      Alert.alert("Error", "No se pudo obtener tu usuario. Intenta cerrar sesión y volver a ingresar.");
      return;
    }
    try {
      const res = await fetch("https://solvy-app-api.vercel.app/ressol/resenia", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          idsolver: solver.idsolver,
          puntuacion,
          idcliente,
          comentario,
        }),
      });
      if (res.ok) {
        if (Platform.OS === "web") {
          window.alert("¡Gracias! Tu reseña fue enviada.");
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
        } else {
          Alert.alert("¡Gracias!", "Tu reseña fue enviada.", [
            {
              text: "OK",
              onPress: () =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Home" }],
                }),
            },
          ]);
        }
      } else {
        const error = await res.json();
        Alert.alert("Error", error?.message || "No se pudo enviar la reseña.");
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo enviar la reseña.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Calificá a tu solver</Text>
      <View style={styles.solverInfo}>
        <Image
          source={
            solver.fotopersonal
              ? { uri: `https://solvy-app-api.vercel.app/uploads/${solver.fotopersonal}` }
              : require("../../assets/chef-hat.png")
          }
          style={styles.solverImg}
        />
        <Text style={styles.nombreSolver}>{solver.nombre} {solver.apellido}</Text>
      </View>
      <Text style={styles.infoServicio}>Servicio: Limpieza profunda - 3 horas</Text>
      <View style={styles.starsRow}>
        {renderStars()}
      </View>
      <TextInput
        style={styles.textarea}
        placeholder="Dejá tu comentario..."
        value={comentario}
        onChangeText={setComentario}
        multiline
        numberOfLines={4}
      />
      <TouchableOpacity style={styles.btnEnviar} onPress={handleEnviar}>
        <Text style={styles.btnEnviarText}>Enviar reseña</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:"#fff", padding:24, alignItems:"center" },
  titulo: { fontSize:22, fontWeight:"bold", marginBottom:18, color:"#007cc0" },
  solverInfo: { flexDirection:"row", alignItems:"center", marginBottom:12 },
  solverImg: { width:48, height:48, borderRadius:24, marginRight:12, backgroundColor:"#eee" },
  nombreSolver: { fontSize:18, fontWeight:"bold", color:"#007cc0" },
  infoServicio: { fontSize:16, color:"#555", marginBottom:18 },
  starsRow: { flexDirection:"row", marginBottom:18 },
  textarea: { width:"100%", borderColor:"#ccc", borderWidth:1, borderRadius:8, padding:10, fontSize:16, minHeight:80, marginBottom:18 },
  btnEnviar: { backgroundColor:"#007cc0", paddingVertical:12, paddingHorizontal:32, borderRadius:24 },
  btnEnviarText: { color:"#fff", fontWeight:"bold", fontSize:18 }
});