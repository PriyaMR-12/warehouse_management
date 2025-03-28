const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Get all reports with filters
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    let query = { user: req.user.id };

    // Add date filters if provided
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get reports based on type
    let reports = [];
    if (type === 'inventory') {
      reports = await Product.find({ user: req.user.id });
    } else if (type === 'sales' || type === 'orders') {
      reports = await Order.find(query)
        .populate('items.product')
        .sort({ createdAt: -1 });
    } else {
      // Get all types of reports
      const products = await Product.find({ user: req.user.id });
      const orders = await Order.find({ user: req.user.id })
        .populate('items.product')
        .sort({ createdAt: -1 });
      reports = [...products, ...orders];
    }

    res.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

// Get inventory report
router.get('/inventory', auth, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id });
    res.json(products);
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    res.status(500).json({ message: 'Error fetching inventory report' });
  }
});

// Get sales report
router.get('/sales', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { user: req.user.id };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Order.find(query)
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({ message: 'Error fetching sales report' });
  }
});

// Generate PDF report
router.get('/pdf', auth, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${type}-${Date.now()}.pdf`);
    
    doc.pipe(res);
    
    // Add content to PDF based on report type
    doc.fontSize(20).text('Warehouse Management System Report', { align: 'center' });
    doc.moveDown();
    
    if (type === 'inventory') {
      const products = await Product.find({ user: req.user.id });
      doc.fontSize(16).text('Inventory Report');
      doc.moveDown();
      
      products.forEach(product => {
        doc.fontSize(12).text(`Product: ${product.name}`);
        doc.text(`Quantity: ${product.quantity}`);
        doc.text(`Price: ₹${product.price}`);
        doc.moveDown();
      });
    } else if (type === 'sales') {
      const orders = await Order.find({ user: req.user.id })
        .populate('items.product')
        .sort({ createdAt: -1 });
      
      doc.fontSize(16).text('Sales Report');
      doc.moveDown();
      
      orders.forEach(order => {
        doc.fontSize(12).text(`Order #: ${order.orderNumber}`);
        doc.text(`Date: ${order.createdAt.toLocaleDateString()}`);
        doc.text(`Total: ₹${order.totalAmount}`);
        doc.moveDown();
      });
    }
    
    doc.end();
  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({ message: 'Error generating PDF report' });
  }
});

module.exports = router; 