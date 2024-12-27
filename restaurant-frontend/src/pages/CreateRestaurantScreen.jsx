import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Image,
  Platform
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
    operatingHours: {
      sunday: { open: '', close: '' },
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' }
    },
    timeSlots: [],
    tags: []
  });
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [timeSlotInput, setTimeSlotInput] = useState({
    time: '',
    capacity: ''
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
      setImageBase64(result.assets[0].base64);
    }
  };


  const handleOperatingHoursChange = (day, field, value) => {
    setRestaurantData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleTimeSlotChange = (field, value) => {
    setTimeSlotInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTimeSlot = () => {
    if (timeSlotInput.time && timeSlotInput.capacity) {
      setRestaurantData(prev => ({
        ...prev,
        timeSlots: [
          ...prev.timeSlots,
          {
            time: timeSlotInput.time,
            capacity: parseInt(timeSlotInput.capacity, 10)
          }
        ]
      }));
      setTimeSlotInput({ time: '', capacity: '' });
    }
  };

  const removeTimeSlot = (index) => {
    setRestaurantData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
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
        formData.append('operatingHours', JSON.stringify(restaurantData.operatingHours));
        formData.append('timeSlots', JSON.stringify(restaurantData.timeSlots));
        formData.append('tags', JSON.stringify(restaurantData.tags || []));

        // Add image if selected
        if (image) {
            const uriParts = image.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            
          // Create file object
          formData.append('image', {
            uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
            type: `image/${fileType}`,
            name: `photo.${fileType}`,
          });
        }

        // Log the form data
        // for (let [key, value] of formData.entries()) {
        //     console.log(`${key}:`, value);
        // }

        const response = await dispatch(createRestaurant(formData)).unwrap();
        Alert.alert('Success', 'Restaurant created successfully');
        navigation.goBack();
    } catch (error) {
        console.error('Error creating restaurant:', error);
        Alert.alert('Error', error.message || 'Failed to create restaurant');
    }
};

// Preview component for the restaurant display
const RestaurantPreview = () => (
  <View style={styles.previewContainer}>
    {image && (
      <Image 
        source={{ uri: image.uri }} 
        style={styles.previewImage} 
        resizeMode="cover"
      />
    )}
    <View style={styles.previewInfo}>
      <Text style={styles.previewName}>{restaurantData.name || 'Restaurant Name'}</Text>
      <Text style={styles.previewLocation}>{restaurantData.location || 'Location'}</Text>
      <Text style={styles.previewCuisine}>{restaurantData.cuisine || 'Cuisine Type'}</Text>
      {restaurantData.tags.length > 0 && (
        <View style={styles.tagContainer}>
          {restaurantData.tags.map((tag, index) => (
            <Text key={index} style={styles.tag}>#{tag}</Text>
          ))}
        </View>
      )}
    </View>
  </View>
);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Restaurant</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Preview Section */}
        <RestaurantPreview />

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

        {/* Operating Hours */}
        <Text style={styles.label}>Operating Hours</Text>
        {Object.entries(restaurantData.operatingHours).map(([day, hours]) => (
          <View key={day} style={styles.operatingHoursContainer}>
            <Text style={styles.operatingHoursDay}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
            <TextInput
              style={styles.operatingHoursInput}
              placeholder="Open (e.g., 10:00)"
              value={hours.open}
              onChangeText={(value) => handleOperatingHoursChange(day, 'open', value)}
            />
            <TextInput
              style={styles.operatingHoursInput}
              placeholder="Close (e.g., 22:00)"
              value={hours.close}
              onChangeText={(value) => handleOperatingHoursChange(day, 'close', value)}
            />
          </View>
        ))}

        {/* Time Slots */}
        <Text style={styles.label}>Time Slots</Text>
        <View style={styles.timeSlotInputContainer}>
          <TextInput
            style={styles.timeSlotInput}
            placeholder="Time (e.g., 10:00 AM)"
            value={timeSlotInput.time}
            onChangeText={(value) => handleTimeSlotChange('time', value)}
          />
          <TextInput
            style={styles.timeSlotInput}
            placeholder="Capacity"
            value={timeSlotInput.capacity}
            onChangeText={(value) => handleTimeSlotChange('capacity', value)}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.addTimeSlotButton} onPress={addTimeSlot}>
            <Text style={styles.addTimeSlotButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {restaurantData.timeSlots.map((slot, index) => (
          <View key={index} style={styles.timeSlotItem}>
            <Text style={styles.timeSlotText}>{slot.time} (Capacity: {slot.capacity})</Text>
            <TouchableOpacity onPress={() => removeTimeSlot(index)}>
              <FontAwesome5 name="times" size={16} color="red" />
            </TouchableOpacity>
          </View>
        ))}

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
  previewContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  previewInfo: {
    padding: 15,
  },
  previewName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B44E13',
    marginBottom: 5,
  },
  previewLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  previewCuisine: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  operatingHoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  operatingHoursDay: {
    width: 80,
    fontWeight: 'bold',
    color: '#B44E13',
  },
  operatingHoursInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  timeSlotInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeSlotInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  addTimeSlotButton: {
    backgroundColor: '#B44E13',
    padding: 10,
    borderRadius: 8,
  },
  addTimeSlotButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  timeSlotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  timeSlotText: {
    color: '#B44E13',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  tag: {
    backgroundColor: '#F7BF90',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 5,
    marginBottom: 5,
    color: '#B44E13',
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