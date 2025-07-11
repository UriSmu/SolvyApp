import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

export default function Tabbar() {
      const navigation = useNavigation();

    return (
        <View style={styles.footerContainer}>
            <View style={styles.menuInferior}>
                <TouchableOpacity style={styles.footerImagenes} onPress={() => navigation.navigate('Home')}>
                    <View style={styles.centrarFooter}>
                        <Entypo name="home" size={30} color="white" />
                    </View>
                    <Text style={styles.menuItem}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerImagenes} onPress={() => navigation.navigate('Servicios')}>
                    <View style={styles.centrarFooter}>
                        <Fontisto name="person" size={30} color="white" />
                    </View>
                    <Text style={styles.menuItem}>Servicios</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerImagenes} onPress={() => navigation.navigate('Productos')}>
                    <View style={styles.centrarFooter}>
                        <FontAwesome5 name="shopping-cart" size={30} color="white" />
                    </View>
                    <Text style={styles.menuItem}>Productos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerImagenes} onPress={() => navigation.navigate('Actividad')}>
                    <View style={styles.centrarFooter}>
                        <FontAwesome name="list-ul" size={30} color="white" />
                    </View>
                    <Text style={styles.menuItem}>Actividad</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
      container: { 
        flex: 1, 
        backgroundColor: '#fff',  
      },
      scrollContainer: { 
        padding: 20, 
        paddingBottom: 0, 
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      logoText: { 
        fontSize: 18, 
        fontWeight: 'bold' 
      },
      iconoPerfil: { 
        fontSize: 30 
      },
      titulo: { 
        fontSize: 26, 
        fontWeight: 'bold', 
        marginVertical: 20 
      },
      botonReciente: {
        backgroundColor: '#007cc0',
        padding: 12,
        borderRadius: 10,
        marginBottom: 20,
      },
      textoReciente: { 
        color: '#fff', 
        fontStyle: 'italic', 
        opacity: '75%' 
      },
      subtitulo: { 
        fontSize: 30, 
        fontWeight: 'bold', 
        marginTop: 20, 
        marginBottom: 20, 
        textAlign: 'center'
      },
      filaServicios: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
      },
      servicio: {
        width: '30%',
        alignItems: 'center',
      },
      iconoServicio: {
        backgroundColor: '#007cc0',
        width: 95,
        height: 95, 
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
      },
      iconoTexto: { 
        fontSize: 30, 
        color: '#fff' 
      },
      nombreServicio: { 
        textAlign: 'center', 
        fontSize: 13 ,
        fontWeight: '600'
      },
    
      footerContainer: {
        backgroundColor: '#007cc0',
        paddingBottom: 20, 
      },
      menuInferior: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
      },
      menuItem: { 
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 5,
        textAlign: 'center',
        fontSize: 12,
      },
      todo: {
        flex: 1,
        flexDirection: 'column'
      },
      footerImagenes:{
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
      },
      centrarFooter:{
        width: 40, height: 30, alignItems: 'center', justifyContent: 'center' 
      },
      contenedorBotonMasServicios: { 
        marginTop: 30,
        marginBottom: 100, // Más espacio con el footer
        alignItems: 'center',
        justifyContent: 'center',
      },
      filaBoton: {
        marginTop: 30,
        marginBottom: 100, // separación del footer
        alignItems: 'center',
        justifyContent: 'center',
      },
      
      botonMasServicios: {
        backgroundColor: '#007ACC',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
      
        // Sombra para iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      
        // Elevación para Android
        elevation: 6,
      
        // Animación visual de profundidad
        transform: [{ scale: 1 }],
      },
      
      textoBotonMasServicios: {
        color: 'white',
        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        textAlign: 'center',
      },
      
      
    })