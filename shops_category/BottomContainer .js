import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import Theme from "../constants/Theme";
import Icons from "../constants/Icons";
import { useSelector } from "react-redux";
const BottomContainer = ({
  totalItemCount,
  totalPrice,
  onViewCart,
  initialCount,
  updateTotalPrice,
}) => {
  const [count, setCount] = useState(initialCount);

  const handleViewCart = () => {
    if (typeof onViewCart === "function") {
      onViewCart();
    }
  };

  const productsCart = useSelector((state) => state.cart.productsCart);

  // const handleIncrementCount = () => {
  //   setCount(count + 1);
  //   updateTotalPrice(totalPrice + 1);
  // };

  // const handleDecrementCount = () => {
  //   if (count > initialCount) {
  //     setCount(count - 1);
  //     updateTotalPrice(totalPrice - 1);
  //   }
  // };


  const price = (productsCart || []).map((i) =>
    i.count > 1 ? i.count * i.price : i.price
  );

  // Ensure price is an array before reducing
  const TotalPrice =
    price.length > 0 ? price.reduce((acc, val) => acc + val, 0) : 0;
// console.log('====================================');
// console.log(TotalPrice);
// console.log('====================================');
  return (
    <View style={[styles.container, { bottom: count > initialCount ? 50 : 0 }]}>
      <Text style={[styles.itemCountText, Theme.FONTS.h5]}>
        {productsCart?.length} items
      </Text>
      <Text style={styles.totalText}>| ₹{TotalPrice}</Text>
      {/* <View style={styles.countContainer}>
        <TouchableOpacity onPress={handleDecrementCount}>
          <Text style={styles.countText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.countText}>{count}</Text>
        <TouchableOpacity onPress={handleIncrementCount}>
          <Text style={styles.countText}>+</Text>
        </TouchableOpacity>
      </View> */}
      <TouchableOpacity style={styles.viewCartButton} onPress={handleViewCart}>
        <Text style={styles.viewCartText}>View Cart</Text>
        <Image source={Icons.rightArrow} style={styles.arrowIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 13,
    backgroundColor: Theme.COLORS.black,
    borderColor: "gray",
    borderWidth: 2,
    position: "absolute",
    bottom: 0,
    width: "90%",
    alignSelf: "center",
    borderRadius: 10,
    height: 50,
    elevation: 5,
    marginBottom: 10, // Add elevation to ensure it stays above other content
  },
  totalText: {
    color: Theme.COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 110,
  },
  itemCountText: {
    color: "white",
    fontWeight: "bold",
  },
  viewCartButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 5,
    padding: 0,
  },
  viewCartText: {
    color: Theme.COLORS.white,
    fontWeight: "bold",
    marginRight: 5,
    fontSize: 13,
  },
  arrowIcon: {
    width: 10,
    height: 10,
    tintColor: Theme.COLORS.white,
  },
  itemCount: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
});

export default BottomContainer;
