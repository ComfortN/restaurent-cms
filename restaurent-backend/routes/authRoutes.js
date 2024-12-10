const express = require('express');
const { login} = require('../controllers/authController');

const router = express.Router();


router.post('/login', login);

// Example protected routes
router.get('/protected', protect(['super_admin']), (req, res) => {
    res.send('Super admin access only.');
});



module.exports = router;
