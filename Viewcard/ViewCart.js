import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Theme from '../constants/Theme';
import icons from '../constants/Icons';
import Segment1 from './Segment1';
import Segment2 from './Segment2';
import { useSelector, useDispatch } from 'react-redux';
import { decrementItem, incrementItem } from '../redux/actions/counterActions'; // Assuming you have defined these actions

const ViewCart = ({ route, navigation }) => {
  
  const { selectedCategory, setFilteredData, filteredData } = route?.params || {};


  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.cartItems); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSegment2ModalVisible, setIsSegment2ModalVisible] = useState(false);``

  const handleIncrement = (item) => {
    if (item.count < item.stocks) {
      dispatch(incrementItem(item)); 

      const updatedData = {
        ...filteredData,
        [selectedCategory]: filteredData[selectedCategory].map(shopItem =>
          shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count + 1 } : shopItem
        )
      };
      console.log("======>>>>",updatedData);
      setFilteredData(updatedData);

    }
  };

  const handleDecrement = (item) => {
    console.log(item);
    if (item.count > 0) {
      dispatch(decrementItem(item)); 

      const updatedData = {
        ...filteredData,
        [selectedCategory]: filteredData[selectedCategory].map(shopItem =>
          shopItem.productId === item.productId ? { ...shopItem, count: Math.max(0, shopItem.count - 1) } : shopItem
        )
      };
      setFilteredData(updatedData);
  
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemCount}>Quantity: {item.count}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
        <Text style={styles.deliveryTime}>{item.deliveryTime}</Text>
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
    navigation.navigate('Segment1', { 
      selectedCategory,
      filteredData,
      selectedItems: cartItems // Pass the correct items from your Redux state
    });
  };
  const openSegment1 = () => {
    setIsModalVisible(true);
  };

  const closeSegment1 = () => {
    setIsModalVisible(false);
  };

  const openSegment2 = () => {
    setIsSegment2ModalVisible(true);
  };

  const closeSegment2 = () => {
    setIsSegment2ModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.productId.toString()}
        renderItem={renderCartItem}
        contentContainerStyle={styles.contentContainer}
      />

      <View style={styles.totalContainer}>
        <View style={styles.segmentContainer}>
          <TouchableOpacity style={styles.segmentButton} onPress={openSegment1}>
            <View style={styles.row}>
              <Image source={icons.express} style={styles.icon} />
              <Text style={styles.segmentText}>Delivery</Text>
            </View>
            <Text style={styles.additionalText}>Today in 90 mins</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.segmentButton} onPress={openSegment2}>
            <View style={styles.row}>
              <Image source={icons.schedule} style={styles.icon} />
              <Text style={styles.segmentText}>Schedule</Text>
            </View>
            <Text style={styles.additionalText}>Pick your time</Text>
          </TouchableOpacity> */}
        </View>
        <View style={styles.priceContainer}>
          <Text style={[styles.itemCountText, Theme.FONTS.h3]}>{cartItems.length} items</Text>
          <Text style={styles.totalText}>| ₹{calculateTotalPrice(cartItems)}</Text>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Choose your timing</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={isModalVisible} animationType="slide" onRequestClose={closeSegment1}>
        <Segment1
          closeModal={closeSegment1}
          route={{
            params: {
              selectedCategory,
              filteredData,
              selectedItems: cartItems, // Pass the correct items from your Redux state
            },
          }}
        />
      </Modal>

      {/* <Modal visible={isSegment2ModalVisible} animationType="slide" onRequestClose={closeSegment2}>
        <Segment2
          closeModal={closeSegment2}
          route={{
            params: {
              selectedCategory,
              filteredData,
              selectedItems: cartItems, // Pass the correct items from your Redux state
            },
          }}
        />
      </Modal> */}
    </View>
  );
};

const calculateTotalPrice = (cartItems) => {
  let totalPrice = 0;
  cartItems.forEach(item => {
    totalPrice += item.count * item.price;
  });
  return totalPrice.toFixed(2); // Adjust based on your currency format
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingBottom: 160,
    padding: 20,
    marginTop: 0,
  },
  itemCountText: {
    fontWeight: 'bold',
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
    fontWeight: 'bold',
  },
  deliveryTime: {
    fontSize: 10,
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: Theme.COLORS.maroon,
    height: 30,
    width: 80,
    alignItems: 'center',
    borderRadius: 5,
    left: 150,
    bottom: 15,
    color: 'white',
  },
  counterButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
  counterText: {
    color: 'white',
    fontWeight: 'bold',
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
  },
  segmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingBottom: 10,
    marginBottom: 10,
  },
  segmentButton: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 25,
    padding: 10,
    borderColor: 'maroon',
    marginHorizontal: 5,
    width: '45%',
  },
  segmentText: {
    fontSize: 16,
    marginLeft: 5,
  },
  additionalText: {
    fontSize: 11,
    color: 'gray',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 110,
  },
  checkoutButton: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    right: 80,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    width: 20,
    height: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ViewCart; 