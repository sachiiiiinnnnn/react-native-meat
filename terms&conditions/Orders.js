import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { instance } from '../constants/Common';
import AsyncStorage from "@react-native-async-storage/async-storage";

const Orders = () => {
  const [bookings, setBookings] = useState([]);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedUserDetails = await AsyncStorage.getItem('userDetails');
        if (storedUserDetails !== null) {
          setUserDetails(JSON.parse(storedUserDetails));
        }
      } catch (error) {
        console.error('Failed to retrieve user details from AsyncStorage:', error);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      if (userDetails && userDetails.customerId) {
        try {
          const response = await instance.get(`/api/user/Booking/CustomerId?customerId=${userDetails.customerId}`);
          setBookings(response.data);
        } catch (error) {
          console.error('Error fetching bookings:', error);
        }
      } else {
        console.warn('User details or customerId is missing.');
      }
    };

    fetchBookings();
  }, [userDetails]);

  const handleCancelBooking = async (booking) => {
    const { bookingId } = booking;

    try {
      // Update booking status to 'cancel' in the backend
      await instance.put(`/api/user/Booking`, {
        ...booking,
        bookingStatus: 'cancel',
      });

      Alert.alert('Booking Cancelled', 'Your booking has been successfully cancelled.');

      // Refetch the bookings to get the updated status
      const response = await instance.get(`/api/user/Booking/CustomerId?customerId=${userDetails.customerId}`);
      setBookings(response.data);
      
    } catch (error) {
      console.error('Error updating booking:', error);
      Alert.alert('Cancellation Failed', 'There was an issue cancelling your booking. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {bookings.map((booking, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: booking.image }}
              style={styles.image}
            />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.textContent}>
              <Text style={styles.title}>{booking.productName}</Text>
              <Text style={styles.description}>{booking.description}</Text>
              <Text style={styles.quantity}>Quantity: {booking.quantity}</Text>
              <Text style={styles.price}>₹{booking.amount}</Text>
              {booking.bookingStatus === 'cancel' && (
                <TouchableOpacity style={{backgroundColor:'#dbdadd',width:80,height:30,alignItems:'center',borderRadius:5}}>
                <Text style={styles.cancelledText}>Cancelled</Text>
                </TouchableOpacity>
              )}
            </View>
            {booking.bookingStatus !== 'cancel' && (
              <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelBooking(booking)}>
                <Ionicons name="close-circle" size={13} color="white" />
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default Orders;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Ensure the ScrollView takes up the entire space
    backgroundColor: 'white',
    paddingBottom: 120,
  },
  card: {
    backgroundColor: 'white',
    width: 350,
    height: 150,
    marginTop: 15,
    borderRadius: 10,
    alignSelf: 'center',
    elevation: 5,
    flexDirection: 'row',
    padding: 10,
  },
  imageContainer: {
    backgroundColor: 'white',
    width: '40%',
    height: '92%',
    borderRadius: 10,
    elevation: 10,
    margin: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
 
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 13,
    color: 'gray',
  },
  quantity: {
    fontSize: 14,
    bottom:10
  },
  price: {
    fontSize: 15,
    color: 'maroon',
    fontWeight: 'bold',
    bottom:9
  },
  cancelButton: {
    flexDirection: 'row',
    backgroundColor: 'red',
    width: 70,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 90,
  },
  cancelText: {
    fontSize: 13,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5, // Add some space between the icon and text
  },
  cancelledText: {
    fontSize: 14,
    color: 'red',
    fontWeight: 'bold',
    marginTop: 5,
  },
});



















// old code


// import { StyleSheet, Text, View, Image, TouchableOpacity ,ScrollView,Alert} from 'react-native';
// import React, { useEffect, useState } from 'react';
// import { Ionicons } from '@expo/vector-icons';
// import { instance } from '../constants/Common';
// import { useRoute } from '@react-navigation/native'; // Import useRoute
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const Orders = () => {

//   const [bookings, setBookings] = useState([]);
//   const [userDetails, setUserDetails] = useState(null);

//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       try {
//         const storedUserDetails = await AsyncStorage.getItem('userDetails');
//         if (storedUserDetails !== null) {
//           setUserDetails(JSON.parse(storedUserDetails));
//         }
//       } catch (error) {
//         console.error('Failed to retrieve user details from AsyncStorage:', error);
//       }
//     };

//     fetchUserDetails();
//   }, []);


//   useEffect(() => {
//     const fetchBookings = async () => {
//       if (userDetails && userDetails.customerId) {

//         try {
//           const response = await instance.get(`/api/user/Booking/CustomerId?customerId=${userDetails.customerId}`);
//           setBookings(response.data);
//         } catch (error) {
//           console.error('Error fetching bookings:', error);
//         }
//       } else {
//         console.warn('User details or customerId is missing.');
//       }
//     };


//     fetchBookings();
//   }, [userDetails]);


//   const handleCancelBooking = async (booking) => {
//     console.log(booking);
    
//     const { bookingId, productId, quantity, bookingDate, categoryId, bookingStatus } = booking;
  
//     if (!bookingId || !productId || !quantity || !bookingDate || !categoryId || !bookingStatus) {
//       Alert.alert('Missing Information', 'One or more required fields are missing. Cannot proceed with the cancellation.');
//       return;
//     }
  
//     try {
//       const updatedBooking = {
//         bookingId:booking.bookingId ,
//         productId:booking.productId,
//         quantity:booking.quantity,
//         bookingDate:booking.bookingDate,
//         categoryId:booking.categoryId,
//         bookingStatus: 'cancel'
//       };
  
//       await instance.put(`/api/user/Booking`, updatedBooking);
//       Alert.alert('Booking Cancelled', 'Your booking has been successfully cancelled.');
  
  
//       setBookings((prevBookings) => 
//         prevBookings.map(b => 
//           b.bookingId === bookingId ? { ...b, bookingStatus: 'Cancelled' } : b
//         )
//       );
      
//     } catch (error) {
//       console.error('Error updating booking:', error);
//       Alert.alert('Cancellation Failed', 'There was an issue cancelling your booking. Please try again.');
//     }
//   };

  
//   return (
//     <ScrollView  contentContainerStyle={styles.container}>
//       {bookings.map((booking, index) => (
//         <View key={index} style={styles.card}>
//           <View style={styles.imageContainer}>
//             <Image 
//                 source={{ uri: booking.image }}
//                 style={styles.image}
//             />
//           </View>
//           <View style={styles.textContainer}>
//             <View style={styles.textContent}>
//               <Text style={styles.title}>{booking.productName}</Text> 
//               <Text style={styles.description}>{booking.description}</Text> 
//               <Text style={styles.quantity}>Quantity: {booking.quantity}</Text>
//               <Text style={styles.price}>₹{booking.amount}</Text>
//               {booking.bookingStatus === 'Cancelled' && (
//                 <Text style={styles.cancelledText}>Cancelled</Text>
//               )}
//             </View>
//             {booking.bookingStatus !== 'Cancelled' && (
//               <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelBooking(booking)}>
//                 <Ionicons name="close-circle" size={13} color="white" />
//                 <Text style={styles.cancelText}>Cancel</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       ))}
//     </ScrollView>
//   );
// };
// export default Orders;