import React, { useState, useEffect } from 'react';
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
import { useDispatch } from 'react-redux';
import { updateRestaurant } from '../reduc/slices/restaurentSlice';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';


const EditRestaurantScreen = ({ route, navigation }) => {
    const { restaurant } = route.params;
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);

    // State for form fields
    const [name, setName] = useState(restaurant.name);
    const [cuisine, setCuisine] = useState(restaurant.cuisine);
    const [location, setLocation] = useState(restaurant.location);
    const [contactNumber, setContactNumber] = useState(restaurant.contactNumber);
    const [description, setDescription] = useState(restaurant.description);
    const [openingHours, setOpeningHours] = useState(restaurant.openingHours);
    const [websiteUrl, setWebsiteUrl] = useState(restaurant.websiteUrl);
    const [tags, setTags] = useState(restaurant.tags ? restaurant.tags.join(', ') : '');
    const [image, setImage] = useState(null);
    const [imageUri, setImageUri] = useState(null);
    // State for operating hours
    const [operatingHours, setOperatingHours] = useState(
        restaurant.operatingHours || {
            sunday: { open: '', close: '' },
            monday: { open: '', close: '' },
            tuesday: { open: '', close: '' },
            wednesday: { open: '', close: '' },
            thursday: { open: '', close: '' },
            friday: { open: '', close: '' },
            saturday: { open: '', close: '' }
        }
    );

    // State for time slots
    const [timeSlots, setTimeSlots] = useState(restaurant.timeSlots || []);
    const [timeSlotInput, setTimeSlotInput] = useState({
        time: '',
        capacity: ''
    });




    // Initialize image from restaurant data
    useEffect(() => {
        if (restaurant.image?.data) {
            // If we have base64 data, use it directly
            setImageUri(restaurant.image.data);
        }
    }, [restaurant]);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
            console.error('Image picker error:', error);
        }
    };

    console.log(image);


    const handleOperatingHoursChange = (day, field, value) => {
        setOperatingHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
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
            setTimeSlots(prev => [
                ...prev,
                {
                    time: timeSlotInput.time,
                    capacity: parseInt(timeSlotInput.capacity, 10)
                }
            ]);
            setTimeSlotInput({ time: '', capacity: '' });
        }
    };

    const removeTimeSlot = (index) => {
        setTimeSlots(prev => prev.filter((_, i) => i !== index));
    };


    const handleSave = async () => {
        if (!name || !cuisine || !location) {
            Alert.alert('Error', 'Name, Cuisine, and Location are required');
            return;
        }

        setIsLoading(true);
    
        const formData = new FormData();
        formData.append('name', name);
        formData.append('cuisine', cuisine);
        formData.append('location', location);
        formData.append('contactNumber', contactNumber);
        formData.append('description', description);
        formData.append('openingHours', openingHours);
        formData.append('websiteUrl', websiteUrl);
        formData.append('tags', tags ? tags.split(',').map(tag => tag.trim()).join(',') : '');
        formData.append('operatingHours', JSON.stringify(operatingHours));
        formData.append('timeSlots', JSON.stringify(timeSlots));

        // Handle image upload
        if (image) {
            // Get the file extension
            const imageExtension = image.split('.').pop();
            
            // Create file name
            const fileName = `${Date.now()}.${imageExtension}`;
            
            // Append image to form data
            formData.append('image', {
                uri: image,
                type: `image/${imageExtension}`,
                name: fileName,
            });
        }
    
        try {
            console.log('Sending update with formData:', formData);
            await dispatch(updateRestaurant({ 
                restaurantId: restaurant._id, 
                restaurantData: formData 
            }));
            
            Alert.alert(
                'Success', 
                'Restaurant updated successfully',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Update error:', error);
            Alert.alert('Error', error.message || 'Failed to update restaurant');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Edit Restaurant</Text>
                
                <Text style={styles.label}>Restaurant Image</Text>
                {imageUri ? (
                    <View style={styles.imageContainer}>
                        <Image 
                            source={{ uri: imageUri }} 
                            style={styles.imagePreview}
                            onError={(e) => {
                                console.error('Image loading error:', e.nativeEvent.error);
                                setImageUri(null); // Reset on error
                            }}
                        />
                        <TouchableOpacity 
                            style={styles.changeImageButton} 
                            onPress={pickImage}
                        >
                            <Text style={styles.changeImageText}>Change Image</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity onPress={pickImage} style={styles.pickImageButton}>
                        <Text style={styles.pickImageButtonText}>Pick an Image</Text>
                    </TouchableOpacity>
                )}

                <Text style={styles.label}>Restaurant Name *</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter restaurant name"
                />

                <Text style={styles.label}>Cuisine *</Text>
                <TextInput
                    style={styles.input}
                    value={cuisine}
                    onChangeText={setCuisine}
                    placeholder="Enter cuisine type"
                />

                <Text style={styles.label}>Location *</Text>
                <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Enter restaurant address"
                />

                <Text style={styles.label}>Contact Number</Text>
                <TextInput
                    style={styles.input}
                    value={contactNumber}
                    onChangeText={setContactNumber}
                    placeholder="Enter contact number"
                    keyboardType="phone-pad"
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter restaurant description"
                    multiline
                    numberOfLines={4}
                />

                {/* Operating Hours */}
                <Text style={styles.label}>Operating Hours</Text>
                {Object.entries(operatingHours).map(([day, hours]) => (
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

                {timeSlots.map((slot, index) => (
                    <View key={index} style={styles.timeSlotItem}>
                        <Text style={styles.timeSlotText}>{slot.time} (Capacity: {slot.capacity})</Text>
                        <TouchableOpacity onPress={() => removeTimeSlot(index)}>
                            <FontAwesome5 name="times" size={16} color="red" />
                        </TouchableOpacity>
                    </View>
                ))}

                <Text style={styles.label}>Website URL</Text>
                <TextInput
                    style={styles.input}
                    value={websiteUrl}
                    onChangeText={setWebsiteUrl}
                    placeholder="Enter website URL"
                    keyboardType="url"
                />

                <Text style={styles.label}>Tags (comma-separated)</Text>
                <TextInput
                    style={styles.input}
                    value={tags}
                    onChangeText={setTags}
                    placeholder="Enter tags (e.g., family-friendly, outdoor seating)"
                />

<TouchableOpacity 
                style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isLoading}
            >
                <Text style={styles.saveButtonText}>
                    {isLoading ? 'Saving Changes...' : 'Save Changes'}
                </Text>
            </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7BF90'
    },
    formContainer: {
        padding: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#B44E13'
    },
    imageContainer: {
        marginBottom: 15,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: '#ddd'
    },
    changeImageButton: {
        backgroundColor: '#B44E13',
        padding: 8,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 5
    },
    changeImageText: {
        color: 'white',
        fontWeight: 'bold'
    },
    label: {
        marginBottom: 5,
        fontWeight: 'bold',
        color: '#B44E13'
    },
    input: {
        backgroundColor: 'white',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 15
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top'
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
    saveButton: {
        backgroundColor: '#B44E13',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center'
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    saveButtonDisabled: {
        opacity: 0.7
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 15,
        backgroundColor: '#ddd'
    },
    pickImageButton: {
        backgroundColor: '#B44E13',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center'
    },
    pickImageButtonText: {
        color: 'white',
        fontWeight: 'bold'
    }
});

export default EditRestaurantScreen;
