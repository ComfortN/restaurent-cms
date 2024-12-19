const Restaurant = require('../models/Restaurent');
const User = require('../models/User');
const { saveToFirestore, deleteFromFirestore } = require('../middlewares/firestoreMiddleware.js');

// exports.createRestaurant = async (req, res) => {
//     try {
//         // Ensure only super admin can create restaurants
//         if (!req.user || req.user.role !== 'super_admin') {
//             return res.status(403).json({ message: "Access denied. Only Super Admin can create restaurants." });
//         }

//         const { 
//             name, 
//             location, 
//             cuisine, 
//             description = '', 
//             contactNumber = '', 
//             websiteUrl = '', 
//             openingHours = '',
//             tags = []
//         } = req.body;

//         // Check if restaurant with same name and location already exists
//         const existingRestaurant = await Restaurant.findOne({ name, location });
//         if (existingRestaurant) {
//             return res.status(400).json({ message: "Restaurant with this name and location already exists." });
//         }

//         // Handle the image if uploaded
//         const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

//         // Create new restaurant
//         const newRestaurant = await Restaurant.create({
//             name,
//             location,
//             cuisine,
//             description,
//             contactNumber,
//             websiteUrl,
//             openingHours,
//             tags,
//             image: imageUrl,
//         });
//         console.log('Body:', req.body);
//         console.log('File:', req.file);


//         res.status(201).json({ 
//             message: "Restaurant created successfully", 
//             restaurant: newRestaurant 
//         });
//     } catch (error) {
//         console.error("Error creating restaurant:", error);
//         res.status(500).json({ 
//             message: "Server error", 
//             error: error.message 
//         });
//     }
// };


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

        let restaurants;
        if (req.user.role === 'super_admin') {
            // Super Admin sees all details
            restaurants = await Restaurant.find().populate('owner', 'name email');
        } else if (req.user.role === 'user') {
            // Regular user sees limited details
            restaurants = await Restaurant.find().select('name location cuisine');
        }

        res.status(200).json(restaurants);
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

// exports.updateRestaurant = async (req, res) => {
//     try {
//         const { 
//             name, 
//             location, 
//             cuisine, 
//             description, 
//             contactNumber, 
//             websiteUrl, 
//             openingHours,
//             tags
//         } = req.body;
        
//         // Find the restaurant
//         const restaurant = await Restaurant.findById(req.params.id);
        
//         if (!restaurant) {
//             return res.status(404).json({ message: "Restaurant not found" });
//         }

//         // Access control
//         if (req.user.role === 'restaurant_admin' && 
//             restaurant.owner.toString() !== req.user.id) {
//             return res.status(403).json({ message: "Access denied" });
//         }

//         // Update restaurant details
//         // Use optional chaining and nullish coalescing to handle partial updates
//         restaurant.name = name ?? restaurant.name;
//         restaurant.location = location ?? restaurant.location;
//         restaurant.cuisine = cuisine ?? restaurant.cuisine;
        
//         // Optional fields can be updated if provided
//         if (description !== undefined) restaurant.description = description;
//         if (contactNumber !== undefined) restaurant.contactNumber = contactNumber;
//         if (websiteUrl !== undefined) restaurant.websiteUrl = websiteUrl;
//         if (openingHours !== undefined) restaurant.openingHours = openingHours;
//         if (tags !== undefined) restaurant.tags = tags;

//         await restaurant.save();

//         res.status(200).json({ 
//             message: "Restaurant updated successfully", 
//             restaurant 
//         });
//     } catch (error) {
//         console.error("Error updating restaurant:", error);
//         res.status(500).json({ 
//             message: "Server error", 
//             error: error.message 
//         });
//     }
// };


exports.updateRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        if (req.user.role === 'restaurant_admin' && 
            restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        const fieldsToUpdate = [
            'name', 'location', 'cuisine', 'description', 
            'contactNumber', 'websiteUrl', 'openingHours'
        ];
        
        fieldsToUpdate.forEach(field => {
            if (req.body[field] !== undefined) {
                restaurant[field] = req.body[field];
            }
        });

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
            // Delete old image from Firestore if it exists
            if (restaurant.image?.id) {
                await deleteFromFirestore(restaurant.image.id);
            }
            
            // Save new image to Firestore
            const imageData = await saveToFirestore(req.file, restaurant._id.toString());
            restaurant.image = {
                id: imageData.id,
                originalName: imageData.originalName,
                mimetype: imageData.mimetype
            };
        }

        await restaurant.save();

        res.status(200).json({ 
            message: "Restaurant updated successfully", 
            restaurant 
        });
    } catch (error) {
        console.error("Error updating restaurant:", error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
};

// exports.deleteRestaurant = async (req, res) => {
//     try {
//         // Ensure only super admin can delete restaurants
//         if (!req.user || req.user.role !== 'super_admin') {
//             return res.status(403).json({ message: "Access denied. Only Super Admin can delete restaurants." });
//         }

//         const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

//         if (!restaurant) {
//             return res.status(404).json({ message: "Restaurant not found" });
//         }

//         res.status(200).json({ 
//             message: "Restaurant deleted successfully", 
//             restaurant 
//         });
//     } catch (error) {
//         console.error("Error deleting restaurant:", error);
//         res.status(500).json({ 
//             message: "Server error", 
//             error: error.message 
//         });
//     }
// };


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