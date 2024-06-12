import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook
import Theme from '../constants/Theme';
import Images from '../constants/Images';
import { shopDetails } from '../constants/Data';
import Icons from '../constants/Icons';

const Categories = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation(); // Use useNavigation hook

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const renderShopDetails = ({ item }) => (
    <TouchableOpacity style={styles.shopDetailsContainer} onPress={() => navigation.navigate('ShopDetails')}>
      <Image source={item.image} style={styles.shopImage} resizeMode="cover" />
      <View style={styles.shopInfoContainer}>
        <View style={styles.leftInfo}>
          <Text style={styles.shopName}>{item.name}</Text>
          <Text style={styles.shopLocation}>{item.address}</Text>
          <Text style={styles.shopCity}>{item.City}</Text>
        </View>
        <View style={styles.rightInfo}>
          <View style={styles.ratingContainer}>
            <Image source={Icons.starRating} style={styles.starIcon} />
            <Text style={styles.shopRating}> {item.rating}</Text>
          </View>
          <Text style={styles.shopDistance}>~{item.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={toggleSearch} style={styles.searchIconContainer}>
          <Image source={require('../assets/icons/search.png')} style={styles.searchIcon} />
        </TouchableOpacity>
        {isSearchVisible && (
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery} 
          />
        )}
      </View>
      <FlatList
        data={shopDetails}
        renderItem={renderShopDetails}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.shopList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  searchIconContainer: {
    padding: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: 'black',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  shopDetailsContainer: {
    width: 340,
    height: 280,
    backgroundColor: Theme.COLORS.white,
    alignSelf: 'center',
    marginTop: 5,
    borderRadius: 10,
    elevation: 5,
    marginBottom: 10,
  },
  shopImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignSelf: 'center',
  },
  shopInfoContainer: {
    paddingHorizontal: 10,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftInfo: {
    flex: 1,
  },
  rightInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginTop:5,
    right:5
  },
  shopName: {
    ...Theme.FONTS.h3,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  shopLocation: {
    ...Theme.FONTS.h7,
    marginTop: 5,
    marginLeft: 5,
    fontWeight:'bold',
    opacity:0.7
  },
  shopCity:{
    ...Theme.FONTS.h7,
    marginTop: 5,
    marginLeft: 5,
    fontWeight:'bold',
    opacity:0.4
  },
  shopDistance: {
    ...Theme.FONTS.h7,
    marginTop:15,
    fontWeight:'bold',
    color:Theme.COLORS.gray
  },
  shopRating: {
    ...Theme.FONTS.h7,
    color:'white',
    fontWeight:'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:'green',
    paddingHorizontal:10,
    paddingVertical:5,
  
    borderRadius:5
  },
  starIcon: {
    width: 15,
    height: 15,
    marginRight: 5,
  },
  shopList: {
    paddingBottom: 20,
  },
});

export default Categories;
