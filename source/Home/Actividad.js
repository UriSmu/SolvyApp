import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const DATA = [
  {
    id: '1',
    title: 'Cocina',
    address: 'Avenida Diaz Velez 1290',
    date: '4 Mar',
    time: '18.23hs',
    price: '$9.460',
  },
  {
    id: '2',
    title: 'Cocina',
    address: 'Avenida Diaz Velez 1290',
    date: '4 Mar',
    time: '18.23hs',
    price: '$9.460',
  },
  {
    id: '3',
    title: 'Cocina',
    address: 'Avenida Diaz Velez 1290',
    date: '4 Mar',
    time: '18.23hs',
    price: '$9.460',
  },
  {
    id: '4',
    title: 'Cocina',
    address: 'Avenida Diaz Velez 1290',
    date: '4 Mar',
    time: '18.23hs',
    price: '$9.460',
  },
];

export default function ActividadScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardImageContainer}>
        {/* Replace with actual image or icon */}
        <FontAwesome5 name="chef-hat" size={40} color="#003f5c" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.address}>{item.address}</Text>
        <View style={styles.dateTimeRow}>
          <Text style={styles.date}>{item.date}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.price}>{item.price}</Text>
      </View>
      <TouchableOpacity style={styles.repeatButton}>
        <FontAwesome name="repeat" size={24} color="#003f5c" />
        <Text style={styles.repeatText}>Repetir</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.todo}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>SOLV</Text>
          <TouchableOpacity>
            <FontAwesome name="user-circle-o" size={30} color="#000" />
          </TouchableOpacity>
        </View>

        <Text style={styles.screenTitle}>Actividad</Text>

        <FlatList
          data={DATA}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      {/* Footer Navigation */}
      <View style={styles.footerContainer}>
        <View style={styles.menuInferior}>
          <View style={styles.footerImagenes}>
            <Entypo name="home" size={30} color="white" />
            <Text style={styles.menuItem}>Home</Text>
          </View>
          <View style={styles.footerImagenes}>
            <Fontisto name="person" size={30} color="white" />
            <Text style={styles.menuItem}>Servicios</Text>
          </View>
          <View style={styles.footerImagenes}>
            <FontAwesome5 name="shopping-cart" size={30} color="white" />
            <Text style={styles.menuItem}>Productos</Text>
          </View>
          <View style={styles.footerImagenes}>
            <FontAwesome name="list-ul" size={30} color="white" />
            <Text style={styles.menuItem}>Actividad</Text>
          </View>
        </View>
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
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#007cc0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  cardImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#003f5c',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  address: {
    color: 'white',
    fontSize: 12,
    fontStyle: 'italic',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  date: {
    color: 'white',
    marginRight: 10,
    fontSize: 12,
  },
  time: {
    color: 'white',
    fontSize: 12,
  },
  price: {
    color: 'white',
    marginTop: 4,
    fontWeight: 'bold',
  },
  repeatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#005a9c',
    borderRadius: 6,
  },
  repeatText: {
    color: '#003f5c',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  footerContainer: {
    backgroundColor: '#007cc0',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  menuInferior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerImagenes: {
    flex: 1,
    alignItems: 'center',
  },
  menuItem: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
});
