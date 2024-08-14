// cartActions.js

export const INCREMENT_ITEM = "INCREMENT_ITEM";
export const DECREMENT_ITEM = "DECREMENT_ITEM";
export const CART= "CART";
export const PRODUCTS_BY_CATEGORY = "PRODUCTS_BY_CATEGORY";

export const incrementItem = (item) => ({
  type: INCREMENT_ITEM,
  payload: item,
});

export const decrementItem = (item) => ({
  type: DECREMENT_ITEM,
  payload: item,
});


export const cart = (productsCart) => ({
  type: CART,
  payload: {
    productsCart,
    // allProducts
  },
  
});

// export const ProductsByCategory = (items) => ({
//   type: PRODUCTS_BY_CATEGORY,
//   payload: items,
// });
