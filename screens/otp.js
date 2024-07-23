import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Theme from '../constants/Theme';
import { instance } from '../constants/Common';
import { useRoute } from '@react-navigation/native';

const Otp = ({ navigation }) => {
  const route = useRoute();
  const { customerId } = route.params;
  const [otp, setOtp] = useState(['', '', '', '']);
  const [customerName, setcustomerName] = useState('');
  const [customerEmail, setcustomerEmail] = useState('');
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < inputs.current.length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleContinue = async () => {
    const enteredOtp = otp.join('');
    if (!customerName || !customerEmail ||!customerId|| enteredOtp.length < 4) {
      Alert.alert('Validation Error', 'Please fill all the fields and enter a valid OTP.');
      return;
    }

    console.log('Username:', customerName, 'Email:', customerEmail, 'Entered OTP:', enteredOtp);

    try {
      const response = await instance.post('/api/user/Login', { otp: enteredOtp, customerName, customerEmail,customerId });
      console.log('OTP verification successful:', response.data);
      navigation.replace('Home');
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      Alert.alert('Verification Failed', 'Invalid OTP. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={customerName}
        onChangeText={setcustomerName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your Email"
        value={customerEmail}
        onChangeText={setcustomerEmail}
      />
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
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 18,
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 20,
    marginHorizontal: 5,
  },
  continueButton: {
    backgroundColor: Theme.COLORS.maroon,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // For Android shadow
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Otp;
