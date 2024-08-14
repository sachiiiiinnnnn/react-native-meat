import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Swiper from "react-native-swiper";
import { LinearGradient } from "expo-linear-gradient";
import Images from "../constants/Images";
import Theme from "../constants/Theme";
import { imageData, sellerData } from "../constants/Data";
import BottomContainer from "../shops_category/BottomContainer ";
import Icons from "../constants/Icons"; // Import the icons
import { instance } from "../constants/Common";
import { useSelector } from "react-redux";
import * as Location from "expo-location";
import Geocoder from "react-native-geocoding";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

Geocoder.init("YOUR_GOOGLE_MAPS_API_KEY");

const Home = () => {
  const navigation = useNavigation();
  const [selectedItems, setSelectedItems] = useState([]);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("Fetching location...");

  const cartState = useSelector((state) => state.cart) || {}; // Default to an empty object if undefined
  const productsCart = useSelector((state) => state.cart.productsCart);

  // Use optional chaining and default values to handle undefined cases
  const totalItemCount = (cartState.cartItems || []).reduce(
    (total, item) => total + (item.count || 0),
    0
  );
  const totalPrice = cartState.totalPrice || 0;
  //integration category
  const [categoryData, setCategoryData] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [viewCart, setViewCart] = useState([]);

  const getCategory = async () => {
    try {
      const response = await instance.get("/api/user/Category");
      if (response.status === 200) {
        setCategoryData(response.data);
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  const getBestSellers = async () => {
    try {
      const response = await instance.get("/api/user/Product/BestSeller");
      if (response.status === 200) {
        setBestSellers(response.data);
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

  useEffect(() => {
    getBestSellers();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      const { latitude, longitude } = location.coords;

      Geocoder.from(latitude, longitude)
        .then((json) => {
          const addressComponent = json.results[0].formatted_address;
          setAddress(addressComponent);
        })
        .catch((error) => console.warn(error));
    })();
  }, []);

  const handleCategoryPress = (categoryId) => {
    navigation.navigate("Shops", { category: categoryId });
  };

  const handleToggleItem = (item) => {
    setSelectedItems((prevItems) => {
      const existingItem = prevItems.find(
        (prevItem) => prevItem.id === item.id
      );
      if (existingItem) {
        return prevItems.map((prevItem) =>
          prevItem.id === item.id
            ? { ...prevItem, count: prevItem.count + 1 }
            : prevItem
        );
      } else {
        return [...prevItems, { ...item, count: 1 }];
      }
    });
  };



  // const handleIncrement = (item) => {
  //   dispatch(incrementItem(item));
  //   setTimeout(() => {
  //     fetchUserDetails();
  //   }, 500);
  // };

  // const handleDecrement = (item) => {
  //   dispatch(decrementItem(item));
  //   setTimeout(() => {
  //     fetchUserDetails();
  //   }, 500);
  // };


  // const fetchUserDetails = async () => {
  //   try {
  //     const productData = await AsyncStorage.getItem("productDetails");
  //     const ProductsInCart = await AsyncStorage.getItem("selectedProduct");
  //     if (productData !== null) {
  //       const parseProductData = JSON.parse(productData);
  //       const parseProductInCart = JSON.parse(ProductsInCart);
  //       console.log(
  //         "ppppppppppppppppppppppppppp",
  //         parseProductData,
  //         "oooooooooooooooooooooooooooooo"
  //       );
  //       console.log(
  //         "ccccccccccccccccccccc",
  //         parseProductInCart,
  //         "ttttttttttttttttttttt"
  //       );
  //       setData(parseProductData);
  //       setViewCart(parseProductInCart);
  //       // setViewCart(Cart);
  //       dispatch({
  //         type: "CART",
  //         payload: parseProductInCart,
  //       });
  //     } else {
  //       console.log("else");
  //     }
  //   } catch (error) {
  //     console.error("Failed to load user details from AsyncStorage:", error);
  //   }
  // };
  // useEffect(()=>{
  // fetchUserDetails();

  // },[])

  
  const renderImage = ({ item }) => (
    <TouchableOpacity onPress={() => handleCategoryPress(item.categoryId)}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <Text style={styles.imageName}>{item.categoryName}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSellerItem = ({ item }) => {
    const selectedItem = selectedItems.find(
      (selectedItem) => selectedItem.id === item.id
    );
    const count = selectedItem ? selectedItem.count : 0;

    return (
      <View style={styles.sellerItemContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.sellerImage}
          resizeMode="cover"
        />
        <View style={styles.sellerDetails}>
          <Text style={[styles.sellerTitle, Theme.FONTS.body0]}>
            {item.productName}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <Text style={[styles.sellerDescription, Theme.FONTS.h8]}>
              {item.quantity}{" "}
            </Text>
            <Text style={[styles.sellerDescription, Theme.FONTS.h8]}>
              {item.mass} |
            </Text>
            <Text style={[styles.sellerDescription, Theme.FONTS.h8]}>
              {item.pieces} pieces
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{item.price}</Text>
            <Text style={styles.oldPrice}>220</Text>
            <Text style={styles.discount}>22%</Text>
          </View>
          <Text style={styles.deliveryTime}>today in 30mins</Text>
          <View style={styles.counterContainer}>
            {count > 0 ? (
              <>
                <TouchableOpacity
                  onPress={() => handleDecrement(item.id)}
                  style={styles.counterButton}
                >
                  <Text style={styles.counterText}>-</Text>
                </TouchableOpacity>
                <Text
                  style={[
                    styles.counterValue,
                    { color: Theme.COLORS.white, fontWeight: "bold" },
                  ]}
                >
                  {count}
                </Text>
                <TouchableOpacity
                  onPress={() => handleIncrement(item.id)}
                  style={styles.counterButton}
                >
                  <Text style={styles.counterText}>+</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleToggleItem(item)}
              >
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
      {/* Location container with LinearGradient */}
      <LinearGradient
        colors={["#ffcccc", "white", "white", "#ffcccc"]}
        style={styles.locationContainer}
      >
        <View style={styles.locationRow}>
          <Image source={Icons.location} style={styles.locationIcon} />
          <View>
            <Text style={styles.addressText}>Address</Text>
            <Text style={styles.locationText}>{address}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Scrollable content */}
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={["#ffcccc", "white", "white"]}
          style={styles.scrollContainer}
        >
          {/* Swiper container */}
          <View style={styles.swiperContainer}>
            <Swiper
              dot={<View style={styles.dot} />}
              activeDot={<View style={styles.activeDot} />}
              showsPagination={true}
              loop={true}
            >
              {/* Image 1 */}
              <View style={styles.slide}>
                <View style={styles.shadowContainer}>
                  <Image
                    source={Images.loginBackground}
                    style={styles.swiperImage}
                    resizeMode="cover"
                  />
                </View>
              </View>

              {/* Image 2 */}
              <View style={styles.slide}>
                <View style={styles.shadowContainer}>
                  <Image
                    source={Images.log}
                    style={styles.swiperImage}
                    resizeMode="cover"
                  />
                </View>
              </View>

              {/* Image 3 */}
              <View style={styles.slide}>
                <View style={styles.shadowContainer}>
                  <Image
                    source={Images.loginBackground1}
                    style={styles.swiperImage}
                    resizeMode="cover"
                  />
                </View>
              </View>

              {/* Image 4 */}
              <View style={styles.slide}>
                <View style={styles.shadowContainer}>
                  <Image
                    source={Images.loginBackground2}
                    style={styles.swiperImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </Swiper>
          </View>

          {/* Shop by category section */}
          <View style={styles.shopContainer}>
            <Text style={[styles.shopText, Theme.FONTS.h6]}>
              Shop by category
            </Text>
            <Text style={[styles.shopText, Theme.FONTS.h5]}>
              Choose from the widest range of premium meats
            </Text>
            <FlatList
              horizontal
              data={categoryData}
              renderItem={renderImage}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageRow}
            />
          </View>

          {/* BestSellers section */}
          <View style={styles.sellers}>
            <Text style={[styles.sellerText, Theme.FONTS.h6]}>BestSellers</Text>
            <Text style={[styles.sellerText, Theme.FONTS.h5]}>
              Fresh meats at extra special prices
            </Text>
            <FlatList
              horizontal
              data={bestSellers}
              renderItem={renderSellerItem}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sellerRow}
            />
          </View>
        </LinearGradient>
      </ScrollView>
      {productsCart?.length>0 &&(
 <BottomContainer

 onViewCart={() => navigation.navigate("ViewCart")}
/>
      )}
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  locationContainer: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 80,
    zIndex: 10,
    elevation: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Added for spacing between items // Added to create a line at the bottom of the location container
    borderBottomColor: "rgba(0,0,0,0.1)", // Added to specify the color of the bottom line
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  locationIcon: {
    width: 20,
    height: 20,
    tintColor: Theme.COLORS.maroon,
    marginRight: 10,
    marginLeft: 20,
  },
  addressText: {
    fontSize: 16,
  },
  locationText: {
    color: Theme.COLORS.black,
    fontWeight: "bold",
    fontSize: 18,
  },
  scrollView: {
    marginTop: 80,
  },
  scrollContainer: {
    padding: 12,
    paddingBottom: 70,
  },
  swiperContainer: {
    width: "100%",
    height: 230,
    marginTop: 20,
  },
  slide: {
    justifyContent: "center",
    alignItems: "center",
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
    borderRadius: 4, // Corrected to specify the borderRadius for dots
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
    marginTop: 20,
  },
  shopText: {
    marginBottom: 10,
    marginLeft: 20,
  },
  imageRow: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
  imageContainer: {
    alignItems: "center",
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  imageName: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "bold",
    color: Theme.COLORS.black,
  },
  sellers: {
    marginTop: 20,
  },
  sellerText: {
    marginBottom: 10,
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
    width: "100%",
    height: 130,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  sellerDetails: {
    padding: 10,
  },
  sellerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sellerDescription: {
    fontSize: 14,
    color: Theme.COLORS.gray,
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: Theme.COLORS.black,
    marginRight: 5,
  },
  oldPrice: {
    fontSize: 14,
    color: Theme.COLORS.gray,
    textDecorationLine: "line-through",
    marginRight: 15,
  },
  discount: {
    fontSize: 14,
    color: "green",
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
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: Theme.COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: Theme.COLORS.maroon,
    width: "50%",
    borderRadius: 5,
  },
  counterButton: {
    borderRadius: 5,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
  },
  counterText: {
    color: Theme.COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  counterValue: {
    fontSize: 16,
    marginHorizontal: 10,
    color: "white",
  },
});

export default Home;
