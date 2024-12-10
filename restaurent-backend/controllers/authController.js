const User = require('../models/User');
const Restaurant = require('../models/Restaurent');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');



exports.createRestaurantAdmin = async (req, res) => {
    try {
        const { name, email, password, restaurantId } = req.body;

        // Ensure only super admin can create restaurant admins
        if (!req.user || req.user.role !== 'super_admin') {
            return res.status(403).json({ message: "Access denied. Only Super Admin can create Restaurant Admins." });
        }

        // Validate restaurant exists
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found." });
        }

        // Check if the restaurant already has an admin
        const existingAdmin = await User.findOne({ 
            restaurantId: restaurantId, 
            role: 'restaurant_admin' 
        });
        if (existingAdmin) {
            return res.status(400).json({ message: "This restaurant already has an admin assigned." });
        }

        // Check if user with email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists." });
        }

        // Create new restaurant admin
        const newUser = await User.create({
            name,
            email,
            password, // The pre-save hook will handle hashing
            role: 'restaurant_admin',
            restaurantId,
        });

        // Update the restaurant with the owner
        restaurant.owner = newUser._id;
        await restaurant.save();

        // Remove password from response
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({ 
            message: "Restaurant Admin created successfully.", 
            user: userResponse 
        });
    } catch (error) {
        console.error("Error creating Restaurant Admin:", error.message);
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};



exports.login = async (req, res) => {
    const { email, password } = req.body;

    console.log('Login attempt details:');
    console.log('Received Email:', email);
    console.log('Received Password:', password);

    try {
        const user = await User.findOne({ email });
        console.log('User found:', user);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        console.log('Stored Hashed Password:', user.password);

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password valid:', isPasswordValid);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate token with role and user details
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        console.log('JWT_SECRET:', process.env.JWT_SECRET);


        res.status(200).json({ message: "Login successful", token, role: user.role });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

