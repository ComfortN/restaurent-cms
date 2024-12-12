const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
    {
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true,
        },
        // userId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'User',
        //     required: true,
        // },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String, // Alternatively, use a `Date` field for exact time
            required: true,
        },
        guests: {
            type: Number,
            required: true,
            min: 1,
        },
        customerName: {
            type: String,
            required: true,
        },
        customerEmail: {
            type: String,
            required: true,
        },
        customerPhoneNumber: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'pending',
        },
        isCancelledByUser: {
            type: Boolean,
            default: false, // Tracks whether the user cancelled the reservation
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending'
        },
        paymentIntentId: {
            type: String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
