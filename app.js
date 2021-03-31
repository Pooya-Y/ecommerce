const express = require('express');
const app = express();
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const mongoose = require("mongoose");
const Product = require("./models/product");
const products = require("./routes/products");
const categories = require("./routes/categories");
const users = require("./routes/users");
const orders = require("./routes/orders");
const payment = require("./routes/payment");

const cors = require("cors");
require('dotenv/config');

app.use(cors());
app.options("*", cors);
app.use(helmet());
app.use(compression());

const api = process.env.API_URL;
const port = process.env.port || 3000;

app.use(express.json());
app.use(morgan("tiny"));
app.use('/uploads', express.static(__dirname + '/uploads'));



app.use(api+"/products", products);
app.use(api+"/categories", categories);
app.use(api+"/users", users);
app.use(api+"/orders", orders)
app.use(api+"/payment", payment)




mongoose.connect(process.env.MONGO_SRV, { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    console.log("Connected to database ...");
}).catch((err)=>{
    console.log(err);
});

app.listen(port, ()=>{
    console.log("listening to " + port);
});
