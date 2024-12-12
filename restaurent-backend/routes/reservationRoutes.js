// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middlewares/authMiddleware.js');
// const reservationController = require('../controllers/reservationController.js');

// // User routes
// router.post('/', protect(['user']), reservationController.createReservation);
// router.get('/user', protect(['user']), reservationController.getUserReservations);
// router.put('/:reservationId', protect(['user']), reservationController.updateUserReservation);
// router.delete('/:reservationId', protect(['user']), reservationController.cancelUserReservation);

// // Admin routes
// router.get('/restaurant/:restaurantId', protect(['restaurant_admin']), reservationController.getRestaurantReservations);
// router.put('/status/:reservationId', protect(['restaurant_admin']), reservationController.updateReservationStatus);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware.js');
const reservationController = require('../controllers/reservationController.js');
const paymentController = require('../controllers/paymentController.js');

// Payment routes
router.post('/create-payment', protect(['user']), paymentController.createReservationPayment);
router.post('/confirm-payment', protect(['user']), paymentController.confirmReservationPayment);

// Existing user reservation routes
router.get('/user', protect(['user']), reservationController.getUserReservations);
router.put('/:reservationId', protect(['user']), reservationController.updateUserReservation);
router.delete('/:reservationId', protect(['user']), reservationController.cancelUserReservation);

// Admin routes
router.get('/restaurant/:restaurantId', protect(['restaurant_admin']), reservationController.getRestaurantReservations);
router.put('/status/:reservationId', protect(['restaurant_admin']), reservationController.updateReservationStatus);

module.exports = router;