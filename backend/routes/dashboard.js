const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Helper function to calculate average daily consumption
const calculateDailyConsumption = (orders, productId) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const productOrders = orders.filter(order => 
    order.createdAt >= thirtyDaysAgo &&
    order.items.some(item => item.product.toString() === productId.toString())
  );

  const totalQuantity = productOrders.reduce((sum, order) => {
    const productItem = order.items.find(item => 
      item.product.toString() === productId.toString()
    );
    return sum + (productItem ? productItem.quantity : 0);
  }, 0);

  return Math.ceil(totalQuantity / 30); // Average daily consumption over last 30 days
};

// Helper function to calculate days until stockout
const calculateDaysUntilStockout = (currentStock, avgDailyConsumption) => {
  if (avgDailyConsumption === 0) return null;
  return Math.floor(currentStock / avgDailyConsumption);
};

// Helper function to calculate recommended order quantity
const calculateRecommendedOrder = (currentStock, reorderPoint, avgDailyConsumption) => {
  if (currentStock <= reorderPoint) {
    // Order enough for 30 days plus buffer to reach reorder point
    return Math.max(
      (avgDailyConsumption * 30) - currentStock + reorderPoint,
      0
    );
  }
  return 0;
};

// @route   GET /api/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching dashboard data for user:', req.user.userId);
    
    // Get all products for the user
    const products = await Product.find({ user: req.user.userId });
    console.log('Total products found:', products.length);
    
    // Get all orders for calculations
    const orders = await Order.find({ user: req.user.userId })
      .populate('items.product', 'name price');

    // Calculate stock predictions for each product
    const stockPredictions = products.map(product => {
      const avgDailyConsumption = calculateDailyConsumption(orders, product._id);
      const daysUntilStockout = calculateDaysUntilStockout(product.quantity, avgDailyConsumption);
      const recommendedOrder = calculateRecommendedOrder(
        product.quantity,
        product.reorderPoint,
        avgDailyConsumption
      );

      return {
        id: product._id,
        name: product.name,
        currentStock: product.quantity,
        reorderPoint: product.reorderPoint,
        avgDailyConsumption,
        daysUntilStockout: daysUntilStockout || 0,
        recommendedOrder,
        lastUpdated: product.updatedAt
      };
    });

    // Calculate dashboard metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const lowStockItems = products.filter(product => 
      product.quantity <= product.reorderPoint
    ).length;

    // Get recent orders
    const recentOrders = await Order.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.product', 'name price');

    const dashboardData = {
      totalProducts: products.length,
      totalOrders: orders.length,
      lowStockItems,
      totalRevenue,
      stockPredictions,
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        date: order.createdAt,
        totalAmount: order.totalAmount,
        status: order.status,
        items: order.items.map(item => ({
          product: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        }))
      }))
    };

    console.log('Dashboard response:', dashboardData);
    res.json(dashboardData);

  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard data',
      error: error.message 
    });
  }
});

module.exports = router; 