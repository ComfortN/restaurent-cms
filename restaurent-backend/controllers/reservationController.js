// const { status } = require('express/lib/response');
// const Reservation = require('../models/Reservation');
// const Restaurant = require('../models/Restaurant');
// const syncHandler = require('express-async-handler');

// //Create (Crud)
// const createReservation = asyncHandler(async (req, res) => {
//     const { 
//         restaurantId, 
//         date, 
//         time, 
//         guests, 
//         customerName, 
//         customerEmail,
//         customerPhoneNumber,
//     } = req.body;

//     if (!restaurantId || !date || !time || !guests || !customerName || !customerEmail || !customerPhoneNumber) {
//         res.status(400);
//         throw new Error('Please provide all required reservation details');
//     }
    
//     //Check if restuarent exists
//     const restaurant = await Restaurant.findById(restaurantId);
//     if (!restaurant) {
//         res.status(404);
//         throw new Error('Restaurant not found');
//     }

//     //Check if resevation exists
//     const existingReservation = await Reservation.findOne({
//         restaurantId,
//         date,
//         time
//     });

//     if (existingReservation) {
//         res.status(400);
//         throw new Error('This time slot is already booked');
//     }

// //Create resevation(Crud)
//     const reservation = await Reservation.create({
//         restaurantId, 
//         date, 
//         time, 
//         guests, 
//         customerName, 
//         customerEmail,
//         customerPhoneNumber,
//         status: 'confirmed',
//     });

//     res.status(201).json(reservation);
// });

// const getReservations = asyncHandler(async (req, res) => {
//     const { 
//         page = 1, 
//         limit = 10, 
//         restaurantId, 
//         status, 
//         startDate, 
//         endDate 
//     } = req.query;

//     // Build query object
//     const query = {};
//     if (restaurantId) query.restaurantId = restaurantId;
//     if (status) query.status = status;
//     if (startDate && endDate) {
//         query.date = {
//             $gte: new Date(startDate),
//             $lte: new Date(endDate)
//         };
//     }

//     const reservations = await Reservation.find(query)
//         .populate('restaurantId', 'name') // Populate restaurant details
//         .limit(limit * 1)
//         .skip((page - 1) * limit)
//         .sort({ date: 1, time: 1 });

//     const count = await Reservation.countDocuments(query);

//     res.json({
//         reservations,
//         totalPages: Math.ceil(count / limit),
//         currentPage: page
//     });
// });


// const getReservationById = asyncHandler(async (req, res) => {
//     const reservation = await Reservation.findById(req.params.id)
//         .populate('restaurantId', 'name address');

//     if (!reservation) {
//         res.status(404);
//         throw new Error('Reservation not found');
//     }

//     res.json(reservation);
// });


// const updateReservation = asyncHandler(async (req, res) => {
//     const { 
//         date, 
//         time, 
//         guests, 
//         status 
//     } = req.body;

//     const reservation = await Reservation.findById(req.params.id);

//     if (!reservation) {
//         res.status(404);
//         throw new Error('Reservation not found');
//     }

//     // Update fields if provided
//     if (date) reservation.date = date;
//     if (time) reservation.time = time;
//     if (guests) reservation.guests = guests;
//     if (status) reservation.status = status;

//     const updatedReservation = await reservation.save();

//     res.json(updatedReservation);
// });


// const cancelReservation = asyncHandler(async (req, res) => {
//     const reservation = await Reservation.findById(req.params.id);

//     if (!reservation) {
//         res.status(404);
//         throw new Error('Reservation not found');
//     }

//     // Update status to cancelled instead of deleting
//     reservation.status = 'Cancelled';
//     await reservation.save();

//     res.json({ message: 'Reservation cancelled successfully' });
// });

// module.exports = {
//     createReservation,
//     getReservations,
//     getReservationById,
//     updateReservation,
//     cancelReservation
// };


const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurent');


exports.createReservation = async (req, res) => {
    try {
        const {
            restaurantId,
            date,
            time,
            guests,
            customerName,
            customerEmail,
            customerPhoneNumber,
        } = req.body;

        const userId = req.user.id;

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const reservation = new Reservation({
            restaurantId,
            userId,
            date,
            time,
            guests,
            customerName,
            customerEmail,
            customerPhoneNumber,
        });

        await reservation.save();
        res.status(201).json({ message: 'Reservation created successfully', reservation });
    } catch (error) {
        console.error('Error creating reservation:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.getUserReservations = async (req, res) => {
    try {
        const userId = req.user.id;

        const reservations = await Reservation.find({ userId })
            .sort({ date: -1 })
            .populate('restaurantId', 'name');

        res.status(200).json({ reservations });
    } catch (error) {
        console.error('Error fetching user reservations:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.updateUserReservation = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const { date, time, guests } = req.body;
        const userId = req.user.id;

        const reservation = await Reservation.findOne({ _id: reservationId, userId });

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found or unauthorized' });
        }

        reservation.date = date || reservation.date;
        reservation.time = time || reservation.time;
        reservation.guests = guests || reservation.guests;

        await reservation.save();
        res.status(200).json({ message: 'Reservation updated successfully', reservation });
    } catch (error) {
        console.error('Error updating reservation:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.cancelUserReservation = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const userId = req.user.id;

        const reservation = await Reservation.findOne({ _id: reservationId, userId });

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found or unauthorized' });
        }

        reservation.status = 'cancelled';
        reservation.isCancelledByUser = true;

        await reservation.save();
        res.status(200).json({ message: 'Reservation cancelled successfully', reservation });
    } catch (error) {
        console.error('Error cancelling reservation:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.getRestaurantReservations = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        // Check if the admin has access to the restaurant
        if (req.user.role !== 'restaurant_admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const reservations = await Reservation.find({ restaurantId }).sort({ date: -1 });
        res.status(200).json({ reservations });
    } catch (error) {
        console.error('Error fetching restaurant reservations:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.updateReservationStatus = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const { status } = req.body;

        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const reservation = await Reservation.findById(reservationId);

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        reservation.status = status;

        await reservation.save();
        res.status(200).json({ message: 'Reservation status updated successfully', reservation });
    } catch (error) {
        console.error('Error updating reservation status:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
