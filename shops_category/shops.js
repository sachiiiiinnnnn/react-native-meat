import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import Theme from "../constants/Theme";
import BottomContainer from "../shops_category/BottomContainer ";
import { instance } from "../constants/Common";
import { useDispatch, useSelector } from "react-redux";
import {
  incrementItem,
  decrementItem,
  ProductsByCategory,
} from "../redux/actions/counterActions";

const Shops = () => {
  const [selectedCategory, setSelectedCategory] = useState();
  const [data, setData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const [isBottomContainerVisible, setIsBottomContainerVisible] =
    useState(false);

  const [viewCart, setViewCart] = useState([]);
  // const [totalPrice, setTotalPrice] = useState("");

  const navigation = useNavigation();
  const route = useRoute();

  const ProductsInCart = useSelector((state) => state.cart.productsCart);
  // const totalPrice = useSelector((state) => state.cart.totalPrice);
  const Data = useSelector((state) => state.cart.data);
  const dispatch = useDispatch();
  const Cart = useSelector((state) => state.cart.productsCart);

  console.log("ProductsInCart 123456789", Cart);

  const handleIncrement = (item) => {
    dispatch(incrementItem(item));
    setTimeout(() => {
      fetchUserDetails();
    }, 500);
  };

  const handleDecrement = (item) => {
    dispatch(decrementItem(item));
    setTimeout(() => {
      fetchUserDetails();
    }, 500);
  };

  const updateCartState = (updatedData) => {
    const newCartItems = Object.values(updatedData)
      .flat()
      .filter((shopItem) => shopItem.count > 0);
    const newTotalPrice = newCartItems.reduce(
      (total, item) => total + item.count * parseInt(item.price),
      0
    );
    setIsBottomContainerVisible(newCartItems.length > 0);

    dispatch({
      type: "UPDATE_CART",
      payload: { selectedProduct: newCartItems, totalPrice: newCartItems },
    });
  };

  const getCategory = async () => {
    try {
      const response = await instance.get("/api/user/Category");
      if (response.status === 200) {
        setCategoryData(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getProduct = async () => {
    try {
      const response = await instance.get(`api/user/Product`);
      if (response.status === 200) {
        // console.log("response.data", response.data);

        await AsyncStorage.setItem(
          "productDetails",
          JSON.stringify(
            response.data?.map((product) => ({ ...product, count: 0 }))
          )
        );
        // setData(response.data?.map((product) => ({ ...product, count: 0 })));
        // dispatch(
        //   ProductsByCategory(
        //     response.data?.map((product) => ({ ...product, count: 0 }))
        //   )
        // );
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };


  // const getSearch = async () => {
  //   try {
  //     const response = await instance.get(`/api/user/Search?productName=${searchQuery}&categoryId=${selectedCategory}`);
  //     if (response.status === 200) {
  //       console.log('Search results:', response.data); 
  //       setData(response.data);
  //     } else {
  //       setData([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching search results:", error);
  //     setData([]);
  //   }
  // };


  // useEffect(() => {
  //   if (searchQuery === '') {
  //     // Show all categories when search is empty
  //     setData([]);
  //   } else {
  //     // Fetch search results based on searchQuery
  //     getSearch();
  //   }
  // }, [searchQuery]);


  const fetchUserDetails = async () => {
    
    try {
      const productData = await AsyncStorage.getItem("productDetails");
      const ProductsInCart = await AsyncStorage.getItem("selectedProduct");
      if (productData !== null) {
        const parseProductData = JSON.parse(productData);
        const parseProductInCart = JSON.parse(ProductsInCart);
        console.log(
          "ppppppppppppppppppppppppppp",
          parseProductData,
          "oooooooooooooooooooooooooooooo"
        );
        console.log(
          "ccccccccccccccccccccc",
          parseProductInCart,
          "ttttttttttttttttttttt"
        );
        setData(parseProductData);
        setViewCart(parseProductInCart);
        // setViewCart(Cart);
        dispatch({
          type: "CART",
          payload: parseProductInCart,
        });
      } else {
        console.log("else");
      }
    } catch (error) {
      console.error("Failed to load user details from AsyncStorage:", error);
    }
  };

  useEffect(() => {
    getCategory();
    getProduct();

    fetchUserDetails();

    const category = route.params?.category;
    if (category) {
      setSelectedCategory(category);
    }
    AsyncStorage.removeItem("selectedProduct");
  }, [route.params?.category]);

  // useEffect(() => {
  //   getProduct(selectedCategory);
  // }, [selectedCategory]);


  const handleViewCart = () => {
    navigation.navigate("ViewCart", {
      selectedItems: Cart,
      totalPrice: TotalPrice,
      totalItemCount: Cart?.length,
      selectedCategory: selectedCategory,
    });
  };

  // const price = viewCart?.map((i) =>
  //   i.count > 1 ? i.count * i.price : i.price
  // );
  // const TotalPrice = price.reduce((acc, val) => acc + val, 0);

  // Ensure viewCart is an array
  const price = (Cart || []).map((i) =>
    i.count > 1 ? i.count * i.price : i.price
  );

  // Ensure price is an array before reducing
  const TotalPrice =
    price.length > 0 ? price.reduce((acc, val) => acc + val, 0) : 0;

  console.log("Total Price:", TotalPrice);

  const renderShopItem = ({ item }) => (
    <View style={styles.touchContainer}>
      <View style={styles.shopContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <Text style={[styles.shopname, Theme.FONTS.bo]}>
          {item.productName}
        </Text>
        <Text style={[styles.shopLocation, Theme.FONTS.h9]}>
          {item.productDescription}
        </Text>
        <View style={styles.pricePiecesContainer}>
          <Text style={[styles.shopprice, Theme.FONTS.h9]}>
            {item.quantity}
          </Text>
          <Text style={[styles.shopprice, Theme.FONTS.h9]}>{item.mass} |</Text>
          <Text style={[styles.pieces, Theme.FONTS.h10]}>
            {item.pieces} Pieces
          </Text>
        </View>
        <View style={styles.offerContainer}>
          <Text style={[styles.money, Theme.FONTS.h9]}>₹{item.price}</Text>
          <Text style={[styles.offer, Theme.FONTS.h10]}>95%</Text>
        </View>
        <Text style={[styles.deliveryTime, Theme.FONTS.h10]}>
          {item.deliveryTime}
        </Text>
      </View>
      {item.count === 0 ? (
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleIncrement(item)}
        >
          <Text style={[styles.buttonText, Theme.FONTS.h8]}>Add +</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => handleDecrement(item)}
          >
            <Text style={[styles.counterButtonText, Theme.FONTS.h8]}>-</Text>
          </TouchableOpacity>
          <Text style={[styles.counterText, Theme.FONTS.h8]}>{item.count}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => handleIncrement(item)}
          >
            <Text style={[styles.counterButtonText, Theme.FONTS.h8]}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const filteredProduct = data.length > 0 
  ? data.filter((e) => e.categoryId === selectedCategory)
  : [];
  

  return (
    <View style={styles.container}>
      {/* ************************ SEARCH ************************* */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="What's your favourite"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchIconContainer}>
          <Image
            source={require("../assets/icons/search.png")}
            style={styles.searchIcon}
          />
        </TouchableOpacity>
      </View>
      {/* ************************ CATEGORY ************************* */}
      <View style={styles.redContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categoryData.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.redContainerItem,
                selectedCategory === category.CategoryId &&
                  styles.selectedRedContainer,
              ]}
              onPress={() => setSelectedCategory(category.categoryId)}
            >
              <Image
                source={{ uri: category.image }}
                style={styles.redContainerImage}
                resizeMode="cover"
              />
              <Text
                style={[
                  styles.redContainerText,
                  Theme.FONTS.h8,
                  selectedCategory === category.categoryId && styles.boldText,
                ]}
              >
                {category.categoryName}
              </Text>
              {selectedCategory === category.categoryId && (
                <View style={styles.hoverLine} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ************************ PRODUCT ************************* */}

      <FlatList
        data={filteredProduct}
        keyExtractor={(item) => item.productId}
        renderItem={renderShopItem}
        contentContainerStyle={styles.list}
      />

      {Cart?.length > 0 ? (
        <BottomContainer
          // totalItemCount={Cart?.length}
          // totalPrice={TotalPrice} 
          onViewCart={handleViewCart}
        />
      ) : null}
    </View>
  );
};

export default Shops;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "white",
    paddingBottom: 60,
  },
  searchContainer: {
    flexDirection: "row",
    marginLeft: 20,
    marginBottom: 0,
  },
  searchIconContainer: {
    padding: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: "black",
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  redContainer: {
    height: 130,
    backgroundColor: "white",
    marginBottom: 10,
    marginTop: 0,
  },
  redContainerItem: {
    alignSelf: "center",
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
    alignSelf: "center",
  },
  hoverLine: {
    width: "100%",
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
    width: "95%",
    alignSelf: "center",
    borderRadius: 10,
    elevation: 3,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
  image: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden",
  },

  shopname: {
    fontWeight: "bold",
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
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "bold",
  },
  button: {
    position: "absolute",
    bottom: 20,
    right: 30,
    backgroundColor: Theme.COLORS.maroon,
    borderRadius: 5,
    width: 50,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  buttonText: {
    color: Theme.COLORS.white,
    fontWeight: "bold",
    fontSize: 13,
  },
  boldText: {
    fontWeight: "bold",
  },
  money: {
    fontWeight: "bold",
    backgroundColor: "#ffcccc",
    color: Theme.COLORS.black,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    elevation: 5,
    alignSelf: "flex-start",
    marginTop: 5,
    marginLeft: 15,
    textAlign: "center",
    textAlignVertical: "center",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
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
    alignItems: "center",
    justifyContent: "center",
  },
  counterButtonText: {
    color: Theme.COLORS.white,
    fontWeight: "bold",
    fontSize: 20,
  },
  counterText: {
    marginHorizontal: 10,
    fontWeight: "bold",
    fontSize: 16,
    color: Theme.COLORS.white,
  },
  offerContainer: {
    flexDirection: "row",
  },
  offer: {
    fontWeight: "bold",
    color: "green",
    marginTop: 10,
    marginLeft: 20,
  },
});
