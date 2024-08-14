import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import Theme from "../constants/Theme";
import { instance } from "../constants/Common";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Otp = ({ navigation }) => {
  const route = useRoute();
  const { customerId ,userExits} = route.params;


  const [otp, setOtp] = useState(["", "", "", ""]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  // const [timer, setTimer] = useState(120);
  const inputs = useRef([]);
  // useEffect(() => {
  //   const countdown = setInterval(() => {
  //     setTimer((prevTimer) => {
  //       if (prevTimer <= 1) {
  //         clearInterval(countdown);
  //         Alert.alert(
  //           "Time Expired",
  //           "The OTP entry time has expired. Please request a new OTP."
  //         );
  //         return 0;
  //       }
  //       return prevTimer - 1;
  //     });
  //   }, 1000);

  //   return () => clearInterval(countdown);
  // }, []);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < inputs.current.length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleContinue = async () => {
    const enteredOtp = otp.join("");
    const isEmailValid = emailRegex.test(customerEmail);
    if (
      !customerId ||
      enteredOtp.length < 4 ||
      (!userExits && (!customerName || !customerEmail))
    ) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }


    if (!userExits && !isEmailValid) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    try {
      const response = await instance.post("/api/user/Login", {
        otp: enteredOtp,
        customerName,
        customerEmail,
        customerId,
      });
      if (response.status === 200) {
        await AsyncStorage.setItem(
          "userDetails",
          JSON.stringify(response.data.result[0])
        );
        navigation.replace("Home");
      }
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      Alert.alert("Verification Failed", "Invalid OTP. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
       {!userExits && (
        <>
          <Text style={styles.sectionTitle}>Enter your details</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            value={customerName}
            onChangeText={setCustomerName}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your Email"
            value={customerEmail}
            onChangeText={setCustomerEmail}
          />
        </>
      )}
      <Text style={styles.sectionTitle}>Verify OTP</Text>
      <View style={styles.otpContainer}>
        {otp.map((value, index) => (
          <TextInput
            key={index}
            style={styles.otpBox}
            keyboardType="numeric"
            maxLength={1}
            value={value}
            onChangeText={(text) => handleChange(text, index)}
            ref={(ref) => (inputs.current[index] = ref)}
          />
        ))}
      </View>
      {/* <Text style={styles.timerText}>{`Time remaining: ${timer} seconds`}</Text> */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText} >Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "black",
  },
  input: {
    width: "80%",
    height: 50,
    borderColor: "maroon",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    fontSize: 15,
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "maroon",
    borderRadius: 20,
    textAlign: "center",
    fontSize: 20,
    marginHorizontal: 5,
  },
  timerText: {
    fontSize: 13,
    color: "gray",
    fontWeight: "bold",
    marginBottom: 20,
    marginRight: 40,
  },
  continueButton: {
    backgroundColor: Theme.COLORS.maroon,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // For Android shadow
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Otp;
