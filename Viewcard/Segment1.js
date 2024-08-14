import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Theme from '../constants/Theme';
import { useNavigation } from '@react-navigation/native';
import Icons from '../constants/Icons';
import { FontAwesome } from '@expo/vector-icons'; // Import the FontAwesome icons

const Segment1 = ({ route }) => {
  const { selectedItems } = route.params || {};
  const navigation = useNavigation();

  const [expanded, setExpanded] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);

  const initialItemCount = 4;
  const displayedItems = expanded ? selectedItems : selectedItems.slice(0, initialItemCount);

  const handleSeeMore = () => {
    setExpanded(true);
  };

  const handlePress = async (text, day) => {
    const newSelectedTime = { text, day };
      setSelectedTime(newSelectedTime);
  };
 

  const handleCheckout = async () => {
    if (!selectedTime) {
      alert('Please select a delivery time.');
      return;
    }
    navigation.navigate('Payment', {
      cartItems: selectedItems,
      deliveryTime: selectedTime.text, 
      deliveryDay: selectedTime.day,
    });
  };

 console.log('Selected time:', selectedTime);

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

  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'short' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const todayDate = formatDate(today);
  const tomorrowDate = formatDate(tomorrow);

  const generateTimeSlots = (start, end, isToday) => {
    const slots = [];
    const currentTime = new Date().getHours();
    for (let hour = start; hour <= end; hour++) {
      if (!isToday || hour > currentTime) {
        const formattedTime = `${hour % 12 || 12}${hour < 12 ? 'AM' : 'PM'} to ${((hour + 1) % 12) || 12}${hour < 11 ? 'AM' : 'PM'}`;
        slots.push(formattedTime);
      }
    }
    return slots;
  };

  const containerTextsToday = generateTimeSlots(6, 17, true);
  const containerTextsTomorrow = generateTimeSlots(6, 17, false);

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
      <View style={{ flexDirection: 'row' }}>
        <Image source={Icons.shipment} style={styles.shipmentIcon} />
        <Text style={styles.headerText}>ITEMS IN SHIPMENT</Text>
      </View>

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
        <Text style={styles.dateText}> {todayDate}</Text>
        <View style={styles.gridContainer}>
          {renderContainers(containerTextsToday, 'Today')}
        </View>

        <Text style={styles.dateText}> {tomorrowDate}</Text>
        <View style={styles.gridContainer}>
          {renderContainers(containerTextsTomorrow, 'Tomorrow')}
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <FontAwesome name="shopping-cart" size={20} color="white" style={styles.checkoutIcon} />
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
    marginTop: 10,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 5,
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
  shipmentIcon: {
    width: 25,
    height: 25,
    marginRight: 10,
    marginTop: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  deliveryTimeContainer: {
    width: '31%',
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
    borderRadius: 10,
    marginTop: 30,
    flexDirection: 'row', // Added for row alignment
    justifyContent: 'center', // Center the contents horizontally
  },
  checkoutButtonText: {
    marginLeft: 10, // Added for spacing between icon and text
    color: 'white',
    fontWeight: 'bold',
  },
  checkoutIcon: {
    marginRight: 10, // Added for spacing between icon and text
  },
});

export default Segment1;
