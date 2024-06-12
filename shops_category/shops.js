import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { mutton, fish, chicken, prawn, beaf, egg } from '../constants/Data';
import Theme from '../constants/Theme';
import BottomContainer from '../shops_category/BottomContainer ';
import ViewCart from '../Viewcard/ViewCart';

const initialData = {
  chicken: chicken.map(item => ({ ...item, count: 0 })),
  mutton: mutton.map(item => ({ ...item, count: 0 })),
  fish: fish.map(item => ({ ...item, count: 0 })),
  beaf: beaf.map(item => ({ ...item, count: 0 })),
  egg: egg.map(item => ({ ...item, count: 0 })),
  prawn: prawn.map(item => ({ ...item, count: 0 })),
};

const redContainerImages = [
  { image: require('../assets/images/login/chickenn.png'), name: 'Chicken', key: 'chicken' },
  { image: require('../assets/images/shop/mutton1.jpg'), name: 'Mutton', key: 'mutton' },
  { image: require('../assets/images/shop/fish.jpg'), name: 'Fish', key: 'fish' },
  { image: require('../assets/images/login/chicken1.png'), name: 'Beaf', key: 'beaf' },
  { image: require('../assets/images/login/chicken2.png'), name: 'Egg', key: 'egg' },
  { image: require('../assets/images/login/mutton.png'), name: 'Prawn', key: 'prawn' },
];

const Shops = () => {
  const [selectedCategory, setSelectedCategory] = useState('chicken');
  const [data, setData] = useState(initialData);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(redContainerImages);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isBottomContainerVisible, setIsBottomContainerVisible] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    const category = route.params?.category;
    if (category) {
      setSelectedCategory(category.toLowerCase());
    }
  }, [route.params?.category]);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredData(redContainerImages);
    } else {
      const filtered = redContainerImages.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchQuery]);

  const handleIncrement = (item) => {
    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.id === item.id ? { ...shopItem, count: shopItem.count + 1 } : shopItem
      )
    };
    setData(updatedData);

    const newCartItems = Object.values(updatedData).flat().filter(shopItem => shopItem.count > 0);
    const totalPriceIncrement = parseInt(item.money.replace('₹', ''));
    setCartItems(newCartItems);
    setTotalPrice(totalPrice + totalPriceIncrement);
    setIsBottomContainerVisible(newCartItems.length > 0);
  };

  const handleDecrement = (item) => {
    if (item.count === 0) return;
    const updatedData = {
      ...data,
      [selectedCategory]: data[selectedCategory].map(shopItem =>
        shopItem.id === item.id ? { ...shopItem, count: shopItem.count - 1 } : shopItem
      )
    };
    setData(updatedData);

    const newCartItems = Object.values(updatedData).flat().filter(shopItem => shopItem.count > 0);
    const totalPriceDecrement = parseInt(item.money.replace('₹', ''));
    setCartItems(newCartItems);
    setTotalPrice(totalPrice - totalPriceDecrement);
    setIsBottomContainerVisible(newCartItems.length > 0);
  };
  const handleViewCart = () => {
    navigation.navigate('ViewCart', { 
      selectedItems: cartItems, 
      totalPrice, 
      updateTotalPrice // Include the updateTotalPrice function
    });
  };
  

  const updateTotalPrice = (newTotalPrice) => {
 
    setTotalPrice(newTotalPrice);
  };
  const updateCartItems = (updatedItems) => {
    // Update the state with the updated items
    // This function will be passed down to the ViewCart component
    // It will update both the cart items and the total price
  };
  const handleSearchIconPress = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const renderShopItem = ({ item }) => (
    <View style={styles.touchContainer}>
      <View style={styles.shopContainer}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
        <Text style={[styles.shopname, Theme.FONTS.bo]}>{item.name}</Text>
        <Text style={[styles.shopLocation, Theme.FONTS.h9]}>{item.uses}</Text>
        <View style={styles.pricePiecesContainer}>
          <Text style={[styles.shopprice, Theme.FONTS.h9]}>{item.price}</Text>
          <Text style={[styles.pieces, Theme.FONTS.h10]}>{item.pieces}</Text>
        </View>
        <View style={styles.offerContainer}>
          <Text style={[styles.money, Theme.FONTS.h9]}>{item.money}</Text>
          <Text style={[styles.offer, Theme.FONTS.h10]}>{item.offer}</Text>
        </View>
        <Text style={[styles.deliveryTime, Theme.FONTS.h10]}>{item.deliveryTime}</Text>
      </View>
      {item.count === 0 ? (
        <TouchableOpacity style={styles.button} onPress={() => handleIncrement(item)}>
          <Text style={styles.buttonText}>Add +</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.counterContainer}>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleDecrement(item)}>
            <Text style={styles.counterButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.counterText}>{item.count}</Text>
          <TouchableOpacity style={styles.counterButton} onPress={() => handleIncrement(item)}>
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const handleRedContainerImagePress = (key) => {
    setSelectedCategory(key);
  };

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
            <TouchableOpacity key={index} onPress={() => handleRedContainerImagePress(item.key)} style={styles.redContainerItem}>
              <Image source={item.image} style={styles.redContainerImage} resizeMode="cover" />
              <Text style={[styles.redContainerText, Theme.FONTS.h8, selectedCategory === item.key && styles.boldText]}>{item.name}</Text>
              {selectedCategory === item.key && <View style={styles.hoverLine} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={data[selectedCategory]}
        renderItem={renderShopItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.contentContainer}
        extraData={data[selectedCategory]}
      />
      {isBottomContainerVisible && (
        <BottomContainer
          totalPrice={totalPrice}
          onViewCart={handleViewCart}
          updateTotalPrice={updateTotalPrice}
          cartItems={cartItems}
          updateCartItems={updateCartItems} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    marginBottom: 0,
    marginTop: 30,
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
    width: 330,
    height: 270,
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
    width: 330,
    height: 140,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
    fontWeight: 'bold'
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
    fontSize: 20
  },
  counterText: {
    marginHorizontal: 10,
    fontWeight: 'bold',
    fontSize: 16,
    color: Theme.COLORS.white
  },
  offerContainer: {
    flexDirection: 'row',
  },
  offer: {
    fontWeight: 'bold',
    color: 'green',
    marginTop: 10,
    marginLeft: 20
  },
});

export default Shops;
