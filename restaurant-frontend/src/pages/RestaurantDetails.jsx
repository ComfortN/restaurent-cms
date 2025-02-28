import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Image,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { deleteRestaurant } from '../reduc/slices/restaurentSlice';

const RestaurantDetailScreen = ({ route, navigation }) => {
    const { restaurant } = route.params;
    const dispatch = useDispatch();

    const handleEditRestaurant = () => {
        navigation.navigate('EditRestaurant', { restaurant });
    };

    const handleDeleteRestaurant = () => {
        Alert.alert(
        'Confirm Deletion',
        'Are you sure you want to delete this restaurant?',
        [
            {
            text: 'Cancel',
            style: 'cancel'
            },
            {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
                dispatch(deleteRestaurant(restaurant._id))
                    .then(() => {
                        Alert.alert(
                            'Success', 
                            'Restaurant deleted successfully',
                            [{ 
                                text: 'OK', 
                                onPress: () => navigation.goBack() 
                            }]
                        );
                    })
                    .catch((error) => {
                        Alert.alert(
                            'Error', 
                            error.message || 'Failed to delete restaurant'
                        );
                    });
    }
            }
        ]
        );
    };

    return (
        <ScrollView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <FontAwesome5 name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Restaurant Details</Text>
            <View style={styles.headerActions}>
                <TouchableOpacity 
                    style={styles.editButton}
                    onPress={handleEditRestaurant}
                >
                    <MaterialIcons name="edit" size={20} color= '#B44E13' />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={handleDeleteRestaurant}
                >
                    <MaterialIcons name="delete" size={20} color= '#B44E13' />
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Restaurant Information</Text>
            <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Restaurant ID:</Text>
                <Text style={styles.detailValue}>{restaurant._id}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{restaurant.name}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Cuisine:</Text>
                <Text style={styles.detailValue}>{restaurant.cuisine}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>{restaurant.location}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Contact Number:</Text>
                <Text style={styles.detailValue}>{restaurant.contactNumber}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Description:</Text>
                <Text style={styles.detailValue}>{restaurant.description}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Operating Hours:</Text>
                <View style={styles.operatingHoursContainer}>
                    {Object.entries(restaurant.operatingHours || {}).map(([day, hours]) => (
                        <Text key={day} style={styles.operatingHoursText}>
                            {day.charAt(0).toUpperCase() + day.slice(1)}: {hours.open} - {hours.close}
                        </Text>
                    ))}
                </View>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Time Slots:</Text>
                <View style={styles.timeSlotsContainer}>
                    {restaurant.timeSlots?.map((slot, index) => (
                        <Text key={index} style={styles.timeSlotText}>
                            {slot.time} (Capacity: {slot.capacity})
                        </Text>
                    ))}
                </View>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Tags:</Text>
                <Text style={styles.detailValue}>{restaurant.tags}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Website:</Text>
                <Text style={styles.detailValue}>{restaurant.websiteUrl}</Text>
            </View>
            {/* Image Section */}
            <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Image:</Text>
                {restaurant.image?.data ? (
                    <Image 
                        source={{ uri: restaurant.image.data }} 
                        style={styles.restaurantImage} 
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <FontAwesome5 name="image" size={40} color="#B44E13" />
                        <Text style={styles.placeholderText}>No Image Available</Text>
                    </View>
                )}
            </View>
        </View>
        </ScrollView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      },
      restaurantDetails: {
        flex: 1,
        marginRight: 10
      },
      restaurantName: {
        fontSize: 16,
        fontWeight: 'bold',
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
      operatingHoursContainer: {
        flex: 1,
    },
    operatingHoursText: {
        marginBottom: 5,
        color: '#666',
    },
    timeSlotsContainer: {
        flex: 1,
    },
    timeSlotText: {
        marginBottom: 5,
        color: '#666',
    },
      actionButtons: {
        flexDirection: 'row',
        gap: 10
      },
      editButton: {
        backgroundColor: '#FFE1BB',
        padding: 10,
        borderRadius: 5
      },
      deleteButton: {
        backgroundColor: '#FFE1BB',
        padding: 10,
        borderRadius: 5
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
      },
    headerActions: {
        flexDirection: 'row',
        marginLeft: 'auto',
        gap: 10
    },
    detailSection: {
        backgroundColor: '#FFE1BB',
        padding: 15,
        margin: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#B44E13'
    },
    detailItem: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'center'
    },
    detailLabel: {
        fontWeight: 'bold',
        marginRight: 10,
        width: 120,
        color: '#B44E13'
    },
    detailValue: {
        flex: 1
    },
    restaurantImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginRight: 15
    },
    placeholderImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        backgroundColor: '#FFE1BB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    placeholderText: {
        marginTop: 5,
        color: '#B44E13',
        fontSize: 12
    }
});

export default RestaurantDetailScreen;