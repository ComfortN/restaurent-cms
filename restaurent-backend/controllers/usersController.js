const User = require('../models/User');
const Restaurant = require('../models/Restaurent');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('restaurantId', 'name');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('restaurantId', 'name');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error.message
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, email, role, contactNumber } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent changing role to super_admin
        if (role && role === 'super_admin') {
            return res.status(403).json({
                success: false,
                message: "Cannot change user role to super_admin"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                ...(name && { name }),
                ...(email && { email }),
                ...(role && { role }),
                ...(contactNumber && { contactNumber })
            },
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        res.status(200).json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating user",
            error: error.message
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent deleting super_admin
        if (user.role === 'super_admin') {
            return res.status(403).json({
                success: false,
                message: "Cannot delete super admin user"
            });
        }

        // If user is restaurant_admin, update restaurant
        if (user.role === 'restaurant_admin' && user.restaurantId) {
            await Restaurant.findByIdAndUpdate(user.restaurantId, {
                $unset: { owner: "" }
            });
        }

        await user.remove();

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message
        });
    }
};

exports.getRestaurantAdmins = async (req, res) => {
    try {
        const restaurantAdmins = await User.find({ role: 'restaurant_admin' })
            .select('-password')
            .populate('restaurantId', 'name');

        res.status(200).json({
            success: true,
            count: restaurantAdmins.length,
            data: restaurantAdmins
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching restaurant admins",
            error: error.message
        });
    }
};