import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllRestaurants } from '../reduc/slices/restaurentSlice';
import { logoutUser } from '../reduc/slices/authSlice';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

const SuperAdminDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { restaurants, isLoading, error } = useSelector(state => state.restaurants);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchAllRestaurants());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigation.replace('Login');
  };

  const handleCreateRestaurant = () => {
    navigation.navigate('CreateRestaurant');
  };

  const handleManageRestaurants = () => {
    navigation.navigate('ManageRestaurants');
  };

  const handleCreateRestaurantAdmin = () => {
    navigation.navigate('CreateRestaurantAdmin');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.name || 'Super Admin'}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.dashboardContent}>
        <Text style={styles.sectionTitle}>Dashboard Overview</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <FontAwesome5 name="restaurant" size={30} color="#007bff" />
            <Text style={styles.statNumber}>{restaurants.length}</Text>
            <Text style={styles.statLabel}>Total Restaurants</Text>
          </View>
          
          <View style={styles.statBox}>
            <FontAwesome5 name="user-tie" size={30} color="#28a745" />
            <Text style={styles.statNumber}>
              {restaurants.filter(r => r.owner).length}
            </Text>
            <Text style={styles.statLabel}>Restaurants with Admin</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleCreateRestaurant}
          >
            <FontAwesome5 name="plus-circle" size={24} color="white" />
            <Text style={styles.actionButtonText}>Create Restaurant</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleManageRestaurants}
          >
            <FontAwesome5 name="list" size={24} color="white" />
            <Text style={styles.actionButtonText}>Manage Restaurants</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleCreateRestaurantAdmin}
          >
            <FontAwesome5 name="user-plus" size={24} color="white" />
            <Text style={styles.actionButtonText}>Create Restaurant Admin</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#007bff',
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
    marginBottom: 10
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  statBox: {
    backgroundColor: 'white',
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
    marginTop: 10
  },
  statLabel: {
    fontSize: 14,
    color: '#666'
  },
  actionContainer: {
    gap: 15
  },
  actionButton: {
    backgroundColor: '#007bff',
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
  }
});

export default SuperAdminDashboard;