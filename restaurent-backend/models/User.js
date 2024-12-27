const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contactNumber: { 
        type: String, 
        required: false,
        validate: {
            validator: function(v) {
                // Optional regex for phone number validation (adjust as needed)
                return v === null || v === '' || /^\+27\d{9}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    fcmToken: {
        type: String,
        default: null
    },
    role: { 
        type: String, 
        enum: ['super_admin', 'restaurant_admin', 'user'], 
        default: 'user' 
    },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: false }, // Only for Restaurant Admins
}, { timestamps: true });

// Hash the password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);

    next(); 
});

module.exports = mongoose.model('User', userSchema);
