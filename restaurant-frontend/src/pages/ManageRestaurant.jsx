// import React, { useEffect, useState } from 'react';
// import { 
//   View, 
//   Text, 
//   FlatList, 
//   TouchableOpacity, 
//   StyleSheet, 
//   Alert, 
//   Image
// } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchAllRestaurants } from '../reduc/slices/restaurentSlice';
// import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

// const ManageRestaurants = ({ navigation }) => {
//   const dispatch = useDispatch();
//   const { restaurants, isLoading, error } = useSelector(state => state.restaurants);
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     dispatch(fetchAllRestaurants());
//   }, [dispatch]);

//   const handleRefresh = () => {
//     setRefreshing(true);
//     dispatch(fetchAllRestaurants()).then(() => setRefreshing(false));
//   };

//   const renderRestaurantItem = ({ item }) => (
//     <TouchableOpacity 
//       style={styles.restaurantItem}
//       onPress={() => navigation.navigate('RestaurantDetails', { restaurant: item })}
//     >
//       {/* Display Restaurant Image */}
//       <Image 
//       source={{ uri: item.image?.url }} 
//       style={styles.restaurantImage} 
//       resizeMode="cover" 
//     />
//       <View style={styles.restaurantDetails}>
//         <Text style={styles.restaurantName}>{item.name}</Text>
//         <Text style={styles.restaurantAddress}>{item.location}</Text>
//         <Text style={styles.restaurantContact}>{item.contactNumber}</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//           <FontAwesome5 name="arrow-left" size={20} color="white" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Manage Restaurants</Text>
//       </View>

//       {isLoading && !refreshing ? (
//         <View style={styles.loadingContainer}>
//           <Text>Loading restaurants...</Text>
//         </View>
//       ) : error ? (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={restaurants}
//           renderItem={renderRestaurantItem}
//           keyExtractor={(item, index) => (item.id ? item.id.toString() : `key-${index}`)}
//           refreshing={refreshing}
//           onRefresh={handleRefresh}
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <Text>No restaurants found</Text>
//             </View>
//           }
//           contentContainerStyle={styles.listContainer}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'white'
//   },
//   header: {
//     backgroundColor: '#B44E13',
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     paddingTop: 40
//   },
//   backButton: {
//     marginRight: 15
//   },
//   headerTitle: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold'
//   },
//   listContainer: {
//     padding: 15
//   },
//   restaurantItem: {
//     backgroundColor: '#FFE1BB',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3
//   },
//   restaurantImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 10,
//     marginRight: 10
//   },
//   restaurantDetails: {
//     flex: 1,
//     marginRight: 10
//   },
//   restaurantName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 5,
//     color: '#B44E13'
//   },
//   restaurantAddress: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 3
//   },
//   restaurantContact: {
//     fontSize: 14,
//     color: '#666'
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     gap: 10
//   },
//   editButton: {
//     backgroundColor: '#28a745',
//     padding: 10,
//     borderRadius: 5
//   },
//   deleteButton: {
//     backgroundColor: '#dc3545',
//     padding: 10,
//     borderRadius: 5
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   errorText: {
//     color: 'red',
//     textAlign: 'center'
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 50
//   }
// });

// export default ManageRestaurants;


import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Image
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllRestaurants } from '../reduc/slices/restaurentSlice';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

const ManageRestaurants = ({ navigation }) => {
  const dispatch = useDispatch();
  const { restaurants, isLoading, error } = useSelector(state => state.restaurants);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchAllRestaurants());
  }, [dispatch]);

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(fetchAllRestaurants()).then(() => setRefreshing(false));
  };

  const renderRestaurantItem = ({ item }) => {
    const imageUri = item.image?.data;
    
    console.log('Restaurant:', item.name);
    console.log('Image data available:', !!imageUri);

    return (
        <TouchableOpacity 
            style={styles.restaurantItem}
            onPress={() => navigation.navigate('RestaurantDetails', { restaurant: item })}
        >
            {imageUri ? (
                <Image 
                    source={{ uri: imageUri }}
                    style={styles.restaurantImage} 
                    resizeMode="cover"
                    onError={(error) => {
                        console.error('Image loading error for', item.name, ':', error);
                    }}
                />
            ) : (
                <View style={styles.placeholderImage}>
                    <FontAwesome5 name="image" size={40} color="#B44E13" />
                </View>
            )}

            <View style={styles.restaurantDetails}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <Text style={styles.restaurantAddress}>{item.location}</Text>
                <Text style={styles.restaurantContact}>{item.contactNumber}</Text>
            </View>
        </TouchableOpacity>
    );
};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Restaurants</Text>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <Text>Loading restaurants...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderRestaurantItem}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : `key-${index}`)}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text>No restaurants found</Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7BF90'
  },
  header: {
    backgroundColor: '#B44E13',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 40
  },
  backButton: {
    marginRight: 15
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  listContainer: {
    padding: 15
  },
  restaurantItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#FFE1BB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  restaurantDetails: {
    flex: 1
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B44E13',
    marginBottom: 5
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3
  },
  restaurantContact: {
    fontSize: 14,
    color: '#666'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: 'red',
    textAlign: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  }
});

export default ManageRestaurants;