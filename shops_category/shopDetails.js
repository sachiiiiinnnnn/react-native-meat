import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Swiper from 'react-native-swiper';
import Images from '../constants/Images'; // Make sure this path is correct based on your file structure
import Theme from '../constants/Theme';
import Icons from '../constants/Icons'; // Import Icons

const ShopDetails = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const pricePerItem = 100; // Assuming price per item is 100

  const handleSearchIconPress = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const handleIncreaseQuantity = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  const handleDecreaseQuantity = () => {
    setQuantity(prevQuantity => (prevQuantity > 0 ? prevQuantity - 1 : 0));
  };

  const handleIconPress = (icon) => {
    setSelectedIcon(icon);
  };

  const getIconStyle = (icon) => {
    if (selectedIcon === icon) {
      switch (icon) {
        case 'call':
          return { tintColor: 'green' };
        case 'location':
          return { tintColor: 'blue' };
        case 'favourite':
          return { tintColor: 'red' };
        default:
          return {};
      }
    }
    return { tintColor: 'black' };
  };

  const items = ['Chicken', 'Mutton', 'Beaf', 'Prawn', 'Egg', 'Kadai', 'Fish', 'Sea foods',];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {isSearchVisible && (
          <TextInput style={styles.searchInput} placeholder="What's your favourite" />
        )}
        <TouchableOpacity onPress={handleSearchIconPress} style={styles.searchIconContainer}>
          <Image source={Icons.search} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.swiperContainer}>
          <Swiper
            dot={<View style={styles.dot} />}
            activeDot={<View style={styles.activeDot} />}
            showsPagination={true}
            loop={true}
          >
            {/* Image 1 */}
            <View style={styles.slide}>
              <Image source={Images.shop} style={styles.swiperImage} resizeMode="cover" />
            </View>

            {/* Image 2 */}
            <View style={styles.slide}>
              <Image source={Images.loginBackground3} style={styles.swiperImage} resizeMode="cover" />
            </View>

            {/* Image 3 */}
            <View style={styles.slide}>
              <Image source={Images.loginBackground1} style={styles.swiperImage} resizeMode="cover" />
            </View>

            {/* Image 4 */}
            <View style={styles.slide}>
              <Image source={Images.loginBackground2} style={styles.swiperImage} resizeMode="cover" />
            </View>
          </Swiper>
        </View>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => handleIconPress('call')} style={styles.iconButton}>
            <Image source={Icons.call} style={[styles.icon, getIconStyle('call')]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleIconPress('location')} style={styles.iconButton}>
            <Image source={Icons.location} style={[styles.icon, getIconStyle('location')]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleIconPress('favourite')} style={styles.iconButton}>
            <Image source={Icons.favourite} style={[styles.icon, getIconStyle('favourite')]} />
          </TouchableOpacity>
        </View>
        <View style={{ padding: 20 }}>
          <Text style={[Theme.FONTS.h2, styles.storetext]}>Sachin Chicken Shop</Text>
          <View style={styles.storeDetailsRow}>
            <Text style={[Theme.FONTS.h4, styles.storeLocation]}>Medavakkam - Chennai</Text>
            <Text style={[Theme.FONTS.h10, styles.storeTiming]}>Timing - 10.00AM to 10.00PM</Text>
          </View>
          <Text style={[Theme.FONTS.h11, styles.storeBio]}>
            Chicken Curry Cut is a premium cut that includes the leg, breast & wings. This smaller, tender cut has equal-sized pieces for uniform cooking and the juiciest bites. Our meaty, juicy Chicken Curry Cut is perfect for a family of 4.
          </Text>
          <Text style={{marginTop:10,fontWeight:'bold',color:Theme.COLORS.maroon,fontSize:18}}>Availables</Text>
          <View style={styles.tickList}>
            {items.map((item, index) => (
              <View key={index} style={styles.tickRow}>
                <Image source={Icons.tick} style={styles.tickIcon} />
                <Text style={[styles.tickText, Theme.FONTS.h12]}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomContainer}>
        <Text style={styles.priceText}>Price: ₹{quantity * pricePerItem}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={handleDecreaseQuantity} style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <View style={styles.addContainer}>
            <Text style={styles.addText}>{quantity > 0 ? quantity : "Add"}</Text>
          </View>
          <TouchableOpacity onPress={handleIncreaseQuantity} style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ShopDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.COLORS.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: Theme.COLORS.white,
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
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 20,
    paddingHorizontal: 10,
    flex: 1,
  },
  swiperContainer: {
    width: '100%',
    height: 230,
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  swiperImage: {
    width: '100%',
    height: '100%',
  },
  dot: {
    backgroundColor: Theme.COLORS.white,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    top: 10,
  },
  activeDot: {
    backgroundColor: Theme.COLORS.lightGreen,
    width: 25,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    top: 10,
  },
  storetext: {
    fontWeight: 'bold',
  },
  storeDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: Theme.COLORS.lightGray,
    height: 40,
    padding: 10,
    borderRadius: 10,
  },
  storeLocation: {
    color: Theme.COLORS.black,
  },
  storeTiming: {
    color: Theme.COLORS.maroon,
    fontWeight: 'bold',
  },
  storeBio: {
    marginTop: 15,
  },
  tickList: {
    marginTop: 15,
    marginBottom:50
  },
  tickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginLeft:10
  },
  tickIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  tickText: {

  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 25,
    height: 25,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Theme.COLORS.white,
    borderTopWidth: 1,
    borderColor: Theme.COLORS.gray2,
    position: 'absolute',
    bottom: 10,
    width: '90%',
    borderRadius: 10,
    elevation: 5,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: Theme.COLORS.maroon,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.COLORS.white,
    marginRight: 1,
    marginLeft: 0,
  },
  addContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.COLORS.maroon,
    height: 34.5,
    width: 50,
    borderRadius: 0,
    marginHorizontal: 0,
  },
  addText: {
    fontSize: 18,
    color: Theme.COLORS.white,
  },
});
