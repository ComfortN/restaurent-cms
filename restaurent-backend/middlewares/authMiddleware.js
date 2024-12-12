const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
exports.protect = (roles = []) => {
    return async (req, res, next) => {
        const authHeader = req.headers.authorization;

        // Check if authorization header exists
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized. No token provided." });
        }

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to request
            req.user = decoded;

            // Optionally fetch user details from the DB (if needed)
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }
            console.log("logged in user: ", user)
            
            // Role-based access control
            if (roles.length && !roles.includes(user.role)) {
                return res.status(403).json({ message: "Access denied. Insufficient permissions." });
            }

            next(); // Proceed to the next middleware/route
        } catch (error) {
            console.error("Token verification error:", error.message);
            return res.status(401).json({ message: "Invalid or expired token." });
        }
    };
};