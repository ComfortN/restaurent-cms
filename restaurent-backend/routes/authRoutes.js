const express = require('express');
const { login, createRestaurantAdmin } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware.js');

const router = express.Router();


router.post('/create-restaurant-admin', protect(['super_admin']), createRestaurantAdmin);

router.post('/login', login);

// Example protected routes
router.get('/protected', protect(['super_admin']), (req, res) => {
    res.send('Super admin access only.');
});



module.exports = router;
