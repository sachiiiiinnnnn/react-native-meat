import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from 'styled-components/native';
import Swiper from 'react-native-swiper';
import { Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Theme from '../constants/Theme';
import { instance } from '../constants/Common';





const Login = ({ navigation }) => {
  const theme = useTheme();
  const [mobileNumber, setMobileNumber] = useState('');
  const [id,setId]=useState("");
  // const [exitResponse ,setExitResponse]=useState(false)

  //  const alreadyExists = {
  //   value:exitResponse,
  // };
  
  const handleContinue = async () => {
    if (mobileNumber.length === 10) {
      try {
        const response = await instance.post('/api/user/Login/Otp', {
          customerMobile: mobileNumber,
        });

        if (response.data ) {
          console.log("0000000000000000000000",response.data);
          Alert.alert('OTP Sent', 'Please check your mobile for the OTP');

          // setExitResponse(response.data.alreadyExist)

          navigation.replace('otp', { customerId: response.data.customerId,userExits:response.data.alreadyExist }); 
        } else {
          Alert.alert('Error', 'Failed to generate OTP');
        }
      } catch (error) {
        console.error('Failed to send OTP', error);
        Alert.alert('Error', 'Failed to send OTP');
      }
    } else {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
    }
  };

  const handleSkip = () => {
    navigation.replace('Home');
  };


  return (
    <View style={{ flex: 1 }}>
      <View style={styles.swiperContainer}>
        <Swiper
          showsButtons={false}
          loop={true}
          style={styles.swiper}
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
          autoplay={true} // Enable autoplay
          autoplayTimeout={4}
        >
          <View style={styles.slide}>
            <Image
              source={theme.Images.loginBackground}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          <View style={styles.slide}>
            <Image
              source={theme.Images.loginBackground1}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          <View style={styles.slide}>
            <Image
              source={theme.Images.loginBackground2}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          <View style={styles.slide}>
            <Image
              source={theme.Images.loginBackground3}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        </Swiper>
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, Theme.FONTS.h5]}>
          Sign Up/Log In
        </Text>
        <View style={styles.inputContainer}>
          <Text style={styles.countryCode}>+91</Text>
          <Input
            placeholder="Enter mobile number"
            keyboardType="numeric"
            maxLength={10}
            value={mobileNumber}
            onChangeText={setMobileNumber}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            containerStyle={{ flex: 1 }}
            inputStyle={{ fontWeight: 'bold', textAlign: 'center' }}
          />
        </View>
        <TouchableOpacity
          onPress={handleContinue}
          style={[
            styles.continueButton,
            mobileNumber.length === 10 && styles.continueButtonActive
          ]}
        >
          <Text
            style={[
              styles.continueButtonText,
              mobileNumber.length === 10 && styles.continueButtonTextActive
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleSkip}
        style={styles.skipButton}
      >
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>

      <View style={{ alignSelf: 'center', bottom: 30 }}>
        <Text style={{ color: '#7B797A', marginLeft: 10 }}>
          By Signing in, you agree to our
        </Text>
        <Text style={{ color: 'maroon' }}>
          Terms & Conditions | Privacy Policy
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  swiperContainer: {
    flex: 0.9, // 90% height
  },
  slide: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  dot: {
    backgroundColor: 'white',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  activeDot: {
    backgroundColor: 'red', // Change to white
    width: 10,
    height: 10,
    borderRadius: 4,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  contentContainer: {
    flex: 0.1, // 10% height
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
    marginBottom: 130,
  },
  title: {
    fontWeight: 700,
    bottom: 10,
    fontSize: 18
  },
  inputContainer: {
    flexDirection: 'row',
    borderColor: 'black',
    borderWidth: 0.8,
    borderRadius: 20,
    paddingHorizontal: 10,
    width: 300,
    height: 45,
    alignSelf: 'center',
    marginBottom: 10,
  },
  countryCode: {
    fontWeight: 'bold',
    marginRight: 5,
    marginTop: 10,
  },
  continueButton: {
    backgroundColor: Theme.COLORS.lightred, // Light maroon background for inactive state
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    width: 300,
    height: 45,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // For Android shadow
  },
  continueButtonActive: {
    backgroundColor: Theme.COLORS.maroon, // Full maroon color when active
  },
  continueButtonText: {
    color: Theme.COLORS.white, // Light maroon text color for inactive state
    fontWeight: 'bold',
    fontSize: 17,
  },
  continueButtonTextActive: {
    color: 'white', // White text color when active
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    borderColor: Theme.COLORS.maroon,
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 10,
    width: 80,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // For Android shadow
  },
  skipButtonText: {
    color: Theme.COLORS.maroon,
    fontSize: 15,
  },
});
// export { alreadyExists}
export default Login;
