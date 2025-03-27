const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const { auth, checkRole } = require('../middleware/auth');

// Get inventory status
router.get('/', auth, async (req, res) => {
    try {
        const inventoryItems = await Inventory.find({ userId: req.user._id });
        const inventoryStatus = await Promise.all(inventoryItems.map(async item => {
            const product = await Product.findById(item.productId);
            return {
                id: item._id,
                productId: item.productId,
                name: product ? product.name : 'Unknown Product',
                sku: product ? product.sku : '',
                quantity: item.quantity,
                location: item.location,
                minimumQuantity: item.minimumQuantity,
                maximumQuantity: item.maximumQuantity,
                notes: item.notes,
                userId: item.userId
            };
        }));
        res.json(inventoryStatus);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory status', error: error.message });
    }
});

// Get low stock items
router.get('/low-stock', auth, async (req, res) => {
    try {
        const lowStockItems = await Product.find({
            $expr: {
                $lte: ['$quantity', '$reorderPoint']
            }
        });
        res.json(lowStockItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching low stock items', error: error.message });
    }
});

// Get inventory value report
router.get('/value-report', auth, checkRole(['admin', 'manager']), async (req, res) => {
    try {
        const products = await Product.find();
        const report = {
            totalValue: 0,
            totalCost: 0,
            totalItems: 0,
            categories: {}
        };

        products.forEach(product => {
            report.totalValue += product.price * product.quantity;
            report.totalCost += product.cost * product.quantity;
            report.totalItems += product.quantity;

            if (!report.categories[product.category]) {
                report.categories[product.category] = {
                    value: 0,
                    cost: 0,
                    items: 0
                };
            }

            report.categories[product.category].value += product.price * product.quantity;
            report.categories[product.category].cost += product.cost * product.quantity;
            report.categories[product.category].items += product.quantity;
        });

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error generating inventory value report', error: error.message });
    }
});

// Get stock movement history
router.get('/movement-history', auth, checkRole(['admin', 'manager']), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};
        
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const orders = await Order.find(query)
            .populate('items.product')
            .sort({ createdAt: -1 });

        const movementHistory = orders.map(order => ({
            date: order.createdAt,
            orderNumber: order.orderNumber,
            type: order.status === 'cancelled' ? 'cancelled' : 'outbound',
            items: order.items.map(item => ({
                product: item.product.name,
                quantity: item.quantity,
                price: item.price
            }))
        }));

        res.json(movementHistory);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stock movement history', error: error.message });
    }
});

// Update reorder point
router.patch('/:id/reorder-point', auth, checkRole(['admin', 'manager']), async (req, res) => {
    try {
        const { reorderPoint } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { reorderPoint },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating reorder point', error: error.message });
    }
});

// Create new inventory item
router.post('/', auth, async (req, res) => {
    try {
        const { productId, location, quantity, minimumQuantity, maximumQuantity, notes } = req.body;

        // Validate required fields
        if (!productId || !location || !quantity) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Create new inventory item
        const inventoryItem = new Inventory({
            productId,
            location,
            quantity: parseInt(quantity),
            minimumQuantity: minimumQuantity ? parseInt(minimumQuantity) : 0,
            maximumQuantity: maximumQuantity ? parseInt(maximumQuantity) : 0,
            notes,
            userId: req.user._id
        });

        await inventoryItem.save();

        // Update product quantity
        product.quantity += parseInt(quantity);
        await product.save();

        res.status(201).json(inventoryItem);
    } catch (error) {
        console.error('Error creating inventory item:', error);
        res.status(500).json({ message: 'Error creating inventory item', error: error.message });
    }
});

// Delete inventory item
router.delete('/:id', auth, async (req, res) => {
    try {
        const inventoryItem = await Inventory.findOne({ 
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!inventoryItem) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        // Update product quantity before deleting
        const product = await Product.findById(inventoryItem.productId);
        if (product) {
            product.quantity -= inventoryItem.quantity;
            await product.save();
        }

        // Delete the inventory item
        await Inventory.findByIdAndDelete(req.params.id);
        res.json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        res.status(500).json({ message: 'Error deleting inventory item', error: error.message });
    }
});

module.exports = router; 