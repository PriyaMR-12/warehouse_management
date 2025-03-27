const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// Get all products
router.get('/', auth, async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Get single product
router.get('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});

// Create new product (any authenticated user)
router.post('/', auth, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
});

// Update product (any authenticated user)
router.put('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
});

// Delete product (any authenticated user)
router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

// Update product quantity
router.patch('/:id/quantity', auth, async (req, res) => {
    try {
        const { quantity } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $inc: { quantity } },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating quantity', error: error.message });
    }
});

module.exports = router; 