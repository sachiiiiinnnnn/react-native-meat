import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Address = () => {
  const navigation = useNavigation();
  const [receiverName, setReceiverName] = useState('');
  const [receiverContact, setReceiverContact] = useState('');
  const [flatHouseBuilding, setFlatHouseBuilding] = useState('');
  const [nearbyLandmark, setNearbyLandmark] = useState('');

  const handleConfirmLocation = () => {
    // Validate address fields if needed
    const addressDetails = {
      receiverName,
      receiverContact,
      flatHouseBuilding,
      nearbyLandmark,
    };
    // Navigate back to Payment screen and pass addressDetails as route params
    navigation.navigate('Payment', { addressDetails });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Enter Address Details</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Receiver's name</Text>
        <TextInput
          style={styles.input}
          placeholder="Receiver's name"
          value={receiverName}
          onChangeText={setReceiverName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Receiver's contact</Text>
        <TextInput
          style={styles.input}
          placeholder="Receiver's contact"
          value={receiverContact}
          onChangeText={setReceiverContact}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Flat/House no/Building</Text>
        <TextInput
          style={styles.input}
          placeholder="Flat/House no/Building"
          value={flatHouseBuilding}
          onChangeText={setFlatHouseBuilding}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nearby landmark</Text>
        <TextInput
          style={styles.input}
          placeholder="Nearby landmark"
          value={nearbyLandmark}
          onChangeText={setNearbyLandmark}
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
