import React, { useEffect, useRef } from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const PaymentButton = ({ onPress }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true, // use native driver for better performance
      })
    ).start();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300], // TranslateX from -300 to 300 pixels
  });

  return (
    <TouchableOpacity
      style={styles.buttonContainer}
      onPress={onPress}
    >
      <View style={styles.button}>
        <AnimatedLinearGradient
          colors={["white", "maroon", "white", "maroon", "white"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { transform: [{ translateX }] }]}
        />
        <Text style={styles.buttonText}>Add to payment</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 4,
    overflow: "hidden",
    alignSelf: "center",
    margin: 10,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF2EF",
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "maroon",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    width: "200%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
    zIndex: 1,
    textShadowColor: "#000", // Shadow color
    textShadowOffset: { width: 2, height: 2 }, // Shadow offset
    textShadowRadius: 15, // Shadow radius
  },
});

export default PaymentButton;
