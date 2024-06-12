// App.js
import React, { useState, useEffect } from 'react';
import { SplashScreen } from 'expo'; //console warn
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from 'styled-components/native';
import appTheme from './constants/Theme';
import loadFonts from './constants/Fonts';
import Login from './screens/Login';
import BottomTab from './navigation/BottomTab';
import Shops from './shops_category/shops';
import BottomContainer from './shops_category/BottomContainer ';
import ViewCart from './Viewcard/ViewCart';

import Sign from './accounts/Sign';
import User from './accounts/User';
import ParentComponent from './Viewcard/ParentComponent ';
// import  shopDetails  from './shops_category/shopDetails';


const Stack = createNativeStackNavigator();

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
      setFontsLoaded(true);
    };

    loadAsyncFonts();
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        if (SplashScreen && SplashScreen.preventAutoHideAsync) {
          await SplashScreen.preventAutoHideAsync();
        }
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider theme={appTheme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Shops" component={Shops} />
          {/* <Stack.Screen name="ShopDetails" component={shopDetails} /> */}
          <Stack.Screen name="Home" component={BottomTab} />
          <Stack.Screen name="BottomCart" component={BottomContainer} />
          <Stack.Screen name="ViewCart" component={ViewCart} />
          {/* <Stack.Screen name="ParentComponent" component={ParentComponent} /> */}
          <Stack.Screen name="Sign" component={Sign} />
          <Stack.Screen name="User" component={User} />
          
        </Stack.Navigator>
   
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
