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
    // Get all products
    const products = await Product.find();
    
    // Get recent orders for trend analysis
    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(30)
        .populate('items.product');

    // Calculate stock predictions
    const stockPredictions = await Promise.all(products.map(async (product) => {
        // Get orders for this product in the last 30 days
        const productOrders = recentOrders.filter(order => 
            order.items.some(item => item.product._id.toString() === product._id.toString())
        );

        // Calculate average daily consumption
        const totalConsumption = productOrders.reduce((sum, order) => {
            const item = order.items.find(item => item.product._id.toString() === product._id.toString());
            return sum + (item ? item.quantity : 0);
        }, 0);

        const averageDailyConsumption = totalConsumption / 30;

        // Calculate days until stockout
        const daysUntilStockout = Math.floor(product.quantity / averageDailyConsumption);

        // Calculate reorder recommendation
        const reorderPoint = product.reorderPoint || 10;
        const recommendedOrder = Math.max(
            reorderPoint - product.quantity,
            Math.ceil(averageDailyConsumption * 7) // Order at least 7 days worth
        );

        // Determine stock status
        let stockStatus = 'normal';
        if (product.quantity <= 0) {
            stockStatus = 'out_of_stock';
        } else if (product.quantity <= reorderPoint) {
            stockStatus = 'low_stock';
        }

        return {
            productId: product._id,
            name: product.name,
            currentStock: product.quantity,
            reorderPoint: reorderPoint,
            averageDailyConsumption: Math.round(averageDailyConsumption * 10) / 10,
            daysUntilStockout: daysUntilStockout,
            recommendedOrder: recommendedOrder,
            status: stockStatus,
            lastUpdated: new Date()
        };
    }));

    // Calculate total inventory value
    const totalInventoryValue = products.reduce((sum, product) => 
        sum + (product.price * product.quantity), 0
    );

    // Calculate low stock items
    const lowStockItems = products.filter(product => 
        product.quantity <= (product.reorderPoint || 10)
    );

    // Calculate out of stock items
    const outOfStockItems = products.filter(product => 
        product.quantity === 0
    );

    res.json({
        totalProducts: products.length,
        totalInventoryValue,
        lowStockItems: lowStockItems.length,
        outOfStockItems: outOfStockItems.length,
        stockPredictions,
        recentOrders: recentOrders.map(order => ({
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            status: order.status,
            date: order.createdAt,
            items: order.items.map(item => ({
                product: item.product.name,
                quantity: item.quantity
            }))
        }))
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
});

module.exports = router; 