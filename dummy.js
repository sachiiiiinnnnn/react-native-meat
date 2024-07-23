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


