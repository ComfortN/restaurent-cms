const { status } = require('express/lib/response');
const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');
const syncHandler = require('express-async-handler');

//Create (Crud)
const createReservation = asyncHandler(async (req, res) => {
    const { 
        restaurantId, 
        date, 
        time, 
        guests, 
        customerName, 
        customerEmail,
        customerPhoneNumber,
    } = req.body;

    if (!restaurantId || !date || !time || !guests || !customerName || !customerEmail || !customerPhoneNumber) {
        res.status(400);
        throw new Error('Please provide all required reservation details');
    }
    
    //Check if restuarent exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        res.status(404);
        throw new Error('Restaurant not found');
    }

    //Check if resevation exists
    const existingReservation = await Reservation.findOne({
        restaurantId,
        date,
        time
    });

    if (existingReservation) {
        res.status(400);
        throw new Error('This time slot is already booked');
    }

//Create resevation(Crud)
    const reservation = await Reservation.create({
        restaurantId, 
        date, 
        time, 
        guests, 
        customerName, 
        customerEmail,
        customerPhoneNumber,
        status: 'confirmed',
    });

    res.status(201).json(reservation);
});

const getReservations = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        restaurantId, 
        status, 
        startDate, 
        endDate 
    } = req.query;

    // Build query object
    const query = {};
    if (restaurantId) query.restaurantId = restaurantId;
    if (status) query.status = status;
    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const reservations = await Reservation.find(query)
        .populate('restaurantId', 'name') // Populate restaurant details
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ date: 1, time: 1 });

    const count = await Reservation.countDocuments(query);

    res.json({
        reservations,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    });
});


const getReservationById = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id)
        .populate('restaurantId', 'name address');

    if (!reservation) {
        res.status(404);
        throw new Error('Reservation not found');
    }

    res.json(reservation);
});


const updateReservation = asyncHandler(async (req, res) => {
    const { 
        date, 
        time, 
        guests, 
        status 
    } = req.body;

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
        res.status(404);
        throw new Error('Reservation not found');
    }

    // Update fields if provided
    if (date) reservation.date = date;
    if (time) reservation.time = time;
    if (guests) reservation.guests = guests;
    if (status) reservation.status = status;

    const updatedReservation = await reservation.save();

    res.json(updatedReservation);
});


const cancelReservation = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
        res.status(404);
        throw new Error('Reservation not found');
    }

    // Update status to cancelled instead of deleting
    reservation.status = 'Cancelled';
    await reservation.save();

    res.json({ message: 'Reservation cancelled successfully' });
});

module.exports = {
    createReservation,
    getReservations,
    getReservationById,
    updateReservation,
    cancelReservation
};