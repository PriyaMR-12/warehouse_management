const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    location: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    minimumQuantity: {
        type: Number,
        default: 0,
        min: 0
    },
    maximumQuantity: {
        type: Number,
        min: 0
    },
    notes: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Inventory', inventorySchema); 