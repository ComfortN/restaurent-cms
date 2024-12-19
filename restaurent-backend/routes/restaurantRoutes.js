const express = require('express');
const { 
    createRestaurant, 
    getAllRestaurants, 
    getRestaurantById, 
    updateRestaurant, 
    deleteRestaurant 
} = require('../controllers/restaurentController');
const { protect } = require('../middlewares/authMiddleware.js');
const { upload } = require('../middlewares/firestoreMiddleware.js')
const router = express.Router();

// Create a new restaurant (Super Admin only)
router.post('/', upload.single('image'), protect(['super_admin']), createRestaurant);

// Get all restaurants (Super Admin only)
router.get('/', protect(['super_admin', 'user']), getAllRestaurants);

// Get a specific restaurant (Super Admin and Restaurant Admin with ownership)
router.get('/:id', protect(['super_admin', 'restaurant_admin']), getRestaurantById);

// Update a restaurant (Super Admin and Restaurant Admin with ownership)
router.put('/:id', protect(['super_admin', 'restaurant_admin']), upload.single('image'), updateRestaurant);

// Delete a restaurant (Super Admin only)
router.delete('/:id', protect(['super_admin']), deleteRestaurant);

module.exports = router;