import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import Theme from '../constants/Theme';
import BottomContainer from '../shops_category/BottomContainer ';
import { instance } from '../constants/Common';
import { useDispatch, useSelector } from 'react-redux';
import { incrementItem, decrementItem } from '../redux/actions/counterActions';

const Shops = () => {
  const [selectedCategory, setSelectedCategory] = useState('chicken');
  const [data, setData] = useState({});
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryData, setCategoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isBottomContainerVisible, setIsBottomContainerVisible] = useState(false);
  
  const navigation = useNavigation();
  const route = useRoute();

  const cartItems = useSelector(state => state.cart.cartItems);
  const totalPrice = useSelector(state => state.cart.totalPrice);
  const dispatch = useDispatch();

console.log("===============================" ,filteredData);

  const handleIncrement = (item) => {
    if (item.count >= item.stocks) return; 
    dispatch(incrementItem(item));

    const updatedData = {
      ...filteredData,
      [selectedCategory]: filteredData[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count + 1 } : shopItem
      )
    };
    console.log("-------->>>>",updatedData);
    setFilteredData(updatedData);
     
    updateCartState(updatedData); // Update cart state
  };
  
  const handleDecrement = (item) => {
    if (item.count === 0) return;
  console.log(item);
    dispatch(decrementItem(item));
  
    const updatedData = {
      ...filteredData,
      [selectedCategory]: filteredData[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: Math.max(1, shopItem.count - 1) } : shopItem
      )
    };
    setFilteredData(updatedData);
  
    updateCartState(updatedData);
  };
  
  const updateCartState = (updatedData) => {
    const newCartItems = Object.values(updatedData).flat().filter(shopItem => shopItem.count > 0);
    const newTotalPrice = newCartItems.reduce((total, item) => total + item.count * parseInt(item.price), 0);
    setIsBottomContainerVisible(newCartItems.length > 0);
   
    // Update Redux store or local state with new cart items and total price
    // This depends on your implementation. Assuming you use Redux:
    dispatch({ type: 'UPDATE_CART', payload: { cartItems: newCartItems, totalPrice:(newCartItems)  } });
  };

  const getCategory = async () => {
    try {
      const response = await instance.get('/api/user/Category');
      if (response.status === 200) {
        setCategoryData(response.data);
        
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getProduct = async (categoryName) => {
    try {
      const response = await instance.get(`/api/user/Product/CategoryName?categoryName=${categoryName}`);
      if (response.status === 200) {
        setData(prevData => ({
          ...prevData,
          [categoryName.toLowerCase()]: response.data.map(product => ({
            ...product,
            count: 0 
          }))
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await instance.get(`/api/user/Product/CategoryName?categoryName=${selectedCategory}`);
        if (response.status === 200) {
          setData(prevData => ({
            ...prevData,
            [selectedCategory.toLowerCase()]: response.data.map(product => ({
              ...product,
              count: 0
            }))
          }));
          setFilteredData(prevData => ({
            ...prevData,
            [selectedCategory.toLowerCase()]: response.data.map(product => ({
              ...product,
              count: 0
            }))
          }));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchData();
  }, [selectedCategory]);



  const getSearch = async () => {
    try {
      const response = await instance.get(`/api/user/Search?productName=${searchQuery}&categoryName=${selectedCategory}`);
      if (response.status === 200) {
        setFilteredData(response.data);
      } else {
        setFilteredData([]);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setFilteredData([]);
    }
  };

  

  useEffect(() => {
    getCategory();

    const category = route.params?.category;
    if (category) {
      setSelectedCategory(category.toLowerCase());
    }
  }, [route.params?.category]);

  useEffect(() => {
    getProduct(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredData([]); // Clear filtered data when search query is empty
    } else {
      getSearch(); // Fetch search results based on the current search query
    }
  }, [searchQuery]);
  


  const handleViewCart = () => {
    navigation.navigate('ViewCart', {
      selectedItems: cartItems,
      totalPrice,
      totalItemCount: cartItems.length,
      filteredData:filteredData,setFilteredData:setFilteredData,selectedCategory:selectedCategory
    });
  };
  
  
  const handleSearchIconPress = () => {
    setIsSearchVisible(!isSearchVisible);
    setSearchQuery('');
  };

  const renderShopItem = ({ item }) => (
    <View style={styles.touchContainer}>
      <View style={styles.shopContainer}>
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        <Text style={[styles.shopname, Theme.FONTS.bo]}>{item.productName}</Text>
        <Text style={[styles.shopLocation, Theme.FONTS.h9]}>{item.productDescription}</Text>
        <View style={styles.pricePiecesContainer}>
          <Text style={[styles.shopprice, Theme.FONTS.h9]}>{item.gram} |</Text>
          <Text style={[styles.pieces, Theme.FONTS.h10]}>{item.pieces} Pieces</Text>
        </View>
        <View style={styles.offerContainer}>
          <Text style={[styles.money, Theme.FONTS.h9]}>₹{item.price}</Text>
          <Text style={[styles.offer, Theme.FONTS.h10]}>95%</Text>
        </View>
        <Text style={[styles.deliveryTime, Theme.FONTS.h10]}>{item.deliveryTime}</Text>
      </View>
      {!item.count ? (
        <TouchableOpacity style={styles.button} onPress={() => handleIncrement(item)}>
          <Text style={[styles.buttonText, Theme.FONTS.h8]}>Add +</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.counterContainer}>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleDecrement(item)}>
            <Text style={[styles.counterButtonText, Theme.FONTS.h8]}>-</Text>
          </TouchableOpacity>
          <Text style={[styles.counterText, Theme.FONTS.h8]}>{item.count}</Text>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleIncrement(item)}>
            <Text style={[styles.counterButtonText, Theme.FONTS.h8]}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {isSearchVisible && (
          <TextInput
            style={styles.searchInput}
            placeholder="What's your favourite"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        )}
        <TouchableOpacity onPress={handleSearchIconPress} style={styles.searchIconContainer}>
          <Image source={require('../assets/icons/search.png')} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.redContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
          {categoryData.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.redContainerItem,
                selectedCategory === category.categoryName.toLowerCase() && styles.selectedRedContainer,
              ]}
              onPress={() => setSelectedCategory(category.categoryName.toLowerCase())}
            >
              <Image source={{ uri: category.image }} style={styles.redContainerImage} resizeMode="cover" />
              <Text style={[styles.redContainerText, Theme.FONTS.h8, selectedCategory === category.categoryName.toLowerCase() && styles.boldText]}>
                {category.categoryName}
              </Text>
              {selectedCategory === category.categoryName.toLowerCase() && <View style={styles.hoverLine} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={filteredData.length > 0 ? filteredData : (filteredData[selectedCategory] || [])}

        keyExtractor={(item) => item.productId}
        renderItem={renderShopItem}
        contentContainerStyle={styles.list}
        />
             
  <BottomContainer
  totalItemCount={cartItems.length}
  totalPrice={totalPrice}
  onViewCart={handleViewCart}
  updateTotalPrice={updateCartState}
  initialCount={0}
/>

      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: 'white',
    paddingBottom:60
  },
  searchContainer: {
    flexDirection: 'row',
    marginLeft:20,
    marginBottom: 0,
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
  },
  redContainer: {
    height: 130,
    backgroundColor: 'white',
    marginBottom: 10,
    marginTop: 0,
  },
  redContainerItem: {
    alignSelf: 'center',
    marginHorizontal: 5,
    marginTop: 10,
    padding: 10,
  },
  redContainerImage: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  redContainerText: {
    marginTop: 5,
    alignSelf: 'center',
  },
  hoverLine: {
    width: '100%',
    height: 3,
    borderRadius: 20,
    backgroundColor: Theme.COLORS.maroon,
    marginTop: 5,
  },
  contentContainer: {
    paddingHorizontal: 10,
  },
  touchContainer: {
    marginBottom: 10,
    
  },
  shopContainer: {
    width: '95%',
    alignSelf: 'center',
    borderRadius: 10,
    elevation: 3,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
  },

  shopname: {
    fontWeight: 'bold',
    marginLeft: 15,
    marginTop: 10,
  },
  shopLocation: {
    marginLeft: 15,
    marginTop: 5,
    color: Theme.COLORS.gray,
    opacity: 0.8,
  },
  pricePiecesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    marginTop: 10,
  },
  shopprice: {
    color: Theme.COLORS.black,
    marginRight: 5,
  },
  deliveryTime: {
    marginLeft: 15,
    marginTop: 5,
    color: Theme.COLORS.lightGray2,
  },
  pieces: {
    color: Theme.COLORS.lightGray2,
    fontWeight: 'bold',
  },
  button: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    backgroundColor: Theme.COLORS.maroon,
    borderRadius: 5,
    width: 50,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  buttonText: {
    color: Theme.COLORS.white,
    fontWeight: 'bold',
    fontSize: 13,
    
  },
  boldText: {
    fontWeight: 'bold',
  },
  money: {
    fontWeight: 'bold',
    backgroundColor: '#ffcccc',
    color: Theme.COLORS.black,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    elevation: 5,
    alignSelf: 'flex-start',
    marginTop: 5,
    marginLeft: 15,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    paddingHorizontal: 5,
    paddingVertical: 3,
    backgroundColor: Theme.COLORS.maroon,
    borderRadius: 10,
    bottom: 20,
    right: 20,
  },
  counterButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    color: Theme.COLORS.white,
    fontWeight: 'bold',
    fontSize: 20,
  },
  counterText: {
    marginHorizontal: 10,
    fontWeight: 'bold',
    fontSize: 16,
    color: Theme.COLORS.white,
  },
  offerContainer: {
    flexDirection: 'row',
  },
  offer: {
    fontWeight: 'bold',
    color: 'green',
    marginTop: 10,
    marginLeft: 20,
  },
});

export default Shops;       