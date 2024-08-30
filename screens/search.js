import { StyleSheet, Image, View, TextInput, FlatList, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { instance } from '../constants/Common';
import icons from '../constants/Icons'; // Adjust the path if needed
import { useNavigation } from '@react-navigation/native';
import BottomContainer from '../shops_category/BottomContainer ';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
const numColumns = 3;

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchData, setSearchData] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [categoryData, setCategoryData] = useState([]);

  
  const cartState = useSelector(state => state.cart) || {}; // Default to an empty object if undefined
  const productsCart = useSelector((state) => state.cart.productsCart);

  // Use optional chaining and default values to handle undefined cases
  const totalItemCount = (cartState.cartItems || []).reduce((total, item) => total + (item.count || 0), 0);
  const totalPrice = cartState.totalPrice || 0;
  const navigation = useNavigation();

  useEffect(() => {
    getCategory();
  }, []);

  const getCategory = async () => {
    try {
      const response = await instance.get('/api/user/Category');
      if (response.status === 200) {
        setCategoryData(response.data);
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

  const getSearch = async (productName) => {
    try {
      const response = await instance.get(`/api/user/SearchProduct?productName=${productName}`);
      if (response.status === 200) {
        setSearchData(response.data);
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

  const handleSearchIconClick = () => {
    setIsSearchActive(true);
  };

  const handleSearchQueryChange = (text) => {
    setSearchQuery(text);
    if (text === '') {
      setSearchData([]);
    } else {
      getSearch(text);
    }
  };

  const handleSearchResultClick = (item) => {
    navigation.navigate('Shops', { category: item.categoryId });
  };

  return (
    <LinearGradient
    colors={['white', 'white','white','#ffcccc',]} // Adjust gradient colors as needed
    style={styles.gradient}
  >
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {/* {!isSearchActive && ( */}
          
        {/* )} */}
        {/* {isSearchActive && ( */}
          <TextInput
            style={styles.input}
            placeholder="Search for any products"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearchQueryChange}
            
          />
        {/* )} */}
        <TouchableOpacity onPress={handleSearchIconClick}>
            <Image source={icons.search} style={styles.searchIcon} />
          </TouchableOpacity>
      </View>

      <FlatList
        data={searchData.length > 0 ? searchData : categoryData}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.productId ? item.productId : item.categoryId} // Ensure a unique key here
            style={styles.itemContainer}
            onPress={() => handleSearchResultClick(item)}
          >
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            <Text style={styles.itemText}>{item.productName}</Text>
            <Text style={styles.categoryText}>{item.categoryName}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.productId ? item.productId.toString() : item.categoryId.toString()} // Convert to string if necessary
        numColumns={numColumns}
        contentContainerStyle={styles.searchItems}
      />
           {productsCart?.length>0 &&(
 <BottomContainer

 onViewCart={() => navigation.navigate("ViewCart")}
/>
      )}
    </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,

  },
  searchContainer: {
    paddingTop: 70,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    width: 24,
    height: 24,
    tintColor: 'gray',
    marginLeft:10
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginLeft: 0,
    flex: 1,
  },
  searchItems: {
    padding: 10,
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    margin: 10,
    maxWidth: 100,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  itemText: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  categoryText: {
    marginTop: 2,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default Search;
