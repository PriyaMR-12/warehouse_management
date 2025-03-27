const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @route   GET /api/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get total products count
    const totalProducts = await Product.countDocuments();

    // Get total orders count
    const totalOrders = await Order.countDocuments();

    // Get low stock items count (where quantity <= reorderPoint)
    const lowStockItems = await Product.countDocuments({
      $expr: {
        $lte: ['$quantity', '$reorderPoint']
      }
    });

    // Calculate total revenue from all orders
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      totalProducts,
      totalOrders,
      lowStockItems,
      totalRevenue
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router; 