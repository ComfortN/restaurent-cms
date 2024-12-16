import React, { useState } from 'react';
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
import { createRestaurant } from '../reduc/slices/restaurentSlice';
import { FontAwesome5 } from '@expo/vector-icons';

const CreateRestaurant = ({ navigation }) => {
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    location: '',
    cuisine: '',
    description: '',
    contactNumber: '',
    websiteUrl: '',
    openingHours: '',
    tags: []
  });

  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.restaurants);

  const handleInputChange = (field, value) => {
    setRestaurantData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagChange = (tagsInput) => {
    // Split tags by comma and trim whitespace
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
    setRestaurantData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleCreateRestaurant = () => {
    // Basic validation
    const requiredFields = ['name', 'location', 'cuisine'];
    const missingFields = requiredFields.filter(field => !restaurantData[field]);

    if (missingFields.length > 0) {
      Alert.alert(
        'Validation Error', 
        `Please fill in the following required fields: ${missingFields.join(', ')}`
      );
      return;
    }

    dispatch(createRestaurant(restaurantData))
      .then((response) => {
        if (response.meta.requestStatus === 'fulfilled') {
          Alert.alert('Success', 'Restaurant created successfully', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        }
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Restaurant</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Required Fields */}
        <Text style={styles.label}>Restaurant Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter restaurant name"
          value={restaurantData.name}
          onChangeText={(value) => handleInputChange('name', value)}
        />

        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter restaurant location"
          value={restaurantData.location}
          onChangeText={(value) => handleInputChange('location', value)}
        />

        <Text style={styles.label}>Cuisine *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter cuisine type"
          value={restaurantData.cuisine}
          onChangeText={(value) => handleInputChange('cuisine', value)}
        />

        {/* Optional Fields */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter restaurant description"
          value={restaurantData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          multiline
        />

        <Text style={styles.label}>Contact Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter contact number"
          value={restaurantData.contactNumber}
          onChangeText={(value) => handleInputChange('contactNumber', value)}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Website URL</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter website URL"
          value={restaurantData.websiteUrl}
          onChangeText={(value) => handleInputChange('websiteUrl', value)}
          keyboardType="url"
        />

        <Text style={styles.label}>Opening Hours</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter opening hours"
          value={restaurantData.openingHours}
          onChangeText={(value) => handleInputChange('openingHours', value)}
        />

        <Text style={styles.label}>Tags (comma-separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter tags (e.g. italian, pizza, casual dining)"
          value={restaurantData.tags.join(', ')}
          onChangeText={handleTagChange}
        />

        <TouchableOpacity 
          style={styles.createButton} 
          onPress={handleCreateRestaurant}
          disabled={isLoading}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? 'Creating...' : 'Create Restaurant'}
          </Text>
        </TouchableOpacity>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    </ScrollView>
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
  formContainer: {
    padding: 20
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15
  },
  createButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center'
  }
});

export default CreateRestaurant;