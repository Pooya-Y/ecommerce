const {Category} = require('../models/category');
const {auth, isAdmin} = require("../middlewares/jwt")
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const categoryList = await Category.find();
    if(!categoryList) return res.status(500).json({success: false});
    res.status(200).send(categoryList);
});

router.get('/:id', async(req,res)=>{
    const category = await Category.findById(req.params.id);
    if(!category) return res.status(404).json({message: 'The category with the given ID was not found.'})
    res.status(200).send(category);
});


router.post('/',auth, isAdmin, async (req,res)=>{
    let category = new Category({
        name: req.body.name,
    })
    category = await category.save();
    if(!category) return res.status(400).send('the category cannot be created!')
    res.send(category);
});


router.put('/:id',auth,isAdmin,async (req, res)=> {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {name: req.body.name},
        {new: true}
    )
    if(!category) return res.status(400).send('the category cannot be updated!')
    res.send(category);
});

router.delete('/:id',auth,isAdmin, async (req, res)=>{
    const category = await Category.findByIdAndRemove(req.params.id);
    if(!category) return res.status(404).json({success: false , message: "category not found!"});
    res.send();
});

module.exports = router;