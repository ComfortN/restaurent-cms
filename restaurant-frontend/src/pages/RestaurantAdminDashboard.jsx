import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, fetchUserProfile } from '../reduc/slices/authSlice';
import { fetchRestaurantReservations } from '../reduc/slices/reservationSlice';
import { 
  fetchAllRestaurants, 
  fetchRestaurantById, 
  setSelectedRestaurant, 
  fetchRestaurantReviews 
} from '../reduc/slices/restaurentSlice';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

const RestaurantAdminDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { reservations, isLoading: reservationsLoading } = useSelector(state => state.reservations);
  const { restaurants, selectedRestaurant, isLoading: restaurantsLoading } = useSelector(state => state.restaurants);
  const { reviews } = useSelector(state => state.restaurants);

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchAllRestaurants());

    // Fetch reservations for the admin's specific restaurant
    if (user?.restaurantId?._id) {
      dispatch(fetchRestaurantById(user.restaurantId._id));
      dispatch(fetchRestaurantReservations(user.restaurantId._id));
      dispatch(fetchRestaurantReviews({
        restaurantId: user.restaurantId._id,
        page: 1,
        limit: 3 // Show only latest 3 reviews in dashboard
      }));
    }
  }, [dispatch, user?.restaurantId?._id]);

  useEffect(() => {
    if (restaurants.length > 0 && user?.restaurantId?._id) {
      const selectedRestaurant = restaurants.find(r => r._id === user.restaurantId._id);
      if (selectedRestaurant) {
        dispatch(setSelectedRestaurant(selectedRestaurant));
      }
    }
  }, [restaurants, user?.restaurantId?._id, dispatch]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FontAwesome5
        key={index}
        name={index < rating ? "star" : "star-o"}
        size={14}
        color={index < rating ? "#FFD700" : "#BDC3C7"}
        style={{ marginRight: 2 }}
      />
    ));
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigation.replace('Login');
  };

  const handleManageReservations = () => {
    navigation.navigate('ManageReservations');
  };

  const handleRestaurantDetails = () => {
    if (selectedRestaurant) {
      navigation.navigate('RestaurantDetails', { restaurant: selectedRestaurant });
    } else {
      Alert.alert('Error', 'Restaurant details not found');
    }
  };

  // Count reservations by status
  const reservationStats = reservations.reduce((acc, reservation) => {
    acc[reservation.status] = (acc[reservation.status] || 0) + 1;
    return acc;
  }, {});

  // If loading, show a loading state
  if (restaurantsLoading || reservationsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.dashboardContent}>
        <Text style={styles.sectionTitle}>Restaurant Overview</Text>
        
        <TouchableOpacity 
          style={styles.restaurantCard} 
          onPress={handleRestaurantDetails}
        >
          <FontAwesome5 name="store" size={30} color="#B44E13" />
          <View style={styles.restaurantDetails}>
            <Text style={styles.restaurantName}>
              {selectedRestaurant?.name || 'My Restaurant'}
            </Text>
            <Text style={styles.restaurantLocation}>
              {selectedRestaurant?.location || 'Location Not Set'}
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Reservation Statistics</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <FontAwesome5 name="clipboard-list" size={30} color="#28a745" />
            <Text style={styles.statNumber}>
              {reservations.length}
            </Text>
            <Text style={styles.statLabel}>Total Reservations</Text>
          </View>
          
          <View style={styles.statBox}>
            <FontAwesome5 name="check-circle" size={30} color="#17a2b8" />
            <Text style={styles.statNumber}>
              {reservationStats.confirmed || 0}
            </Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>
        </View>

        <View style={styles.additionalStatsContainer}>
          <View style={styles.smallStatBox}>
            <Text style={styles.statNumber}>{reservationStats.pending || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.smallStatBox}>
            <Text style={styles.statNumber}>{reservationStats.cancelled || 0}</Text>
            <Text style={styles.statLabel}>Cancelled</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Latest Reviews</Text>
        <View style={styles.reviewsContainer}>
          {reviews?.items?.slice(0, 3).map((review) => (
            <View key={review._id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>
                  {review.userId?.name || 'Anonymous'}
                </Text>
                <View style={styles.ratingContainer}>
                  {renderStars(review.rating)}
                </View>
              </View>
              <Text style={styles.reviewComment} numberOfLines={2}>
                {review.comment}
              </Text>
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('Reviews')}
          >
            <Text style={styles.viewAllButtonText}>View All Reviews</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleManageReservations}
          >
            <FontAwesome5 name="calendar-alt" size={24} color="white" />
            <Text style={styles.actionButtonText}>Manage Reservations</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('CreateReservation')}
          >
            <FontAwesome5 name="plus-circle" size={24} color="white" />
            <Text style={styles.actionButtonText}>Create Reservation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 40
  },
  welcomeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  logoutButton: {
    padding: 10
  },
  dashboardContent: {
    padding: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#B44E13',
  },
  restaurantCard: {
    backgroundColor: '#FFE1BB',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20
  },
  restaurantDetails: {
    marginLeft: 15,
    flex: 1
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B44E13',
  },
  restaurantLocation: {
    color: '#666',
    marginTop: 5
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  statBox: {
    backgroundColor: '#FFE1BB',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#B44E13'
  },
  statLabel: {
    fontSize: 14,
    color: '#666'
  },
  reviewsContainer: {
    backgroundColor: '#FFE1BB',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F7BF90',
    paddingVertical: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewerName: {
    fontWeight: 'bold',
    color: '#B44E13',
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  reviewComment: {
    color: '#666',
    fontSize: 13,
  },
  viewAllButton: {
    backgroundColor: '#B44E13',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  viewAllButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionContainer: {
    gap: 15
  },
  actionButton: {
    backgroundColor: '#B44E13',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 10
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7BF90'
  },
  additionalStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  smallStatBox: {
    backgroundColor: '#FFE1BB',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  }
});

export default RestaurantAdminDashboard;