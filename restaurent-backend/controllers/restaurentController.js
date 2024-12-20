const Restaurant = require('../models/Restaurent');
const User = require('../models/User');
const { saveToFirestore, deleteFromFirestore } = require('../middlewares/firestoreMiddleware.js');
const { db } = require('../config/firestore');
const { collection, getDocs, doc, getDoc } = require('firebase/firestore');


exports.createRestaurant = async (req, res) => {
    try {
        // Log the incoming request data
        console.log('Headers:', req.headers['content-type']);
        console.log('Request Body:', req.body);
        console.log('Request File:', req.file);

        // Ensure only super admin can create restaurants
        if (!req.user || req.user.role !== 'super_admin') {
            return res.status(403).json({ message: "Access denied. Only Super Admin can create restaurants." });
        }

        // Parse the tags if they exist
        let parsedTags = [];
        if (req.body.tags) {
            try {
                parsedTags = JSON.parse(req.body.tags);
            } catch (e) {
                console.log('Error parsing tags:', e);
                parsedTags = req.body.tags.split(',').map(tag => tag.trim());
            }
        }

        // Prepare restaurant data
        const restaurantData = {
            name: req.body.name,
            location: req.body.location,
            cuisine: req.body.cuisine,
            description: req.body.description || '',
            contactNumber: req.body.contactNumber || '',
            websiteUrl: req.body.websiteUrl || '',
            openingHours: req.body.openingHours || '',
            tags: parsedTags,
            image: null // Initialize image as null
        };

        // Create new restaurant first
        console.log('Creating restaurant with data:', restaurantData);
        const newRestaurant = await Restaurant.create(restaurantData);
        console.log('Restaurant created:', newRestaurant);

        // Then save image to Firestore if provided
        if (req.file) {
            console.log('Uploading image to Firestore...');
            const imageData = await saveToFirestore(req.file, newRestaurant._id.toString());
            console.log('Image uploaded to Firestore:', imageData);

            // Update restaurant with image reference
            const updatedRestaurant = await Restaurant.findByIdAndUpdate(
                newRestaurant._id, 
                {
                    image: {
                        id: imageData.id,
                        originalName: imageData.originalName,
                        mimetype: imageData.mimetype,
                        url: imageData.url // Add this if your saveToFirestore returns a URL
                    }
                },
                { new: true }
            );
            console.log('Restaurant updated with image:', updatedRestaurant);
            
            newRestaurant.image = imageData;
        }

        res.status(201).json({ 
            message: "Restaurant created successfully", 
            restaurant: newRestaurant 
        });
    } catch (error) {
        console.error("Error creating restaurant:", error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message,
            details: error.errors // Include validation errors
        });
    }
};

exports.getAllRestaurants = async (req, res) => {
    try {
        if (!req.user || !['super_admin', 'user'].includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied." });
        }

        // Fetch restaurants from MongoDB
        let restaurants = await Restaurant.find();

        // Fetch image data from Firestore for each restaurant
        const restaurantsWithImages = await Promise.all(restaurants.map(async (restaurant) => {
            const restaurantObj = restaurant.toObject(); // Convert to plain object
            
            if (restaurantObj.image && restaurantObj.image.id) {
                try {
                    const imageDocRef = doc(db, 'restaurantImages', restaurantObj.image.id);
                    const imageDoc = await getDoc(imageDocRef);
                    
                    if (imageDoc.exists()) {
                        const imageData = imageDoc.data();
                        restaurantObj.image = {
                            ...restaurantObj.image,
                            data: imageData.data // This should be your base64 string
                        };
                    }
                } catch (error) {
                    console.error(`Error fetching image for restaurant ${restaurantObj._id}:`, error);
                }
            }
            return restaurantObj;
        }));

        res.status(200).json(restaurantsWithImages);
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
};


exports.getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email');

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        // Restrict access based on role
        if (req.user.role === 'restaurant_admin' && 
            restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json(restaurant);
    } catch (error) {
        console.error("Error fetching restaurant:", error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
};


exports.updateRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        // Check authorization
        if (req.user.role === 'restaurant_admin' && 
            restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Update basic fields
        const fieldsToUpdate = [
            'name', 'location', 'cuisine', 'description', 
            'contactNumber', 'websiteUrl', 'openingHours'
        ];
        
        fieldsToUpdate.forEach(field => {
            if (req.body[field] !== undefined) {
                restaurant[field] = req.body[field];
            }
        });

        // Handle tags
        if (req.body.tags) {
            try {
                restaurant.tags = typeof req.body.tags === 'string' 
                    ? req.body.tags.split(',').map(tag => tag.trim())
                    : req.body.tags;
            } catch (e) {
                console.error('Error parsing tags:', e);
            }
        }

        // Handle image update
        if (req.file) {
            try {
                // Delete old image from Firestore if it exists
                if (restaurant.image?.id) {
                    try {
                        await deleteFromFirestore(restaurant.image.id);
                    } catch (deleteError) {
                        console.error('Error deleting old image:', deleteError);
                        // Continue with update even if delete fails
                    }
                }
                
                // Save new image to Firestore
                const imageData = await saveToFirestore(req.file, restaurant._id.toString());
                restaurant.image = {
                    id: imageData.id,
                    originalName: imageData.originalName,
                    mimetype: imageData.mimetype,
                    data: imageData.url // Store the base64 data URL
                };
            } catch (imageError) {
                console.error('Error processing image:', imageError);
                return res.status(500).json({ 
                    message: "Failed to process image update", 
                    error: imageError.message 
                });
            }
        }

        // Save the updated restaurant
        const updatedRestaurant = await restaurant.save();

        // If successful, fetch the complete restaurant data including image
        const restaurantWithImage = updatedRestaurant.toObject();
        
        if (restaurantWithImage.image?.id) {
            try {
                const imageDocRef = doc(db, 'restaurantImages', restaurantWithImage.image.id);
                const imageDoc = await getDoc(imageDocRef);
                
                if (imageDoc.exists()) {
                    const imageData = imageDoc.data();
                    restaurantWithImage.image = {
                        ...restaurantWithImage.image,
                        data: imageData.data
                    };
                }
            } catch (fetchError) {
                console.error('Error fetching updated image:', fetchError);
                // Continue without image data if fetch fails
            }
        }

        res.status(200).json({ 
            message: "Restaurant updated successfully", 
            restaurant: restaurantWithImage 
        });

    } catch (error) {
        console.error("Error updating restaurant:", error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
};


exports.deleteRestaurant = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'super_admin') {
            return res.status(403).json({ message: "Access denied. Only Super Admin can delete restaurants." });
        }

        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        // Delete image from Firestore if it exists
        if (restaurant.image?.id) {
            await deleteFromFirestore(restaurant.image.id);
        }

        await restaurant.deleteOne();

        res.status(200).json({ 
            message: "Restaurant deleted successfully", 
            restaurant 
        });
    } catch (error) {
        console.error("Error deleting restaurant:", error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
};