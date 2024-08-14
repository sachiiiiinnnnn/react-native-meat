import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  INCREMENT_ITEM,
  DECREMENT_ITEM,
  UPDATE_CART,
  CART,
  // PRODUCTS_BY_CATEGORY,
} from "../actions/counterActions";

const initialState = {
  data: [],
  productsCart: [],
  
  totalPrice: 0,
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case INCREMENT_ITEM: {
      const { productId, ...productDetails } = action.payload;

      const Plus = async () => {
        const productData = await AsyncStorage.getItem("productDetails");
        console.log(productData);
        const Data = JSON.parse(productData);
        const newData = Data?.map((item) =>
          item.productId === productId
            ? { ...item, count: item.count + 1 }
            : item
        );
        await AsyncStorage.setItem("productDetails", JSON.stringify(newData));

        const ProductsInCart = await AsyncStorage.getItem("selectedProduct");
        const parsedProductsInCart = JSON.parse(ProductsInCart) || [];

        const productExists = parsedProductsInCart.find(
          (item) => item.productId === productId
        );
        if (!productExists) {
          const NewSelected = [
            ...parsedProductsInCart,
            {
              ...productDetails,
              productId: productId,
              count: productDetails.count + 1,
            },
          ];
          await AsyncStorage.setItem(
            "selectedProduct",
            JSON.stringify(NewSelected)
          );
          console.log("Updated selectedProduct:", NewSelected);
        } else if (productExists) {
          const NewSelected = parsedProductsInCart.map((item) =>
            item.productId === productId
              ? { ...item, count: productDetails.count + 1 }
              : item
          );
          await AsyncStorage.setItem(
            "selectedProduct",
            JSON.stringify(NewSelected)
          );
        }

        console.log("Updated productDetails:", newData);
        console.log("Updated selectedProduct:", NewSelected);
      };

      Plus();
      return true;
    }

    case DECREMENT_ITEM: {
      const { productId, ...productDetails } = action.payload;

      const Minus = async () => {
        const productData = await AsyncStorage.getItem("productDetails");
        console.log(productData);
        const Data = JSON.parse(productData);
        const newData = Data?.map((item) =>
          item.productId === productId
            ? { ...item, count: item.count - 1 }
            : item
        );
        await AsyncStorage.setItem("productDetails", JSON.stringify(newData));

        const ProductsInCart = await AsyncStorage.getItem("selectedProduct");
        const parsedProductsInCart = JSON.parse(ProductsInCart) || [];

        // Check if product exists in cart
        const productExists = parsedProductsInCart.find(
          (item) => item.productId === productId
        );

        if (productExists) {
          if (productExists.count === 1) {
            // Remove product if count is 1
            const NewSelected = parsedProductsInCart.filter(
              (item) => item.productId !== productId
            );
            await AsyncStorage.setItem(
              "selectedProduct",
              JSON.stringify(NewSelected)
            );
          } else if (productExists.count > 1) {
            // Decrease count in selectedProduct
            const NewSelected = parsedProductsInCart.map((item) =>
              item.productId === productId
                ? { ...item, count: item.count - 1 }
                : item
            );
            await AsyncStorage.setItem(
              "selectedProduct",
              JSON.stringify(NewSelected)
            );
          }
        }

        // const ProductsInCart = await AsyncStorage.getItem("selectedProduct");
        // const parsedProductsInCart = JSON.parse(ProductsInCart) || [];

        // const productExists = parsedProductsInCart.find(
        //   (item) => item.productId === productId
        // );

        // if (productExists.count === 1) {
        //   const NewSelected = parsedProductsInCart.filter(
        //     (item) => item.productId !== productId
        //   );
        //   await AsyncStorage.setItem(
        //     "selectedProduct",
        //     JSON.stringify(NewSelected)
        //   );
        // } else if (productExists.count > 1) {
        //   const NewSelected = parsedProductsInCart.map((item) =>
        //     item.productId === productId
        //       ? { ...item, count: productDetails.count - 1 }
        //       : item
        //   );
        //   await AsyncStorage.setItem(
        //     "selectedProduct",
        //     JSON.stringify(NewSelected)
        //   );
        // }

        console.log("1234567890", newData);
      };

      Minus();
      return true;
    }

    case CART: {
      const productsCart = action.payload;
      return {
        ...state,
        productsCart:productsCart
      };
    }

    case UPDATE_CART: {
      return {
        ...state,
        selectedProduct: action.payload.selectedProduct,
        totalPrice: action.payload.totalPrice,
      };
    }

    default:
      return state;
  }
};

export default cartReducer;
