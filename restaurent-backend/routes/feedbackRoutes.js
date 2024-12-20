const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/feedbackController.js')
const { protect } = require('../middlewares/authMiddleware.js');

router.post('/', protect(['user']), reviewController.createReview);
router.put('/reviews/:reviewId', protect(['user']), reviewController.updateReview);
router.delete('/reviews/:reviewId', protect(['user']), reviewController.deleteReview);
router.get('/restaurants/:restaurantId/reviews', protect(['user', 'super_admin', 'restaurant_admin']), reviewController.getRestaurantReviews);

module.exports = router;