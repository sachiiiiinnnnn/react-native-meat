import React from 'react';
import { StyleSheet, Text, View, Image, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import Icons from '../constants/Icons'; // Adjust the path as needed
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import Theme from '../constants/Theme';

const Payment = ({ route }) => {
  const { cartItems, totalPrice, addressDetails, deliveryTime, deliveryDay } = route.params;

  const navigation = useNavigation();
  const [cartDetails, setCartDetails] = useState(cartItems);

  const renderCartItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemCount}>Quantity: {item.count}</Text>
      </View>
      <Text style={styles.itemPrice}>₹{item.count * item.price}</Text>
    </View>
  );

  const calculateItemTotal = (cartItems) => {
    let total = 0;
    cartItems.forEach((item) => {
      total += item.count * item.price;
    });
    return total.toFixed(2);
  };

  const calculateGST = (cartItems) => {
    const itemTotal = parseFloat(calculateItemTotal(cartItems));
    const GSTPercentage = 18; // Assuming 18% GST
    const GSTAmount = (itemTotal * GSTPercentage) / 100;
    return GSTAmount.toFixed(2);
  };

  const calculateTotalPrice = () => {
    const itemTotal = parseFloat(calculateItemTotal(cartDetails));
    const GST = parseFloat(calculateGST(cartDetails));
    const deliveryFees = 30; // Example delivery fee
    const platformFees = 10; // Example platform fee
    const grandTotal = itemTotal + GST + deliveryFees + platformFees;
    return grandTotal.toFixed(2);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Offer Container */}
        <View style={styles.offerContainer}>
          <Image source={Icons.offer} style={styles.offerIcon} />
          <View>
            <Text style={styles.offerText}>Save ₹50 more with SLASH50</Text>
            <Text style={styles.couponText}>View All restaurant coupons</Text>
          </View>
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyButtonText}>APPLY</Text>
          </TouchableOpacity>
        </View>

        {/* Display Selected Delivery Time */}
        <View style={{ marginTop: 10, marginLeft: '0%' ,flexDirection:'row',justifyContent:'space-between',paddingHorizontal:10}}>
          <Text style={[Theme.FONTS.h8]}>Delivery Time: {deliveryTime}</Text>
          <Text style={[Theme.FONTS.h8]}>Delivery Day: {deliveryDay}</Text>
        </View>

        {/* Cart Items */}
        <FlatList
          data={cartDetails}
          keyExtractor={(item) => item.productId}
          renderItem={renderCartItem}
          contentContainerStyle={styles.contentContainer}
        />

        {/* Bill Summary */}
        <View style={styles.billSummary}>
          <View style={styles.billSummaryRow}>
            <Image source={Icons.billSummary} style={styles.billSummaryIcon} />
            <Text style={styles.billSummaryText}>Bill Summary</Text>
          </View>
          <View style={styles.priceDetails}>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>Item total</Text>
              <Text style={styles.priceValue}>₹{calculateItemTotal(cartDetails)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>GST</Text>
              <Text style={styles.priceValue}>₹{calculateGST(cartDetails)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>Delivery Fees</Text>
              <Text style={styles.priceValue}>₹30</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>Platform Fees</Text>
              <Text style={styles.priceValue}>₹10</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.priceText}>Grand Total</Text>
              <Text style={styles.priceValue}>₹{calculateTotalPrice()}</Text>
            </View>
          </View>
        </View>

        {/* Display Address Details */}
        {addressDetails && (
          <View style={styles.addressContainer}>
            <Text style={styles.addressHeading}>Delivery Address:</Text>
            <Text style={styles.addressDetail}>Name: {addressDetails.receiverName}</Text>
            <Text style={styles.addressDetail}>Contact: {addressDetails.receiverContact}</Text>
            <Text style={styles.addressDetail}>House No: {addressDetails.flatHouseBuilding}</Text>
            <Text style={styles.addressDetail}> Landmark: {addressDetails.nearbyLandmark}</Text>
          </View>
        )}

        {/* Add Location Button */}
        <TouchableOpacity
          style={styles.addLocationButton}
          onPress={() => navigation.navigate('Address')}
        >
          <Image source={Icons.address} style={styles.offerIcon} />
          <Text style={styles.addLocationButtonText}>Add Location</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Total Container at Bottom */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ₹{calculateTotalPrice()}</Text>
        <TouchableOpacity>
          <Text style={styles.addToPaymentButton}>Add to payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


export default Payment;


const styles = StyleSheet.create({
  scrollContainer: {
    padding: 10,

  },
  offerContainer: {
    width: '95%',
    height: 70,
    backgroundColor: 'white',
    alignSelf: 'center',
    marginTop: 5,
    borderRadius: 5,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  offerIcon: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  offerText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  couponText: {
    color: 'gray',
    fontSize: 12,
    marginTop: 5,
  },
  applyButton: {
    marginTop: 10,
    marginLeft: 30,
    borderWidth: 1,
    borderColor: 'maroon',
    paddingHorizontal: 5,
    borderRadius: 5,
    paddingVertical: 5,
    height: 30,
  },
  applyButtonText: {
    textAlign: 'center',
    color: 'maroon',
  },
  billSummary: {
    padding: 10,
    marginTop: 20,
  },
  billSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  billSummaryIcon: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  billSummaryText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingBottom: 0,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 10,
    marginTop: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceDetails: {
    flex: 1, // Ensure it takes full width
    marginLeft: 10,
    marginBottom:10
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Align children to opposite ends
    marginBottom: 5, // Adjust spacing
  },
  priceText: {
    fontSize: 14,
    color: 'black',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  itemDetails: {
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemCount: {
    fontSize: 13,
    color: 'gray',
  },
  itemPrice: {
    fontSize: 14,
    color: 'maroon',
    fontWeight: 'bold',
    marginRight: 10,
  },
  addressContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  addressHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addressDetail: {
    fontSize: 16,
    marginBottom: 5,
  },
  addLocationButton: {
    padding: 10,
    marginTop: 20,
    backgroundColor: 'maroon',
    alignSelf: 'center',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:100
  },
  addLocationButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  totalContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addToPaymentButton: {
    color: 'white',
    width: '100%',
    backgroundColor: 'maroon',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
