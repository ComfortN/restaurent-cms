const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
    getAllUsers, getUserById, updateUser, deleteUser, getRestaurantAdmins
} = require('../controllers/usersController');

const router = express.Router();

// User management routes
router.get('/', protect(['super_admin']), getAllUsers);
router.get('/:id', protect(['super_admin']), getUserById);
router.put('/:id', protect(['super_admin']), updateUser);
router.delete('/:id', protect(['super_admin']), deleteUser);

// Restaurant admin specific routes
router.get('/restaurant-admins', protect(['super_admin']), getRestaurantAdmins);

module.exports = router;