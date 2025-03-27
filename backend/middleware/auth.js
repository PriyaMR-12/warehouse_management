const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                message: 'No authentication token provided.',
                error: 'AUTH_NO_TOKEN'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({ _id: decoded.userId }).select('-password');

            if (!user) {
                return res.status(401).json({ 
                    message: 'User not found.',
                    error: 'AUTH_USER_NOT_FOUND'
                });
            }

            req.user = user;
            req.token = token;
            next();
        } catch (jwtError) {
            console.error('JWT Verification Error:', jwtError);
            return res.status(401).json({ 
                message: 'Invalid or expired token.',
                error: 'AUTH_INVALID_TOKEN'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ 
            message: 'Authentication error.',
            error: 'AUTH_SERVER_ERROR'
        });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Required roles: ${roles.join(', ')}`
            });
        }
        next();
    };
};

module.exports = { auth, checkRole }; 