const express = require('express')
const router = express.Router();
const upload = require('../config/multer-config.js');
const productModel = require('../models/product-model');
const ownerModel = require('../models/owner-model');
const isOwnerLoggedin = require('../middlewares/isOwnerLoggedin');

router.post('/create', isOwnerLoggedin, upload.single("image"), async (req, res) => {
    try {
        const { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;

        const product = await productModel.create({
            image: req.file.buffer,
            name,
            price,
            discount,
            bgcolor,
            panelcolor,
            textcolor,
        });

        // Find the owner and add the new product's ID to their products array
        let owner = await ownerModel.findById(req.owner._id);
        if (owner) {
            owner.products.push(product._id);
            await owner.save();
        }

        req.flash('success', 'Product created successfully');
        res.redirect('/owners/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

router.get('/delete/:productid', isOwnerLoggedin, async (req, res) => {
    try {
        const productId = req.params.productid;

        // Find the owner and remove product from their array
        let owner = await ownerModel.findById(req.owner._id);
        if (owner) {
            owner.products = owner.products.filter(id => id.toString() !== productId);
            await owner.save();
        }

        // Also remove from any user's cart
        const userModel = require('../models/user-model');
        await userModel.updateMany(
            { cart: productId },
            { $pull: { cart: productId } }
        );

        // Delete from Product database
        await productModel.findByIdAndDelete(productId);

        req.flash('success', 'Product deleted successfully');
        res.redirect('/owners/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

module.exports = router;