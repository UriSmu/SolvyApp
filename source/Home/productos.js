import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';


const PRODUCTS = [
    {
        id: '1',
        name: 'Quitamanchas',
        price: 8399.99,
        image: require('../../assets/Vanish.png'),
    },
    {
        id: '2',
        name: 'Quitamanchas',
        price: 8399.99,
        image: require('../../assets/Vanish.png'),
    },
    {
        id: '3',
        name: 'Quitamanchas',
        price: 8399.99,
        image: require('../../assets/Vanish.png'),
    },
    {
        id: '4',
        name: 'Quitamanchas',
        price: 8399.99,
        image: require('../../assets/Vanish.png'),
    },
    {
        id: '5',
        name: 'Quitamanchas',
        price: 8399.99,
        image: require('../../assets/Vanish.png'),
    },
    {
        id: '6',
        name: 'Quitamanchas',
        price: 8399.99,
        image: require('../../assets/Vanish.png'),
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
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>SOLV<Text style={{fontSize:18}}>Y</Text> <Ionicons name="restaurant-outline" size={16} /></Text>
                <TouchableOpacity style={styles.profileIcon}>
                    <FontAwesome name="user-circle-o" size={36} color="#000" />
                </TouchableOpacity>
            </View>
            {/* Search and Cart */}
            <View style={styles.searchCartRow}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar..."
                    Value={search}
                    onChangeText={setSearch}
                />
                <TouchableOpacity style={styles.cartButton}>
                    <Text style={styles.cartButtonText}>Mi carrito</Text>
                </TouchableOpacity>
            </View>
            {/* Products Grid */}
            <FlatList
                data={PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))}
                renderItem={renderProduct}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={styles.productsList}
                showsVerticalScrollIndicator={false}
            />
            {/* Bottom NaVigation */}
            <View style={styles.bottomNaV}>
                <TouchableOpacity style={styles.naVItem}>
                    <Ionicons name="home" size={28} color="#009FE3" />
                    <Text style={styles.naVText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.naVItem}>
                    <Ionicons name="people" size={28} color="#009FE3" />
                    <Text style={styles.naVText}>SerVicios</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.naVItem}>
                    <Ionicons name="cart" size={28} color="#009FE3" />
                    <Text style={[styles.naVText, styles.actiVeNaVText]}>Productos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.naVItem}>
                    <Ionicons name="stats-chart" size={28} color="#009FE3" />
                    <Text style={styles.naVText}>ActiVidad</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 16,
        justifyContent: 'space-between',
    },
    logo: {
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    profileIcon: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 2,
        borderWidth: 1,
        borderColor: '#eee',
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
        paddingBottom: 90,
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
    }
})
