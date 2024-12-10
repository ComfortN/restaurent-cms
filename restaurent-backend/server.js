const User = require('./models/User.js');
const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Database connected"))
    .catch(err => console.error(err));


    const initializeSuperAdmin = async () => {
        try {
            const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
            if (!existingSuperAdmin) {
                const superAdmin = new User({
                    name: 'Super Admin',
                    email: 'superadmin@example.com',
                    password: 'defaultSuperAdminPassword123', 
                    role: 'super_admin',
                });
    
                await superAdmin.save(); // Trigger the pre-save hook to hash
                console.log('Super Admin user initialized successfully.');
            } else {
                console.log('Super Admin user already exists.');
            }
        } catch (error) {
            console.error('Error initializing Super Admin:', error.message);
        }
    };

// Call the function to initialize the Super Admin
initializeSuperAdmin();




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
