import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import Theme from '../constants/Theme';
import BottomContainer from '../shops_category/BottomContainer ';
import ViewCart from '../Viewcard/ViewCart';
import { instance } from '../constants/Common';

const Shops = () => {


// **********************************************************************************

  function changeTimeFormat() {
    let date = new Date();

    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Check whether AM or PM
    let newformat = hours >= 12 ? 'PM' : 'AM';

    // Find current hour in AM-PM Format
    hours = hours % 12;

    // To display "0" as "12"
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    console.log(hours + ':' + minutes + ' ' + newformat);
}

changeTimeFormat();

// **********************************************************************************



  const [selectedCategory, setSelectedCategory] = useState('chicken');
  const [data, setData] = useState({});
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isBottomContainerVisible, setIsBottomContainerVisible] = useState(false);
  const [totalItemCount, setTotalItemCount] = useState(0);

  const navigation = useNavigation();
  const route = useRoute();

  // Integration category
  const [categoryData, setCategoryData] = useState([]);

  const getCategory = async () => {
    try {
      const response = await instance.get('/api/user/Category');
      if (response.status === 200) {
        setCategoryData(response.data);
      }
    } catch (error) {
      console.error("error:", error);
    }
  }

  // Integration product
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
      console.error("error:", error);
    }
  }

  useEffect(() => {
    getCategory();
    getProduct(selectedCategory);
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
      setFilteredData(categoryData);
    } else {
      const filtered = categoryData.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, categoryData]);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('shopData', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save data to AsyncStorage', error);
      }
    };

    saveData();
  }, [data]);

  const handleIncrement = (item) => {
    if (item.count >= item.stocks) return; // Don't exceed the available stock

    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count + 1 } : shopItem
      )
    };
    setData(updatedData);

    const newCartItems = Object.values(updatedData).flat().filter(shopItem => shopItem.count > 0);
    const totalPriceIncrement = parseInt(item.price);
    setCartItems(newCartItems);
    setTotalPrice(totalPrice + totalPriceIncrement);
    setIsBottomContainerVisible(newCartItems.length > 0);
  };

  const handleDecrement = (item) => {
    if (item.count === 0) return;

    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count - 1 } : shopItem
      )
    };
    setData(updatedData);

    const newCartItems = Object.values(updatedData).flat().filter(shopItem => shopItem.count > 0);
    const totalPriceDecrement = parseInt(item.price);
    setCartItems(newCartItems);
    setTotalPrice(totalPrice - totalPriceDecrement);
    setIsBottomContainerVisible(newCartItems.length > 0);
  };

  const handleViewCart = () => {
    navigation.navigate('ViewCart', {
      selectedItems: cartItems,
      totalPrice,
      totalItemCount1: totalItemCount,
      updateCartItems: updateCartItems,
      shopHandleIncrement: handleIncrement,
      updateTotalPrice: setTotalPrice,
      shopHandleDecrement: handleDecrement
    });
  };

  const updateCartItems = (updatedItems) => {
    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(item =>
        updatedItems.find(updatedItem => updatedItem.productId === item.productId) || item
      )
    };
    setData(updatedData);

    const newCartItems = updatedItems.filter(item => item.count > 0);
    setCartItems(newCartItems);

    const newTotalPrice = newCartItems.reduce((total, item) => total + item.count * parseInt(item.price), 0);
    setTotalPrice(newTotalPrice);

    setIsBottomContainerVisible(newCartItems.length > 0);
  };

  const handleSearchIconPress = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  useEffect(() => {
    const newTotalPrice = Object.values(data)
      .flat()
      .reduce((total, item) => total + item.count * parseInt(item.price), 0);
    setTotalPrice(newTotalPrice);

    const totalCount = Object.values(data).flat().reduce((total, item) => total + item.count, 0);
    setTotalItemCount(totalCount);

    const isAnyCounterGreaterThanZero = Object.values(data).flat().some(item => item.count > 0);
    setIsBottomContainerVisible(isAnyCounterGreaterThanZero);
  }, [data]);

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
      {item.count === 0 ? (
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categoryData.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleRedContainerImagePress(item.categoryName)}
              style={styles.redContainerItem}
            >
              <Image source={{ uri: item.image }} style={styles.redContainerImage} resizeMode="cover" />
              <Text
                style={[
                  styles.redContainerText,
                  Theme.FONTS.h8,
                  selectedCategory === item.categoryName && styles.boldText
                ]}
              >
                {item.categoryName}
              </Text>
              {selectedCategory === item.categoryName && <View style={styles.hoverLine} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={productData}
        renderItem={renderShopItem}
        keyExtractor={(item) => item.productId.toString()}
        contentContainerStyle={styles.contentContainer}
      />
      {isBottomContainerVisible && (
        <BottomContainer
          totalPrice={totalPrice}
          onViewCart={handleViewCart}
          updateTotalPrice={setTotalPrice}
          updateCartItems={setCartItems}
          totalItemCount={totalItemCount}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 80,
  },
  redContainers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  redContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#ffcccb',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  selectedRedContainer: {
    backgroundColor: '#ff6666',
  },
  redContainerImage: {
    width: 50,
    height: 50,
  },
  redContainerText: {
    marginTop: 5,
    fontSize: 12,
  },
  shopItemsContainer: {
    paddingHorizontal: 10,
  },
  touchContainer: {
    flex: 1,
    flexDirection: 'column',
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  shopContainer: {
    padding: 10,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  shopname: {
    marginTop: 10,
    fontSize: 16,
  },
  shopLocation: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  pricePiecesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  shopprice: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  pieces: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666',
  },
  offerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  money: {
    fontSize: 12,
    color: '#f00',
  },
  offer: {
    marginLeft: 5,
    fontSize: 12,
    color: '#f00',
  },
  deliveryTime: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  button: {
    backgroundColor: '#ff6666',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    margin: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  counterButton: {
    backgroundColor: '#ccc',
    padding: 5,
    borderRadius: 5,
  },
  counterButtonText: {
    fontSize: 18,
  },
  counterText: {
    fontSize: 18,
    marginHorizontal: 10,
  },
});

export default Shops;




















import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import Theme from '../constants/Theme';
import BottomContainer from '../shops_category/BottomContainer ';
import ViewCart from '../Viewcard/ViewCart';
import { instance } from '../constants/Common';

const Shops = () => {
  const [selectedCategory, setSelectedCategory] = useState('chicken');
  const [data, setData] = useState({});
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryData, setCategoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isBottomContainerVisible, setIsBottomContainerVisible] = useState(false);
  const [totalItemCount, setTotalItemCount] = useState(0);

  const navigation = useNavigation();
  const route = useRoute();

  // Fetch categories from API
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

  // Fetch products based on selected category
  const getProduct = async (categoryName) => {
    try {
      const response = await instance.get(`/api/user/Product/CategoryName?categoryName=${categoryName}`);
      if (response.status === 200) {
        setData(prevData => ({
          ...prevData,
          [categoryName.toLowerCase()]: response.data.map(product => ({
            ...product,
            count: 0 // Initialize count to 0
          }))
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
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





  // Handle incrementing item count
  const handleIncrement = (item) => {
    if (item.count >= item.stocks) return; // Check if count exceeds available stocks

    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count + 1 } : shopItem
      )
    };
    setData(updatedData);

    updateCartState(updatedData); // Update cart state
  };

  // Handle decrementing item count
  const handleDecrement = (item) => {
    if (item.count === 0) return;

    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count - 1 } : shopItem
      )
    };
    setData(updatedData);

    updateCartState(updatedData); // Update cart state
  };

  // Update cart state based on updated data
  const updateCartState = (updatedData) => {
    const newCartItems = Object.values(updatedData).flat().filter(shopItem => shopItem.count > 0);
    const newTotalPrice = newCartItems.reduce((total, item) => total + item.count * parseInt(item.price), 0);

    setCartItems(newCartItems);
    setTotalPrice(newTotalPrice);
    setTotalItemCount(newCartItems.length);
    setIsBottomContainerVisible(newCartItems.length > 0);
  };

  // Handle view cart button press
  const handleViewCart = () => {
    navigation.navigate('ViewCart', {
      selectedItems: cartItems,
      totalPrice,
      totalItemCount,
      updateCartItems: updateCartItems,
      shopHandleIncrement: handleIncrement,
      updateTotalPrice: setTotalPrice,
      shopHandleDecrement: handleDecrement
    });
  };

  // Update cart items function
  const updateCartItems = (updatedItems) => {
    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(item =>
        updatedItems.find(updatedItem => updatedItem.productId === item.productId) || item
      )
    };
    setData(updatedData);
    updateCartState(updatedItems);
  };

  // Toggle search input visibility
  const handleSearchIconPress = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  // Filter categories based on search query
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredData(categoryData);
    } else {
      const filtered = categoryData.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, categoryData]);

  // Save data to AsyncStorage when data changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('shopData', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save data to AsyncStorage', error);
      }
    };

    saveData();
  }, [data]);

  // Calculate total price and item count when data changes
  useEffect(() => {
    const newTotalPrice = Object.values(data)
      .flat()
      .reduce((total, item) => total + item.count * parseInt(item.price), 0);
    setTotalPrice(newTotalPrice);

    const totalCount = Object.values(data).flat().reduce((total, item) => total + item.count, 0);
    setTotalItemCount(totalCount);

    setIsBottomContainerVisible(totalCount > 0);
  }, [data]);

  // Render each shop item
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
      {item.count === 0 ? (
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filteredData.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleRedContainerImagePress(item.categoryName)}
              style={[
                styles.redContainerItem,
                selectedCategory === item.categoryName && styles.selectedRedContainer
              ]}
            >
              <Image source={{ uri: item.image }} style={styles.redContainerImage} resizeMode="cover" />
              <Text style={[styles.redContainerText, Theme.FONTS.h8]}>{item.categoryName}</Text>
              {selectedCategory === item.categoryName && <View style={styles.hoverLine} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={data[selectedCategory] || []}
        renderItem={renderShopItem}
        keyExtractor={(item) => item.productId.toString()}
        contentContainerStyle={styles.contentContainer}
      />
      {isBottomContainerVisible && (
        <BottomContainer
          totalPrice={totalPrice}
          onViewCart={handleViewCart}
          updateTotalPrice={setTotalPrice}
          updateCartItems={setCartItems}
          totalItemCount={totalItemCount}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 80,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  searchIconContainer: {
    marginLeft: 10,
    padding: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  redContainer: {
    backgroundColor: '#ffcccb',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  redContainerItem: {
    marginRight: 10,
    alignItems: 'center',
  },
  selectedRedContainer: {
    backgroundColor: '#ff6666',
  },
  redContainerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  redContainerText: {
    fontSize: 12,
  },
  hoverLine: {
    width: 30,
    height: 2,
    backgroundColor: '#000',
    marginTop: 2,
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  touchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  shopContainer: {
    padding: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  shopname: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  shopLocation: {
    fontSize: 12,
    color: '#666',
  },
  pricePiecesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  shopprice: {
    fontWeight: 'bold',
  },
  pieces: {
    marginLeft: 5,
    color: '#666',
  },
  offerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  money: {
    color: '#f00',
  },
  offer: {
    marginLeft: 5,
    color: '#f00',
  },
  deliveryTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#ff6666',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  counterButton: {
    backgroundColor: '#ccc',
    padding: 5,
    borderRadius: 5,
  },
  counterButtonText: {
    fontSize: 18,
  },
  counterText: {
    fontSize: 18,
    marginHorizontal: 10,
  },
});

export default Shops;












import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import Theme from '../constants/Theme';
import BottomContainer from '../shops_category/BottomContainer ';
import { instance } from '../constants/Common';

const Shops = () => {
  const [selectedCategory, setSelectedCategory] = useState('chicken');
  const [data, setData] = useState({});
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryData, setCategoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isBottomContainerVisible, setIsBottomContainerVisible] = useState(false);
  const [totalItemCount, setTotalItemCount] = useState(0);

  const navigation = useNavigation();
  const route = useRoute();

  const getCategory = async () => {
    try {
      const response = await instance.get('/api/user/Category');
      if (response.status === 200) {
        setCategoryData(response.data);
        // Initialize data state for all categories here
        const initialData = {};
        response.data.forEach(category => {
          initialData[category.categoryName.toLowerCase()] = [];
        });
        setData(initialData);
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
            count: 0 // Initialize count to 0
          }))
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
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
      setFilteredData(categoryData);
    } else {
      const filtered = categoryData.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, categoryData]);

  const handleIncrement = (item) => {
    if (item.count >= item.stocks) return; // Don't exceed the available stock

    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count + 1 } : shopItem
      )
    };
    setData(updatedData);

    updateCartState(updatedData);
  };

  const handleDecrement = (item) => {
    if (item.count === 0) return;

    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count - 1 } : shopItem
      )
    };
    setData(updatedData);

    updateCartState(updatedData); // Update cart state
  };

  const updateCartState = (updatedData) => {
    const newCartItems = Object.values(updatedData).flat().filter(shopItem => shopItem.count > 0);
    const newTotalPrice = newCartItems.reduce((total, item) => total + item.count * parseInt(item.price), 0);

    setCartItems(newCartItems);
    setTotalPrice(newTotalPrice);
    setTotalItemCount(newCartItems.length);
    setIsBottomContainerVisible(newCartItems.length > 0);
  };

  const handleViewCart = () => {
    navigation.navigate('ViewCart', {
      selectedItems: cartItems,
      totalPrice,
      totalItemCount,
      updateCartItems: updateCartItems,
      shopHandleIncrement: handleIncrement,
      updateTotalPrice: setTotalPrice,
      shopHandleDecrement: handleDecrement
    });
  };

  const updateCartItems = (updatedItems) => {
    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(item =>
        updatedItems.find(updatedItem => updatedItem.productId === item.productId) || item
      )
    };
    setData(updatedData);
    updateCartState(updatedItems);
  };

  // Save data to AsyncStorage when data changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('shopData', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save data to AsyncStorage', error);
      }
    };

    saveData();
  }, [data]);

  // Calculate total price and item count when data changes
  useEffect(() => {
    const newTotalPrice = Object.values(data)
      .flat()
      .reduce((total, item) => total + item.count * parseInt(item.price), 0);
    setTotalPrice(newTotalPrice);

    const totalCount = Object.values(data).flat().reduce((total, item) => total + item.count, 0);
    setTotalItemCount(totalCount);

    setIsBottomContainerVisible(totalCount > 0);
  }, [data]);

  const handleSearchIconPress = () => {
    setIsSearchVisible(!isSearchVisible);
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categoryData.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedCategory(item.categoryName)}
              style={[
                styles.redContainerItem,
                selectedCategory === item.categoryName && styles.selectedRedContainer
              ]}
            >
              <Image source={{ uri: item.image }} style={styles.redContainerImage} resizeMode="cover" />
              <Text style={[styles.redContainerText, Theme.FONTS.h8, selectedCategory === item.categoryName && styles.boldText]}>{item.categoryName}</Text>
              {selectedCategory === item.categoryName && <View style={styles.hoverLine} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={data[selectedCategory.toLowerCase()]}
        keyExtractor={(item) => item.productId.toString()}
        renderItem={renderShopItem}
        contentContainerStyle={styles.flatlist}
      />
      <BottomContainer
        visible={isBottomContainerVisible}
        totalItemCount={totalItemCount}
        totalPrice={totalPrice}
        onViewCart={handleViewCart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  searchIconContainer: {
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  redContainer: {
    paddingVertical: 15,
    backgroundColor: '#F5F5F5',
  },
  redContainerItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  redContainerImage: {
    width: 30,
    height: 30,
    borderRadius: 8,
    marginRight: 10,
  },
  redContainerText: {
    color: '#333333',
    marginRight: 10,
  },
  selectedRedContainer: {
    backgroundColor: '#FF6C44',
  },
  boldText: {
    fontWeight: 'bold',
  },
  hoverLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    backgroundColor: 'black',
    width: '100%',
  },
  flatlist: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  touchContainer: {
    marginBottom: 20,
  },
  shopContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 10,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  shopname: {
    color: '#333333',
    marginBottom: 5,
  },
  shopLocation: {
    color: '#777777',
    marginBottom: 5,
  },
  pricePiecesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  shopprice: {
    color: '#FF6C44',
    marginRight: 5,
  },
  pieces: {
    color: '#777777',
  },
  offerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  money: {
    color: '#FF6C44',
    marginRight: 5,
  },
  offer: {
    backgroundColor: '#FF6C44',
    color: 'white',
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  deliveryTime: {
    color: '#777777',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#FF6C44',
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  counterButton: {
    backgroundColor: '#FF6C44',
    borderRadius: 5,
    padding: 5,
    marginHorizontal: 5,
  },
  counterButtonText: {
    color: 'white',
  },
  counterText: {
    paddingHorizontal: 10,
  },
});

export default Shops;

















import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import Theme from '../constants/Theme';
import BottomContainer from '../shops_category/BottomContainer ';
import { instance } from '../constants/Common';

const Shops = () => {
  const [selectedCategory, setSelectedCategory] = useState('chicken');
  const [data, setData] = useState({});
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryData, setCategoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isBottomContainerVisible, setIsBottomContainerVisible] = useState(false);
  const [totalItemCount, setTotalItemCount] = useState(0);

  const navigation = useNavigation();
  const route = useRoute();

  const getCategory = async () => {
    try {
      const response = await instance.get('/api/user/Category');
      if (response.status === 200) {
        setCategoryData(response.data);
        setFilteredData(response.data);
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
            count: 0 // Initialize count to 0
          }))
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
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
      setFilteredData(categoryData);
    } else {
      const filtered = categoryData.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, categoryData]);

  const handleIncrement = (item) => {
    if (item.count >= item.stocks) return; // Don't exceed the available stock

    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count + 1 } : shopItem
      )
    };
    setData(updatedData);

    updateCartState(updatedData);
  };

  const handleDecrement = (item) => {
    if (item.count === 0) return;

    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count - 1 } : shopItem
      )
    };
    setData(updatedData);

    updateCartState(updatedData); // Update cart state
  };

  const updateCartState = (updatedData) => {
    const newCartItems = Object.values(updatedData).flat().filter(shopItem => shopItem.count > 0);
    const newTotalPrice = newCartItems.reduce((total, item) => total + item.count * parseInt(item.price), 0);

    setCartItems(newCartItems);
    setTotalPrice(newTotalPrice);
    setTotalItemCount(newCartItems.length);
    setIsBottomContainerVisible(newCartItems.length > 0);
  };

  const handleViewCart = () => {
    navigation.navigate('ViewCart', {
      selectedItems: cartItems,
      totalPrice,
      totalItemCount,
      updateCartItems: updateCartItems,
      shopHandleIncrement: handleIncrement,
      updateTotalPrice: setTotalPrice,
      shopHandleDecrement: handleDecrement
    });
  };

  const updateCartItems = (updatedItems) => {
    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(item =>
        updatedItems.find(updatedItem => updatedItem.productId === item.productId) || item
      )
    };
    setData(updatedData);
    updateCartState(updatedItems);
  };

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('shopData', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save data to AsyncStorage', error);
      }
    };

    saveData();
  }, [data]);

  useEffect(() => {
    const newTotalPrice = Object.values(data)
      .flat()
      .reduce((total, item) => total + item.count * parseInt(item.price), 0);
    setTotalPrice(newTotalPrice);

    const totalCount = Object.values(data).flat().reduce((total, item) => total + item.count, 0);
    setTotalItemCount(totalCount);

    setIsBottomContainerVisible(totalCount > 0);
  }, [data]);

  const handleSearchIconPress = () => {
    setIsSearchVisible(!isSearchVisible);
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filteredData.map((item, index) => (
            <TouchableOpacity key={index} onPress={() => setSelectedCategory(item.categoryName.toLowerCase())} 
              style={[
                styles.redContainerItem,
                selectedCategory === item.categoryName.toLowerCase() && styles.selectedRedContainer
              ]}
            >
              <Image source={{ uri: item.image }} style={styles.redContainerImage} resizeMode="cover" />
              <Text style={[styles.redContainerText, Theme.FONTS.h8, selectedCategory === item.categoryName.toLowerCase() && styles.boldText]}>
                {item.categoryName}
              </Text>
              {selectedCategory === item.categoryName.toLowerCase() && <View style={styles.hoverLine} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={data[selectedCategory] || []}
        renderItem={renderShopItem}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.contentContainer}
      />
      {isBottomContainerVisible && (
        <BottomContainer 
          totalItemCount={totalItemCount} 
          totalPrice={totalPrice} 
          onViewCart={handleViewCart} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  searchIconContainer: {
    marginLeft: 10,
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  redContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  redContainerItem: {
    alignItems: 'center',
    marginRight: 10,
  },
  selectedRedContainer: {
    borderBottomWidth: 2,
    borderBottomColor: 'red',
  },
  redContainerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  redContainerText: {
    marginTop: 5,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  hoverLine: {
    height: 3,
    backgroundColor: 'red',
    marginTop: 3,
    width: '100%',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  touchContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    overflow: 'hidden',
  },
  shopContainer: {
    padding: 16,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  shopname: {
    marginTop: 10,
  },
  shopLocation: {
    color: '#888',
  },
  pricePiecesContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  shopprice: {
    color: 'red',
    marginRight: 5,
  },
  pieces: {
    color: '#888',
  },
  offerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  money: {
    marginRight: 5,
    color: 'green',
  },
  offer: {
    color: 'red',
  },
  deliveryTime: {
    marginTop: 5,
    color: '#888',
  },
  button: {
    backgroundColor: 'red',
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  counterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  counterButtonText: {
    color: 'red',
  },
  counterText: {
    paddingVertical: 10,
  },
});

export default Shops;


















import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import Theme from '../constants/Theme';
import BottomContainer from '../shops_category/BottomContainer';
import { instance } from '../constants/Common';

const Shops = () => {
  const [selectedCategory, setSelectedCategory] = useState('chicken');
  const [data, setData] = useState({});
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryData, setCategoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isBottomContainerVisible, setIsBottomContainerVisible] = useState(false);
  const [totalItemCount, setTotalItemCount] = useState(0);
  const [outOfStock, setOutOfStock] = useState(false); // State to manage out of stock message

  const navigation = useNavigation();
  const route = useRoute();

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
            count: 0 // Initialize count to 0
          }))
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
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
      setFilteredData(categoryData);
    } else {
      const filtered = categoryData.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, categoryData]);

  const handleIncrement = (item) => {
    if (item.count >= item.stocks) {
      setOutOfStock(true); // Set out of stock message flag
      return;
    }

    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count + 1 } : shopItem
      )
    };
    setData(updatedData);

    updateCartState(updatedData);
  };

  const handleDecrement = (item) => {
    if (item.count === 0) return;

    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count - 1 } : shopItem
      )
    };
    setData(updatedData);

    updateCartState(updatedData);
  };

  const updateCartState = (updatedData) => {
    const newCartItems = Object.values(updatedData).flat().filter(shopItem => shopItem.count > 0);
    const newTotalPrice = newCartItems.reduce((total, item) => total + item.count * parseInt(item.price), 0);

    setCartItems(newCartItems);
    setTotalPrice(newTotalPrice);
    setTotalItemCount(newCartItems.length);
    setIsBottomContainerVisible(newCartItems.length > 0);
    setOutOfStock(false); // Reset out of stock message flag
  };

  const handleViewCart = () => {
    navigation.navigate('ViewCart', {
      selectedItems: cartItems,
      totalPrice,
      totalItemCount,
      updateCartItems: updateCartItems,
      shopHandleIncrement: handleIncrement,
      updateTotalPrice: setTotalPrice,
      shopHandleDecrement: handleDecrement
    });
  };

  const updateCartItems = (updatedItems) => {
    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(item =>
        updatedItems.find(updatedItem => updatedItem.productId === item.productId) || item
      )
    };
    setData(updatedData);
    updateCartState(updatedItems);
  };

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('shopData', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save data to AsyncStorage', error);
      }
    };

    saveData();
  }, [data]);

  useEffect(() => {
    const newTotalPrice = Object.values(data)
      .flat()
      .reduce((total, item) => total + item.count * parseInt(item.price), 0);
    setTotalPrice(newTotalPrice);

    const totalCount = Object.values(data).flat().reduce((total, item) => total + item.count, 0);
    setTotalItemCount(totalCount);

    setIsBottomContainerVisible(totalCount > 0);
  }, [data]);

  const handleSearchIconPress = () => {
    setIsSearchVisible(!isSearchVisible);
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filteredData.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedCategory(item.categoryName.toLowerCase())}
              style={[
                styles.redContainerItem,
                selectedCategory === item.categoryName.toLowerCase() && styles.selectedRedContainer
              ]}
            >
              <Image source={{ uri: item.image }} style={styles.redContainerImage} resizeMode="cover" />
              <Text style={[styles.redContainerText, Theme.FONTS.h8, selectedCategory === item.categoryName.toLowerCase() && styles.boldText]}>{item.categoryName}</Text>
              {selectedCategory === item.categoryName.toLowerCase() && <View style={styles.hoverLine} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={data[selectedCategory] || []}
        renderItem={renderShopItem}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
      {outOfStock && (
        <View style={styles.outOfStockContainer}>
          <Text style={styles.outOfStockText}>Out of Stock!</Text>
        </View>
      )}
      {isBottomContainerVisible && (
        <BottomContainer
          totalItems={totalItemCount}
          totalPrice={totalPrice}
          onViewCart={handleViewCart}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  searchIconContainer: {
    padding: 10,
    backgroundColor: Theme.COLORS.primary,
    borderRadius: 20,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
  redContainer: {
    marginVertical: 10,
  },
  redContainerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
  },
  selectedRedContainer: {
    backgroundColor: Theme.COLORS.primary,
  },
  redContainerImage: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  redContainerText: {
    marginLeft: 5,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  hoverLine: {
    position: 'absolute',
    bottom: -2,
    height: 2,
    width: '100%',
    backgroundColor: Theme.COLORS.primary,
  },
  touchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  shopContainer: {
    width: '60%',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  shopname: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  shopLocation: {
    color: '#999',
    marginBottom: 5,
  },
  pricePiecesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  shopprice: {
    color: Theme.COLORS.primary,
    marginRight: 5,
  },
  pieces: {
    color: '#999',
  },
  offerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  money: {
    color: Theme.COLORS.primary,
    marginRight: 5,
  },
  offer: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 5,
    color: Theme.COLORS.primary,
    marginRight: 5,
  },
  deliveryTime: {
    color: '#999',
    marginBottom: 5,
  },
  button: {
    backgroundColor: Theme.COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    backgroundColor: Theme.COLORS.primary,
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  counterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  counterText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  outOfStockContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 10,
  },
  outOfStockText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Shops;























import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import Theme from '../constants/Theme';
import BottomContainer from '../shops_category/BottomContainer ';
import { instance } from '../constants/Common';

const Shops = () => {
  const [selectedCategory, setSelectedCategory] = useState('chicken');
  const [data, setData] = useState({});
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryData, setCategoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isBottomContainerVisible, setIsBottomContainerVisible] = useState(false);
  const [totalItemCount, setTotalItemCount] = useState(0);

  const navigation = useNavigation();
  const route = useRoute();

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
            count: 0 // Initialize count to 0
          }))
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const getSearch = async () => {
    try {
      const response = await instance.get(`/api/user/Search?productName=${searchQuery}`);
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
      setFilteredData([]);
    } else {
      getSearch();
    }
  }, [searchQuery]);

  const handleIncrement = (item) => {
    if (item.count >= item.stocks) return; // Don't exceed the available stock

    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count + 1 } : shopItem
      )
    };
    setData(updatedData);

    updateCartState(updatedData);
  };

  const handleDecrement = (item) => {
    if (item.count === 0) return;

    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count - 1 } : shopItem
      )
    };
    setData(updatedData);

    updateCartState(updatedData);
  };

  const updateCartState = (updatedData) => {
    const newCartItems = Object.values(updatedData).flat().filter(shopItem => shopItem.count > 0);
    const newTotalPrice = newCartItems.reduce((total, item) => total + item.count * parseInt(item.price), 0);

    setCartItems(newCartItems);
    setTotalPrice(newTotalPrice);
    setTotalItemCount(newCartItems.length);
    setIsBottomContainerVisible(newCartItems.length > 0);
  };

  const handleViewCart = () => {
    navigation.navigate('ViewCart', {
      selectedItems: cartItems,
      totalPrice,
      totalItemCount,
      updateCartItems: updateCartItems,
      shopHandleIncrement: handleIncrement,
      updateTotalPrice: setTotalPrice,
      shopHandleDecrement: handleDecrement
    });
  };

  const updateCartItems = (updatedItems) => {
    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(item =>
        updatedItems.find(updatedItem => updatedItem.productId === item.productId) || item
      )
    };
    setData(updatedData);
    updateCartState(updatedItems);
  };

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('shopData', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save data to AsyncStorage', error);
      }
    };

    saveData();
  }, [data]);

  useEffect(() => {
    const newTotalPrice = Object.values(data)
      .flat()
      .reduce((total, item) => total + item.count * parseInt(item.price), 0);
    setTotalPrice(newTotalPrice);

    const totalCount = Object.values(data).flat().reduce((total, item) => total + item.count, 0);
    setTotalItemCount(totalCount);

    setIsBottomContainerVisible(totalCount > 0);
  }, [data]);

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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categoryData.map((item, index) => (
            <TouchableOpacity key={index} onPress={() => setSelectedCategory(item.categoryName.toLowerCase())}
              style={[
                styles.redContainerItem,
                selectedCategory === item.categoryName.toLowerCase() && styles.selectedRedContainer
              ]}
            >
              <Image source={{ uri: item.image }} style={styles.redContainerImage} resizeMode="cover" />
              <Text style={[styles.redContainerText, Theme.FONTS.h8, selectedCategory === item.categoryName.toLowerCase() && styles.boldText]}>{item.categoryName}</Text>
              {selectedCategory === item.categoryName.toLowerCase() && <View style={styles.redContainerIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={filteredData.length > 0 ? filteredData : data[selectedCategory]}
        keyExtractor={(item) => item.productId.toString()}
        renderItem={renderShopItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
      />
      {isBottomContainerVisible && (
        <BottomContainer totalPrice={totalPrice} totalItemCount={totalItemCount} onPress={handleViewCart} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.COLORS.BACKGROUND,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
  },
  searchIconContainer: {
    padding: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  redContainer: {
    backgroundColor: Theme.COLORS.PRIMARY,
    padding: 10,
    marginBottom: 10,
  },
  redContainerItem: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  selectedRedContainer: {
    borderBottomWidth: 2,
    borderBottomColor: Theme.COLORS.BLACK,
  },
  redContainerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  redContainerText: {
    marginTop: 5,
    color: Theme.COLORS.BLACK,
  },
  boldText: {
    fontWeight: 'bold',
  },
  redContainerIndicator: {
    height: 2,
    backgroundColor: Theme.COLORS.BLACK,
    width: '100%',
    marginTop: 5,
  },
  touchContainer: {
    flex: 1,
    margin: 5,
  },
  shopContainer: {
    backgroundColor: Theme.COLORS.WHITE,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  shopname: {
    marginTop: 10,
  },
  shopLocation: {
    marginTop: 5,
    color: Theme.COLORS.GRAY,
  },
  pricePiecesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  shopprice: {
    color: Theme.COLORS.BLACK,
  },
  pieces: {
    color: Theme.COLORS.GRAY,
  },
  offerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  money: {
    color: Theme.COLORS.BLACK,
    marginRight: 10,
  },
  offer: {
    color: Theme.COLORS.RED,
  },
  deliveryTime: {
    marginTop: 5,
    color: Theme.COLORS.GRAY,
  },
  button: {
    backgroundColor: Theme.COLORS.PRIMARY,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: Theme.COLORS.WHITE,
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: Theme.COLORS.LIGHT_GRAY,
    borderRadius: 5,
  },
  counterButton: {
    padding: 10,
  },
  counterButtonText: {
    color: Theme.COLORS.BLACK,
  },
  counterText: {
    color: Theme.COLORS.BLACK,
  },
});

export default Shops;





















































import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import Theme from '../constants/Theme';
import BottomContainer from '../shops_category/BottomContainer ';
import { instance } from '../constants/Common';


const Shops = () => {
  const [selectedCategory, setSelectedCategory] = useState('chicken');
  const [data, setData] = useState({});
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryData, setCategoryData] = useState([]);
  const [filteredData, setFilteredData] = useState(categoryData);;
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isBottomContainerVisible, setIsBottomContainerVisible] = useState(false);
  const [totalItemCount, setTotalItemCount] = useState(0);

  const navigation = useNavigation();
  const route = useRoute();



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

 //integration category
  const getProduct = async (categoryName) => {
    try {
      const response = await instance.get(`/api/user/Product/CategoryName?categoryName=${categoryName}`);
      if (response.status === 200) {
        setData(prevData => ({
          ...prevData,
          [categoryName.toLowerCase()]: response.data.map(product => ({
            ...product,
            count: 0 // Initialize count to 0
          }))
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  
 //integration search
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
    // Show all categories when search is empty
    setFilteredData([]);
  } else {
    // Fetch search results based on searchQuery
    getSearch();
  }
}, [searchQuery]); // Include categoryData as a dependency




  const handleIncrement = (item) => {
    if (item.count >= item.stocks) return; // Don't exceed the available stock

    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count + 1 } : shopItem
      )
    };
    setData(updatedData);

    updateCartState(updatedData);
  };

  const handleDecrement = (item) => {
    if (item.count === 0) return;

    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count - 1 } : shopItem
      )
    };
    setData(updatedData);

    updateCartState(updatedData); // Update cart state
  };


  const updateCartState = (updatedData) => {
    const newCartItems = Object.values(updatedData).flat().filter(shopItem => shopItem.count > 0);
    const newTotalPrice = newCartItems.reduce((total, item) => total + item.count * parseInt(item.price), 0);

    setCartItems(newCartItems);
    setTotalPrice(newTotalPrice);
    setTotalItemCount(newCartItems.length);
    setIsBottomContainerVisible(newCartItems.length > 0);
  };


  const handleViewCart = () => {
    navigation.navigate('ViewCart', {
      selectedItems: cartItems,
      totalPrice,
      totalItemCount,
      updateCartItems: updateCartItems,
      shopHandleIncrement: handleIncrement,
      updateTotalPrice: setTotalPrice,
      shopHandleDecrement: handleDecrement
    });
  };

  const updateCartItems = (updatedItems) => {
    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(item =>
        updatedItems.find(updatedItem => updatedItem.productId === item.productId) || item
      )
    };
    setData(updatedData);
    updateCartState(updatedItems);
  };

    // Save data to AsyncStorage when data changes
    useEffect(() => {
      const saveData = async () => {
        try {
          await AsyncStorage.setItem('shopData', JSON.stringify(data));
        } catch (error) {
          console.error('Failed to save data to AsyncStorage', error);
        }
      };
  
      saveData();
    }, [data]);
  
    // Calculate total price and item count when data changes
    useEffect(() => {
      const newTotalPrice = Object.values(data)
        .flat()
        .reduce((total, item) => total + item.count * parseInt(item.price), 0);
      setTotalPrice(newTotalPrice);
  
      const totalCount = Object.values(data).flat().reduce((total, item) => total + item.count, 0);
      setTotalItemCount(totalCount);
  
      setIsBottomContainerVisible(totalCount > 0);
    }, [data]);


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
        data={filteredData.length > 0 ? filteredData : data[selectedCategory]}
        keyExtractor={(item) => item.productId}
        renderItem={renderShopItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}></Text>
          </View>
        }
      />
      {isBottomContainerVisible && (
        <BottomContainer  totalPrice={totalPrice}
        onViewCart={handleViewCart}
        updateTotalPrice={setTotalPrice}
        updateCartItems={setCartItems}
        totalItemCount={totalItemCount} 
         />
      )}
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
  const [filteredData, setFilteredData] = useState(categoryData);

  const navigation = useNavigation();
  const route = useRoute();

  const cartItems = useSelector(state => state.cart.cartItems);
  const totalPrice = useSelector(state => state.cart.totalPrice);
  const dispatch = useDispatch();

  const handleIncrement = (item) => {
    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count + 1 } : shopItem
      )
    };
    setData(updatedData);
  };

  const handleDecrement = (item) => {
    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.productId === item.productId ? { ...shopItem, count: shopItem.count - 1 } : shopItem
      )
    };
    setData(updatedData);
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
            count: 0 // Initialize count to 0
          }))
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

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
      setFilteredData([]);
    } else {
      getSearch();
    }
  }, [searchQuery]);

  const handleViewCart = () => {
    navigation.navigate('ViewCart', {
      selectedItems: cartItems,
      totalPrice,
      totalItemCount: cartItems.length,
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
        data={filteredData.length > 0 ? filteredData : data[selectedCategory]}
        keyExtractor={(item) => item.productId}
        renderItem={renderShopItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}></Text>
          </View>
        }
      />
      {cartItems.length > 0 && (
        <BottomContainer 
          totalPrice={totalPrice}
          onViewCart={handleViewCart}
          updateTotalPrice={() => {}}
          updateCartItems={() => {}}
          totalItemCount={cartItems.length} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: 'white',
    paddingBottom: 60
  },
  searchContainer: {
    flexDirection: 'row',
    marginLeft: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  categoryContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: 'black',
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  touchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 5,
  },
  shopContainer: {
    flex: 1,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  shopname: {
    marginLeft: 15,
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shopLocation: {
    marginLeft: 15,
    color: 'black',
    fontSize: 12,
    marginTop: 2,
  },
  pricePiecesContainer: {
    flexDirection: 'row',
    marginLeft: 15,
    marginTop: 5,
  },
  shopprice: {
    color: Theme.COLORS.gray,
    fontSize: 12,
    marginRight: 5,
  },
  pieces: {
    color: 'black',
    fontSize: 12,
  },
  offerContainer: {
    flexDirection: 'row',
    marginLeft: 15,
    marginTop: 2,
  },
  money: {
    color: Theme.COLORS.gray,
    fontSize: 12,
    marginRight: 5,
  },
  offer: {
    color: 'black',
    fontSize: 12,
  },
  deliveryTime: {
    marginLeft: 15,
    color: Theme.COLORS.gray,
    fontSize: 12,
    marginTop: 5,
  },
  button: {
    backgroundColor: Theme.COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  counterButton: {
    backgroundColor: Theme.COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  counterButtonText: {
    color: 'white',
    fontSize: 14,
  },
  counterText: {
    fontSize: 14,
    marginHorizontal: 5,
  },
});

export default Shops;






















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
  const [filteredData, setFilteredData] = useState(categoryData);
  const [isBottomContainerVisible, setIsBottomContainerVisible] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();

  const cartItems = useSelector(state => state.cart.cartItems);
  const totalPrice = useSelector(state => state.cart.totalPrice);
  const dispatch = useDispatch();

  const handleIncrement = (item) => {
    dispatch(incrementItem(item.productId));
    updateProductCount(item.productId, item.count + 1);
  };

  const handleDecrement = (item) => {
    dispatch(decrementItem(item.productId));
    updateProductCount(item.productId, item.count - 1);
  };

  const updateProductCount = (productId, count) => {
    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(product =>
        product.productId === productId ? { ...product, count } : product
      )
    };
    setData(updatedData);
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
            count: 0 // Initialize count to 0
          }))
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

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
      setFilteredData([]);
    } else {
      getSearch();
    }
  }, [searchQuery]);

  const handleViewCart = () => {
    navigation.navigate('ViewCart', {
      selectedItems: cartItems,
      totalPrice,
      totalItemCount: cartItems.length,
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
        data={filteredData.length > 0 ? filteredData : data[selectedCategory]}
        keyExtractor={(item) => item.productId}
        renderItem={renderShopItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}></Text>
          </View>
        }
      />
      {isBottomContainerVisible && (
        <BottomContainer 
          totalPrice={totalPrice}
          onViewCart={handleViewCart}
          updateTotalPrice={() => {}}
          updateCartItems={() => {}}
          totalItemCount={cartItems.length} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: 'white',
    paddingBottom: 60
  },
  searchContainer: {
    flexDirection: 'row',
    marginLeft: 20,
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
  categoryContainer: {
    alignItems: 'center',
  },
  redContainerItem: {
    alignSelf: 'center',
    marginHorizontal: 5,
    marginTop: 10,
    padding: 10,
  },
  selectedRedContainer: {
    backgroundColor: '#ffe6e6',
  },
  redContainerImage: {
    width: 100,
    height: 60,
    borderRadius: 10,
  },
  redContainerText: {
    textAlign: 'center',
    marginTop: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
  hoverLine: {
    height: 2,
    backgroundColor: 'red',
    marginTop: 5,
  },
  listContent: {
    paddingHorizontal: 10,
  },
  touchContainer: {
    marginBottom: 10,
  },
  shopContainer: {
    borderRadius: 15,
    backgroundColor: 'white',
    marginBottom: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 15,
  },
  shopname: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  shopLocation: {
    color: 'gray',
    marginTop: 5,
  },
  pricePiecesContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  shopprice: {
    fontWeight: 'bold',
  },
  pieces: {
    marginLeft: 5,
    color: 'gray',
  },
  offerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  money: {
    fontWeight: 'bold',
  },
  offer: {
    marginLeft: 10,
    color: 'red',
  },
  deliveryTime: {
    color: 'gray',
    marginTop: 10,
  },
  button: {
    marginTop: 10,
    backgroundColor: 'red',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  counterButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  counterButtonText: {
    color: 'white',
  },
  counterText: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: 'gray',
  },
});

export default Shops;




























import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { incrementItem, decrementItem } from '../redux/actions/counterActions';
import Theme from '../constants/Theme';
import BottomContainer from '../shops_category/BottomContainer ';
import { instance } from '../constants/Common';

const Shops = () => {
  const [selectedCategory, setSelectedCategory] = useState('chicken');
  const [data, setData] = useState({});
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryData, setCategoryData] = useState([]);
  const [filteredData, setFilteredData] = useState(categoryData);
  const [isBottomContainerVisible, setIsBottomContainerVisible] = useState(false);
  
  const navigation = useNavigation();
  const route = useRoute();

  const cartItems = useSelector(state => state.cart.cartItems);
  const totalPrice = useSelector(state => state.cart.totalPrice);
  const dispatch = useDispatch();

  const handleIncrement = (item) => {
    dispatch(incrementItem(item));
  };

  const handleDecrement = (item) => {
    dispatch(decrementItem(item));
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
            count: 0 // Initialize count to 0
          }))
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const getSearch = async () => {
    try {
      const response = await instance.get(`/api/user/Search?productName=${searchQuery}&categoryId=${selectedCategory}`);
      if (response.status === 200) {
        setFilteredData(response.data.map(product => ({
          ...product,
          count: 0
        })));
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
      setFilteredData(data[selectedCategory] || []); // Clear filtered data when search query is empty
    } else {
      getSearch(); // Fetch search results based on the current search query
    }
  }, [searchQuery, selectedCategory]);

  const handleViewCart = () => {
    navigation.navigate('ViewCart', {
      selectedItems: cartItems,
      totalPrice,
      totalItemCount: cartItems.length,
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
      {filteredData.length > 0 && searchQuery.length > 0 ? (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderShopItem}
          numColumns={2}
          contentContainerStyle={styles.flatListContentContainer}
        />
      ) : (
        <FlatList
          data={data[selectedCategory] || []}
          keyExtractor={(item) => item.productId.toString()}
          renderItem={renderShopItem}
          numColumns={2}
          contentContainerStyle={styles.flatListContentContainer}
        />
      )}
      <BottomContainer isVisible={isBottomContainerVisible} onClose={() => setIsBottomContainerVisible(false)} />
      <TouchableOpacity style={styles.cartButton} onPress={handleViewCart}>
        <Text style={[styles.cartButtonText, Theme.FONTS.h8]}>{totalPrice} | View Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Add your styles here
});

export default Shops;

















import {
  ADD_TO_CART,
  REMOVE_FROM_CART,
  UPDATE_CART_ITEM,
  INCREMENT_ITEM,
  DECREMENT_ITEM,
  UPDATE_CART
} from '../actions/counterActions'; // Update the path as per your file structure

const initialState = {
  cart: [],
  totalPrice: 0,
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      return {
        ...state,
        cart: [...state.cart, action.payload],
      };
    case REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload),
      };
    case UPDATE_CART_ITEM:
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.productId
            ? { ...item, count: action.payload.count }
            : item
        ),
      };
    case INCREMENT_ITEM: {
      const existingProductIndex = state.cart.findIndex(item => item.productId === action.payload);
      let updatedCart;

      if (existingProductIndex >= 0) {
        updatedCart = state.cart.map((item, index) =>
          index === existingProductIndex
            ? { ...item, count: item.count + 1 }
            : item
        );
      } else {
        updatedCart = [...state.cart, { productId: action.payload, count: 1 }];
      }

      return {
        ...state,
        cart: updatedCart,
      };
    }
    case DECREMENT_ITEM: {
      const existingProductIndex = state.cart.findIndex(item => item.productId === action.payload);
      let updatedCart;

      if (existingProductIndex >= 0) {
        updatedCart = state.cart.map((item, index) =>
          index === existingProductIndex && item.count > 0
            ? { ...item, count: item.count - 1 }
            : item
        ).filter(item => item.count > 0);
      }

      return {
        ...state,
        cart: updatedCart,
      };
    }
    case UPDATE_CART:
      return {
        ...state,
        cart: action.payload.cartItems,
        totalPrice: action.payload.totalPrice,
      };
    default:
      return state;
  }
};

export default cartReducer;


















// actions.js
export const ADD_TO_CART = 'ADD_TO_CART';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
export const UPDATE_CART_ITEM = 'UPDATE_CART_ITEM';
export const INCREMENT_ITEM = 'INCREMENT_ITEM';
export const DECREMENT_ITEM = 'DECREMENT_ITEM';

export const addToCart = (product) => ({
  type: ADD_TO_CART,
  payload: product,
});

export const removeFromCart = (productId) => ({
  type: REMOVE_FROM_CART,
  payload: productId,
});

export const updateCartItem = (productId, count) => ({
  type: UPDATE_CART_ITEM,
  payload: { productId, count },
});

export const incrementItem = (productId) => ({
  type: INCREMENT_ITEM,
  payload: productId,
});

export const decrementItem = (productId) => ({
  type: DECREMENT_ITEM,
  payload: productId,
});
































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
  
  const navigation = useNavigation();
  const route = useRoute();

  const cartItems = useSelector(state => state.cart.cartItems);
  const totalPrice = useSelector(state => state.cart.totalPrice);
  const dispatch = useDispatch();

console.log("11111111111111111111111111111111111111111111111",filteredData);

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

  const getSearch = async () => {
    try {
      const response = await instance.get(`/api/user/Search?productName=${searchQuery}&categoryName=${selectedCategory}`);
      if (response.status === 200) {
        setFilteredData(prevData => ({
          ...prevData,
          [selectedCategory.toLowerCase()]: response.data.map(product => ({
            ...product,
            count: 0 
          }))
        }));
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

      getSearch("",selectedCategory);
  
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
        data={filteredData.length > 0 ? filteredData : filteredData[selectedCategory]}

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
        data={filteredData.length > 0 ? filteredData : (data[selectedCategory] || [])}

        keyExtractor={(item) => item.productId}
        renderItem={renderShopItem}
        contentContainerStyle={styles.list}
        />
              {isBottomContainerVisible && (
  <BottomContainer
  totalItemCount={cartItems.length}
  totalPrice={totalPrice}
  onViewCart={handleViewCart}
  updateTotalPrice={updateCartState}
  initialCount={0}
/>)}

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



























































import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, Animated, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Icons from '../constants/Icons'; // Adjust the path as needed
import { useNavigation } from '@react-navigation/native';
import Theme from '../constants/Theme';
import PaymentButton from './PaymentButton';
import { instance } from '../constants/Common';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Corrected import

const Payment = ({ route }) => {
  const { cartItems = [], totalPrice = 0, deliveryTime = '', deliveryDay = '' } = route.params || {};
  const navigation = useNavigation();
  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const [fetchedAddressDetails, setFetchedAddressDetails] = useState([]);

  const toggleSwitch = () => setIsOnlineMode(previousState => !previousState);

  const getAddress = async (id) => {
    try {
      const response = await instance.get(`/api/user/Location?customerId=${id}`);
      if (response.status === 200) {
        setFetchedAddressDetails(response.data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await AsyncStorage.getItem("userDetails");
        if (userData !== null) {
          const parsedUserData = JSON.parse(userData);
          getAddress(parsedUserData.customerId);
        } else {
          Alert.alert('Error', 'User details not found.');
        }
      } catch (error) {
        console.error("Failed to load user details from AsyncStorage:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const renderCartItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemCount}>Quantity: {item.count}</Text>
      </View>
      <Text style={styles.itemPrice}>₹{item.count * item.price}</Text>
    </View>
  );

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => {
          setFetchedAddressDetails(fetchedAddressDetails.filter(item => item.id !== id));
          // Optionally, also delete the address from the backend here
        } }
      ]
    );
  };

  const renderAddressItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}
    >
      <View style={styles.addressContainer}>
        <Text style={styles.addressHeading}>Delivery Address:</Text>
        <Text style={styles.addressDetail}>Address: {item.location}</Text>
      </View>
    </Swipeable>
  );

  const calculateItemTotal = (cartItems) => {
    let total = 0;
    cartItems.forEach((item) => {
      total += item.count * item.price;
    });
    return total.toFixed(2);
  };

  const calculateGST = (cartItems) => {
    const itemTotal = parseFloat(calculateItemTotal(cartItems));
    const GSTPercentage = 18; // Assuming 18% GST
    const GSTAmount = (itemTotal * GSTPercentage) / 100;
    return GSTAmount.toFixed(2);
  };

  const calculateTotalPrice = () => {
    const itemTotal = parseFloat(calculateItemTotal(cartItems));
    const GST = parseFloat(calculateGST(cartItems));
    const deliveryFees = 30; // Example delivery fee
    const platformFees = 10; // Example platform fee
    const grandTotal = itemTotal + GST + deliveryFees + platformFees;
    return grandTotal.toFixed(2);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.productId}
        renderItem={renderCartItem}
        ListHeaderComponent={() => (
          <View style={styles.headerContent}>
            <View style={styles.offerContainer}>
              <Image source={Icons.offer} style={styles.offerIcon} />
              <View>
                <Text style={styles.offerText}>Save ₹50 more with SLASH50</Text>
                <Text style={styles.couponText}>View All restaurant coupons</Text>
              </View>
              <TouchableOpacity style={styles.applyButton}>
                <Text style={styles.applyButtonText}>APPLY</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.deliveryDetails}>
              <Text style={[Theme.FONTS.h8]}>Delivery Time: {deliveryTime}</Text>
              <Text style={[Theme.FONTS.h8]}>Delivery Day: {deliveryDay}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.footerContent}>
            <View style={styles.billSummary}>
              <View style={styles.billSummaryRow}>
                <Image source={Icons.billSummary} style={styles.billSummaryIcon} />
                <Text style={styles.billSummaryText}>Bill Summary</Text>
              </View>
              <View style={styles.priceDetails}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>Item total</Text>
                  <Text style={styles.priceValue}>₹{calculateItemTotal(cartItems)}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>GST</Text>
                  <Text style={styles.priceValue}>₹{calculateGST(cartItems)}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>Delivery Fees</Text>
                  <Text style={styles.priceValue}>₹30</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>Platform Fees</Text>
                  <Text style={styles.priceValue}>₹10</Text>
                </View>
                <View style={[styles.priceRow, styles.totalRow]}>
                  <Text style={styles.priceText}>Grand Total</Text>
                  <Text style={styles.priceValue}>₹{calculateTotalPrice()}</Text>
                </View>
              </View>
            </View>
            <View style={styles.paymentContainer}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={Icons.payment} style={styles.paymentIcon} />
                <Text style={styles.title}>Payment mode</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.text}>Online mode</Text>
                <CustomSwitch isOn={isOnlineMode} onToggle={toggleSwitch} />
              </View>
            </View>
            {fetchedAddressDetails.length > 0 ? (
              <FlatList
              
                data={fetchedAddressDetails}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderAddressItem}
                ListFooterComponent={() => (
                  <TouchableOpacity
                    style={styles.addLocationButton}
                    onPress={() => navigation.navigate('Address')}
                  >
                    <Image source={Icons.address} style={styles.offerIcon} />
                    <Text style={styles.addLocationButtonText}>Add Location</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <Text style={styles.noDataText}>No data found</Text>
            )}
          </View>
        )}
        contentContainerStyle={styles.contentContainer}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ₹{calculateTotalPrice()}</Text>
        <TouchableOpacity>
          <PaymentButton onPress={handleAddToPayment} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Payment;

const styles = StyleSheet.create({
  // ... other styles
  addressContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: '90%',
    height: 80,
    alignSelf: 'center',
  },
  addressHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addressDetail: {
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
  },
});






















import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Animated,
} from "react-native";
import Icons from "../constants/Icons"; // Adjust the path as needed
import { useNavigation } from "@react-navigation/native";
import Theme from "../constants/Theme";
import PaymentButton from "./PaymentButton";
import { instance } from "../constants/Common";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Corrected import

const Payment = ({ route }) => {
  const {
    cartItems = [],
    totalPrice = 0,
    deliveryTime = "",
    deliveryDay = "",
  } = route.params || {};

  const navigation = useNavigation();
  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const [fetchedAddressDetails, setfetchedAddressDetails] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const toggleSwitch = () => setIsOnlineMode(prev => !prev);

  const CustomSwitch = ({ isOn, onToggle }) => {
    const animatedValue = useRef(new Animated.Value(isOn ? 24 : 2)).current;

    const handleToggle = () => {
      const toValue = isOn ? 2 : 24;
      Animated.timing(animatedValue, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }).start();
      onToggle();
    };

    return (
      <TouchableOpacity
        onPress={handleToggle}
        style={[styles.slider, isOn && styles.sliderOn]}
      >
        <Animated.View style={[styles.knob, { left: animatedValue }]} />
      </TouchableOpacity>
    );
  };

  const getAddress = async (id) => {
    try {
      const response = await instance.get(`/api/user/Location?customerId=${id}`);
      if (response.status === 200) {
        setfetchedAddressDetails(response.data);
        // Set the first address as the selected one if no address is selected
        if (!selectedAddress && response.data.length > 0) {
          setSelectedAddress(response.data[0]);
        }
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await AsyncStorage.getItem("userDetails");
        if (userData !== null) {
          const parsedUserData = JSON.parse(userData);
          getAddress(parsedUserData.customerId);
        } else {
          Alert.alert("Error", "User details not found.");
        }
      } catch (error) {
        console.error("Failed to load user details from AsyncStorage:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const renderCartItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemCount}>Quantity: {item.count}</Text>
      </View>
      <Text style={styles.itemPrice}>₹{item.count * item.price}</Text>
    </View>
  );

  const calculateItemTotal = (cartItems) => {
    let total = 0;
    cartItems.forEach((item) => {
      total += item.count * item.price;
    });
    return total.toFixed(2);
  };

  const calculateGST = (cartItems) => {
    const itemTotal = parseFloat(calculateItemTotal(cartItems));
    const GSTPercentage = 18; // Assuming 18% GST
    const GSTAmount = (itemTotal * GSTPercentage) / 100;
    return GSTAmount.toFixed(2);
  };

  const calculateTotalPrice = () => {
    const itemTotal = parseFloat(calculateItemTotal(cartItems));
    const GST = parseFloat(calculateGST(cartItems));
    const deliveryFees = 30; // Example delivery fee
    const platformFees = 10; // Example platform fee
    const grandTotal = itemTotal + GST + deliveryFees + platformFees;
    return grandTotal.toFixed(2);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.productId}
        renderItem={renderCartItem}
        ListHeaderComponent={() => (
          <View style={styles.headerContent}>
            {/* Offer Container */}
            <View style={styles.offerContainer}>
              <Image source={Icons.offer} style={styles.offerIcon} />
              <View>
                <Text style={styles.offerText}>Save ₹50 more with SLASH50</Text>
                <Text style={styles.couponText}>
                  View All restaurant coupons
                </Text>
              </View>
              <TouchableOpacity style={styles.applyButton}>
                <Text style={styles.applyButtonText}>APPLY</Text>
              </TouchableOpacity>
            </View>

            {/* Display Selected Delivery Time */}
            <View style={styles.deliveryDetails}>
              <Text style={[Theme.FONTS.h8]}>
                Delivery Time: {deliveryTime}
              </Text>
              <Text style={[Theme.FONTS.h8]}>Delivery Day: {deliveryDay}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.footerContent}>
            {/* Bill Summary */}
            <View style={styles.billSummary}>
              <View style={styles.billSummaryRow}>
                <Image
                  source={Icons.billSummary}
                  style={styles.billSummaryIcon}
                />
                <Text style={styles.billSummaryText}>Bill Summary</Text>
              </View>
              <View style={styles.priceDetails}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>Item total</Text>
                  <Text style={styles.priceValue}>
                    ₹{calculateItemTotal(cartItems)}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>GST</Text>
                  <Text style={styles.priceValue}>
                    ₹{calculateGST(cartItems)}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>Delivery Fees</Text>
                  <Text style={styles.priceValue}>₹30</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>Platform Fees</Text>
                  <Text style={styles.priceValue}>₹10</Text>
                </View>
                <View style={[styles.priceRow, styles.totalRow]}>
                  <Text style={styles.priceText}>Grand Total</Text>
                  <Text style={styles.priceValue}>
                    ₹{calculateTotalPrice()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Payment Mode */}
            <View style={styles.paymentContainer}>
              <View style={{ flexDirection: "row" }}>
                <Image source={Icons.payment} style={styles.paymentIcon} />
                <Text style={styles.title}>Payment mode</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.text}>Online mode</Text>
                <CustomSwitch isOn={isOnlineMode} onToggle={toggleSwitch} />
              </View>
            </View>

            <FlatList
              data={fetchedAddressDetails}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.addressContainer}>
                  <TouchableOpacity
                    style={[
                      styles.addressCard,
                      selectedAddress === item && styles.selectedAddress,
                    ]}
                    onPress={() => setSelectedAddress(item)}
                  >
                    <View style={styles.addressContent}>
                      <Text style={styles.addressHeading}>
                        Delivery Address:
                      </Text>
                      <Text style={styles.addressDetail}>
                        Address: {item.location}
                      </Text>
                    </View>
                    {selectedAddress === item && (
                      <View style={styles.checkmarkContainer}>
                        <Text style={styles.checkmark}>✔</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={styles.contentContainer}
            />

            {/* Add Location Button */}
            <TouchableOpacity
              style={styles.addLocationButton}
              onPress={() => navigation.navigate("Address")}
            >
              <Image source={Icons.address} style={styles.offerIcon} />
              <Text style={styles.addLocationButtonText}>Add Location</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.contentContainer}
      />

      {/* Total Container at Bottom */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>₹{calculateTotalPrice()}</Text>
        <PaymentButton title="Proceed to Payment" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  offerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFE4E1",
    padding: 10,
    borderRadius: 5,
  },
  offerIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  offerText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "bold",
  },
  couponText: {
    fontSize: 12,
    color: "#888",
  },
  applyButton: {
    backgroundColor: "#FF6347",
    padding: 5,
    borderRadius: 5,
  },
  applyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  deliveryDetails: {
    marginTop: 10,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemCount: {
    fontSize: 14,
    color: "#888",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6347",
  },
  footerContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  billSummary: {
    backgroundColor: "#F0F8FF",
    borderRadius: 5,
    padding: 10,
  },
  billSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  billSummaryIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  billSummaryText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  priceDetails: {
    marginTop: 10,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  priceText: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    marginTop: 10,
  },
  totalContainer: {
    padding: 20,
    backgroundColor: "#F5F5F5",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  paymentContainer: {
    backgroundColor: "#F0F8FF",
    padding: 10,
    borderRadius: 5,
  },
  paymentIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  text: {
    fontSize: 14,
  },
  slider: {
    width: 50,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  sliderOn: {
    backgroundColor: "#4CAF50",
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
    position: "absolute",
  },
  addressContainer: {
    marginHorizontal: 5,
  },
  addressCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedAddress: {
    borderColor: "#4CAF50",
    borderWidth: 2,
  },
  addressContent: {
    flex: 1,
  },
  addressHeading: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addressDetail: {
    fontSize: 14,
    color: "#888",
  },
  checkmarkContainer: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  checkmark: {
    fontSize: 18,
    color: "#4CAF50",
  },
  contentContainer: {
    paddingBottom: 20,
  },
  addLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0FFFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  addLocationButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default Payment;





























import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { instance } from '../constants/Common';
import { useRoute } from '@react-navigation/native'; // Import useRoute
import AsyncStorage from "@react-native-async-storage/async-storage";

const Orders = () => {
  const route = useRoute(); 
  const { customerId } = route.params || {};

  const [bookings, setBookings] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedUserDetails = await AsyncStorage.getItem('userDetails');
        if (storedUserDetails !== null) {
          setUserDetails(JSON.parse(storedUserDetails));
        }
      } catch (error) {
        console.error('Failed to retrieve user details from AsyncStorage:', error);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!customerId) return;

      try {
        const response = await instance.get(`/api/user/Booking/CustomerId?customerId=${customerId}`);
        setBookings(response.data); 
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, [customerId]);
console.log('====================================');
console.log(userDetails);
console.log('====================================');
  return (
    <View style={styles.container}>
      {bookings.map((booking, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.imageContainer}>
            <Image 
                source={{ uri: booking.image }}
                style={styles.image}
            />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.textContent}>
              <Text style={styles.title}>{booking.productName}</Text> 
              <Text style={styles.description}>{booking.description}</Text> 
              <Text style={styles.quantity}>Quantity: {booking.quantity}</Text>
              <Text style={styles.price}>${booking.amount}</Text>
            </View>
            <TouchableOpacity style={styles.cancelButton}>
              <Ionicons name="close-circle" size={20} color="white" />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};
export default Orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    width: '90%',
    height: '20%',
    marginTop: 10,
    borderRadius: 10,
    alignSelf: 'center',
    elevation: 5,
    flexDirection: 'row',
    padding: 10,
  },
  imageContainer: {
    backgroundColor: 'white',
    width: '40%',
    height: '92%',
    borderRadius: 10,
    elevation: 10,
    margin: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
 
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 13,
    color: 'gray',
  },
  quantity: {
    fontSize: 14,
  },
  price: {
    fontSize: 15,
    color: 'maroon',
    fontWeight: 'bold',
    marginTop: 5,
  },
  cancelButton: {
    flexDirection: 'row',
    backgroundColor: 'red',
    width: 90,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 90,
  },
  cancelText: {
    fontSize: 15,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5, // Add some space between the icon and text
  },
});










import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import Theme from "../constants/Theme";
import { instance } from "../constants/Common";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Otp = ({ navigation }) => {
  const route = useRoute();
  const { customerId ,userExits} = route.params;
  // navigation.replace("Orders", { customerId:customerId });


  const [otp, setOtp] = useState(["", "", "", ""]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  // const [timer, setTimer] = useState(120);
  const inputs = useRef([]);
  // useEffect(() => {
  //   const countdown = setInterval(() => {
  //     setTimer((prevTimer) => {
  //       if (prevTimer <= 1) {
  //         clearInterval(countdown);
  //         Alert.alert(
  //           "Time Expired",
  //           "The OTP entry time has expired. Please request a new OTP."
  //         );
  //         return 0;
  //       }
  //       return prevTimer - 1;
  //     });
  //   }, 1000);

  //   return () => clearInterval(countdown);
  // }, []);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < inputs.current.length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleContinue = async () => {
    const enteredOtp = otp.join("");
    const isEmailValid = emailRegex.test(customerEmail);
    if (
      !customerId ||
      enteredOtp.length < 4 ||
      (!userExits && (!customerName || !customerEmail))
    ) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }


    if (!userExits && !isEmailValid) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    try {
      const response = await instance.post("/api/user/Login", {
        otp: enteredOtp,
        customerName,
        customerEmail,
        customerId,
      
      });
      if (response.status === 200) {
        
        await AsyncStorage.setItem(
          "userDetails",
          JSON.stringify(response.data.result[0])
        );

        navigation.replace("Home");
      }
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      Alert.alert("Verification Failed", "Invalid OTP. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
       {!userExits && (
        <>
          <Text style={styles.sectionTitle}>Enter your details</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            value={customerName}
            onChangeText={setCustomerName}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your Email"
            value={customerEmail}
            onChangeText={setCustomerEmail}
          />
        </>
      )}
      <Text style={styles.sectionTitle}>Verify OTP</Text>
      <View style={styles.otpContainer}>
        {otp.map((value, index) => (
          <TextInput
            key={index}
            style={styles.otpBox}
            keyboardType="numeric"
            maxLength={1}
            value={value}
            onChangeText={(text) => handleChange(text, index)}
            ref={(ref) => (inputs.current[index] = ref)}
          />
        ))}
      </View>
      {/* <Text style={styles.timerText}>{`Time remaining: ${timer} seconds`}</Text> */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText} >Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "black",
  },
  input: {
    width: "80%",
    height: 50,
    borderColor: "maroon",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    fontSize: 15,
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "maroon",
    borderRadius: 20,
    textAlign: "center",
    fontSize: 20,
    marginHorizontal: 5,
  },
  timerText: {
    fontSize: 13,
    color: "gray",
    fontWeight: "bold",
    marginBottom: 20,
    marginRight: 40,
  },
  continueButton: {
    backgroundColor: Theme.COLORS.maroon,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // For Android shadow
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Otp;

















import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { instance } from '../constants/Common';
import { useRoute } from '@react-navigation/native'; // Import useRoute
import AsyncStorage from "@react-native-async-storage/async-storage";

const Orders = () => {
  const route = useRoute(); 
  const { customerId } = route.params || {}; 

  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!customerId) return;

      try {
        const response = await instance.get(`/api/user/Booking/CustomerId?customerId=${customerId}`);
        setBookings(response.data); 
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, [customerId]);

  return (
    <View style={styles.container}>
      {bookings.map((booking, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.imageContainer}>
            <Image 
                source={{ uri: booking.image }}
                style={styles.image}
            />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.textContent}>
              <Text style={styles.title}>{booking.productName}</Text> 
              <Text style={styles.description}>{booking.description}</Text> 
              <Text style={styles.quantity}>Quantity: {booking.quantity}</Text>
              <Text style={styles.price}>${booking.amount}</Text>
            </View>
            <TouchableOpacity style={styles.cancelButton}>
              <Ionicons name="close-circle" size={20} color="white" />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};
export default Orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    width: '90%',
    height: '20%',
    marginTop: 10,
    borderRadius: 10,
    alignSelf: 'center',
    elevation: 5,
    flexDirection: 'row',
    padding: 10,
  },
  imageContainer: {
    backgroundColor: 'white',
    width: '40%',
    height: '92%',
    borderRadius: 10,
    elevation: 10,
    margin: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
 
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 13,
    color: 'gray',
  },
  quantity: {
    fontSize: 14,
  },
  price: {
    fontSize: 15,
    color: 'maroon',
    fontWeight: 'bold',
    marginTop: 5,
  },
  cancelButton: {
    flexDirection: 'row',
    backgroundColor: 'red',
    width: 90,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 90,
  },
  cancelText: {
    fontSize: 15,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5, // Add some space between the icon and text
  },
});
