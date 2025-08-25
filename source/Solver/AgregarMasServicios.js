import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AgregarMasServicios({ route, navigation }) {
  const servicio = route.params?.servicio;
  const [convirtiendo, setConvirtiendo] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [estudios, setEstudios] = useState(false);
  const [experiencia, setExperiencia] = useState('');

  async function handleEnviarDatos() {
    setConvirtiendo(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const usuarioStr = await AsyncStorage.getItem('usuario');
      let idsolver = null;
      if (usuarioStr) {
        try {
          const usuarioObj = JSON.parse(usuarioStr);
          idsolver =
            usuarioObj?.profile?.user?.idsolver ||
            usuarioObj?.profile?.idsolver ||
            usuarioObj?.user?.idsolver ||
            usuarioObj?.idsolver ||
            null;
        } catch (err) {
          console.log('Error parsing usuario:', err);
        }
      }
      if (!idsolver || !servicio?.idservicio) {
        Alert.alert('Error', 'No se pudo obtener el usuario o servicio.');
        setConvirtiendo(false);
        return;
      }
      const body = {
        idsolver,
        idservicio: servicio.idservicio,
        estudios,
        certificadoestudios: estudios ? 'certificado_default.png' : null,
        experiencia: experiencia ? parseInt(experiencia) : 0
      };
      const res = await fetch('https://solvy-app-api.vercel.app/sol/solverservicio', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const text = await res.text();
      console.log('Body:', body);
      console.log('Status:', res.status);
      console.log('Response:', text);
      if (res.ok) {
        Alert.alert('¡Listo!', `Ahora ofreces el servicio "${servicio.nombre}".`);
        setModalVisible(false);
        navigation.goBack();
      } else {
        Alert.alert('Error', 'No se pudo agregar el servicio.\n' + text);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
    setConvirtiendo(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Convertirse en {servicio?.nombre}</Text>
      <TouchableOpacity
        style={styles.convertirseBtn}
        onPress={() => setModalVisible(true)}
        disabled={convirtiendo}
      >
        <Text style={styles.convertirseBtnText}>
          {convirtiendo ? 'Convirtiendo...' : `Convertirse en ${servicio?.nombre}`}
        </Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Datos requeridos</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>¿Tenés estudios?</Text>
              <Switch
                value={estudios}
                onValueChange={setEstudios}
              />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Años de experiencia</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={experiencia}
                onChangeText={setExperiencia}
                placeholder="Ej: 2"
                maxLength={2}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={convirtiendo}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.enviarBtn}
                onPress={handleEnviarDatos}
                disabled={convirtiendo}
              >
                <Text style={styles.enviarBtnText}>
                  {convirtiendo ? 'Enviando...' : 'Enviar'}
                </Text>
              </TouchableOpacity>
            </View>
            {convirtiendo && (
              <ActivityIndicator size="large" color="#007cc0" style={{ marginTop: 20 }} />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  convertirseBtn: {
    backgroundColor: '#007cc0',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignSelf: 'center',
    marginBottom: 18,
  },
  convertirseBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    width: '85%',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
    color: '#007cc0',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#007cc0',
    borderRadius: 8,
    padding: 8,
    width: 70,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#f7f7f7',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelBtn: {
    backgroundColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelBtnText: {
    color: '#007cc0',
    fontWeight: 'bold',
    fontSize: 16,
  },
  enviarBtn: {
    backgroundColor: '#007cc0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  enviarBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});