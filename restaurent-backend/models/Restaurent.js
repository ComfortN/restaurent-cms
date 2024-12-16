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
        type: {
            url: { type: String, default: '' },
            publicId: { type: String, default: '' },
            originalName: { type: String, default: '' },
            mimetype: { type: String, default: '' }
        },
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
