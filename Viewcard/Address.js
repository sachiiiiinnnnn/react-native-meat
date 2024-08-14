import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Corrected import
import { instance } from "../constants/Common";

const Address = ({ route }) => {
  const navigation = useNavigation();
  const [locationData, setLocationData] = useState({
    receiverName: '',
    receiverContact: '',
    flatHouseBuilding: '',
    nearbyLandmark: '',
  });
  const [customerId, setCustomerId] = useState('');

  const handleConfirmLocation = async () => {
    try {
      const combinedAddress = `${locationData.receiverName}, ${locationData.receiverContact}, ${locationData.flatHouseBuilding}, ${locationData.nearbyLandmark}`;
      const response = await instance.post('/api/user/Location', {
        customerId,
        location: combinedAddress
      });

      if (response.status === 200) {
        navigation.navigate('Payment');
      } else {
        Alert.alert('Error', 'Failed to submit address details.');
      }
    } catch (error) {
      console.error('Error submitting address details:', error);
      Alert.alert('Error', 'An error occurred while submitting address details.');
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await AsyncStorage.getItem("userDetails");
        if (userData !== null) {
          const parsedUserData = JSON.parse(userData);
          setCustomerId(parsedUserData.customerId);
        } else {
          Alert.alert('Error', 'User details not found.');
        }
      } catch (error) {
        console.error("Failed to load user details from AsyncStorage:", error);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Enter Address Details</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Receiver's name</Text>
        <TextInput
          style={styles.input}
          placeholder="Receiver's name"
          value={locationData.receiverName}
          onChangeText={(text) => setLocationData(prevData => ({ ...prevData, receiverName: text }))}
        />
      </View>

      {/* <View style={styles.inputContainer}>
        <Text style={styles.label}>Receiver's contact</Text>
        <TextInput
          style={styles.input}
          placeholder="Receiver's contact"
          value={locationData.receiverContact}
          onChangeText={(text) => setLocationData(prevData => ({ ...prevData, receiverContact: text }))}
        />
      </View> */}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Flat/House no/Building</Text>
        <TextInput
          style={styles.input}
          placeholder="Flat/House no/Building"
          value={locationData.flatHouseBuilding}
          onChangeText={(text) => setLocationData(prevData => ({ ...prevData, flatHouseBuilding: text }))}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>District</Text>
        <TextInput
          style={styles.input}
          placeholder="District"
          value={locationData.nearbyLandmark}
          onChangeText={(text) => setLocationData(prevData => ({ ...prevData, nearbyLandmark: text }))}
        />
      </View>

      {/* Confirm Location Button */}
      <TouchableOpacity style={styles.confirmLocation} onPress={handleConfirmLocation}>
        <Text style={styles.confirmLocationText}>Confirm Location</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Address;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 30,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  confirmLocation: {
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute',
    backgroundColor: 'maroon',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  confirmLocationText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
