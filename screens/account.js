import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  Modal,
  TextInput,
  Button,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Theme from "../constants/Theme";
import Icons from "../constants/Icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { instance } from "../constants/Common";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

const mealZoneData = [
  { id: "1", name: "Rewards", icon: Icons.recipe },
  { id: "2", name: "Orders", icon: Icons.blogs },
  { id: "3", name: "Notifications", icon: Icons.faq },
  { id: "4", name: "Contact Us", icon: Icons.privacy },
  { id: "5", name: "Cancellation & Reschedule Policy", icon: Icons.cancellation },
];

const Account = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [originalUserData, setOriginalUserData] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await AsyncStorage.getItem("userDetails");
        if (userData !== null) {
          const parsedUserData = JSON.parse(userData);
          setUsername(parsedUserData.customerName);
          setEmail(parsedUserData.customerEmail);
          setNumber(parsedUserData.customerMobile);
          setCustomerId(parsedUserData.customerId);
          setOriginalUserData(parsedUserData);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Failed to load user details from AsyncStorage:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleEditPress = () => {
    setModalVisible(true);
  };

  const handleSave = async () => {
    setModalVisible(false);

    const userData = {
      customerId,
      customerName: username,
      customerEmail: email,
    };

    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    
    try {
      const response = await instance.put("/api/user/Login/Edit", userData);
      if (response.status === 200) {
        await AsyncStorage.setItem(
          "userDetails",
          JSON.stringify(response.data.result[0])
        );
        Alert.alert("Success", "Profile updated successfully");
        setOriginalUserData(userData);
        setModalVisible(false);
      } else if (response.status === 400) {
        Alert.alert(
          "Invalid Input",
          "Please check the entered details and try again."
        );
      } else {
        Alert.alert("Failed to update profile", "Please try again later.");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        Alert.alert(
          "Invalid Input",
          "Please check the entered details and try again."
        );
      } else {
        Alert.alert("Error", "Failed to update profile. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    setUsername(originalUserData.customerName);
    setEmail(originalUserData.customerEmail);
    setModalVisible(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userDetails");
      setIsLoggedIn(false);
      navigation.navigate("Login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleCropImage = async () => {
    if (selectedImage) {
      try {
        const { uri } = await ImageManipulator.manipulateAsync(
          selectedImage,
          [{ resize: { width: 800 } }],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        setSelectedImage(uri);
      } catch (error) {
        console.error("Failed to crop image:", error);
      }
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


  const renderMealZoneItem = ({ item }) => (
    <TouchableOpacity
      style={styles.mealsZoneContainer}
      onPress={() => {
        if (item.name === "Rewards") {
          navigation.navigate("Rewards");
        }
        if (item.name === "Orders") {
          navigation.navigate("Orders");
        }
        if (item.name === "Notifications") {
          navigation.navigate("Notifi");
        }
        if (item.name === "Contact Us") {
          navigation.navigate("Cont");
        }
        if (item.name === "Cancellation & Reschedule Policy") {
          navigation.navigate("Cancellation");
        }
      }}
    >
      <Image source={item.icon} style={styles.icon} />
      <Text style={styles.mealsZoneText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["white", "white", "white", "#ffcccc"]}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <View style={{ padding: 20, marginTop: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Hey Meatlover</Text>
          <Text style={{ fontSize: 12, marginTop: 10, color: Theme.COLORS.gray }}>
            Welcome to our app. Manage your orders, reward, address & other details.
          </Text>
          <View style={styles.infoContainer}>
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={handleImagePick}
            >
              <Image
                source={
                  selectedImage
                    ? { uri: selectedImage }
                    : {
                        uri: "data:image/png;base64,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",
                      }
                }
                style={styles.image}
              />
            </TouchableOpacity>
            {isLoggedIn ? (
              <>
                <View style={styles.textContainer}>
                  <View style={styles.row}>
                    <Text style={styles.name}>{username}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.email}>{email}</Text>
                  </View>
                  <Text style={styles.mobileNumber}>+91 {number}</Text>
                </View>
                <TouchableOpacity onPress={handleEditPress}>
                  <Image source={Icons.edit} style={styles.editIcon} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
              style={{
                borderWidth:1,
                borderColor:'maroon',
                width: "40%",
                height: 45,
                alignSelf: "center",
                alignItems: "center",
                marginBottom: 20,
                justifyContent: "center",
                borderRadius: 10,
                marginTop: 20,
                marginLeft: 60,
              }}
              onPress={() => navigation.navigate("Login")}
            >
              <Text
                style={{ color: "maroon", fontWeight: "bold", fontSize: 15 }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ padding: 20, flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Meals Zone</Text>
          <FlatList
            data={mealZoneData}
            renderItem={renderMealZoneItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      </View>
      {isLoggedIn && (
          <TouchableOpacity
          style={{
            backgroundColor: "maroon",
            width: "60%",
            height: 50,
            alignSelf: "center",
            alignItems: "center",
            marginBottom: 20,
            justifyContent: "center",
            borderRadius: 10,
          }}
          onPress={handleLogout}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 20 }}>
            Logout
          </Text>
        </TouchableOpacity>
      )}
    
            {selectedImage && (
              <View style={styles.selectedImageContainer}>
                {/* <Text style={styles.selectedImageText}>Selected Image:</Text> */}
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.selectedImage}
                />
                <TouchableOpacity onPress={handleCropImage}>
                  {/* <Text style={styles.cropButton}>Crop Image</Text> */}
                </TouchableOpacity>
              </View>
            )}
       
      <Modal visible={modalVisible} animationType="slide" transparent={true} >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Name"
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
            />
            <View style={styles.modalButtons}>
              <Button title="Save" onPress={handleSave}      disabled={!validateEmail(email)}/>
              <Button title="Cancel" onPress={handleCancel} />
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default Account;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingTop: 20, // Adjust as needed
  },
  container: {
    flex: 1,
    backgroundColor: "transparent", // Ensure background is transparent to show gradient
  },
  mealsZoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
    elevation: 5,
    height: 50,
  },
  icon: {
    width: 20,
    height: 20,
    marginLeft: 20,
  },
  editIcon: {
    width: 20,
    height: 20,
    marginLeft: 20,
    marginTop: 40,
  },
  mealsZoneText: {
    fontSize: 14,
    marginLeft: 10,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  textContainer: {
    marginLeft: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  name: {
    fontSize: 18,
    color: "black",
    fontWeight: "bold",
  },
  email: {
    fontSize: 13,
    color: "gray",
    marginTop: 0,
    fontWeight: "bold",
  },
  mobileNumber: {
    fontSize: 13,
    color: "#333",
    marginTop: 0,
  },
  imageContainer: {
    padding: 3,
    borderWidth: 2,
    borderColor: "maroon",
    borderRadius: 50,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxWidth: 400,
  marginTop:'50%',
    alignSelf:'center',
    
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});





























































// import {
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Image,
//   FlatList,
//   Modal,
//   TextInput,
//   Button,
//   Alert,
// } from "react-native";
// import React, { useEffect } from "react";
// import { useNavigation } from "@react-navigation/native"; // Import useNavigation hook
// import { LinearGradient } from "expo-linear-gradient";
// import Theme from "../constants/Theme";
// import Icons from "../constants/Icons"; // Adjust the path if needed
// import { useState } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { instance } from "../constants/Common";

// const mealZoneData = [
//   { id: "1", name: "Rewards", icon: Icons.recipe },
//   { id: "2", name: "Orders", icon: Icons.blogs },
//   { id: "3", name: "Notifications", icon: Icons.faq },
//   { id: "4", name: "Contact Us", icon: Icons.privacy },
//   {
//     id: "5",
//     name: "Cancellation & Reschedule Policy",
//     icon: Icons.cancellation,
//   },
// ];

// const Account = () => {
//   const navigation = useNavigation();
//   const [modalVisible, setModalVisible] = useState(false);
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [number, setNumber] = useState("");
//   const [customerId, setCustomerId] = useState("");
//   const [originalUserData, setOriginalUserData] = useState({});
//   const [emptyUser, setEmptyUser] = useState();

//   const handleEditPress = () => {
//     setModalVisible(true);
//   };

//   const handleSave = async () => {
//     setModalVisible(false);

//     const userData = {
//       customerId,
//       customerName: username,
//       customerEmail: email,
//     };
//     console.log("3333333333333333", userData);
//     try {
//       const response = await instance.put("/api/user/Login/Edit", userData);
//       if (response.status === 200) {
//         console.log("5555555555555555", response.data.result[0]);
//         await AsyncStorage.setItem(
//           "userDetails",
//           JSON.stringify(response.data.result[0])
//         );
//         Alert.alert("Success", "Profile updated successfully");
//         setOriginalUserData(userData); // Update original data with the new data
//         setModalVisible(false);
//       } else if (response.status === 400) {
//         Alert.alert(
//           "Invalid Input",
//           "Please check the entered details and try again."
//         );
//       } else {
//         Alert.alert("Failed to update profile", "Please try again later.");
//       }
//     } catch (error) {
//       if (error.response && error.response.status === 400) {
//         Alert.alert(
//           "Invalid Input",
//           "Please check the entered details and try again."
//         );
//       } else {
//         console.error("Failed to update profile:", error);
//         Alert.alert("Error", "Failed to update profile. Please try again.");
//       }
//     }
//   };

//   const handleCancel = () => {
//     setUsername(originalUserData.username);
//     setEmail(originalUserData.email);
//     setModalVisible(false);
//   };

//   const handleLogout = async () => {
//     try {
//       await AsyncStorage.removeItem("userDetails");
//       setIsLoggedIn(false); // Update login state
//       navigation.navigate("Login");
//     } catch (error) {
//       console.error("Failed to log out:", error);
//     }
//   };

//   const renderMealZoneItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.mealsZoneContainer}
//       onPress={() => {
//         if (item.name === "Rewards") {
//           navigation.navigate("Rewards");
//         }
//         if (item.name === "Orders") {
//           navigation.navigate("Orders");
//         }
//         if (item.name === "Notifications") {
//           navigation.navigate("Notifi");
//         }
//         if (item.name === "Contact Us") {
//           navigation.navigate("Cont");
//         }
//         if (item.name === "Cancellation & Reschedule Policy") {
//           navigation.navigate("Cancellation");
//         }
//       }}
//     >
//       <Image source={item.icon} style={styles.icon} />
//       <Text style={styles.mealsZoneText}>{item.name}</Text>
//     </TouchableOpacity>
//   );

//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       try {
//         const userData = await AsyncStorage.getItem("userDetails");
//         console.log("1111111111111111111", userData);
//         if (userData !== null) {
//           const parsedUserData = JSON.parse(userData);
//           console.log("0000000000000000000", parsedUserData);
//           setUsername(parsedUserData.customerName);
//           setEmail(parsedUserData.customerEmail);
//           setNumber(parsedUserData.customerMobile);
//           setCustomerId(parsedUserData.customerId);
//         } else {
//           setEmptyUser(userData);
//         }
//       } catch (error) {
//         console.error("Failed to load user details from AsyncStorage:", error);
//       }
//     };

//     fetchUserDetails();
//   }, []);

//   return (
//     <LinearGradient
//       colors={["white", "white", "white", "#ffcccc"]}
//       style={styles.gradient}
//     >
//       <View style={styles.container}>
//         <View style={{ padding: 20, marginTop: 20 }}>
//           <Text style={{ fontSize: 20, fontWeight: "bold" }}>
//             Hey Meatlover
//           </Text>
//           <Text
//             style={{ fontSize: 12, marginTop: 10, color: Theme.COLORS.gray }}
//           >
//             Welcome to our app. Manage your orders, reward, address & other
//             details.
//           </Text>
//           {/* <TouchableOpacity
//             style={{
//               backgroundColor: Theme.COLORS.maroon,
//               height: 35,
//               width: 300,
//               alignSelf: 'center',
//               alignItems: 'center',
//               justifyContent: 'center',
//               marginTop: 20,
//               borderRadius: 5,
//             }}
//             onPress={() => navigation.navigate(Sign)} // Navigate to Signup screen
//           >
//             <Text style={{ color: Theme.COLORS.white, fontSize: 15, fontWeight: 'bold' }}>Login / Sign Up</Text>
//           </TouchableOpacity> */}
//           <View style={styles.infoContainer}>
//             <TouchableOpacity style={styles.imageContainer}>
//               <Image
//                 source={{
//                   uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4gtXQxB0e0r2HAgC4Nf7R716wZ-c8yZGIgQ&s",
//                 }}
//                 style={styles.image}
//               />
//             </TouchableOpacity>
//             {emptyUser === null ? (
//               <TouchableOpacity
//                 style={{
//                   backgroundColor: "maroon",
//                   width: "40%",
//                   height: 30,
//                   alignSelf: "center",
//                   alignItems: "center",
//                   marginBottom: 20,
//                   justifyContent: "center",
//                   borderRadius: 10,
//                 }}
//                 onPress={() => {
//                   AsyncStorage.setItem("userDetails", "");
//                   navigation.navigate("Login");
//                 }}
//               >
//                 <Text
//                   style={{ color: "white", fontWeight: "bold", fontSize: 15 }}
//                 >
//                   SIGN UP
//                 </Text>
//               </TouchableOpacity>
//             ) : (
//               <>
//                 <View style={styles.textContainer}>
//                   <View style={styles.row}>
//                     <Text style={styles.name}>{username}</Text>
//                   </View>
//                   <View style={styles.row}>
//                     <Text style={styles.email}>{email}</Text>
//                   </View>
//                   <Text style={styles.mobileNumber}>+91 {number}</Text>
//                 </View>
//                 <TouchableOpacity onPress={handleEditPress}>
//                   <Image source={Icons.edit} style={styles.editIcon} />
//                 </TouchableOpacity>
//               </>
//             )}
//           </View>
//         </View>
//         <View style={{ padding: 20, flex: 1 }}>
//           <Text style={{ fontSize: 18, fontWeight: "bold" }}>Meals Zone</Text>
//           <FlatList
//             data={mealZoneData}
//             renderItem={renderMealZoneItem}
//             keyExtractor={(item) => item.id}
//           />
//         </View>
//       </View>
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => {
//           setModalVisible(!modalVisible);
//         }}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Edit Profile</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Username"
//               value={username}
//               onChangeText={setUsername}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Email"
//               value={email}
//               onChangeText={setEmail}
//               keyboardType="email-address"
//             />
//             <View style={styles.modalButtons}>
//               <Button title="Cancel" onPress={handleCancel} />
//               <Button title="Save" onPress={handleSave} />
//             </View>
//           </View>
//         </View>
//       </Modal>
//       <TouchableOpacity
//         style={{
//           backgroundColor: "maroon",
//           width: "60%",
//           height: 50,
//           alignSelf: "center",
//           alignItems: "center",
//           marginBottom: 20,
//           justifyContent: "center",
//           borderRadius: 10,
//         }}
//         onPress={() => {
//           AsyncStorage.setItem("userDetails", "");
//           navigation.navigate("Login");
//         }}
//       >
//         <Text style={{ color: "white", fontWeight: "bold", fontSize: 15 }}>
//           Log out
//         </Text>
//       </TouchableOpacity>
//     </LinearGradient>
//   );
// };













