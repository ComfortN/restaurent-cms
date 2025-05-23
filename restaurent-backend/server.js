const User = require('./models/User.js');
const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes.js');
const reservationRoutes = require('./routes/reservationRoutes.js')
const reviewsRoutes = require('./routes/feedbackRoutes.js')
const userRoutes = require('./routes/usersRoutes.js')
const path = require('path');

dotenv.config();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:8081', 'http://localhost:3000'],
    credentials: true
  }));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
