const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        console.log('Registration attempt:', { username, email, role });

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            console.log('User already exists:', { email, username });
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            role: role || 'staff'
        });

        console.log('Attempting to save user...');
        await user.save();
        console.log('User saved successfully');

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ 
            message: 'Error creating user', 
            error: error.message,
            details: error.name === 'ValidationError' ? Object.values(error.errors).map(err => err.message) : undefined
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt for email:', email);

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if JWT_SECRET is set
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not set in environment variables');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful for user:', email);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ 
            message: 'Error during login', 
            error: error.message,
            details: error.name === 'ValidationError' ? Object.values(error.errors).map(err => err.message) : undefined
        });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});

module.exports = router; 