const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

// Get all reports with filters
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    let query = {};

    // Add date filters if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Add type filter if provided
    if (type && type !== 'all') {
      query.type = type;
    }

    // Get reports based on type
    let reports = [];
    switch (type) {
      case 'inventory':
        reports = await Inventory.find(query)
          .populate('product')
          .sort({ date: -1 });
        break;
      case 'sales':
        reports = await Order.find(query)
          .sort({ date: -1 });
        break;
      case 'orders':
        reports = await Order.find(query)
          .sort({ date: -1 });
        break;
      default:
        // Get all types of reports
        const inventoryReports = await Inventory.find(query)
          .populate('product')
          .sort({ date: -1 });
        const salesReports = await Order.find(query)
          .sort({ date: -1 });
        reports = [...inventoryReports, ...salesReports].sort((a, b) => b.date - a.date);
    }

    res.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

// Generate slip for a specific report
router.get('/slip/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Order.findById(id).populate('products.product');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Create PDF document
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=slip-${id}.pdf`);
    doc.pipe(res);

    // Add company header
    doc.fontSize(20)
       .text('Warehouse Management System', { align: 'center' })
       .moveDown();

    // Add slip details
    doc.fontSize(12)
       .text(`Slip ID: ${report._id}`)
       .text(`Date: ${report.date.toLocaleDateString()}`)
       .text(`Customer: ${report.customerName}`)
       .text(`Address: ${report.shippingAddress}`)
       .moveDown();

    // Add products table
    const tableTop = doc.y;
    let currentTop = tableTop;

    // Table headers
    doc.text('Product', 50, currentTop)
       .text('Quantity', 250, currentTop)
       .text('Price', 350, currentTop)
       .text('Total', 450, currentTop);
    currentTop += 20;

    // Table rows
    report.products.forEach(item => {
      const product = item.product;
      const quantity = item.quantity;
      const price = product.price;
      const total = quantity * price;

      doc.text(product.name, 50, currentTop)
         .text(quantity.toString(), 250, currentTop)
         .text(`₹${price.toFixed(2)}`, 350, currentTop)
         .text(`₹${total.toFixed(2)}`, 450, currentTop);
      currentTop += 20;
    });

    // Add total
    currentTop += 10;
    doc.text('Total Amount:', 350, currentTop)
       .text(`₹${report.totalAmount.toFixed(2)}`, 450, currentTop);

    // Add footer
    doc.moveDown(2)
       .fontSize(10)
       .text('Thank you for your business!', { align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error generating slip:', error);
    res.status(500).json({ message: 'Error generating slip' });
  }
});

module.exports = router; 