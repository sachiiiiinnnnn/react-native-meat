// navigation/BottomTab.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import CategoriesScreen from "../screens/categories";
import SearchScreen from "../screens/search";
import AccountScreen from "../screens/account";
import TabIcon from "../components/TabIcon";
import Icons from "../constants/Icons";
import HomeScreen from "../screens/home";

const Tab = createBottomTabNavigator();

const BottomTab = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: {
          display: "none" // Hide the original tab label
        },
        tabBarStyle: {
          alignSelf:'center',
          bottom: 3,
          // borderColor:'brown',
          // borderWidth:1,
          width:360,
          borderRadius:10,
          elevation: 1,
          backgroundColor: "white",
          borderTopColor: "transparent",
          height: 70, // Increased height
        },
      }}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Icons.home} label="Home" />
          ),
          headerShown: false // Hide the screen name in the upper position
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Icons.shopping} label="Stores" />
          ),
          headerShown: false
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Icons.search} label="Search" />
          ),
          headerShown: false
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Icons.user} label="Account" />
          ),
          headerShown: false
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTab;
