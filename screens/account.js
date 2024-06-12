import { StyleSheet, Text, TouchableOpacity, View, Image, FlatList } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook
import Theme from '../constants/Theme';
import Icons from '../constants/Icons'; // Adjust the path if needed
import Sign from '../accounts/Sign'
const mealZoneData = [
  { id: '1', name: 'Recipes', icon: Icons.recipe },
  { id: '2', name: 'Blogs', icon: Icons.blogs },
  { id: '3', name: 'Terms & Conditions', icon: Icons.terms },
  { id: '4', name: 'FAQs', icon: Icons.faq },
  { id: '5', name: 'Privacy Policy', icon: Icons.privacy },
  { id: '6', name: 'Cancellation & Reschedule Policy', icon: Icons.cancellation },
];

const Account = () => {
  const navigation = useNavigation(); // Use the navigation hook

  const renderMealZoneItem = ({ item }) => (
    <TouchableOpacity style={styles.mealsZoneContainer}>
      <Image source={item.icon} style={styles.icon} />
      <Text style={styles.mealsZoneText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ padding: 20, marginTop: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Hey Meatlover</Text>
        <Text style={{ fontSize: 12, marginTop: 10, color: Theme.COLORS.gray }}>
          Welcome to our app. Manage your orders, reward, address & other details.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: Theme.COLORS.maroon,
            height: 35,
            width: 300,
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
            borderRadius: 5,
          }}
          onPress={() => navigation.navigate(Sign)} // Navigate to Signup screen
        >
          <Text style={{ color: Theme.COLORS.white, fontSize: 15, fontWeight: 'bold' }}>Login / Sign Up</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Meals Zone</Text>
        <FlatList
          data={mealZoneData}
          renderItem={renderMealZoneItem}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
};

export default Account;

const styles = StyleSheet.create({
  mealsZoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 5,
    height: 50,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  mealsZoneText: {
    fontSize: 14,
    marginLeft: 10,
  },
})
