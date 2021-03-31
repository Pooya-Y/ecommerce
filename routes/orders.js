const {Order} = require('../models/order');
const {Product} = require('../models/product');
const {OrderItem} = require("../models/order-item")
const {auth, isAdmin} = require("../middlewares/jwt")
const express = require('express');
const router = express.Router();


router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.get(`/`,auth,isAdmin, async (req, res) =>{
    const orderList = await Order.find().populate("user", "name email").sort({"dateOrdered":-1});
    if(!orderList) return res.status(500).json({success: false});
    res.send(orderList);
});

router.get(`/:id`,auth,isAdmin, async (req, res) =>{
    // const order = await Order.findById(req.params.id).populate("user").populate({path:"orderItems",populate: "product"});
    const order = await Order.findById(req.params.id).populate("user")
    .populate({
        path:"orderItems",populate: {
            path: "product", populate:"category"}});

    if(!order) return res.status(500).json({success: false});
    res.send(order);
});

router.post('/', async (req,res)=>{
    const orderItemsIds = await Promise.all(req.body.orderItems.map(async (orderItem) =>{
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
    })

        newOrderItem = await newOrderItem.save();
        const item = await OrderItem.findById(newOrderItem);
        const product = await Product.findByIdAndUpdate(
        item.product,
        {
            $inc:{countInStock:-item.quantity}
        },
        {new: true}
        );
        if(product.countInStock<0){
            item.quantity+=product.countInStock;
            product.countInStock=0;
            await item.save();
            await product.save();
        }
        return newOrderItem._id;
    }))

    const totalPrices = await Promise.all(orderItemsIds.map(async(orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate("product", "price");
        const totalPrice = Number(orderItem.product.price) * Number(orderItem.quantity);
        return totalPrice;
    }));
    let totalPrice = 0;
    totalPrices.forEach(price => {
        totalPrice+=price;
    });
    let order = new Order({
        orderItems: orderItemsIds,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        postcode: req.body.postcode,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    });

    order = await order.save();
    if(!order) return res.status(400).send('the order cannot be created!');
    res.send(order);
 
});

router.put('/:id',auth,isAdmin,async (req, res)=> {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true}
    )
    if(!order) return res.status(400).send('the order cannot be update!')
    res.send(order);
})

router.delete('/:id', auth,isAdmin, async (req, res)=>{
    const order = await Order.findByIdAndRemove(req.params.id);
    if(!order) return res.status(404).json({success: false , message: "order not found!"});
    const orderItems = await Promise.all(order.orderItems.map(async(orderItem)=>{
        const item = await OrderItem.findById(orderItem);
        await Product.findByIdAndUpdate(
        item.product,
        {
            $inc:{countInStock:+item.quantity}
        },
        {new: true}
        );
        await OrderItem.findByIdAndRemove(orderItem);
    }));
    if(!orderItems) return res.status(404).json({success: false , message: "order item not found!"});

    res.send();
});
router.get('/get/totalsales', async (req, res)=> {
    const totalSales= await Order.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ])

    if(!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({totalsales: totalSales.pop().totalsales})
});

router.get(`/get/count`, async (req, res) =>{
    const orderCount = await Order.countDocuments((count) => count)

    if(!orderCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        orderCount: orderCount
    });
});
router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        }).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
});

module.exports =router;

        