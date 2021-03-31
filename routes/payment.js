const express = require('express');
const router = express.Router();
const {Order} = require("../models/order");
const {auth} = require("../middlewares/jwt")

const idpay = require('idpay_ir')('bdcc733c-1386-4807-b070-67bbeb506147', true);



router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.get('/:id',auth, async(req, res)=> {
    const order = await Order.findById(req.params.id);
    let response = await idpay.create(order.id,order.totalPrice, req.protocol + "://" + req.get("host")+'/api/v1/payment/verify')
    res.json(response);
});
router.post('/verify', function(req, res){
    const order_id = req.body.order_id;
    const token = req.body.id;
    
    idpay.validate(order_id,token)
        .then(async(data) => {
           const order = await Order.findById(data.order_id);
            order.paymentStatus = true;
           const orderUpdate = await order.save();
           if(!order) return res.status(400).send('the order cannot be update!')
           res.send(orderUpdate);
        })
        .catch((error) =>{
            console.log(error);          
        });
});

module.exports = router;