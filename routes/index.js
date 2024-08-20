const express = require("express");
const router = express.Router();
const isloggedin = require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const mongoose = require("mongoose");


router.get("/", function(req, res) {
    let error = req.flash("error");
    res.render("index", { error, loggedin: false });
});

router.get("/shop", isloggedin, async function(req, res) {
   let products = await productModel.find();
   let success = req.flash("success")
    res.render("shop", {products, success}); 
});

router.get("/cart", isloggedin, async function(req, res) {
    try {
        let user = await userModel
            .findOne({ email: req.user.email })
            .populate("cart");

        // Initialize bill and handle empty cart
        let bill = 0;
        if (user.cart.length > 0) {
            // Ensure the cart has at least one item
            bill = Number(user.cart[0].price) + 20 - Number(user.cart[0].discount);
        }

        res.render("cart", { user, bill });
    } catch (error) {
        console.error("Error fetching user cart:", error);
        res.status(500).send("Internal Server Error");
    }
});



 router.get("/addtocart/:productid", isloggedin, async function(req, res) {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("/shop");
        }

        const productId = req.params.productid;
        
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            req.flash("error", "Invalid product ID");
            return res.redirect("/shop");
        }

        if (!user.cart.includes(productId)) { // Avoid adding duplicates
            user.cart.push(productId);
            await user.save();
            req.flash("success", "Added to cart");
        } else {
            req.flash("info", "Product already in cart");
        }

        res.redirect("/shop");
    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong");
        res.redirect("/shop");
    }
});


router.get("/logout", isloggedin, function(req, res) {
    res.render("shop"); 
});



module.exports = router;
