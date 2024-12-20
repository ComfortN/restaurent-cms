const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    cuisine: { type: String, required: true },
    description: { type: String, default: '' },
    contactNumber: { type: String, default: '' },
    websiteUrl: { type: String, default: '' },
    openingHours: { type: String, default: '' },
    tags: [{ type: String, default: [] }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Owner is a Restaurant Admin
    image: {
        id: String,          // Firestore document ID
        originalName: String,
        mimetype: String
      },
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
