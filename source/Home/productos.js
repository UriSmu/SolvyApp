import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StatusBar } from 'expo-status-bar';
import Entypo from '@expo/vector-icons/Entypo';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';


const PRODUCTS = [
    {
        id: '1',
        name: 'Quitamanchas',
        price: 8399.99,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHYJhpMJOLA_DTGVAIFAKrLGP8cQGq_m3BQ&s',
    },
    {
        id: '2',
        name: 'Quitamanchas',
        price: 8399.99,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHYJhpMJOLA_DTGVAIFAKrLGP8cQGq_m3BQ&s',
    },
    {
        id: '3',
        name: 'Quitamanchas',
        price: 8399.99,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHYJhpMJOLA_DTGVAIFAKrLGP8cQGq_m3BQ&s',
    },
    {
        id: '4',
        name: 'Quitamanchas',
        price: 8399.99,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHYJhpMJOLA_DTGVAIFAKrLGP8cQGq_m3BQ&s',
    },
    {
        id: '5',
        name: 'Quitamanchas',
        price: 8399.99,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHYJhpMJOLA_DTGVAIFAKrLGP8cQGq_m3BQ&s',
    },
    {
        id: '6',
        name: 'Quitamanchas',
        price: 8399.99,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHYJhpMJOLA_DTGVAIFAKrLGP8cQGq_m3BQ&s',
    },
];


export default function ProductosScreen() {
    const [search, setSearch] = useState('');


    const renderProduct = ({ item }) => (
        <View style={styles.card}>
            <Image source={item.image} style={styles.productImage} resizeMode="contain" />
            <View style={styles.cardFooter}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>Precio: ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</Text>
                <TouchableOpacity style={styles.buyButton}>
                    <Text style={styles.buyButtonText}>COMPRAR</Text>
                </TouchableOpacity>
            </View>
        </View>
    );


    return (
        <View style={styles.todo}>
            <View style={styles.container}>
                <FlatList
                    ListHeaderComponent={
                        <View style={styles.searchCartRow}>
                            <TextInput
                                style={styles.searchInput} placeholder="Buscar..." />
                            <TouchableOpacity style={styles.cartButton}>
                                <Text style={styles.cartButtonText}>Mi carrito</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    stickyHeaderIndices={[0]}
                    data={PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))}
                    renderItem={renderProduct}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.productsList}
                    showsVerticalScrollIndicator={false}
                    />
                {/* Bottom NaVigation */}
                    </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 16,
    },
    logoText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    iconoPerfil: {
        fontSize: 30,
    },
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
        paddingHorizontal: 18,
        paddingVertical: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
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
        oVerflow: 'hidden',
        eleVation: 2,
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
    buyButton: {
        backgroundColor: '#fff',
        borderRadius: 6,
        paddingHorizontal: 18,
        paddingVertical: 6,
    },
    buyButtonText: {
        color: '#009FE3',
        fontWeight: 'bold',
        fontSize: 15,
    },
    bottomNaV: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        backgroundColor: '#009FE3',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        eleVation: 10,
    },
    naVItem: {
        alignItems: 'center',
        flex: 1,
    },
    naVText: {
        color: '#fff',
        fontSize: 13,
        marginTop: 2,
        fontWeight: 'bold',
        opacity: 0.8,
    },
    actiVeNaVText: {
        color: '#fff',
        opacity: 1,
        textDecorationLine: 'underline',
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
        flexDirection: 'column',
    },
    footerImagenes: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centrarFooter: {
        width: 40,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
