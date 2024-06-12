import React from 'react';
import { StyleSheet, Text, View ,FlatList,Image,TouchableOpacity} from 'react-native';
import Icons from '../constants/Icons';
const User = ({ route }) => {
  const { email, username, mobile } = route.params;

  const mealZoneData = [
    { id: '1', name: 'Rewards', icon: Icons.recipe },
    { id: '2', name: 'Orders', icon: Icons.blogs },
    { id: '3', name: 'Address', icon: Icons.terms },
    { id: '4', name: 'Notifications', icon: Icons.faq },
    { id: '5', name: 'Contact Us', icon: Icons.privacy },
  ];

  
  const renderMealZoneItem = ({ item }) => (
    <TouchableOpacity onPress={() => console.log('Pressed:', item.name)}>
      <View style={styles.mealsZoneContainer}>
        <Image source={item.icon} style={styles.icon} />
        <Text style={styles.mealsZoneText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoText1}>{username}</Text>
      </View>
      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoText}>{email}</Text>
        <Text style={styles.userInfoText}>{mobile}</Text>
      </View>

      
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' ,marginTop:40}}>Settings</Text>
        <FlatList
          data={mealZoneData}
          renderItem={renderMealZoneItem}
          keyExtractor={(item) => item.id}
        />
      </View>
      </View>
      

      
   
  );
};

export default User;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  

  },
  userInfoContainer: {

    flexDirection: 'row',
    marginLeft:20,
    top:30,
    marginTop:5,
    gap:40
  },
  userInfoText: {
    fontSize: 13,
  },
  userInfoText1:{
    fontSize: 25,
    color:'maroon',
fontWeight:'bold'
  },
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
});
