const express = require('express');
const { login, createRestaurantAdmin, register, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware.js');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/create-restaurant-admin', protect(['super_admin']), createRestaurantAdmin);
router.put('/profile', protect(), updateProfile);
router.get('/profile', protect(), getProfile)

// Example protected routes
router.get('/protected', protect(['super_admin']), (req, res) => {
    res.send('Super admin access only.');
});



module.exports = router;
