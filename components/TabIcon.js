// components/TabIcon.js
import React from 'react';
import { View, Image, Text } from 'react-native';
import { FONTS } from '../constants/Theme'; // Import the FONTS object from theme.js

const TabIcon = ({ focused, icon, label }) => {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: 80,
        width: 50,
        marginBottom: 5,
      }}
    >
      <Image
        source={icon}
        resizeMode='contain'
        style={{
          width: 28,
          height: 28,
          tintColor: focused ? '#86062D' : 'black',
        }}
      />
    
      <Text style={{ color: focused ? '#86062D' : 'black', fontSize: 10, marginTop: 5 }}> {label}</Text>
    </View>
  );
};

export default TabIcon;
