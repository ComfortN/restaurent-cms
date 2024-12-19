import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Image
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createRestaurant } from '../reduc/slices/restaurentSlice';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

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
  const [image, setImage] = useState(null);

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

  const pickImage = async () => {
    console.log('pickImage function called');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos to proceed!');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
  
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };


  const handleCreateRestaurant = async() => {
    try {
        const formData = new FormData();
        
        // Add the required fields
        formData.append('name', restaurantData.name);
        formData.append('location', restaurantData.location);
        formData.append('cuisine', restaurantData.cuisine);
        
        // Add optional fields
        formData.append('description', restaurantData.description || '');
        formData.append('contactNumber', restaurantData.contactNumber || '');
        formData.append('websiteUrl', restaurantData.websiteUrl || '');
        formData.append('openingHours', restaurantData.openingHours || '');
        formData.append('tags', JSON.stringify(restaurantData.tags || []));

        // Add image if selected
        if (image) {
            const uriParts = image.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            
            formData.append('image', {
                uri: image.uri,
                type: `image/${fileType}`,
                name: `photo.${fileType}`,
            });
        }

        // Log the form data
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        const response = await dispatch(createRestaurant(formData)).unwrap();
        Alert.alert('Success', 'Restaurant created successfully');
        navigation.goBack();
    } catch (error) {
        console.error('Error creating restaurant:', error);
        Alert.alert('Error', error.message || 'Failed to create restaurant');
    }
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
      {/* Image Upload Section */}
      <Text style={styles.label}>Restaurant Image</Text>
        <TouchableOpacity 
          style={styles.imagePicker} 
          onPress={pickImage}
        >
          {image ? (
            <Image 
              source={{ uri: image.uri }} 
              style={styles.imagePreview} 
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <FontAwesome5 name="camera" size={30} color="#B44E13" />
              <Text style={styles.imagePickerText}>Add Image</Text>
            </View>
          )}
        </TouchableOpacity>

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
  formContainer: {
    padding: 20,
    color: '#B44E13'
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: 'white',
    aspectRatio: 16/9,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imagePickerText: {
    marginTop: 10,
    color: '#B44E13',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#B44E13'
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
    backgroundColor: '#B44E13',
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