import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, deleteUser, updateUser } from '../reduc/slices/usersSlice';
import { FontAwesome5 } from '@expo/vector-icons';

const ManageUsersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { users, isLoading, error } = useSelector(state => state.users);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const loadUsers = async () => {
    dispatch(fetchAllUsers());
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers().finally(() => setRefreshing(false));
  };

  const handleDeleteUser = (userId, userName) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteUser(userId));
          }
        }
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>Role: {item.role}</Text>
        {item.restaurantId && (
          <Text style={styles.restaurantName}>
            Restaurant: {item.restaurantId.name}
          </Text>
        )}
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditUser', { user: item })}
        >
          <FontAwesome5 name="edit" size={15} color="#B44E13" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteUser(item._id, item.name)}
        >
          <FontAwesome5 name="trash" size={15} color="#B44E13" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#B44E13" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <FontAwesome5 name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Users</Text>
              </View>
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={item => item._id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No users found</Text>
        }
      />
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7BF90'
  },
  listContainer: {
    padding: 15,
  },
  userCard: {
    backgroundColor: '#FFE1BB',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B44E13',
    marginBottom: 5
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  restaurantName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic'
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff'
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20
  }
});

export default ManageUsersScreen;