/**
 * This script updates restaurant data in a MongoDB database to ensure
 * that all restaurants have default time slots for reservations and
 * operating hours. It can update either all restaurants or a single
 * restaurant by ID, based on a command-line argument.
 * 
 * FOR BACKEND USE
 */


const mongoose = require('mongoose'); // Import Mongoose for interacting with MongoDB
const Restaurant = require('./models/Restaurent'); // Import the Restaurant model

// MongoDB connection URI (Replace with your actual MongoDB URI)
const MONGODB_URI = '';

// Default time slots for restaurant reservations
const defaultTimeSlots = [
    { time: "10:00 AM", capacity: 20, booked: 0 },
    { time: "11:00 AM", capacity: 20, booked: 0 },
    { time: "12:00 PM", capacity: 20, booked: 0 },
    { time: "1:00 PM", capacity: 20, booked: 0 },
    { time: "2:00 PM", capacity: 20, booked: 0 },
    { time: "3:00 PM", capacity: 20, booked: 0 },
    { time: "4:00 PM", capacity: 20, booked: 0 },
    { time: "5:00 PM", capacity: 20, booked: 0 },
    { time: "6:00 PM", capacity: 20, booked: 0 },
    { time: "7:00 PM", capacity: 20, booked: 0 },
    { time: "8:00 PM", capacity: 20, booked: 0 },
    { time: "9:00 PM", capacity: 20, booked: 0 }
];

// Default operating hours for restaurants
const defaultOperatingHours = {
    monday: { open: "10:00", close: "22:00" },
    tuesday: { open: "10:00", close: "22:00" },
    wednesday: { open: "10:00", close: "22:00" },
    thursday: { open: "10:00", close: "22:00" },
    friday: { open: "10:00", close: "22:00" },
    saturday: { open: "10:00", close: "22:00" },
    sunday: { open: "10:00", close: "22:00" }
};

// Function to update all restaurants with missing or incomplete time slots and operating hours
async function updateRestaurants() {
    try {
        // Connect to MongoDB using Mongoose
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find restaurants missing time slots or operating hours
        const restaurants = await Restaurant.find({
            $or: [
                { timeSlots: { $exists: false } }, // Missing the timeSlots field
                { timeSlots: { $size: 0 } }, // timeSlots field is empty
                { operatingHours: { $exists: false } } // Missing the operatingHours field
            ]
        });

        console.log(`Found ${restaurants.length} restaurants to update`);

        // Loop through each restaurant to update
        for (const restaurant of restaurants) {
            // Add default time slots if missing or empty
            if (!restaurant.timeSlots || restaurant.timeSlots.length === 0) {
                restaurant.timeSlots = defaultTimeSlots;
            }

            // Add default operating hours if missing, or ensure all days are defined
            if (!restaurant.operatingHours) {
                restaurant.operatingHours = defaultOperatingHours;
            } else {
                // Ensure every day in the week has defined operating hours
                Object.keys(defaultOperatingHours).forEach(day => {
                    if (!restaurant.operatingHours[day]) {
                        restaurant.operatingHours[day] = defaultOperatingHours[day];
                    }
                });
            }

            // Save the updated restaurant to the database
            await restaurant.save();
            console.log(`Updated restaurant: ${restaurant.name} (${restaurant._id})`);
        }

        console.log('All restaurants updated successfully');
    } catch (error) {
        // Log any errors that occur during the update process
        console.error('Error updating restaurants:', error);
    } finally {
        // Close the MongoDB connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

// Function to update a single restaurant by ID (useful for targeted updates)
async function updateSingleRestaurant(restaurantId) {
    try {
        // Connect to MongoDB using Mongoose
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the restaurant by its ID
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            console.log('Restaurant not found');
            return;
        }

        // Update the restaurant's time slots and operating hours
        restaurant.timeSlots = defaultTimeSlots;
        restaurant.operatingHours = defaultOperatingHours;

        // Save the updated restaurant to the database
        await restaurant.save();
        console.log(`Updated restaurant: ${restaurant.name} (${restaurant._id})`);

    } catch (error) {
        // Log any errors that occur during the update process
        console.error('Error updating restaurant:', error);
    } finally {
        // Close the MongoDB connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

// Check if a restaurant ID is passed as a command-line argument
if (process.argv[2]) {
    // Update a single restaurant if ID is provided
    updateSingleRestaurant(process.argv[2]);
} else {
    // Otherwise, update all restaurants
    updateRestaurants();
}
