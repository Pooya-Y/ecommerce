const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderItems:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "OrderItem",
            required: true
        }
    ],
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required:true
    }],
    shippingAddress1: {
        type: String,
        required: true,
    },
    shippingAddress2: {
        type: String,
    },
    city: {
        type: String,
        required: true,
    },
    postcode: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
    },
    totalPrice: {
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
    paymentStatus:{
        type: Boolean,
        default: false
    }
})

const Order = mongoose.model('Order', orderSchema);
module.exports.Order = Order;