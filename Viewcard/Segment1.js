import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Theme from '../constants/Theme';
import { useNavigation } from '@react-navigation/native';

const Segment1 = ({ route }) => {
  const { selectedItems } = route.params || {};
  const navigation = useNavigation();

  const [expanded, setExpanded] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null); // Track the selected time and its day

  const initialItemCount = 4;
  const displayedItems = expanded ? selectedItems : selectedItems.slice(0, initialItemCount);

  const handleSeeMore = () => {
    setExpanded(true);
  };

  const handlePress = async (text, day) => {
    const newSelectedTime = { text, day };
    if (selectedTime && selectedTime.text === text && selectedTime.day === day) {
      // Deselect the current selection if the same one is pressed again
      setSelectedTime(null);
      await AsyncStorage.removeItem('selectedDeliveryTime');
    } else {
      setSelectedTime(newSelectedTime);
      await AsyncStorage.setItem('selectedDeliveryTime', JSON.stringify(newSelectedTime));
    }
  };

const handleCheckout = async () => {
  if (!selectedTime) {
    alert('Please select a delivery time.');
    return;
  }
  navigation.navigate('Payment', {
    cartItems: selectedItems,
    deliveryTime: selectedTime.text, // Pass the selected delivery time here
    deliveryDay: selectedTime.day, // Pass the selected day here
  });
};


  useEffect(() => {
    const fetchSelectedDeliveryTime = async () => {
      try {
        const storedTime = await AsyncStorage.getItem('selectedDeliveryTime');
        if (storedTime) {
          setSelectedTime(JSON.parse(storedTime));
        }
      } catch (error) {
        console.error('Error fetching delivery time:', error);
      }
    };

    fetchSelectedDeliveryTime();
  }, []);

  const containerTextsToday = [
    '90 mins',
    '6AM to 7AM',
    '8AM to 9AM',
    '10AM-11PM',
    '12PM to 1PM',
    '2PM to 3PM',

  ];

  const containerTextsTomorrow = [
    '8AM to 9AM',
    '9AM to 10PM',
    '11AM-12PM',
    '12PM to 1PM',
    '1PM to 2PM',
    '3PM to 4PM',

  ];

  const renderContainers = (texts, day) => {
    return texts.map((text, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => handlePress(text, day)}
        style={[
          styles.deliveryTimeContainer,
          {
            backgroundColor: selectedTime && selectedTime.text === text && selectedTime.day === day ? 'lightgreen' : 'white',
            borderColor: selectedTime && selectedTime.text === text && selectedTime.day === day ? 'green' : 'gray',
          },
        ]}
      >
        <Text style={styles.deliveryTimeText}>{text}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>ITEMS IN SHIPMENT</Text>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {displayedItems.map((item) => (
          <View key={item.productId} style={styles.itemContainer}>
            <Text style={styles.itemCount}>{item.count}</Text>
            <Text style={styles.itemName}>- {item.productName}</Text>
          </View>
        ))}
        {!expanded && selectedItems.length > initialItemCount && (
          <TouchableOpacity onPress={handleSeeMore}>
            <Text style={styles.seeMoreText}>See More</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.dateText}>TODAY 12, MON</Text>
        <View style={styles.gridContainer}>
          {renderContainers(containerTextsToday, 'Today')}
        </View>

        <Text style={styles.dateText}>Tomorrow 13, TUE</Text>

        <View style={styles.gridContainer}>
          {renderContainers(containerTextsTomorrow, 'Tomorrow')}
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 50,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 12,
    marginTop: 3,
    marginLeft: 10,
    color: 'gray',
  },
  itemCount: {
    fontSize: 12,
    marginTop: 3,
    color: 'gray',
    fontWeight: 'bold',
  },
  seeMoreText: {
    fontSize: 12,
    color: Theme.COLORS.maroon,
    marginTop: 15,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 15,
    marginTop: 30,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  deliveryTimeContainer: {
    width: '30%', // Adjust the width for three columns with space between
    height: 40,
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  deliveryTimeText: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  checkoutButton: {
    width: '70%',
    height: 40,
    backgroundColor: 'maroon',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 30,
  },
  checkoutButtonText: {
    marginTop: 10,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Segment1;
