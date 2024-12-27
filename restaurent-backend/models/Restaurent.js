const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    cuisine: { type: String, required: true },
    description: { type: String, default: '' },
    contactNumber: { type: String, default: '' },
    websiteUrl: { type: String, default: '' },
    // openingHours: { type: String, default: '' },
    timeSlots: [{
        time: String,
        capacity: {
            type: Number,
            default: 20
        },
        booked: {
            type: Number,
            default: 0
        }
    }],
    operatingHours: {
        monday: { 
            open: { type: String, default: "10:00" }, 
            close: { type: String, default: "22:00" } 
        },
        tuesday: { 
            open: { type: String, default: "10:00" }, 
            close: { type: String, default: "22:00" } 
        },
        wednesday: { 
            open: { type: String, default: "10:00" }, 
            close: { type: String, default: "22:00" } 
        },
        thursday: { 
            open: { type: String, default: "10:00" }, 
            close: { type: String, default: "22:00" } 
        },
        friday: { 
            open: { type: String, default: "10:00" }, 
            close: { type: String, default: "22:00" } 
        },
        saturday: { 
            open: { type: String, default: "10:00" }, 
            close: { type: String, default: "22:00" } 
        },
        sunday: { 
            open: { type: String, default: "10:00" }, 
            close: { type: String, default: "22:00" } 
        }
    },
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


restaurantSchema.pre('save', function(next) {
    if (this.isNew || this.timeSlots.length === 0) {
        const slots = [];
        // Generate time slots from 10 AM to 9 PM
        for (let hour = 10; hour <= 21; hour++) {
            const timeStr = hour < 12 ? 
                `${hour}:00 AM` : 
                `${hour === 12 ? 12 : hour - 12}:00 PM`;
            
            slots.push({
                time: timeStr,
                capacity: 20,
                booked: 0
            });
        }
        this.timeSlots = slots;
    }
    next();
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
