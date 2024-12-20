import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurantReservations, updateReservationStatus } from '../reduc/slices/reservationSlice';
import { FontAwesome5 } from '@expo/vector-icons';

const ManageReservations = ( { navigation } ) => {
  const dispatch = useDispatch();
  const { reservations, isLoading } = useSelector((state) => state.reservations);
  const { user } = useSelector((state) => state.auth);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.restaurantId?._id) {
      dispatch(fetchRestaurantReservations(user.restaurantId._id));
    }
  }, [dispatch, user?.restaurantId?._id]);

  const handleUpdateStatus = (reservationId, newStatus) => {
    Alert.alert(
      'Update Reservation',
      `Are you sure you want to mark this reservation as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            dispatch(updateReservationStatus({ reservationId, status: newStatus }));
          },
        },
      ]
    );
  };

  // Filter reservations by status
  const filteredReservations =
    filter === 'all' ? reservations : reservations.filter((res) => res.status === filter);

  const renderReservation = ({ item }) => (
    <View style={styles.reservationCard}>
      <View style={styles.cardContent}>
        <Text style={styles.reservationName}>{item.customerName}</Text>
        <Text style={styles.reservationDetails}>{`Customer Email.: ${item.customerEmail}`}</Text>
        <Text style={styles.reservationDetails}>{`Customer No: ${item.customerPhoneNumber}`}</Text>
        <Text style={styles.reservationDetails}>{`Date: ${item.date}`}</Text>
        <Text style={styles.reservationDetails}>{`Time: ${item.time}`}</Text>
        <Text style={styles.reservationDetails}>{`No of Guests: ${item.guests}`}</Text>

        <Text style={styles.reservationDetails}>{`Status: ${item.status}`}</Text>
      </View>
      <View style={styles.actionsContainer}>
        {item.status !== 'confirmed' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleUpdateStatus(item._id, 'confirmed')}
          >
            <FontAwesome5 name="check-circle" size={20} color="#28a745" />
          </TouchableOpacity>
        )}
        {item.status !== 'cancelled' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleUpdateStatus(item._id, 'cancelled')}
          >
            <FontAwesome5 name="times-circle" size={20} color="#dc3545" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B44E13" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
              >
                <FontAwesome5 name="arrow-left" size={20} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Manage Reservation</Text>
            </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {['all', 'pending', 'confirmed', 'cancelled'].map((status) => (
          <TouchableOpacity
            key={status}
            style={filter === status ? styles.activeFilterButton : styles.filterButton}
            onPress={() => setFilter(status)}
          >
            <Text
              style={filter === status ? styles.activeFilterText : styles.filterText}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reservation List */}
      <FlatList
        data={filteredReservations}
        keyExtractor={(item) => item._id}
        renderItem={renderReservation}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No reservations available.</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7BF90',
  },
  header: {
    backgroundColor: '#B44E13',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 40
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 15,
  },
  filterButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#B44E13',
  },
  activeFilterButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#FFE1BB',
  },
  filterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reservationCard: {
    backgroundColor: '#FFE1BB',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  reservationName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reservationDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7BF90',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});

export default ManageReservations;
