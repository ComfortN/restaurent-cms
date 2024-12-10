const express = require('express');
const {createRestaurant} = require('../controllers/restaurentController');
const { protect } = require('../middlewares/authMiddleware.js');

const router = express.Router();

// Create a new restaurant (Super Admin only)
router.post('/', protect(['super_admin']), createRestaurant);



module.exports = router;