const Review = require('../models/Feedback');
const Restaurant = require('../models/Restaurent');

exports.createReview = async (req, res) => {
    try {
        const { restaurantId, rating, comment } = req.body;
        const userId = req.user.id;

        // Validate rating is between 1 and 5
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if restaurant exists
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Check if user has already reviewed this restaurant
        const existingReview = await Review.findOne({ userId, restaurantId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this restaurant' });
        }

        // Create new review
        const review = new Review({
            userId,
            restaurantId,
            rating,
            comment,
        });

        await review.save();

        // Update restaurant's average rating
        const allReviews = await Review.find({ restaurantId });
        const averageRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
        
        restaurant.averageRating = Number(averageRating.toFixed(1));
        restaurant.totalReviews = allReviews.length;
        await restaurant.save();

        res.status(201).json({
            message: 'Review submitted successfully',
            review
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        // Validate rating
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Find review
        const review = await Review.findOne({ _id: reviewId, userId });
        if (!review) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }

        // Update review
        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        review.updatedAt = Date.now();

        await review.save();

        // Update restaurant's average rating
        const restaurant = await Restaurant.findById(review.restaurantId);
        const allReviews = await Review.find({ restaurantId: review.restaurantId });
        const averageRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
        
        restaurant.averageRating = Number(averageRating.toFixed(1));
        await restaurant.save();

        res.status(200).json({
            message: 'Review updated successfully',
            review
        });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        // Find and delete review
        const review = await Review.findOneAndDelete({ _id: reviewId, userId });
        if (!review) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }

        // Update restaurant's average rating
        const restaurant = await Restaurant.findById(review.restaurantId);
        const allReviews = await Review.find({ restaurantId: review.restaurantId });
        
        if (allReviews.length > 0) {
            const averageRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
            restaurant.averageRating = Number(averageRating.toFixed(1));
        } else {
            restaurant.averageRating = 0;
        }
        
        restaurant.totalReviews = allReviews.length;
        await restaurant.save();

        res.status(200).json({
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

exports.getRestaurantReviews = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

        const reviews = await Review.find({ restaurantId })
            .populate('userId', 'name')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Review.countDocuments({ restaurantId });

        res.status(200).json({
            reviews,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalReviews: count
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};