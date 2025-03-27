const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        default: function() {
            const date = new Date();
            const year = date.getFullYear().toString().slice(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return `ORD${year}${month}${day}${random}`;
        }
    },
    customer: {
        name: {
            type: String,
            required: true
        },
        email: String,
        phone: String,
        address: String
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
orderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Order', orderSchema); 