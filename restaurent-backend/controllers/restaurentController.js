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

exports.getAllRestaurants = async (req, res) => {
    try {
        // Ensure only super admin can view all restaurants
        if (!req.user || req.user.role !== 'super_admin') {
            return res.status(403).json({ message: "Access denied. Only Super Admin can view all restaurants." });
        }

        const restaurants = await Restaurant.find().populate('owner', 'name email');
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

exports.updateRestaurant = async (req, res) => {
    try {
        const { 
            name, 
            location, 
            cuisine, 
            description, 
            contactNumber, 
            websiteUrl, 
            openingHours,
            tags
        } = req.body;
        
        // Find the restaurant
        const restaurant = await Restaurant.findById(req.params.id);
        
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        // Access control
        if (req.user.role === 'restaurant_admin' && 
            restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Update restaurant details
        // Use optional chaining and nullish coalescing to handle partial updates
        restaurant.name = name ?? restaurant.name;
        restaurant.location = location ?? restaurant.location;
        restaurant.cuisine = cuisine ?? restaurant.cuisine;
        
        // Optional fields can be updated if provided
        if (description !== undefined) restaurant.description = description;
        if (contactNumber !== undefined) restaurant.contactNumber = contactNumber;
        if (websiteUrl !== undefined) restaurant.websiteUrl = websiteUrl;
        if (openingHours !== undefined) restaurant.openingHours = openingHours;
        if (tags !== undefined) restaurant.tags = tags;

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

exports.deleteRestaurant = async (req, res) => {
    try {
        // Ensure only super admin can delete restaurants
        if (!req.user || req.user.role !== 'super_admin') {
            return res.status(403).json({ message: "Access denied. Only Super Admin can delete restaurants." });
        }

        const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

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
