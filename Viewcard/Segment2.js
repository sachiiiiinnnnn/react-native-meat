// import React, { useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
// import Theme from '../constants/Theme';
// import icons from '../constants/Icons';
// import Segment1 from './Segment1';
// import { useNavigation } from '@react-navigation/native';

// const Segment2 = ({ route }) => {
//   const { selectedItems } = route.params || {};
//   const navigation = useNavigation();

//   const [expanded, setExpanded] = useState(false);
//   const [selectedContainerIndex, setSelectedContainerIndex] = useState(-1);

//   const initialItemCount = 4;
//   const displayedItems = expanded ? selectedItems : selectedItems.slice(0, initialItemCount);

//   const handleSeeMore = () => {
//     setExpanded(true);
//   };

//   const handlePress = (index) => {
//     if (selectedContainerIndex === index) {
//       setSelectedContainerIndex(-1);
//     } else {
//       setSelectedContainerIndex(index);
//     }
//   };

//   const containerTexts = [
//     '6AM to 8PM',
//     '6AM to 8PM',
//     '8AM to 9PM',
//     '8AM to 9PM',
//     '8AM to 9PM',
//     '8AM to 9PM',
//     '8AM to 9PM',
//     '8AM to 9PM',
//     '8AM to 9PM',
//   ];


//   const handleCheckout = () => {
//     navigation.navigate('Payment', {
//       cartItems: selectedItems,

//     });
//   };



//   const renderContainers = () => {
//     return containerTexts.map((text, index) => (
//       <TouchableOpacity
//         key={index}
//         onPress={() => handlePress(index)}
//         style={[
//           styles.deliveryTimeContainer,
//           {
//             backgroundColor: selectedContainerIndex === index ? 'lightgreen' : 'white',
//             borderColor: selectedContainerIndex === index ? 'green' : 'gray',
//           },
//         ]}
//       >
//         <Text style={styles.deliveryTimeText}>{text}</Text>
//       </TouchableOpacity>
//     ));
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.headerText}>ITEMS IN SHIPMENT</Text>
//       <ScrollView contentContainerStyle={styles.contentContainer}>
//         {displayedItems.map((item) => (
//           <View key={item.productId} style={styles.itemContainer}>
//             <Text style={styles.itemCount}>{item.count}</Text>
//             <Text style={styles.itemName}>- {item.productName}</Text>
//           </View>
//         ))}
//         {!expanded && selectedItems.length > initialItemCount && (
//           <TouchableOpacity onPress={handleSeeMore}>
//             <Text style={styles.seeMoreText}>See More</Text>
//           </TouchableOpacity>
//         )}
//         <Text style={styles.dateText}>TODAY 12, MON</Text>
//         <View style={styles.gridContainer}>
//           {renderContainers()}
//         </View>
//         <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
//           <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//     marginTop: 10,
//     backgroundColor: 'white',
//   },
//   headerText: {
//     fontSize: 15,
//     fontWeight: 'bold',
//   },
//   contentContainer: {
//     paddingBottom: 100,
//   },
//   itemContainer: {
//     flexDirection: 'row',
//     marginBottom: 10,
//   },
//   itemName: {
//     fontSize: 12,
//     marginTop: 3,
//     marginLeft: 10,
//     color: 'gray',
//   },
//   itemCount: {
//     fontSize: 12,
//     marginTop: 3,
//     color: 'gray',
//     fontWeight: 'bold',
//   },
//   seeMoreText: {
//     fontSize: 12,
//     color: Theme.COLORS.maroon,
//     marginTop: 15,
//     fontWeight: 'bold',
//   },
//   dateText: {
//     fontSize: 15,
//     marginTop: 30,
//     fontWeight: 'bold',
//   },
//   gridContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   deliveryTimeContainer: {
//     width: '30%', // Adjust the width for three columns with space between
//     height: 40,
//     backgroundColor: 'white',
//     borderWidth: 2,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 10,
//   },
//   deliveryTimeText: {
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: 'black',
//     textAlign: 'center',
//   },
//   checkoutButton: {
//     width: '70%',
//     height: 40,
//     backgroundColor: 'maroon',
//     alignSelf: 'center',
//     alignItems: 'center',
//     borderRadius: 5,
//     marginTop: 30,
//   },
//   checkoutButtonText: {
//     marginTop: 10,
//     color: 'white',
//     fontWeight: 'bold',
//   },
// });

// export default Segment2;
