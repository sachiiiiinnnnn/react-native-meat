import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Theme from '../constants/Theme';

const ViewCart = ({ route, navigation }) => {
  const { selectedItems, totalPrice: initialTotalPrice, updateTotalPrice } = route.params;
  
  const [cartItems, setCartItems] = useState(selectedItems);
  const [totalPrice, setTotalPrice] = useState(initialTotalPrice);

  const handleIncrement = (item) => {
    const updatedCartItems = cartItems.map((cartItem) =>
      cartItem.id === item.id ? { ...cartItem, count: cartItem.count + 1 } : cartItem
    );
    setCartItems(updatedCartItems);
    const priceIncrement = parseInt(item.money.replace('₹', ''));
    const newTotalPrice = totalPrice + priceIncrement;
    setTotalPrice(newTotalPrice);
    updateTotalPrice(newTotalPrice);
  };

  const handleDecrement = (item) => {
    if (item.count === 0) return;
    const updatedCartItems = cartItems.map((cartItem) =>
      cartItem.id === item.id ? { ...cartItem, count: cartItem.count - 1 } : cartItem
    );
    setCartItems(updatedCartItems);
    const priceDecrement = parseInt(item.money.replace('₹', ''));
    const newTotalPrice = totalPrice - priceDecrement;
    setTotalPrice(newTotalPrice);
    updateTotalPrice(newTotalPrice);
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={item.image} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCount}>Quantity: {item.count}</Text>
        <Text style={styles.itemPrice}>{item.money}</Text>
        <Text style={styles.deliveryTime}> {item.deliveryTime}</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleDecrement(item)}>
            <Text style={styles.counterButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.counterText}>{item.count}</Text>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleIncrement(item)}>
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const handleCheckout = () => {
    // Add your checkout logic here
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCartItem}
        contentContainerStyle={styles.contentContainer}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ₹{totalPrice}</Text>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingBottom: 100,
    padding:20,
    marginTop:20
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 10,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemDetails: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemCount: {
    fontSize: 13,
    color: 'gray',
  },
  itemPrice: {
    fontSize: 14,
    color: Theme.COLORS.maroon,
    fontWeight:'bold'
  },
  totalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  checkoutButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deliveryTime:{
    fontSize:10
  },
  counterContainer:{
    flexDirection:'row',
    justifyContent:'space-evenly',
    backgroundColor:Theme.COLORS.maroon,
    height:30,
    width:'60%',
    alignItems:'center',
    borderRadius:5,
    left:100,
    color:'white'
  },
  counterButtonText:{
    color:'white',
    fontWeight:'bold',
    fontSize:17
  },
  counterText:{
    color:'white',
    fontWeight:'bold'
  }
});

export default ViewCart;