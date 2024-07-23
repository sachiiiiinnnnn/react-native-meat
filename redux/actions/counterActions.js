// cartActions.js

export const INCREMENT_ITEM = 'INCREMENT_ITEM';
export const DECREMENT_ITEM = 'DECREMENT_ITEM';
export const INITIALIZE_ITEM_COUNT = 'INITIALIZE_ITEM_COUNT';

export const incrementItem = (item) => ({
  type: INCREMENT_ITEM,
  payload: item,
});

export const decrementItem = (item) => ({
  type: DECREMENT_ITEM,
  payload: item,
});

export const initializeItemCount = (items) => ({
  type: INITIALIZE_ITEM_COUNT,
  payload: items,
});
