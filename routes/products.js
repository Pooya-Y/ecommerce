const {Product} = require("../models/product");
const {Category} = require("../models/category");
const {auth, isAdmin} = require("../middlewares/jwt")
const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');

const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.split(" ").join("-");
      cb(null, Date.now().toString()+"-"+fileName)
    },
});
   
const upload = multer({ 
    storage: storage ,
    limits:{fileSize: 1024*1024*10},
    fileFilter: function (req, file, cb) {
        if(file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg') {
            cb(new Error("Wrong file type"), false);
        }
        cb(null, true);
    },
})

router.get("/", async (req, res)=>{
    // localhost:3000/api/v1/products?categories=2342342,234234
    let filter = {};
    if(req.query.categories){
         filter = {category: req.query.categories.split(',')}
    }
    const productList = await Product.find(filter).populate('category');
    if(!productList) return res.send(500).json({success: false});
    
    res.send(productList);
});
router.get('/:id', async(req,res)=>{
    const product = await Product.findById(req.params.id);
    if(!product) return res.status(404).json({message: 'The product with the given ID was not found.'})
    res.status(200).send(product);
});
router.post("/",auth,isAdmin,upload.single("image"), async(req, res)=>{
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(404).send("this category does not exist.");
    const fileName = req.file.filename;
    basePath = req.protocol + "://" + req.get("host") + "/uploads/";
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: basePath+fileName,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    });
    product = await product.save();
    if(!product) return res.status(400).json({success: false , message: "the product cannot be created!"});
    res.send(product);
});
router.put("/:id",auth,isAdmin,upload.single("image"), async(req, res)=>{
    const findProduct = await Product.findById(req.params.id);
    if(!findProduct) return res.status(404).json({success: false , message: "this product doesn't exist."});

    const category = await Category.findById(req.body.category);
    if(!category) return res.status(404).send("this category does not exist.");

    const fileName = req.file.filename;
    basePath = req.protocol + "://" + req.get("host") + "/uploads/";

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: basePath + fileName,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        {new: true}
    );
    if(!product) return res.status(400).send('the product cannot be update!')
    res.send(product) 
});
router.delete('/:id', auth,isAdmin, async (req, res)=>{
    const product = await Product.findByIdAndRemove(req.params.id);
    if(!product) return res.status(404).json({success: false , message: "product not found!"});
    res.send();
})

router.get(`/get/count`, async (req, res) =>{
    const productCount = await Product.countDocuments((count) => count)

    if(!productCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        count: productCount
    });
});
router.get(`/get/featured/:count`, async (req, res) =>{
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({isFeatured: true}).limit(+count);

    if(!products) {
        res.status(500).json({success: false})
    } 
    res.send(products);
});

router.put("/gallery-images/:id", upload.array("images"),auth,isAdmin ,async(req, res)=>{
    const product = await Product.findById(req.params.id);
    if(!product) return res.status(404).json({message: 'The product with the given ID was not found.'});
    basePath = req.protocol + "://" + req.get("host") + "/uploads/";
    let images = [];
    if(req.files){
        req.files.map((file) =>{
            images.push(basePath + file.filename);
        });
    }
    product.images = images;
    const productUpdate = await product.save();
    if(!productUpdate) return res.status(400).send('the product cannot be update!')
    res.send(productUpdate);
});
module.exports = router;