const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


exports.login = async (req, res) => {
    const { email, password } = req.body;

    console.log('Login attempt details:');
    console.log('Received Email:', email);
    console.log('Received Password:', password);

    try {
        const user = await User.findOne({ email });
        console.log('User found:', user);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        console.log('Stored Hashed Password:', user.password);

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password valid:', isPasswordValid);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate token with role and user details
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        console.log('JWT_SECRET:', process.env.JWT_SECRET);


        res.status(200).json({ message: "Login successful", token, role: user.role });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

