import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icons from '../constants/Icons';
import Theme from '../constants/Theme';
import { useState } from 'react';

const BottomContainer = ({ totalPrice, onViewCart, initialCount, updateTotalPrice }) => {
  const [count, setCount] = useState(initialCount);

  const handleViewCart = () => {
    onViewCart(); // Call the onViewCart function passed from the parent component
  };

  // Update the count only if it's greater than the initial count
  const handleIncrementCount = () => {
    if (count > initialCount) {
      setCount(count + 1);
      updateTotalPrice(totalPrice + 1);
    }
  };

  const handleDecrementCount = () => {
    if (count > initialCount) {
      setCount(count - 1);
      updateTotalPrice(totalPrice - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.totalText}>Total Price: ₹{totalPrice}</Text>
      <View style={styles.countContainer}>
        <TouchableOpacity onPress={handleDecrementCount}>
          <Text style={styles.countText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.countText}>{count}</Text>
        <TouchableOpacity onPress={handleIncrementCount}>
          <Text style={styles.countText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.viewCartButton} onPress={handleViewCart}>
        <Text style={styles.viewCartText}>View Cart</Text>
        <Image source={Icons.rightArrow} style={styles.arrowIcon} />
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 13,
    backgroundColor: Theme.COLORS.black,
    borderColor:'gray',
    borderWidth:2,
    position: 'absolute',
    bottom: 50,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    height: 50
  },
  totalText: {
    color: Theme.COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    padding: 0,
  },
  viewCartText: {
    color: Theme.COLORS.white,
    fontWeight: 'bold',
    marginRight: 5,
    fontSize: 13
  },
  arrowIcon: {
    width: 10,
    height: 10,
    tintColor: Theme.COLORS.white,
  },
});

export default BottomContainer;
