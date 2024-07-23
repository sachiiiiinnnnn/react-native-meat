import React from 'react';
import { Provider } from 'react-redux';
import Store from './redux/Store'; // Ensure correct path to your Redux store

import SideNavigation from './navigation/SideNavigation';
import { useFonts } from 'expo-font';

const App = () => {
  return (
    <Provider store={Store}>
     
      <SideNavigation />
    </Provider>
  );
};

export default App;
