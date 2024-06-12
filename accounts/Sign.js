import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Theme from '../constants/Theme';

const Sign = () => {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');

  const handleSignUp = async () => {
    // Validate email
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Validate mobile number
    if (!validateMobile(mobile)) {
      Alert.alert('Invalid Mobile Number', 'Please enter a 10-digit mobile number.');
      return;
    }

    // All validations passed, save data to AsyncStorage
    try {
      await AsyncStorage.setItem('email', email);
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('mobile', mobile);
      Alert.alert('Success', 'Sign up successful!');
      
      // Navigate to User screen with user details as params
      navigation.navigate('User', { email, username, mobile });
    } catch (error) {
      console.error('Error saving data to AsyncStorage:', error);
      Alert.alert('Error', 'An error occurred while saving data. Please try again later.');
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile) => {
    return /^\d{10}$/.test(mobile);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Sign;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.COLORS.white,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: Theme.COLORS.maroon,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: Theme.COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
