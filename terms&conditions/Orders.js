import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

const Orders = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/images/fish/fish2.jpg')}
            style={styles.image}
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.textContent}>
            <Text style={styles.title}>Good Fish</Text>
            <Text style={styles.description}>Description</Text>
            <Text style={styles.quantity}>Quantity: 2</Text> 
            <Text style={styles.price}>$500</Text>
          </View>
          <TouchableOpacity style={styles.cancelButton}>
            <Ionicons name="close-circle" size={20} color="white" />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default Orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    width: '90%',
    height: '20%',
    marginTop: 10,
    borderRadius: 10,
    alignSelf: 'center',
    elevation: 5,
    flexDirection: 'row',
    padding: 10,
  },
  imageContainer: {
    backgroundColor: 'white',
    width: '40%',
    height: '92%',
    borderRadius: 10,
    elevation: 10,
    margin: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
 
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 13,
    color: 'gray',
  },
  quantity: {
    fontSize: 14,
  },
  price: {
    fontSize: 15,
    color: 'maroon',
    fontWeight: 'bold',
    marginTop: 5,
  },
  cancelButton: {
    flexDirection: 'row',
    backgroundColor: 'red',
    width: 90,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 90,
  },
  cancelText: {
    fontSize: 15,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5, // Add some space between the icon and text
  },
});
