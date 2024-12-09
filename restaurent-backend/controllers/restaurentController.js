const Restaurant = require('../models/Restaurant'); 
const asyncHandler = require('express-async-handler');

const getRestuarents = asyncHandler(async (req, res) => {
    const {page = 1,  limit = 10, search = ""} = req.query; //filtering

    const options = {
        name: { $regex: search, $options: 'i' }, //search
    };

    const restaurant = await Restaurant.find(options)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    const count = Restaurant.countDocuments(options);
    res.json({
        restaurants,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    });
});

const getRestaurantById = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        res.status(404);
        throw new Error('Restaurant not found');
    }

    res.json(restaurant);
});

//Create (Crud)
const createRestaurant = asyncHandler(async (req, res) => {
    const { 
        name, 
        cuisine, 
        address, 
        contactNumber, 
        openingHours 
    } = req.body;

    // Validate required fields
    if (!name || !cuisine) {
        res.status(400);
        throw new Error('Please provide name and cuisine');
    }

    const restaurant = await Restaurant.create({
        name,
        cuisine,
        address,
        contactNumber,
        openingHours
    });

    res.status(201).json(restaurant);
});

//Update(crUd)
const updateRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        res.status(404);
        throw new Error('Restaurant not found');
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { new: true, runValidators: true }
    );

    res.json(updatedRestaurant);
});

//Deletion(cruD)
const deleteRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        res.status(404);
        throw new Error('Restaurant not found');
    }

    await restaurant.deleteOne();

    res.json({ message: 'Restaurant removed' });
});

module.exports = {
    getRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
};

