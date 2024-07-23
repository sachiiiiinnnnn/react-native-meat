import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Theme from '../constants/Theme';

const UserName = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');


  const handleContinue = () => {
    console.log('Entered Username:', userName);

    
    // Navigate to another screen if needed
     navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={userName}
        onChangeText={setUserName}
      />
            <TextInput
        style={styles.input}
        placeholder="Enter your Email"
        value={userEmail}
        onChangeText={setUserEmail}
      />
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
  continueButton: {
    backgroundColor: Theme.COLORS.maroon,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    marginBottom:50 // For Android shadow
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
   
  },
});

export default UserName;
