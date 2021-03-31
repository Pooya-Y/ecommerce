const {User} = require('../models/user');
const sha256 = require('sha256');
const {auth, isAdmin} = require("../middlewares/jwt")
const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");


router.get('', auth,async(req, res)=>{
    const users = await User.find().select("-password");
    if(!users) return res.status(400).json({success: false});
    res.send(users);
});

router.get('/:id',auth,async(req,res) => {
    const user = await User.findById(req.params.id).select("-password");
    if(!user) return res.status(404).json({success: false});
    res.send(user);
});
  
router.post('/', async (req, res) => {
    let email = await User.findOne({ email: req.body.email });
    if (email) return res.status(400).send('User already registered.');
  
    let user = new User({
        name: req.body.name,
        email: req.body.email ,
        password: req.body.password,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        city: req.body.city,
        address: req.body.address,
        postcode: req.body.postcode
    });

    user.password = sha256(user.password);
    user = await user.save();
    if(!user) return res.send("This user cannot be registered");
    res.send(user);
  });
router.post('/login', async(req, res) => {
    let user = await User.findOne({ email: req.body.email, password: sha256(req.body.password) });
    if (!user) return res.status(400).send('invalid email or password.');
    const secretkey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({userId: user.id, isAdmin: user.isAdmin}, secretkey, {expiresIn: "1d"})
    res.status(200).send({user: user.email, token});
});
router.delete('/:id', auth,isAdmin, async (req, res)=>{
    const user = await User.findByIdAndRemove(req.params.id);
    if(!user) return res.status(404).json({success: false , message: "user not found!"});
    res.send();
});
router.get(`/get/count`, async (req, res) =>{
  const userCount = await User.countDocuments((count) => count)

  if(!userCount) {
      res.status(500).json({success: false})
  } 
  res.send({
      count: userCount
  });
});

module.exports = router;