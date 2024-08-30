import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import Icons from "../constants/Icons";
import { useNavigation } from "@react-navigation/native";
import Theme from "../constants/Theme";
import PaymentButton from "./PaymentButton";
import { instance } from "../constants/Common";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Payment = ({ route }) => {
  const {
    cartItems = [],
    totalPrice = 0,
    deliveryTime = "",
    deliveryDate = "",
  } = route.params || {};

  const navigation = useNavigation();
  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const [fetchedAddressDetails, setfetchedAddressDetails] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const toggleSwitch = () => setIsOnlineMode((previousState) => !previousState);

  const CustomSwitch = ({ isOn, onToggle }) => {
    return (
      <TouchableOpacity
        style={[styles.slider, isOn && styles.sliderOn]}
        onPress={onToggle}
      >
        <View style={[styles.knob, { left: isOn ? 24 : 2 }]} />
      </TouchableOpacity>
    );
  };

  const handleAddToPayment = async () => { 
    const logData = cartItems.map((product) => ({
      productId: product.productId,
      categoryId: product.categoryId,
      quantity: product.count * product.quantity, // Assuming `product.count` is the number of items and `product.quantity` is the unit quantity.
      amount: product.price * product.count, // Assuming `product.price` is the price of a single unit.
    }));

    function formatTimeRange(timeRange) {
      return timeRange.replace(/(\d+)(AM|PM)/g, "$1:00$2").replace(/\s/g, "");
    }

    const formattedTime = formatTimeRange(deliveryTime);
    const [startTime, endTime] = formattedTime.split("to");

    const bookingData = logData.map((item) => ({
      productId: item.productId,
      customerId: custId,
      locationId: selectedAddress,
      quantity: item.quantity,
      amount: item.amount,
      paymentMode: "Online",
      bookingDate: deliveryDate,
      bookingStartTime: startTime,
      bookingEndTime: endTime,
      bookingStatus: "completed",
      categoryId: item.categoryId,
    }));

    try {
      const response = await instance.post("/api/user/Booking", bookingData);
      if (response.status === 200) {
        Alert.alert("Success", "Booking added successfully.");
        navigation.replace("Home");
      }
    } catch (error) {
      console.error("Failed to add booking:", error);
      Alert.alert(
        "Booking Failed",
        "There was an error processing your booking. Please try again."
      );
    }
  };

  const getAddress = async (id) => {
    try {
      const response = await instance.get(
        `/api/user/Location?customerId=${id}`
      );
      if (response.status === 200) {
        setfetchedAddressDetails(response.data);
      }
    } catch (error) {
      console.error("error:", error);
    }
  };
  const [custId, setCustId] = useState();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await AsyncStorage.getItem("userDetails");
        if (userData !== null) {
          const parsedUserData = JSON.parse(userData);
          setCustId(parsedUserData.customerId);
          getAddress(parsedUserData.customerId);
        } else {
          Alert.alert("Error", "User details not found.");
        }
      } catch (error) {
        console.error("Failed to load user details from AsyncStorage:", error);
      }
    };

    fetchUserDetails();
  }, []);

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
  const [totalAmount, setTotalAmount] = useState(0);

  const calculateTotalPrice = () => {
    const itemTotal = parseFloat(calculateItemTotal(cartItems));
    const GST = parseFloat(calculateGST(cartItems));
    const deliveryFees = 30; // Example delivery fee
    const platformFees = 10; // Example platform fee
    const grandTotal = itemTotal + GST + deliveryFees + platformFees;
    setTotalAmount(grandTotal);
    return grandTotal.toFixed(2);
  };

  useEffect(() => {
    calculateTotalPrice();
  }, [cartItems]);

  const renderAddressItem = ({ item }) => (
    <View style={styles.addressContainer}>
      <TouchableOpacity
        style={[
          styles.addressCard,
          selectedAddress === item.locationId && styles.selectedAddress,
        ]}
        onPress={() => setSelectedAddress(item.locationId)}
      >
        <View style={styles.addressContent}>
          <Text style={styles.addressHeading}>Delivery Address:</Text>
          <Text style={styles.addressDetail}>Address: {item.location}</Text>
        </View>
        {selectedAddress === item.locationId && (
          <View style={styles.checkmarkContainer}>
            <Text style={styles.checkmark}>✔</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const sortedAddresses = selectedAddress
    ? [
        ...fetchedAddressDetails.filter(
          (address) => address.locationId === selectedAddress
        ),
        ...fetchedAddressDetails.filter(
          (address) => address.locationId !== selectedAddress
        ),
      ]
    : fetchedAddressDetails;
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.productId}
        renderItem={renderCartItem}
        ListHeaderComponent={() => (
          <View style={styles.headerContent}>
            <View style={styles.offerContainer}>
              <Image source={Icons.offer} style={styles.offerIcon} />
              <View>
                <Text style={styles.offerText}>
                  Save ₹50 more with NIHCAS50
                </Text>
                <Text style={styles.couponText}>
                  View All restaurant coupons
                </Text>
              </View>
              <TouchableOpacity style={styles.applyButton}>
                <Text style={styles.applyButtonText}>APPLY</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.deliveryDetails}>
              <Text style={[Theme.FONTS.h8]}>
                Delivery Time: {deliveryTime}
              </Text>
              <Text style={[Theme.FONTS.h8]}>
                Delivery Date: {deliveryDate}
              </Text>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.footerContent}>
            <View style={styles.billSummary}>
              <View style={styles.billSummaryRow}>
                <Image
                  source={Icons.billSummary}
                  style={styles.billSummaryIcon}
                />
                <Text style={styles.billSummaryText}>Bill Summary</Text>
              </View>
              <View style={styles.priceDetails}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>Item total</Text>
                  <Text style={styles.priceValue}>
                    ₹{calculateItemTotal(cartItems)}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>GST</Text>
                  <Text style={styles.priceValue}>
                    ₹{calculateGST(cartItems)}
                  </Text>
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
                  <Text style={styles.priceValue}>₹{totalAmount}</Text>
                </View>
              </View>
            </View>

            <View style={styles.paymentContainer}>
              <View style={{ flexDirection: "row" }}>
                <Image source={Icons.payment} style={styles.paymentIcon} />
                <Text style={styles.title}>Payment mode</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.text}>Online mode</Text>
                <CustomSwitch isOn={isOnlineMode} onToggle={toggleSwitch} />
              </View>
            </View>

            <FlatList
              data={sortedAddresses}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderAddressItem}
              contentContainerStyle={styles.contentContainer}
            />

            <TouchableOpacity
              style={styles.addLocationButton}
              onPress={() => navigation.navigate("Address")}
            >
              <Image source={Icons.address} style={styles.offerIcon} />
              <Text style={styles.addLocationButtonText}>Add Location</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.contentContainer}
      />

      {/* Total Container at Bottom */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total:₹{totalAmount}</Text>
        <PaymentButton onPress={handleAddToPayment} />
      </View>
    </View>
  );
};

export default Payment;

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
  },
  offerContainer: {
    width: "95%",
    height: 70,
    backgroundColor: "#fff6ed",
    alignSelf: "center",
    marginTop: 5,
    borderRadius: 5,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  offerIcon: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  paymentIcon: {
    width: 25,
    height: 25,
    marginRight: 5,
  },
  offerText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  couponText: {
    color: "gray",
    fontSize: 12,
    marginTop: 5,
  },
  applyButton: {
    marginTop: 10,
    marginLeft: 30,
    borderWidth: 1,
    borderColor: "maroon",
    paddingHorizontal: 5,
    borderRadius: 5,
    paddingVertical: 5,
    height: 30,
  },
  applyButtonText: {
    textAlign: "center",
    color: "maroon",
  },
  footerContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  billSummary: {
    backgroundColor: "#F0F8FF",
    borderRadius: 5,
    padding: 10,
  },
  billSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  billSummaryIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  billSummaryText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  priceDetails: {
    marginTop: 10,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  priceText: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  contentContainer: {
    paddingBottom: 0,
  },
  itemContainer: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "white",
    marginBottom: 10,
    borderRadius: 10,
    marginTop: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceDetails: {
    flex: 1, // Ensure it takes full width
    marginLeft: 10,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Align children to opposite ends
    marginBottom: 5, // Adjust spacing
  },
  priceText: {
    fontSize: 14,
    color: "black",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
  },
  itemDetails: {
    justifyContent: "center",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  itemCount: {
    fontSize: 13,
    color: "gray",
  },
  itemPrice: {
    fontSize: 14,
    color: "maroon",
    fontWeight: "bold",
    marginRight: 10,
  },
  // addressContainer: {
  //   padding: 10,
  //   backgroundColor: '#f0f0f0',
  //   borderRadius: 5,
  //   width: 250,
  //   height: 100,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginRight: 10,
  //   marginLeft:20
  // },
  // addressHeading: {
  //   fontSize: 14,
  //   fontWeight: 'bold',
  //   marginBottom: 8,
  // },
  // addressDetail: {
  //   fontSize: 15,
  //   marginBottom: 5,
  // },
  addLocationButton: {
    padding: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "maroon",
    alignSelf: "center",
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 100,
  },
  addLocationButtonText: {
    color: "maroon",
    fontWeight: "bold",
    marginLeft: 10,
  },
  totalContainer: {
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  addToPaymentButton: {
    color: "white",
    width: "100%",
    backgroundColor: "maroon",
    padding: 10,
    borderRadius: 5,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  paymentContainer: {
    backgroundColor: "#F0F8FF",
    padding: 10,
    borderRadius: 5,
  },
  paymentIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  text: {
    fontSize: 16,
  },
  slider: {
    width: 50,
    height: 30,
    backgroundColor: "gray",
    borderRadius: 50,
    padding: 5,
  },
  sliderOn: {
    backgroundColor: "maroon",
  },
  knob: {
    width: 20,
    height: 20,
    backgroundColor: "white",
    borderRadius: 50,
  },
  deliveryDetails: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
  },
  addressContainer: {
    margin: 10,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    position: "relative",
  },
  addressContent: {
    flex: 1,
  },
  addressHeading: {
    fontWeight: "bold",
  },
  addressDetail: {
    marginVertical: 5,
  },
  checkmarkContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#4caf50",
    borderRadius: 15,
    padding: 5,
  },
  checkmark: {
    color: "#fff",
    fontSize: 10,
  },
  contentContainer: {
    paddingHorizontal: 10,
  },
});
