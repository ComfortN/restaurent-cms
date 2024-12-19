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
import * as ImagePicker from 'expo-image-picker';


const EditRestaurantScreen = ({ route, navigation }) => {
    const { restaurant } = route.params;
    const dispatch = useDispatch();

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

    // const serverBaseUrl = 'https://restaurent-cms.onrender.com/uplouds/'; // Replace with your actual server URL
    // const absoluteImageUrl = `${serverBaseUrl}${image}`;


    // Initialize image from restaurant data
    useEffect(() => {
        if (restaurant.image) {
            const imageUrl = restaurant.image.url;
            // Handle both full URLs and relative paths
            if (imageUrl.startsWith('http')) {
                setImage(imageUrl);
            } else {
                // Construct full URL for relative paths
                const serverBaseUrl = 'https://restaurent-cms.onrender.com';
                setImage(`${serverBaseUrl}${imageUrl}`);
            }
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
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
            console.error('Image picker error:', error);
        }
    };

    console.log(image);


    const handleSave = async () => {
        if (!name || !cuisine || !location) {
            Alert.alert('Error', 'Name, Cuisine, and Location are required');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('cuisine', cuisine);
        formData.append('location', location);
        formData.append('contactNumber', contactNumber);
        formData.append('description', description);
        formData.append('openingHours', openingHours);
        formData.append('websiteUrl', websiteUrl);
        formData.append('tags', tags ? tags.split(',').map(tag => tag.trim()).join(',') : '');

        // Only append image if it's a local file (new image picked)
        if (image && image.startsWith('file://')) {
            const imageName = image.split('/').pop();
            const imageType = `image/${imageName.split('.').pop()}`;
            formData.append('image', {
                uri: image,
                name: imageName,
                type: imageType,
            });
        }

        try {
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
            Alert.alert('Error', error.message || 'Failed to update restaurant');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Edit Restaurant</Text>
                
                <Text style={styles.label}>Restaurant Image</Text>
                {image ? (
                    <Image 
                        source={{ uri: image }} 
                        style={styles.imagePreview}
                        onError={(e) => console.error('Image loading error:', e.nativeEvent.error)}
                    />
                ) : (
                    <Text>No Image Selected</Text>
                )}
                <TouchableOpacity onPress={pickImage} style={styles.pickImageButton}>
                    <Text style={styles.pickImageButtonText}>Pick an Image</Text>
                </TouchableOpacity>

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

                <Text style={styles.label}>Opening Hours</Text>
                <TextInput
                    style={styles.input}
                    value={openingHours}
                    onChangeText={setOpeningHours}
                    placeholder="Enter opening hours"
                />

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
                    style={styles.saveButton}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
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
