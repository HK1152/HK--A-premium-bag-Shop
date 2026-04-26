const express = require('express')
const router = express.Router();
const isloggedin = require("../middlewares/isLoggedin.js")
const flash = require('connect-flash');
const authController = require('../controllers/authController');
const ProductModel = require('../models/product-model');
const userModel = require('../models/user-model.js');


router.get('/', (req, res) => {
    let error = req.flash('error');
    res.render("index", { error, loggedin: !!req.user, user: req.user });
})

router.get('/about', (req, res) => {
    res.render("about", { loggedin: !!req.user, user: req.user, owner: req.owner });
})

router.get('/contact', (req, res) => {
    res.render("contact", { loggedin: !!req.user, user: req.user, owner: req.owner });
})


router.get('/wishlist', isloggedin, async (req, res) => {
    try {
        let products = await ProductModel.find();
        let success = req.flash('success');
        res.render('wishlist', { products, success, user: req.user, loggedin: !!req.user });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
})

router.get('/shop', isloggedin, async (req, res) => {
    try {
        let products = await ProductModel.find();
        let success = req.flash('success');
        res.render('shop', { products, success, user: req.user, loggedin: !!req.user });
    } catch (err) {
        console.error(err);
        res.send(err.message);
    }
})


router.get('/cart', isloggedin, async (req, res) => {
    const user = await userModel.findOne({ email: req.user.email }).populate('cart');

    let totalMRP = user.cart.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
    let totalDiscount = user.cart.reduce((sum, p) => sum + (Number(p.discount) || 0), 0);
    let bill = totalMRP - totalDiscount + 20; 
    let success = req.flash('success');
    let error = req.flash('error');

    let itemMap = {};
    user.cart.forEach(product => {
        if(itemMap[product._id]) {
            itemMap[product._id].quantity += 1;
        } else {
            itemMap[product._id] = { product: product, quantity: 1 };
        }
    });
    let cartItems = Object.values(itemMap);

    res.render('cart', { user, cartItems, totalMRP, totalDiscount, bill, success, error });
})

router.get('/add-to-cart/:productid', isloggedin, async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/shop');
        }
       
        user.cart.push(req.params.productid);
        await user.save();
        req.flash('success', 'Product added to cart');
        
        const referer = req.headers.referer || '/shop';
        res.redirect(referer);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding product to cart');
    }
});

router.get('/decrease-from-cart/:productid', isloggedin, async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/cart');
        }

        const index = user.cart.findIndex(item => item.toString() === req.params.productid);
        if (index > -1) {
            user.cart.splice(index, 1);
            await user.save();
        }
        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error decreasing product from cart');
    }
});

router.get('/remove-from-cart/:productid', isloggedin, async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/cart');
        }

        user.cart = user.cart.filter(item => item.toString() !== req.params.productid);
        await user.save();
        req.flash('success', 'Product removed completely');
        
        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error removing product from cart');
    }
});

router.get('/logout', isloggedin, authController.logout);

module.exports = router;