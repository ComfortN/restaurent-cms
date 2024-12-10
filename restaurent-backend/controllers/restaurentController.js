const Restaurant = require('../models/Restaurent');
const User = require('../models/User');

exports.createRestaurant = async (req, res) => {
    try {
        // Ensure only super admin can create restaurants
        if (!req.user || req.user.role !== 'super_admin') {
            return res.status(403).json({ message: "Access denied. Only Super Admin can create restaurants." });
        }

        const { 
            name, 
            location, 
            cuisine, 
            description = '', 
            contactNumber = '', 
            websiteUrl = '', 
            openingHours = '',
            tags = []
        } = req.body;

        // Check if restaurant with same name and location already exists
        const existingRestaurant = await Restaurant.findOne({ name, location });
        if (existingRestaurant) {
            return res.status(400).json({ message: "Restaurant with this name and location already exists." });
        }

        // Create new restaurant
        const newRestaurant = await Restaurant.create({
            name,
            location,
            cuisine,
            description,
            contactNumber,
            websiteUrl,
            openingHours,
            tags
        });

        res.status(201).json({ 
            message: "Restaurant created successfully", 
            restaurant: newRestaurant 
        });
    } catch (error) {
        console.error("Error creating restaurant:", error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
};

