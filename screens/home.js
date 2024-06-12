import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Swiper from 'react-native-swiper';
import { LinearGradient } from 'expo-linear-gradient';
import Images from '../constants/Images';
import Theme from '../constants/Theme';
import { imageData, sellerData } from '../constants/Data';
 import BottomContainer from '../shops_category/BottomContainer '

const { width } = Dimensions.get('window');

const Home = () => {
  const navigation = useNavigation();
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);


  const handleCategoryPress = (categoryName) => {
    navigation.navigate('Shops', { category: categoryName });
  };

  const handleToggleItem = (item) => {
    setSelectedItems((prevItems) => {
      const existingItem = prevItems.find((prevItem) => prevItem.id === item.id);
      if (existingItem) {
        // Item exists, update its count
        return prevItems.map((prevItem) =>
          prevItem.id === item.id ? { ...prevItem, count: prevItem.count + 1 } : prevItem
        );
      } else {
        // Item doesn't exist, add it with count 1
        return [...prevItems, { ...item, count: 1 }];
      }
    });
  };

  const handleIncrementCount = (itemId) => {
    setSelectedItems((prevItems) =>
      prevItems.map((prevItem) =>
        prevItem.id === itemId ? { ...prevItem, count: prevItem.count + 1 } : prevItem
      )
    );
    setTotalPrice((prevTotal) => prevTotal + 1);
  };

  const handleDecrementCount = (itemId) => {
    setSelectedItems((prevItems) =>
      prevItems.map((prevItem) =>
        prevItem.id === itemId ? { ...prevItem, count: Math.max(0, prevItem.count - 1) } : prevItem
      )
    );
    setTotalPrice((prevTotal) => Math.max(0, prevTotal - 1));
  };

  const handleViewCart = () => {
    navigation.navigate('ViewCart', { selectedItems, totalPrice });
  };


    // Render the BottomContainer if selectedItems has any items
    const renderBottomContainer = () => {
      if (selectedItems.length > 0) {
        return (
          <BottomContainer
            totalPrice={totalPrice}
            initialCount={0}
            onViewCart={handleViewCart}
            updateTotalPrice={setTotalPrice}
          />
      
        );
      }
      return null;
    };

  const renderImage = ({ item }) => (
    <TouchableOpacity onPress={() => handleCategoryPress(item.name)}>
      <View style={styles.imageContainer}>
        <Image source={item.source} style={styles.image} resizeMode="cover" />
        <Text style={styles.imageName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSellerItem = ({ item }) => {
    const selectedItem = selectedItems.find((selectedItem) => selectedItem.id === item.id);
    const count = selectedItem ? selectedItem.count : 0;

    return (
      <View style={styles.sellerItemContainer}>
        <Image source={item.source} style={styles.sellerImage} resizeMode="cover" />
        <View style={styles.sellerDetails}>
          <Text style={[styles.sellerTitle, Theme.FONTS.body0]}>{item.title}</Text>
          <Text style={[styles.sellerDescription, Theme.FONTS.h8]}>{item.description}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{item.price}</Text>
            <Text style={styles.oldPrice}>{item.oldPrice}</Text>
            <Text style={styles.discount}>{item.discount}</Text>
          </View>
          <Text style={styles.deliveryTime}>{item.deliveryTime}</Text>
          <View style={styles.counterContainer}>
            {count > 0 ? (
              <>
                <TouchableOpacity
                  onPress={() => handleDecrementCount(item.id)}
                  style={styles.counterButton}
                >
                  <Text style={styles.counterText}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.counterValue, { color: Theme.COLORS.white, fontWeight: 'bold' }]}>
                  {count}
                </Text>
                <TouchableOpacity
                  onPress={() => handleIncrementCount(item.id)}
                  style={styles.counterButton}
                >
                  <Text style={styles.counterText}>+</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.addButton} onPress={() => handleToggleItem(item)}>
                <Text style={styles.addButtonText}>Add +</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Fixed Location container */}
      <View style={styles.locationContainer}>
        <Text style={styles.locationText}>Location</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView style={styles.scrollView}>
        <LinearGradient colors={['#ffcccc', 'white', 'white']} style={styles.scrollContainer}>
          {/* Swipeable container */}
          <View style={styles.swiperContainer}>
            <Swiper dot={<View style={styles.dot} />} activeDot={<View style={styles.activeDot} />} showsPagination={true} loop={true}>
              {/* Image 1 */}
              <View style={styles.slide}>
                <View style={styles.shadowContainer}>
                  <Image source={Images.loginBackground} style={styles.swiperImage} resizeMode="cover" />
                </View>
              </View>

              {/* Image 2 */}
              <View style={styles.slide}>
                <View style={styles.shadowContainer}>
                  <Image source={Images.log} style={styles.swiperImage} resizeMode="cover" />
                </View>
              </View>

              {/* Image 3 */}
              <View style={styles.slide}>
                <View style={styles.shadowContainer}>
                  <Image source={Images.loginBackground1} style={styles.swiperImage} resizeMode="cover" />
                </View>
              </View>

              {/* Image 4 */}
              <View style={styles.slide}>
                <View style={styles.shadowContainer}>
                  <Image source={Images.loginBackground2} style={styles.swiperImage} resizeMode="cover" />
                </View>
              </View>
            </Swiper>
          </View>

          {/* Shop by category section */}
          <View style={styles.shopContainer}>
            <Text style={[styles.shopText, Theme.FONTS.h6]}>Shop by category</Text>
            <Text style={[styles.shopText, Theme.FONTS.h5]}>Choose from the widest range of premium meats</Text>
            <FlatList
              horizontal
              data={imageData}
              renderItem={renderImage}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageRow}
            />
          </View>

          {/* BestSellers section */}
          <View style={styles.sellers}>
            <Text style={[styles.sellerText, Theme.FONTS.h6]}>BestSellers</Text>
            <Text style={[styles.sellerText, Theme.FONTS.h5]}>Fresh meats at extra special prices</Text>
            <FlatList
              horizontal
              data={sellerData}
              renderItem={renderSellerItem}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sellerRow}
            />
          </View>
        </LinearGradient>
      </ScrollView>
      {renderBottomContainer()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  locationContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 70,
    backgroundColor: Theme.COLORS.white,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    zIndex: 10,
  },
  locationText: {
    color: Theme.COLORS.black,
    fontWeight: 'bold',
    fontSize: 18,
  },
  scrollView: {
    marginTop: 70,
  },
  scrollContainer: {
    padding: 12,
    paddingBottom: 70,
  },
  swiperContainer: {
    width: '100%',
    height: 230,
    marginTop: 20,
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  swiperImage: {
    width: width * 0.9,
    height: 180,
    borderRadius: 10,
  },
  shadowContainer: {
    borderRadius: 10,
    shadowColor: Theme.COLORS.black,
    elevation: 8,
  },
  dot: {
    backgroundColor: Theme.COLORS.lightGray3,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    top: 0,
  },
  activeDot: {
    backgroundColor: Theme.COLORS.maroon,
    width: 15,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    top: 0,
  },
  shopContainer: {
    marginTop: 0,
  },
  shopText: {
    marginBottom: 0,
    marginLeft: 20,
  },
  imageRow: {
    paddingHorizontal: 10,
    marginTop: 0,
  },
  imageContainer: {
    alignItems: 'center',
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  imageName: {
    marginTop: 0,
    fontSize: 13,
    fontWeight: 'bold',
    color: Theme.COLORS.black,
  },
  sellers: {
    marginTop: 20,
  },
  sellerText: {
    marginBottom: 0,
    marginLeft: 20,
  },
  sellerRow: {
    paddingHorizontal: 10,
  },
  sellerItemContainer: {
    width: 210,
    backgroundColor: Theme.COLORS.white,
    marginTop: 10,
    marginRight: 20,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  sellerImage: {
    width: '100%',
    height: 130,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  sellerDetails: {
    padding: 10,
  },
  sellerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sellerDescription: {
    fontSize: 14,
    color: Theme.COLORS.gray,
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.COLORS.black,
    marginRight: 5,
  },
  oldPrice: {
    fontSize: 14,
    color: Theme.COLORS.gray,
    textDecorationLine: 'line-through',
    marginRight: 15,
  },
  discount: {
    fontSize: 14,
    color: 'green',
  },
  deliveryTime: {
    fontSize: 14,
    color: Theme.COLORS.gray,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: Theme.COLORS.maroon,
    borderRadius: 5,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: Theme.COLORS.white,
    fontSize: 16,
    fontWeight:'bold'
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    
    backgroundColor: Theme.COLORS.maroon,
    width:'50%',
    borderRadius:5,
  },
  counterButton: {
    
    borderRadius: 5,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  counterText: {
    color: Theme.COLORS.white,
    fontSize: 18,
    fontWeight:'bold',
  },
  counterValue: {
    fontSize: 16,
    marginHorizontal: 10,
    color:'white'
  },
});

export default Home;
