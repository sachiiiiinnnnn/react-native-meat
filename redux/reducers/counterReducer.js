import { INCREMENT_ITEM, DECREMENT_ITEM, UPDATE_CART } from '../actions/counterActions';

const initialState = {
  cartItems: [],
  totalPrice: 0,
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case INCREMENT_ITEM: {

      
      const existingProductIndex = state.cartItems.findIndex(item => item.productId === action.payload.productId);
      let updatedCartItems;

      if (existingProductIndex >= 0) {
        updatedCartItems = state.cartItems.map((item, index) =>
          index === existingProductIndex
            ? { ...item, count: item.count + 1 }
            : item
        );
      } else {
        updatedCartItems = [...state.cartItems, { ...action.payload, count: 1 }];
      }

      return {
        ...state,
        cartItems: updatedCartItems,
        totalPrice: updatedCartItems.reduce((total, item) => total + item.count * parseInt(item.price), 0),
      };
    }

    case DECREMENT_ITEM: {
      const existingProductIndex = state.cartItems.findIndex(item => item.productId === action.payload.productId);
      let updatedCartItems;

      if (existingProductIndex >= 0) {
        updatedCartItems = state.cartItems.map((item, index) =>
          index === existingProductIndex && item.count > 0
            ? { ...item, count: item.count - 1 }
            : item
        ).filter(item => item.count > 0);
      }

      return {
        ...state,
        cartItems: updatedCartItems,
        totalPrice: updatedCartItems.reduce((total, item) => total + item.count * parseInt(item.price), 0),
      };
    }

    case UPDATE_CART: {
      return {
        ...state,
        cartItems: action.payload.cartItems,
        totalPrice: action.payload.totalPrice,
      };
    }

    default:
      return state;
  }
};

export default cartReducer;
