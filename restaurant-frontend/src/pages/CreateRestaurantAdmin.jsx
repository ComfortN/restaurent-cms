import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Modal, 
  FlatList
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllRestaurants } from '../reduc/slices/restaurentSlice';
import { createRestaurantAdmin } from '../reduc/slices/authSlice';
import { FontAwesome5 } from '@expo/vector-icons';

const CreateRestaurantAdmin = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isRestaurantModalVisible, setIsRestaurantModalVisible] = useState(false);

  const dispatch = useDispatch();
  const { restaurants, isLoading: restaurantsLoading } = useSelector(state => state.restaurants);

  useEffect(() => {
    dispatch(fetchAllRestaurants());
  }, [dispatch]);

  const handleCreateAdmin = () => {
    if (!name || !email || !password || !selectedRestaurant) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    const adminData = {
      name,
      email,
      password,
      restaurantId: selectedRestaurant
    };

    dispatch(createRestaurantAdmin(adminData))
    .unwrap()
    .then(() => {
      Alert.alert('Success', 'Restaurant admin created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    })
    .catch((error) => {
      Alert.alert('Error', error || 'Failed to create restaurant admin');
    });
  };

  const RestaurantPickerModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isRestaurantModalVisible}
      onRequestClose={() => setIsRestaurantModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Restaurant</Text>
          <FlatList
            data={restaurants}
            keyExtractor={(item, index) => item._id ? String(item._id) : `fallback-key-${index}`} // Ensure id is converted to string
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.restaurantItem}
                onPress={() => {
                  setSelectedRestaurant(item._id);
                  setIsRestaurantModalVisible(false);
                }}
              >
                <Text style={styles.restaurantItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>No restaurants available</Text>
            }
          />
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setIsRestaurantModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Restaurants Admin</Text>
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter admin name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter admin email"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter admin password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setSecureTextEntry(!secureTextEntry)}
          >
            <FontAwesome5
              name={secureTextEntry ? "eye-slash" : "eye"}
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Select Restaurant</Text>
        {restaurantsLoading ? (
          <Text>Loading restaurants...</Text>
        ) : (
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setIsRestaurantModalVisible(true)}
          >
            <Text style={styles.pickerText}>
              {selectedRestaurant
                ? restaurants.find((r) => r.id === selectedRestaurant)?.name
                : 'Select a Restaurant'}
            </Text>
            <FontAwesome5 name="utensils" size={16} color="gray" />
          </TouchableOpacity>
        )}

        <RestaurantPickerModal />

        <TouchableOpacity style={styles.createButton} onPress={handleCreateAdmin}>
          <Text style={styles.createButtonText}>Create Restaurant Admin</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '' 
  },
  header: {
    backgroundColor: '#B44E13',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 40
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  backButton: {
    marginRight: 15
  },
  formContainer: { 
    padding: 20, 
  },
  label: { 
    marginBottom: 5, 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#B44E13'
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc',
    backgroundColor: 'white', 
    padding: 10, 
    marginBottom: 10, 
    borderRadius: 5 
  },
  passwordContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  eyeIcon: { 
    marginLeft: 10 
  },
  picker: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 10, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    backgroundColor: 'white',
    borderRadius: 5 
  },
  pickerText: { 
    fontSize: 16 
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '70%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  restaurantItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  restaurantItemText: {
    fontSize: 16
  },
  emptyListText: {
    textAlign: 'center',
    color: 'gray',
    padding: 20
  },
  cancelButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f4f4f4',
    borderRadius: 5
  },
  cancelButtonText: {
    textAlign: 'center',
    color: 'red',
    fontWeight: 'bold'
  },
  createButton: { 
    backgroundColor: '#B44E13', 
    padding: 15, 
    borderRadius: 5, 
    alignItems: 'center', 
    marginTop: 20 },
  createButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});

export default CreateRestaurantAdmin;
