// App.js
import React, { useState, useEffect } from 'react';
import { SplashScreen } from 'expo'; //console warn
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from 'styled-components/native';
import appTheme from '../constants/Theme';
import loadFonts from '../constants/Fonts';
import Login from '../screens/Login';
import BottomTab from '../navigation/BottomTab';
import Shops from '../shops_category/shops';
import BottomContainer from '../shops_category/BottomContainer ';
import ViewCart from '../Viewcard/ViewCart';
import Sign from '../accounts/Sign';
import User from '../accounts/User';
import Payment from '../Viewcard/Payment';
import Address from '../Viewcard/Address';
import Segment1 from '../Viewcard/Segment1';
import Segment2 from '../Viewcard/Segment2';
import otp from '../screens/otp';
import userName from '../screens/userName';
import Rewards from '../terms&conditions/Rewards';
import Orders from '../terms&conditions/Orders';
import Notifi from '../terms&conditions/Notifi';
import Cont from '../terms&conditions/Cont';
import Cancellation from '../terms&conditions/Cancellation';



// import  shopDetails  from './shops_category/shopDetails';


const Stack = createNativeStackNavigator();

const SideNavigation = () => {
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
          <Stack.Screen name="otp" component={otp} />

          <Stack.Screen name="Shops" component={Shops} />
          {/* <Stack.Screen name="ShopDetails" component={shopDetails} /> */}
          <Stack.Screen name="Home" component={BottomTab} />
          <Stack.Screen name="BottomCart" component={BottomContainer} />
          <Stack.Screen name="ViewCart" component={ViewCart} options={{ headerShown: true, title: 'Cart' }} />
          {/* <Stack.Screen name="CartProvider" component={CartProvider} /> */}
          <Stack.Screen name="Sign" component={Sign} />
          <Stack.Screen name="User" component={User} />
          <Stack.Screen name="Payment" component={Payment} options={{ headerShown: true, title: 'Payment' }}/>
          <Stack.Screen name="Address" component={Address}  options={{ headerShown: true, title: 'Address' }}/>
          <Stack.Screen name="Segment1" component={Segment1}/>
          {/* <Stack.Screen name="Segment2" component={Segment2} /> */}
          <Stack.Screen name="userName" component={userName} options={{ headerShown: true, title: 'UserName' }}/>
          <Stack.Screen name="Rewards" component={Rewards} options={{ headerShown: true, title: 'Rewards' }}/>
          <Stack.Screen name="Orders" component={Orders} options={{ headerShown: true, title: 'Orders' }}/>
          <Stack.Screen name="Notifi" component={Notifi} options={{ headerShown: true, title: 'Notification' }}/>
          <Stack.Screen name="Cont" component={Cont} options={{ headerShown: true, title: 'Contact Us' }}/>
          <Stack.Screen name="Cancellation" component={Cancellation} options={{ headerShown: true, title: 'Cancellation' }}/>





        </Stack.Navigator>
   
      </NavigationContainer>

    </ThemeProvider>
  );
};

export default SideNavigation;
