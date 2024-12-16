import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllRestaurants } from '../reduc/slices/restaurentSlice';
import { FontAwesome5 } from '@expo/vector-icons';

const CreateRestaurantAdmin = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

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

    // Add dispatch logic here for creating the admin
    Alert.alert('Success', 'Restaurant admin created successfully', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
        <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <FontAwesome5 name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Restaurants</Text>
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
            onPress={() => {
              const restaurantOptions = restaurants.map((restaurant) => ({
                label: restaurant.name,
                value: restaurant.id
              }));

              Alert.alert(
                'Select Restaurant',
                'Choose a restaurant for this admin',
                [
                  ...restaurantOptions.map((option) => ({
                    text: option.label,
                    onPress: () => setSelectedRestaurant(option.value)
                  })),
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Text style={styles.pickerText}>
              {selectedRestaurant
                ? restaurants.find((r) => r.id === selectedRestaurant)?.name
                : 'Select a Restaurant'}
            </Text>
            <FontAwesome5 name="utensils" size={16} color="gray" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.createButton} onPress={handleCreateAdmin}>
          <Text style={styles.createButtonText}>Create Restaurant Admin</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 40
  },
  formContainer: { padding: 20 },
  label: { marginBottom: 5, fontSize: 16, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center' },
  eyeIcon: { marginLeft: 10 },
  picker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
  pickerText: { fontSize: 16 },
  createButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 20 },
  createButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default CreateRestaurantAdmin;
