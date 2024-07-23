
import { combineReducers } from 'redux';
import cartReducer from '../reducers/counterReducer';

const rootReducer = combineReducers({
  cart: cartReducer,
});

export default rootReducer;