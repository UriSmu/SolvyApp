import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

// ID del servicio de limpieza (ajusta según tu base de datos)
const LIMPIEZA_SERVICE_ID = 1; // Cambia este valor si tu ID de limpieza es otro

export default function LimpiezaServEstatico() {
  const [solver, setSolver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const fetchRandomSolver = async () => {
      try {
        // 1. Traer IDs de solvers que pueden hacer limpieza
        const res = await fetch(`https://solvy-app-api.vercel.app/ser/solvers/${LIMPIEZA_SERVICE_ID}`);
        const solversIds = await res.json();
        if (!Array.isArray(solversIds) || solversIds.length === 0) {
          setLoading(false);
          return;
        }
        // 2. Elegir uno al azar
        const randomId = solversIds[Math.floor(Math.random() * solversIds.length)];
        // 3. Traer info del solver elegido
        const solverRes = await fetch(`https://solvy-app-api.vercel.app/sol/solver/${randomId}`);
        const solverData = await solverRes.json();
        setSolver(solverData);
      } catch (e) {
        setSolver(null);
      }
      setLoading(false);
    };
    fetchRandomSolver();
  }, []);

  const handleFinalizar = () => {
    Alert.alert("Servicio finalizado", "¡Gracias por usar Solvy!");
    // Aquí podrías navegar o hacer otra acción
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007cc0" />
      </View>
    );
  }

  if (!solver) {
    return (
      <View style={styles.centered}>
        <Text>No se encontró un solver disponible.</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Mapa simulado */}
      <View style={styles.mapaFalso}>
        <Text style={styles.logoSolvy}>SOLVY</Text>
        <View style={styles.avatarContainer}>
          <Image
            source={
              solver.fotopersonal
                ? { uri: solver.fotopersonal }
                : require("../../assets/chef-hat.png")
            }
            style={styles.avatar}
          />
        </View>
      </View>
      {/* Card principal */}
      <View style={styles.card}>
        <Text style={styles.tiempoInicio}>
          Inicio de servicio en <Text style={{ fontWeight: "bold" }}>8 min</Text>
        </Text>
        <View style={styles.solverRow}>
          <Image
            source={
              solver.fotopersonal
                ? { uri: solver.fotopersonal }
                : require("../../assets/chef-hat.png")
            }
            style={styles.solverImg}
          />
          <Text style={styles.nombreSolver}>
            {solver.nombre} {solver.apellido}
          </Text>
        </View>
        <View style={styles.mensajeRow}>
          <TextInput
            style={styles.input}
            placeholder="Mensaje"
            value={mensaje}
            onChangeText={setMensaje}
          />
          <TouchableOpacity style={styles.iconBtn}>
            <FontAwesome name="send" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <FontAwesome name="phone" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="access-time" size={22} color="#fff" />
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Duración del servicio:</Text> 3 horas
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="info" size={22} color="#fff" />
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Tipo de servicio:</Text> Limpieza profunda
          </Text>
        </View>
        <View style={styles.infoRow}>
          <FontAwesome name="dollar" size={22} color="#fff" />
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Monto:</Text> AR$ 12.275,00{"\n"}
            <Text style={styles.visaText}>Visa terminada en XX92</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.finalizarBtn} onPress={handleFinalizar}>
          <Text style={styles.finalizarBtnText}>FINALIZAR SERVICIO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  mapaFalso: {
    flex: 1.2,
    backgroundColor: "#e6e6e6",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  logoSolvy: {
    color: "#007cc0",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  avatarContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "32%",
    marginHorizontal: 16,
    backgroundColor: "#007cc0",
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  tiempoInicio: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  solverRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  solverImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#fff",
  },
  nombreSolver: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  mensajeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    width: "100%",
  },
  input: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#333",
  },
  iconBtn: {
    backgroundColor: "#007cc0",
    borderRadius: 20,
    padding: 8,
    marginLeft: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  infoText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
  visaText: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.8,
  },
  finalizarBtn: {
    marginTop: 22,
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "100%",
  },
  finalizarBtnText: {
    color: "#007cc0",
    fontWeight: "bold",
    fontSize: 18,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});