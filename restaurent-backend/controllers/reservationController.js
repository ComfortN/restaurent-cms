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

