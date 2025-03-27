const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, checkRole } = require('../middleware/auth');

// Get all orders
router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('items.product')
            .populate('createdBy', 'username email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product')
            .populate('createdBy', 'username email');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
});

// Create new order
router.post('/', auth, async (req, res) => {
    try {
        const { items, customer, shippingAddress } = req.body;

        // Validate required fields
        if (!items || !items.length) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        if (!customer || !customer.name) {
            return res.status(400).json({ message: 'Customer name is required' });
        }

        if (!shippingAddress || !shippingAddress.street) {
            return res.status(400).json({ message: 'Shipping address is required' });
        }

        // Calculate total amount and validate stock
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.product} not found` });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }
            
            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });
        }

        // Create order
        const order = new Order({
            items: orderItems,
            customer,
            shippingAddress,
            totalAmount,
            createdBy: req.user._id,
            status: 'pending',
            paymentStatus: 'pending'
        });

        // Save the order first
        const savedOrder = await order.save();

        // Update product quantities only after successful order creation
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { quantity: -item.quantity } }
            );
        }

        // Populate the order with product details before sending response
        const populatedOrder = await Order.findById(savedOrder._id)
            .populate('items.product')
            .populate('createdBy', 'username email');

        res.status(201).json(populatedOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            message: 'Error creating order', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Update order status (admin and manager only)
router.patch('/:id/status', auth, checkRole(['admin', 'manager']), async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
});

// Update payment status (admin and manager only)
router.patch('/:id/payment', auth, checkRole(['admin', 'manager']), async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { paymentStatus },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error updating payment status', error: error.message });
    }
});

// Cancel order (admin and manager only)
router.post('/:id/cancel', auth, checkRole(['admin', 'manager']), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Restore product quantities
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { quantity: item.quantity } }
            );
        }

        order.status = 'cancelled';
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling order', error: error.message });
    }
});

module.exports = router; 