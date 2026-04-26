const express = require('express')
const router = express.Router();
const ownerModel = require('../models/owner-model.js')

console.log('NODE_ENV =', process.env.NODE_ENV || '<<not defined>>');

router.get('/login', (req, res) => {
    let error = req.flash('error');
    let success = req.flash('success');
    res.render('owner-login', { error, success });
})

    router.post('/create', async (req, res) => {
        if (process.env.NODE_ENV !== 'development') {
            return res.status(403).send("Owner creation is only allowed in development environment.");
        }
        try {
            let owners = await ownerModel.find();
            if (owners.length > 0) {
                req.flash("error", "An owner already exists. You don't have permission to create a new owner.");
                return res.redirect("/owners/login");
            }

            let { fullname, email, password } = req.body;
            
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, async (err, hash) => {
                    if(err) {
                        req.flash("error", err.message);
                        return res.redirect("/owners/login");
                    }
                    
                    let createdOwner = await ownerModel.create({
                        fullname,
                        email,
                        password: hash,
                    });
                    
                    req.flash("success", "Registration successful. You can now login.");
                    res.redirect('/owners/login');
                });
            });
        } catch (error) {
            req.flash("error", error.message);
            res.redirect("/owners/login");
        }
    });



const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const isOwnerLoggedin = require('../middlewares/isOwnerLoggedin');
const ProductModel = require('../models/product-model');

router.get('/admin', isOwnerLoggedin, async (req, res) => {
    const success = req.flash('success');
    let products = await ProductModel.find();
    res.render('admin', { success, products, owner: req.owner }); 
})
router.get('/products/create', isOwnerLoggedin, (req, res) => {
    const success = req.flash('success');
    res.render('createproducts', { success, owner: req.owner });
})

router.post('/login', async (req, res) => {
    let { email, password } = req.body;

    let owner = await ownerModel.findOne({ email });
    if (!owner) {
        req.flash("error", "Email or Password incorrect");
        return res.redirect("/owners/login");
    }

    bcrypt.compare(password, owner.password, (err, result) => {
        if (result) {
            let token = jwt.sign({ email: owner.email, id: owner._id }, process.env.EXPRESS_SESSION_SECRET);
            res.cookie("token", token);
            res.redirect("/owners/admin");
        } else {
            req.flash("error", "Email or Password incorrect");
            return res.redirect("/owners/login");
        }
    });
});

router.get('/logout', (req, res) => {
    res.cookie("token", "");
    res.redirect("/owners/login");
});

const upload = require('../config/multer-config.js');

router.get('/manage', isOwnerLoggedin, async (req, res) => {
    let success = req.flash('success');
    let error = req.flash('error');
    let owner = await ownerModel.findById(req.owner._id);
    res.render('admin-manage', { success, error, owner });
});

router.post('/manage', isOwnerLoggedin, upload.single('picture'), async (req, res) => {
    try {
        let { fullname, gstin } = req.body;
        let owner = await ownerModel.findById(req.owner._id);
        
        if (fullname) owner.fullname = fullname;
        if (gstin) owner.gstin = gstin;
        if (req.file) {
            owner.picture = req.file.buffer;
        }

        await owner.save();
        req.flash('success', 'Profile updated successfully');
        res.redirect('/owners/manage');
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/owners/manage');
    }
});

module.exports = router;